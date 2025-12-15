"use client";

import { X } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Node } from "reactflow";

interface NodeInspectorProps {
  selectedNode: Node | null;
  setSelectedNode: (node: Node | null) => void;
  onUpdateNode: (id: string, data: any) => void;
}

export default function NodeInspector({
  selectedNode,
  setSelectedNode,
  onUpdateNode,
}: NodeInspectorProps) {
  if (!selectedNode) return null;

  // Handle text changes
  const handleChange = (field: string, value: string) => {
    onUpdateNode(selectedNode.id, {
      ...selectedNode.data,
      [field]: value,
    });
  };

  return (
    <aside className="w-80 bg-white border-l border-gray-200 h-full absolute right-0 top-0 z-10 shadow-xl flex flex-col">
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between bg-gray-50">
        <h3 className="font-semibold text-sm text-gray-900">Configure Node</h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedNode(null)}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Form Content */}
      <div className="p-4 space-y-6 flex-1 overflow-y-auto">
        {/* Common Settings */}
        <div className="space-y-2">
          <Label>Node Name</Label>
          <Input
            value={selectedNode.data.label || ""}
            onChange={(e) => handleChange("label", e.target.value)}
            placeholder="e.g. Sales Agent"
          />
        </div>

        {/* AI Specific Settings */}
        {selectedNode.type === "process" && (
          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label>AI Model</Label>
              <select
                className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                value={selectedNode.data.model || "gemini-1.5-flash"}
                onChange={(e) => handleChange("model", e.target.value)}
              >
                <option value="gemini-1.5-flash">
                  Gemini 1.5 Flash (Fast)
                </option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Smart)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>System Prompt</Label>
              <Textarea
                className="h-32 font-mono text-xs"
                placeholder="You are a helpful assistant..."
                value={selectedNode.data.systemPrompt || ""}
                onChange={(e) => handleChange("systemPrompt", e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground">
                Instructions for how the AI should behave.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
