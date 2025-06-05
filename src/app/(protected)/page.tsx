"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ApiKeyDialog } from "@/app/(protected)/_components/api-key-dialog";

const API_KEY_STORAGE_KEYS = {
  google: "google_ai_api_key",
  openai: "openai_api_key",
  deepseek: "deepseek_api_key",
  anthropic: "anthropic_api_key",
};

export default function ChatPage() {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({
    google: localStorage.getItem(API_KEY_STORAGE_KEYS.google) ?? "",
    openai: localStorage.getItem(API_KEY_STORAGE_KEYS.openai) ?? "",
    deepseek: localStorage.getItem(API_KEY_STORAGE_KEYS.deepseek) ?? "",
    anthropic: localStorage.getItem(API_KEY_STORAGE_KEYS.anthropic) ?? "",
  });

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

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      headers: {
        "x-google-ai-api-key": apiKeys.google ?? "",
      },
      body: {
        apiKey: apiKeys.google!, // Use non-null assertion
      },
    });

  return (
    <div className="flex h-full flex-col p-4">
      <Card className="flex flex-grow flex-col">
        <CardHeader>
          <CardTitle>AI Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {messages.length === 0 && !isLoading && !error ? (
              <div className="text-muted-foreground flex h-full items-center justify-center">
                Start a conversation...
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 ${
                    message.role === "user" ? "text-right" : "text-left"
                  }`}
                >
                  <div
                    className={`inline-block rounded-lg p-2 ${
                      message.role === "user"
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
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
              disabled={isLoading || !apiKeys.google}
            />
            <Button type="submit" disabled={isLoading || !apiKeys.google}>
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
