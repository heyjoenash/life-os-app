"use client";

import { useState } from "react";
import { ChatInterface } from "@/components/ai/chat-interface";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  BrainCircuit,
  FileText,
  ListTodo,
  MessageSquareText,
  Sparkles,
} from "lucide-react";

interface AIPanelProps {
  dayId?: string;
}

export function AIPanel({ dayId }: AIPanelProps) {
  const [activeTab, setActiveTab] = useState("chat");

  // Define assistant presets for quick use
  const assistantPresets = [
    {
      id: "summarize",
      name: "Summarize Day",
      prompt: "Summarize all my activities from today.",
      icon: <FileText className="w-4 h-4 mr-2" />,
    },
    {
      id: "analyze",
      name: "Analyze Tasks",
      prompt: "Analyze my task completion and suggest improvements.",
      icon: <ListTodo className="w-4 h-4 mr-2" />,
    },
    {
      id: "ideas",
      name: "Generate Ideas",
      prompt: "Give me some creative ideas for...",
      icon: <Sparkles className="w-4 h-4 mr-2" />,
    },
    {
      id: "research",
      name: "Research",
      prompt: "Help me research...",
      icon: <BrainCircuit className="w-4 h-4 mr-2" />,
    },
  ];

  return (
    <div className="h-full flex flex-col">
      <Tabs
        defaultValue="chat"
        className="h-full flex flex-col"
        onValueChange={setActiveTab}
      >
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="chat" className="flex items-center">
            <MessageSquareText className="w-4 h-4 mr-2" /> Chat
          </TabsTrigger>
          <TabsTrigger value="presets" className="flex items-center">
            <Sparkles className="w-4 h-4 mr-2" /> Presets
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="chat"
          className="flex-1 relative flex flex-col overflow-hidden"
        >
          <div className="absolute inset-0">
            <ChatInterface />
          </div>
        </TabsContent>

        <TabsContent value="presets" className="flex-1 overflow-auto">
          <div className="space-y-3">
            <p className="text-sm text-gray-600 mb-4">
              Quick prompts to help you get the most out of your AI assistant.
            </p>

            {assistantPresets.map((preset) => (
              <Button
                key={preset.id}
                variant="outline"
                className="w-full justify-start text-left h-auto py-3 px-4"
                onClick={() => {
                  // In a real implementation, this would set the prompt text
                  // and potentially switch to the chat tab
                  setActiveTab("chat");
                }}
              >
                {preset.icon}
                <div className="flex flex-col items-start">
                  <span className="font-medium">{preset.name}</span>
                  <span className="text-xs text-gray-500 mt-1">
                    {preset.prompt}
                  </span>
                </div>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
