import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Calculate level from XP (exponential scaling)
function calculateLevel(xp: number): number {
  // Level formula: level = floor(sqrt(xp / 100))
  // Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

// XP needed for next level
export function xpForLevel(level: number): number {
  return (level - 1) * (level - 1) * 100;
}

export function xpForNextLevel(level: number): number {
  return level * level * 100;
}

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) return null;

    const level = calculateLevel(profile.totalXp);
    const currentLevelXp = xpForLevel(level);
    const nextLevelXp = xpForNextLevel(level);
    const progressXp = profile.totalXp - currentLevelXp;
    const neededXp = nextLevelXp - currentLevelXp;

    return {
      ...profile,
      level,
      progressXp,
      neededXp,
      progressPercent: Math.min((progressXp / neededXp) * 100, 100),
    };
  },
});

export const createProfile = mutation({
  args: { displayName: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("profiles", {
      userId,
      displayName: args.displayName,
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      createdAt: Date.now(),
    });
  },
});

export const addXp = mutation({
  args: { amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const newXp = profile.totalXp + args.amount;
    const newLevel = calculateLevel(newXp);

    await ctx.db.patch(profile._id, {
      totalXp: newXp,
      level: newLevel,
    });

    return { newXp, newLevel, leveledUp: newLevel > profile.level };
  },
});

export const updateStreak = mutation({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .first();

    if (!profile) throw new Error("Profile not found");

    const today = args.date;
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    let newStreak = profile.currentStreak;

    if (profile.lastActiveDate === yesterdayStr) {
      newStreak = profile.currentStreak + 1;
    } else if (profile.lastActiveDate !== today) {
      newStreak = 1;
    }

    await ctx.db.patch(profile._id, {
      currentStreak: newStreak,
      longestStreak: Math.max(profile.longestStreak, newStreak),
      lastActiveDate: today,
    });

    return newStreak;
  },
});
