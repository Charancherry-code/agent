import { Handle, Position } from "reactflow";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BrainCircuit } from "lucide-react";

export function ProcessNode({ data }: { data: { label: string } }) {
  return (
    <Card className="w-[300px] border-2 border-blue-100 shadow-sm hover:border-blue-300 transition-colors bg-white">
      {/* Input Handle: Accepts connection from Start Node */}
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-blue-500 !w-3 !h-3"
      />

      <CardHeader className="p-4 pb-2 bg-blue-50/50 rounded-t-lg flex flex-row items-center gap-2 space-y-0">
        <BrainCircuit className="w-5 h-5 text-blue-600" />
        <CardTitle className="text-sm font-bold text-slate-700">
          AI Agent
        </CardTitle>
      </CardHeader>

      <CardContent className="p-4 text-xs text-muted-foreground">
        {data.label || "Click to configure Gemini..."}
      </CardContent>

      {/* Output Handle: Connects to next step */}
      <Handle
        type="source"
        position={Position.Right}
        className="!bg-blue-500 !w-3 !h-3"
      />
    </Card>
  );
}
