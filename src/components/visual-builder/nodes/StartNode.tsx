import { Handle, Position } from "reactflow";
import { Play } from "lucide-react";

export function StartNode() {
  return (
    <div className="flex items-center gap-2 p-3 px-4 bg-green-50 border-2 border-green-500 rounded-full shadow-md min-w-[120px]">
      <Play className="w-4 h-4 fill-green-600 text-green-600" />
      <span className="text-sm font-bold text-green-900">Start Chat</span>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-green-500 !w-3 !h-3"
      />
    </div>
  );
}
