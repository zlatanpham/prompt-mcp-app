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

const GOOGLE_API_KEY_STORAGE_KEY = "google_ai_api_key";

export default function ChatPage() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem(GOOGLE_API_KEY_STORAGE_KEY);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setIsDialogOpen(true);
    }
  }, []);

  const handleSaveApiKey = (key: string) => {
    localStorage.setItem(GOOGLE_API_KEY_STORAGE_KEY, key);
    setApiKey(key);
    setIsDialogOpen(false);
  };

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      headers: {
        "x-google-ai-api-key": apiKey ?? "",
      },
      body: {
        apiKey: apiKey,
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
                {apiKey
                  ? "Start a conversation..."
                  : "Please enter your API key to start."}
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
              disabled={isLoading || !apiKey}
            />
            <Button type="submit" disabled={isLoading || !apiKey}>
              Send
            </Button>
          </form>
        </CardFooter>
      </Card>
      <ApiKeyDialog isOpen={isDialogOpen} onSave={handleSaveApiKey} />
    </div>
  );
}
