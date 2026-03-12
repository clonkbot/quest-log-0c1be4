import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Main Tasks
export const getMainTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("mainTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const createMainTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    xpReward: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("mainTasks", {
      userId,
      title: args.title,
      description: args.description,
      xpReward: args.xpReward,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const deleteMainTask = mutation({
  args: { id: v.id("mainTasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { isActive: false });
  },
});

// Bonus Tasks
export const getBonusTasks = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("bonusTasks")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const createBonusTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    xpReward: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("bonusTasks", {
      userId,
      title: args.title,
      description: args.description,
      xpReward: args.xpReward,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const deleteBonusTask = mutation({
  args: { id: v.id("bonusTasks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const task = await ctx.db.get(args.id);
    if (!task || task.userId !== userId) throw new Error("Not found");

    await ctx.db.patch(args.id, { isActive: false });
  },
});

// Task Completions
export const getTodayCompletions = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("taskCompletions")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("completedDate", args.date)
      )
      .collect();
  },
});

export const completeTask = mutation({
  args: {
    taskId: v.string(),
    taskType: v.union(v.literal("main"), v.literal("bonus")),
    date: v.string(),
    xpReward: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if already completed today
    const existing = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task_and_date", (q) =>
        q.eq("taskId", args.taskId).eq("completedDate", args.date)
      )
      .first();

    if (existing) throw new Error("Task already completed today");

    await ctx.db.insert("taskCompletions", {
      userId,
      taskId: args.taskId,
      taskType: args.taskType,
      completedDate: args.date,
      xpEarned: args.xpReward,
      completedAt: Date.now(),
    });

    return args.xpReward;
  },
});

export const uncompleteTask = mutation({
  args: {
    taskId: v.string(),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const completion = await ctx.db
      .query("taskCompletions")
      .withIndex("by_task_and_date", (q) =>
        q.eq("taskId", args.taskId).eq("completedDate", args.date)
      )
      .first();

    if (!completion || completion.userId !== userId) {
      throw new Error("Completion not found");
    }

    const xpToRemove = completion.xpEarned;
    await ctx.db.delete(completion._id);

    return xpToRemove;
  },
});

// Stats
export const getWeeklyStats = query({
  args: { startDate: v.string(), endDate: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const completions = await ctx.db
      .query("taskCompletions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Filter by date range
    const filtered = completions.filter(
      (c) => c.completedDate >= args.startDate && c.completedDate <= args.endDate
    );

    // Group by date
    const byDate: Record<string, { main: number; bonus: number; xp: number }> = {};

    for (const c of filtered) {
      if (!byDate[c.completedDate]) {
        byDate[c.completedDate] = { main: 0, bonus: 0, xp: 0 };
      }
      if (c.taskType === "main") {
        byDate[c.completedDate].main++;
      } else {
        byDate[c.completedDate].bonus++;
      }
      byDate[c.completedDate].xp += c.xpEarned;
    }

    return byDate;
  },
});
