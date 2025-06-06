/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import { useEffect, useState } from "react";
import { useChat, type Message } from "@ai-sdk/react";
import { Input } from "@/components/ui/input";
import { ChatMessageDisplay } from "@/app/(protected)/page/_components/chat-message-display";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ApiKeyDialog } from "@/app/(protected)/_components/api-key-dialog";
import { ToolSelectorDropdown } from "@/components/tool-selector-dropdown";
import { type Tool } from "@/types/tool";
import { ArrowUpIcon } from "lucide-react";
import { ChevronDown } from "lucide-react"; // For dropdown indicator

const API_KEY_STORAGE_KEYS = {
  google: "google_ai_api_key",
  openai: "openai_api_key",
  deepseek: "deepseek_api_key",
  anthropic: "anthropic_api_key",
};

const MODELS = [
  { label: "DeepSeek Chat v3", value: "deepseek/deepseek-chat" },
  { label: "Google Gemini 2.0 Flash", value: "google/gemini-2.0-flash-001" },
  { label: "OpenAI GPT 4.1 mini", value: "openai/gpt-4.1-mini" },
  { label: "Anthropic Claude 4 Sonnet", value: "anthropic/claude-4-sonnet" },
  {
    label: "Anthropic Claude 3.7 Sonnet",
    value: "anthropic/claude-3.7-sonnet",
  },
];

export default function ChatPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") {
      return {
        google: "",
        openai: "",
        deepseek: "",
        anthropic: "",
      };
    }
    return {
      google: localStorage.getItem(API_KEY_STORAGE_KEYS.google ?? "") ?? "",
      openai: localStorage.getItem(API_KEY_STORAGE_KEYS.openai ?? "") ?? "",
      deepseek: localStorage.getItem(API_KEY_STORAGE_KEYS.deepseek ?? "") ?? "",
      anthropic:
        localStorage.getItem(API_KEY_STORAGE_KEYS.anthropic ?? "") ?? "",
    };
  });

  const [selectedModel, setSelectedModel] = useState(MODELS[0]?.value);
  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  const handleSaveApiKey = (keys: Record<string, string>) => {
    for (const provider in keys) {
      localStorage.setItem(
        API_KEY_STORAGE_KEYS[provider as keyof typeof API_KEY_STORAGE_KEYS],
        keys[provider] ?? "",
      );
    }
    setApiKeys(keys);
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
  }, [messages, handleSubmit, isLoading, append]);

  return (
    <div className="flex h-[calc(100dvh-16px)] flex-col py-4">
      <div className="flex flex-grow flex-col rounded-b-none border-b-0 border-none shadow-none">
        <h2 className="px-4 text-lg font-semibold">Chat playground</h2>
        <div className="max-h-[calc(100dvh-150px)] pt-2">
          <ScrollArea className="h-full px-4">
            {messages.length === 0 && !isLoading && !error ? (
              <div className="text-muted-foreground mx-auto flex h-[calc(100dvh-400px)] max-w-2xl items-center justify-center text-center text-2xl">
                👋 Hello there! Start to test your tools by typing a message.
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message: Message) => (
                  <ChatMessageDisplay key={message.id} message={message} />
                ))}
              </div>
            )}
            {isLoading && (
              <div className="text-muted-foreground py-1 text-sm">
                AI is thinking...
              </div>
            )}
            {error && (
              <div className="text-center text-red-500">
                Error: {error.message}
              </div>
            )}
          </ScrollArea>
        </div>
      </div>
      <div className="mx-4 flex items-center space-x-2 rounded-xl border p-4 shadow-2xl">
        <ToolSelectorDropdown onToolsChange={setEnabledTools} />
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!apiKeys[currentProvider ?? ""]) {
              setIsApiKeyDialogOpen(true);
            }
            handleSubmit(e);
          }}
          className="flex flex-grow space-x-2"
        >
          <Input
            placeholder="Type your message here..."
            value={input}
            onChange={handleInputChange}
            className="flex-grow rounded-full"
            disabled={isLoading}
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-between rounded-full"
              >
                <span className="truncate">
                  {MODELS.find((model) => model.value === selectedModel)
                    ?.label ?? "Select a model"}
                </span>
                <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-[240px]">
              {MODELS.map((model) => (
                <DropdownMenuItem
                  key={model.value}
                  onSelect={() => setSelectedModel(model.value)}
                >
                  {model.label}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setIsApiKeyDialogOpen(true)}>
                Config API Keys
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="submit" disabled={isLoading} className="rounded-full">
            <ArrowUpIcon className="h-4 w-4" />
          </Button>
        </form>
      </div>
      <ApiKeyDialog
        onSave={handleSaveApiKey}
        isOpen={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
      />
    </div>
  );
}
