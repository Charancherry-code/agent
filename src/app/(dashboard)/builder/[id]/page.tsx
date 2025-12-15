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

// Custom Components
import { ProcessNode } from "@/components/visual-builder/nodes/ProcessNode";
import { StartNode } from "@/components/visual-builder/nodes/StartNode";
import NodeInspector from "@/components/visual-builder/NodeInspector";
import ChatInterface from "@/components/visual-builder/ChatInterface"; // <--- Import Chat

// Database & Icons
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { Loader2, MessageSquare } from "lucide-react"; // <--- Import Icon

const nodeTypes: NodeTypes = {
  process: ProcessNode,
  start: StartNode,
};

export default function BuilderPage() {
  const params = useParams();
  const workflowId = params.id as Id<"workflows">;

  // --- Database Hooks ---
  const workflow = useQuery(api.workflows.getWorkflowById, { id: workflowId });
  const updateWorkflow = useMutation(api.workflows.updateWorkflow);

  // --- State Management ---
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false); // <--- State for Chat Window

  // --- 1. Load Data from DB ---
  useEffect(() => {
    if (!workflow) return;

    console.log("📥 Loading workflow from DB");

    let loadedNodes = [];
    let loadedEdges = [];

    if (workflow.definition) {
      try {
        const flow = JSON.parse(workflow.definition);
        if (flow.nodes) loadedNodes = flow.nodes;
        if (flow.edges) loadedEdges = flow.edges;
      } catch (e) {
        console.error("❌ Failed to parse workflow:", e);
      }
    }

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

  // --- 2. Save Data Function ---
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

  // --- 3. React Flow Helpers ---
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

  // Loading State
  if (workflow === undefined) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="h-[calc(100vh-64px)] w-full flex flex-col">
      {/* Header */}
      <div className="h-14 border-b bg-white flex items-center px-4 justify-between z-20 relative">
        <h2 className="font-semibold text-sm text-slate-700">
          {workflow?.name}
        </h2>

        <div className="flex gap-2">
          {/* Test Chat Button */}
          <button
            onClick={() => setIsChatOpen(!isChatOpen)}
            className={`border px-4 py-1.5 rounded-md text-sm transition flex items-center gap-2 ${
              isChatOpen
                ? "bg-blue-50 border-blue-200 text-blue-700"
                : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            {isChatOpen ? "Close Chat" : "Test Chat"}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-1.5 rounded-md text-sm hover:bg-blue-700 transition"
          >
            Save Workflow
          </button>
        </div>
      </div>

      {/* Main Canvas */}
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

        {/* Sidebar Inspector */}
        {selectedNode && (
          <NodeInspector
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            onUpdateNode={onUpdateNode}
          />
        )}

        {/* Floating Chat Interface */}
        {isChatOpen && (
          <ChatInterface
            workflowId={workflowId}
            onClose={() => setIsChatOpen(false)}
          />
        )}
      </div>
    </div>
  );
}
