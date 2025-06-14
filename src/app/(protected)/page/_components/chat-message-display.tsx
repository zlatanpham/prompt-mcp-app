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
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyIcon, CheckIcon, ChevronDown, RefreshCcw } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";

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
  isLoading?: boolean;
  isThinking?: boolean;
  isLastMessage?: boolean;
  userAvatarFallback?: string;
  onRegenerate?: (messageId: string) => void; // New prop for regenerate action, accepts messageId
}

export function ChatMessageDisplay({
  message,
  isLoading,
  isLastMessage,
  userAvatarFallback,
  onRegenerate,
}: ChatMessageDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Revert after 2 seconds
    } catch (err) {
      console.error("Failed to copy message: ", err);
    }
  };

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
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: "auto" }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="overflow-hidden"
      >
        <Collapsible
          open={isOpen}
          onOpenChange={setIsOpen}
          className="w-full rounded-lg border p-2 text-left"
        >
          <CollapsibleTrigger className="flex w-full items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="rounded-full px-2 py-1">
                {toolName.charAt(0).toUpperCase()}
              </Badge>
              <span className="font-mono text-sm font-medium">{toolName}</span>
            </div>
            <ChevronDown
              className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
            />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-2 space-y-2">
            {toolArgs && (
              <div className="rounded-md p-2">
                <h3 className="mb-2 text-sm font-medium">Request</h3>
                <div className="max-h-[300px] overflow-auto">
                  <pre className="rounded-md bg-gray-100 p-4 text-xs whitespace-pre-wrap">
                    <code>{JSON.stringify(toolArgs, null, 2)}</code>
                  </pre>
                </div>
              </div>
            )}
            {toolResult && (
              <div className="rounded-md p-2">
                <h3 className="mb-2 text-sm font-medium">Response</h3>
                <div className="max-h-[300px] overflow-auto">
                  <pre className="rounded-md bg-gray-100 p-4 text-xs whitespace-pre-wrap">
                    <code>{toolResult}</code>
                  </pre>
                </div>
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
      </motion.div>
    );
  }

  if (message.role === "user") {
    return (
      <motion.div
        initial={{ opacity: 1, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex items-start gap-4 rounded-lg bg-gray-100 p-3"
      >
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-gray-800 text-white">
            {userAvatarFallback}
          </AvatarFallback>
        </Avatar>
        <div className="mt-1">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {message.content}
          </ReactMarkdown>
        </div>
      </motion.div>
    );
  }

  return (
    <div key={message.id} className="prose px-3">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {message.content}
      </ReactMarkdown>
      {isLoading && isLastMessage ? null : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, backgroundColor: "transparent" }}
          transition={{ duration: 0.5 }}
          className="flex items-center" // Added items-center for alignment
        >
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleCopy}
                  variant="link"
                  size="sm"
                  className="cursor-pointer"
                >
                  {copied ? (
                    <CheckIcon className="!h-4 !w-4" />
                  ) : (
                    <CopyIcon className="!h-4 !w-4" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" hideArrow={true} sideOffset={10}>
                Copy
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          {message.role === "assistant" && onRegenerate && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => onRegenerate(message.id)} // Pass message.id
                    variant="link"
                    size="sm"
                    className="cursor-pointer"
                    disabled={isLoading} // Disable when AI is thinking
                  >
                    <RefreshCcw className="!h-4 !w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" hideArrow={true} sideOffset={10}>
                  Regenerate
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </motion.div>
      )}
    </div>
  );
}
