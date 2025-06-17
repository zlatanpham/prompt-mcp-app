/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-floating-promises */
"use client";

import { useSession } from "next-auth/react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useChat, type Message } from "@ai-sdk/react";
import { AnimatePresence, motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ChatMessageDisplay } from "@/app/(protected)/page/_components/chat-message-display";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiKeyDialog } from "@/app/(protected)/_components/api-key-dialog";
import { ToolSelectorPopover } from "@/components/tool-selector-popover";
import { type Tool } from "@/types/tool";
import { ArrowUpIcon, CircleDotIcon } from "lucide-react"; // KeyRoundIcon and ChevronDown are now in ModelSelector
import { ModelSelector } from "@/components/model-selector";
import { API_KEY_STORAGE_KEYS } from "@/lib/constants"; // Import from constants

export default function ChatPage() {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();

  const userAvatarFallback = useMemo(() => {
    if (!session?.user) {
      return "U";
    }
    const userData = session.user as unknown as {
      name?: string;
      avatar?: string;
    };

    return userData.name?.charAt(0).toUpperCase() ?? "U";
  }, [session]);

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

  const [selectedModel, setSelectedModel] = useState(""); // State managed by ModelSelector
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
    stop, // Destructure stop from useChat
    reload, // Destructure reload from useChat
    setMessages, // Destructure setMessages from useChat
  } = useChat({
    api: "/api/chat",
    body: {
      apiKeys: apiKeys, // Pass all apiKeys
      model: selectedModel,
      tools: enabledTools, // Pass enabled tools
    },
  });

  const [currentProvider] = (selectedModel ?? "").split("/");

  const handleRegenerateSpecificMessage = (messageId: string) => {
    const messageIndex = messages.findIndex((msg) => msg.id === messageId);
    if (messageIndex === -1) {
      console.error("Message not found for regeneration:", messageId);
      return;
    }

    // Find the preceding user message to truncate to
    let truncateToIndex = -1;
    for (let i = messageIndex; i >= 0; i--) {
      if (messages[i]?.role === "user") {
        truncateToIndex = i;
        break;
      }
    }

    if (truncateToIndex !== -1) {
      const newMessages = messages.slice(0, truncateToIndex + 1);
      setMessages(newMessages);
      // Reload will re-send the last message in the newMessages array
      reload();
    } else {
      // If no preceding user message, it means the assistant message is the first.
      // In this case, we might clear the chat or handle it differently.
      // For now, let's just clear the chat and let the user start over.
      setMessages([]);
      console.warn(
        "No preceding user message found to regenerate from. Chat cleared.",
      );
    }
  };

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
  }, [messages, handleSubmit, isLoading, append, reload, setMessages]); // Added reload and setMessages to dependencies

  useEffect(() => {
    if (scrollAreaRef.current) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
      const viewport = scrollAreaRef.current.querySelector(
        "[data-radix-scroll-area-viewport]",
      ) as HTMLDivElement | null;

      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight; // Scroll to the very bottom
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages[messages.length - 1]?.content]);

  const isThinking =
    isLoading &&
    (!messages[messages.length - 1] ||
      messages[messages.length - 1]?.role === "user" ||
      (messages[messages.length - 1]?.role === "assistant" &&
        messages[messages.length - 1]?.content === ""));

  return (
    <div className="flex h-[calc(100dvh-16px)] flex-col items-center pb-4">
      <div className="flex w-full flex-grow flex-col rounded-b-none border-b-0 border-none shadow-none">
        <div className="border-b px-4 py-3">
          <h2 className="text-normal font-medium">Chat playground</h2>
        </div>
        <div className="max-h-[calc(100dvh-180px)]">
          <ScrollArea className="h-full px-4" ref={scrollAreaRef}>
            <div className="mx-auto max-w-3xl py-4">
              {messages.length === 0 && !isLoading && !error ? (
                <div className="mx-auto flex h-[calc(100dvh-240px)] max-w-2xl items-center justify-center text-center text-2xl">
                  👋 Hello! Start chatting with your tools here.
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((message: Message, index) => (
                    <ChatMessageDisplay
                      key={message.id}
                      message={message}
                      userAvatarFallback={userAvatarFallback}
                      isThinking={isThinking}
                      isLastMessage={index === messages.length - 1}
                      isLoading={isLoading}
                      onRegenerate={handleRegenerateSpecificMessage}
                    />
                  ))}
                </div>
              )}
              <AnimatePresence>
                {isThinking && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.3 }}
                    className="loading-flash text-muted-foreground mt-3 px-2 text-sm"
                  >
                    AI is thinking...
                  </motion.div>
                )}
              </AnimatePresence>
              {error && (
                <div className="text-center text-red-500">
                  Error: {error.message}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      <div className="flex w-full max-w-3xl items-center px-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!apiKeys[currentProvider ?? ""]) {
              setIsApiKeyDialogOpen(true);
              return;
            }
            handleSubmit(e);
          }}
          className="flex w-full flex-col space-y-2 rounded-xl border p-2 shadow-2xl"
        >
          <div>
            <Input
              placeholder="Type your message here..."
              value={input}
              onChange={handleInputChange}
              className="flex-grow border-none shadow-none"
              disabled={isLoading}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <ToolSelectorPopover onToolsChange={setEnabledTools} />
            </div>
            <div className="flex items-center space-x-2">
              <ModelSelector
                onModelSelect={setSelectedModel}
                onConfigApiKeys={() => setIsApiKeyDialogOpen(true)}
                buttonClassName="w-[180px] rounded-full"
                localStorageKey="chat_page_selected_model"
              />
              <Button
                type="submit"
                variant={isLoading ? "secondary" : "default"}
                className="h-9 w-9 cursor-pointer rounded-full"
                onClick={(e) => {
                  e.preventDefault();
                  if (isLoading) {
                    stop();
                  } else {
                    if (!apiKeys[currentProvider ?? ""]) {
                      setIsApiKeyDialogOpen(true);
                      return;
                    }
                    handleSubmit(e);
                  }
                }}
              >
                {isLoading ? (
                  <CircleDotIcon className="h-4 w-4" />
                ) : (
                  <ArrowUpIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
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
