"use client";

import { useState } from "react";
import { type Message } from "@ai-sdk/react";
import { type ToolInvocation as ToolInvocationType } from "ai";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ToolInvocationLike {
  toolName: string;
  args?: Record<string, unknown>;
  result?: unknown;
}

type ToolInvocation = ToolInvocationType & { result?: string };

// Type guard to check if a JSONValue is ToolInvocationLike
function isToolInvocationLike(value: unknown): value is ToolInvocationLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "toolName" in value &&
    typeof (value as ToolInvocationLike).toolName === "string"
  );
}

interface AnnotationLike {
  toolName: string;
}

function isAnnotationLike(value: unknown): value is AnnotationLike {
  return (
    typeof value === "object" &&
    value !== null &&
    "toolName" in value &&
    typeof (value as AnnotationLike).toolName === "string"
  );
}

interface ChatMessageDisplayProps {
  message: Message;
}

export function ChatMessageDisplay({ message }: ChatMessageDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Hide the message if it has toolName annotation
  // which indicates previous message was a tool invocation
  if (isAnnotationLike(message.annotations)) {
    return null;
  }

  if (message.toolInvocations && message.toolInvocations.length > 0) {
    const rawInvocation = message.toolInvocations[0];

    if (!isToolInvocationLike(rawInvocation)) {
      return null; // Not a valid tool invocation structure
    }

    const toolInvocation: ToolInvocation = {
      ...rawInvocation,
      result: rawInvocation.result,
    };

    const toolName = toolInvocation.toolName;
    const toolArgs = toolInvocation.args;
    const toolResult = toolInvocation.result;

    return (
      <Collapsible
        open={isOpen}
        onOpenChange={setIsOpen}
        className="mb-4 w-full rounded-lg border p-2 text-left"
      >
        <CollapsibleTrigger className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="rounded-full px-2 py-1">
              {toolName.charAt(0).toUpperCase()}
            </Badge>
            <span className="font-semibold">Calling tool {toolName}</span>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m19.5 8.25-7.5 7.5-7.5-7.5"
            />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-2">
          {toolArgs && (
            <div className="rounded-md bg-gray-50 p-2">
              <h3 className="font-semibold">Request</h3>
              <pre className="overflow-auto text-sm whitespace-pre-wrap">
                <code>{JSON.stringify(toolArgs, null, 2)}</code>
              </pre>
            </div>
          )}
          {toolResult && (
            <div className="rounded-md bg-gray-50 p-2">
              <h3 className="font-semibold">Response</h3>
              <pre className="overflow-auto text-sm whitespace-pre-wrap">
                <code>{toolResult}</code>
              </pre>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <div
      key={message.id}
      className={`mb-4 rounded-lg p-3 text-left ${
        message.role === "user" ? "bg-gray-100" : ""
      }`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {message.content}
      </ReactMarkdown>
    </div>
  );
}
