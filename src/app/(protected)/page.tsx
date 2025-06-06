/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import { useEffect, useState } from "react";
import { useChat, type Message } from "@ai-sdk/react";
import { Input } from "@/components/ui/input";
import { ChatMessageDisplay } from "@/app/(protected)/page/_components/chat-message-display";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ApiKeyDialog } from "@/app/(protected)/_components/api-key-dialog";
import { ToolSelectorDropdown } from "@/components/tool-selector-dropdown";
import { type Tool } from "@/types/tool";

const API_KEY_STORAGE_KEYS = {
  google: "google_ai_api_key",
  openai: "openai_api_key",
  deepseek: "deepseek_api_key",
  anthropic: "anthropic_api_key",
};

export default function ChatPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    google: localStorage.getItem(API_KEY_STORAGE_KEYS.google ?? "") ?? "",
    openai: localStorage.getItem(API_KEY_STORAGE_KEYS.openai ?? "") ?? "",
    deepseek: localStorage.getItem(API_KEY_STORAGE_KEYS.deepseek ?? "") ?? "",
    anthropic: localStorage.getItem(API_KEY_STORAGE_KEYS.anthropic ?? "") ?? "",
  });

  const MODELS = [
    { label: "DeepSeek Chat v3", value: "deepseek/deepseek-chat" },
    // { label: "DeepSeek Reasoner v3", value: "deepseek/deepseek-reasoner" },
    { label: "Google Gemini 2.0 Flash", value: "google/gemini-2.0-flash-001" },
  ];

  const [selectedModel, setSelectedModel] = useState(MODELS[0]?.value);

  const handleSaveApiKey = (keys: Record<string, string>) => {
    for (const provider in keys) {
      localStorage.setItem(
        API_KEY_STORAGE_KEYS[provider as keyof typeof API_KEY_STORAGE_KEYS],
        keys[provider] ?? "",
      );
    }
    setApiKeys(keys);
  };

  const handleCloseApiKeyDialog = () => {
    // No action needed here as the dialog manages its own open/close state
    // This function is just to satisfy the onClose prop type
  };

  const [enabledTools, setEnabledTools] = useState<Tool[]>([]);

  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    append,
  } = useChat({
    api: "/api/chat",
    body: {
      apiKeys: apiKeys, // Pass all apiKeys
      model: selectedModel,
      tools: enabledTools, // Pass enabled tools
    },
  });

  const [currentProvider] = (selectedModel ?? "").split("/");
  console.log(messages);

  useEffect(() => {
    if (messages.length > 0 && !isLoading) {
      const lastMessage = messages[messages.length - 1];
      console.log(lastMessage);
      if (
        Array.isArray(lastMessage?.toolInvocations) &&
        lastMessage?.toolInvocations[0]
      ) {
        try {
          append({
            annotations: {
              // @ts-ignore
              toolName: lastMessage?.toolInvocations[0].toolName,
              toolCallId: lastMessage?.toolInvocations[0].toolCallId,
            },
            // @ts-ignore
            content: lastMessage.toolInvocations[0].result,
            role: "user",
          });
        } catch (error) {
          console.error("Error handling tool invocation result:", error);
        }
      }
    }
  }, [messages, handleSubmit, isLoading]);

  return (
    <div className="flex h-full flex-col p-4">
      <Card className="flex flex-grow flex-col">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>AI Chat</CardTitle>
          <div className="flex items-center gap-2">
            <ToolSelectorDropdown onToolsChange={setEnabledTools} />
            <Select value={selectedModel} onValueChange={setSelectedModel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                {MODELS.map((model) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {messages.length === 0 && !isLoading && !error ? (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                Start a conversation...
              </div>
            ) : (
              messages.map((message: Message) => (
                <ChatMessageDisplay key={message.id} message={message} />
              ))
            )}
            {isLoading && (
              <div className="text-muted-foreground text-center">
                AI is thinking...
              </div>
            )}
            {error && (
              <div className="text-center text-red-500">
                Error: {error.message}
              </div>
            )}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              placeholder="Type your message..."
              value={input}
              onChange={handleInputChange}
              className="flex-grow"
              disabled={isLoading || !apiKeys[currentProvider ?? ""]!}
            />
            <Button
              type="submit"
              disabled={isLoading || !apiKeys[currentProvider ?? ""]!}
            >
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
      <ApiKeyDialog
        onSave={handleSaveApiKey}
        onClose={handleCloseApiKeyDialog}
      />
    </div>
  );
}
