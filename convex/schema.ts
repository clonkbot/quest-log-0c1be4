import { defineSchema, defineTable } from "convex/server";
import { authTables } from "@convex-dev/auth/server";
import { v } from "convex/values";

export default defineSchema({
  ...authTables,

  // User profiles with XP and level tracking
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    totalXp: v.number(),
    level: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastActiveDate: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Main daily tasks (recurring)
  mainTasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    xpReward: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Bonus/add-on tasks
  bonusTasks: defineTable({
    userId: v.id("users"),
    title: v.string(),
    description: v.optional(v.string()),
    xpReward: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_user", ["userId"]),

  // Daily completions tracking
  taskCompletions: defineTable({
    userId: v.id("users"),
    taskId: v.string(), // Can be mainTask or bonusTask ID
    taskType: v.union(v.literal("main"), v.literal("bonus")),
    completedDate: v.string(), // YYYY-MM-DD format
    xpEarned: v.number(),
    completedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_date", ["userId", "completedDate"])
    .index("by_task_and_date", ["taskId", "completedDate"]),
});
