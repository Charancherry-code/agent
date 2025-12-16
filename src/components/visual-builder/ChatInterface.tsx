
"use client";

import { useChat } from "@ai-sdk/react";
import { X, Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { useState } from "react";

export default function ChatInterface({
  workflowId,
  onClose,
}: {
  workflowId: string;
  onClose: () => void;
}) {
  // This hook handles all the streaming logic automatically
  const { messages, sendMessage, status } = useChat();
  const [input, setInput] = useState("");

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setInput(e.target.value);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    await sendMessage({ text }, { body: { workflowId } });
    setInput("");
  }

  return (
    <Card className="w-[400px] h-[500px] absolute bottom-4 right-4 z-50 flex flex-col shadow-2xl border-blue-200 bg-white">
      {/* Header */}
      <div className="p-3 border-b bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-semibold text-sm">Test Agent</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-blue-700 text-white"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4 bg-slate-50">
        <div className="space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-xs text-muted-foreground mt-10">
              Type a message to start chatting...
            </p>
          )}

          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex gap-2 ${
                m.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 text-sm ${
                  m.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white border border-gray-200 text-gray-800 shadow-sm"
                }`}
              >
                {m.parts
                  ?.map((p: any) => (p?.type === "text" ? p.text : ""))
                  .join("")}
              </div>
            </div>
          ))}

          {(status === "submitted" || status === "streaming") && (
            <div className="flex gap-2 justify-start">
              <div className="bg-gray-100 rounded-lg p-2 text-xs text-gray-500 animate-pulse">
                ...
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 text-sm"
          />
          <Button
            type="submit"
            size="icon"
            disabled={status !== "ready"}
            className="bg-blue-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </Card>
  );
}
