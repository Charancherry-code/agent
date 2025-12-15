"use client";

import { useParams } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import {
  ReactFlow,
  Background,
  Controls,
  NodeTypes,
  useNodesState,
  useEdgesState,
  Node,
  Connection,
  addEdge,
} from "reactflow";
import "reactflow/dist/style.css";
import { ProcessNode } from "@/components/visual-builder/nodes/ProcessNode";
import { StartNode } from "@/components/visual-builder/nodes/StartNode";
import NodeInspector from "@/components/visual-builder/NodeInspector";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Loader2 } from "lucide-react";

const nodeTypes: NodeTypes = {
  process: ProcessNode,
  start: StartNode,
};

export default function BuilderPage() {
  const params = useParams();
  const workflowId = params.id as Id<"workflows">;

  // Database Hooks
  const workflow = useQuery(api.workflows.getWorkflowById, { id: workflowId });
  const updateWorkflow = useMutation(api.workflows.updateWorkflow);

  // Editor State
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  // 1. Load Data on Startup
  useEffect(() => {
    if (!workflow) return;

    console.log("📥 Loading workflow from DB:", workflow.definition);

    let loadedNodes = [];
    let loadedEdges = [];

    // Parse JSON from DB
    if (workflow.definition) {
      try {
        const flow = JSON.parse(workflow.definition);
        if (flow.nodes) loadedNodes = flow.nodes;
        if (flow.edges) loadedEdges = flow.edges;
      } catch (e) {
        console.error("❌ Failed to parse workflow:", e);
      }
    }

    // Apply data or fall back to defaults
    if (loadedNodes.length > 0) {
      setNodes(loadedNodes);
      setEdges(loadedEdges);
    } else {
      console.log("⚠️ DB is empty, loading default nodes.");
      setNodes([
        { id: "start-1", type: "start", position: { x: 50, y: 300 }, data: {} },
        {
          id: "process-1",
          type: "process",
          position: { x: 300, y: 280 },
          data: { label: "My Gemini Agent" },
        },
      ]);
      setEdges([]);
    }
  }, [workflow, setNodes, setEdges]);

  // 2. Save Data Function
  const handleSave = async () => {
    if (!workflowId) return;

    console.log("💾 Saving nodes:", nodes);

    try {
      const flow = JSON.stringify({ nodes, edges });
      await updateWorkflow({
        id: workflowId,
        definition: flow,
      });
      alert("✅ Saved successfully!");
    } catch (error) {
      console.error("❌ Save failed:", error);
      alert("Failed to save.");
    }
  };

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge(params, eds));
    },
    [setEdges]
  );

  const onUpdateNode = useCallback(
    (id: string, newData: any) => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === id) {
            const updatedNode = { ...node, data: { ...node.data, ...newData } };
            setSelectedNode(updatedNode);
            return updatedNode;
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  if (workflow === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col">
      <div className="h-14 border-b bg-white flex items-center px-4 justify-between z-20 relative">
        <h2 className="font-semibold text-sm text-slate-700">
          {workflow?.name}
        </h2>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
        >
          Save Workflow
        </button>
      </div>

      <div className="flex-1 w-full bg-slate-50 relative overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(e, node) => setSelectedNode(node)}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background gap={12} size={1} />
          <Controls />
        </ReactFlow>

        {selectedNode && (
          <NodeInspector
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            onUpdateNode={onUpdateNode}
          />
        )}
      </div>
    </div>
  );
}
