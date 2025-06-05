"use client";

import { type Message } from "@ai-sdk/react";
import { type ToolInvocation } from "ai";

interface ChatMessageDisplayProps {
  message: Message;
}

export function ChatMessageDisplay({ message }: ChatMessageDisplayProps) {
  if (message.annotations?.toolName) {
    return null;
    return (
      <div className="mb-4 rounded-lg bg-amber-100 p-2 text-left">
        <span className="font-semibold">{message.annotations.toolName}</span>:{" "}
        <div>{message.content}</div>
      </div>
    );
  }

  if (message.toolInvocations?.length > 0) {
    return (
      <div className="mb-4 rounded-lg bg-blue-100 p-2 text-left">
        <span className="font-semibold">
          Calling tool {message.toolInvocations[0]?.toolName}
        </span>
        :{" "}
      </div>
    );
  }

  return (
    <div
      key={message.id}
      className={`mb-4 ${message.role === "user" ? "text-right" : "text-left"}`}
    >
      {message.content}
    </div>
  );
}
