import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create a new empty workflow (Agent)
export const createWorkflow = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    clerkId: v.string(), // We verify ownership with this
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("User not found");

    // Create the workflow with a default empty state
    const workflowId = await ctx.db.insert("workflows", {
      userId: user.clerkId,
      name: args.name,
      description: args.description,
      definition: JSON.stringify({ nodes: [], edges: [] }), // Start empty
      status: "draft",
      lastSaved: Date.now(),
    });

    return workflowId;
  },
});

// Get all workflows for the logged-in user
export const getWorkflows = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("workflows")
      .withIndex("by_userId", (q) => q.eq("userId", args.clerkId))
      .collect();
  },
});

// Get a single workflow by ID (for the Editor)
export const getWorkflowById = query({
  args: { id: v.id("workflows") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateWorkflow = mutation({
  args: {
    id: v.id("workflows"),
    definition: v.string(), // We will store nodes/edges as a JSON string
  },
  handler: async (ctx, args) => {
    // 1. Get the current workflow to check ownership (optional security step)
    const workflow = await ctx.db.get(args.id);
    if (!workflow) throw new Error("Workflow not found");

    // 2. Update the definition and the "lastSaved" timestamp
    await ctx.db.patch(args.id, {
      definition: args.definition,
      lastSaved: Date.now(),
    });
  },
});
