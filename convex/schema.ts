import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users: Synced from Clerk
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    credits: v.number(),
    tier: v.union(v.literal("free"), v.literal("pro")),
  }).index("by_clerkId", ["clerkId"]),

  // Workflows: The Visual Agents
  workflows: defineTable({
    userId: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    definition: v.string(),
    status: v.union(v.literal("draft"), v.literal("published")),
    lastSaved: v.number(),
    publishId: v.optional(v.string()),
  })
    .index("by_userId", ["userId"])
    .index("by_publishId", ["publishId"]),

  // Executions: Run history
  executions: defineTable({
    workflowId: v.id("workflows"),
    userId: v.optional(v.string()),
    input: v.string(),
    output: v.optional(v.string()),
    status: v.string(),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    creditsConsumed: v.number(),
  }).index("by_workflowId", ["workflowId"]),
});
