"use client";

import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton
import { ChevronDown, KeyRoundIcon } from "lucide-react";
import { cn } from "@/lib/utils"; // Import cn utility

const MODELS = [
  { label: "DeepSeek Chat v3", value: "deepseek/deepseek-chat" },
  {
    label: "Google Gemini 2.5 Pro",
    value: "google/gemini-2.5-pro-preview-06-05",
  },
  {
    label: "Google Gemini 2.5 Flash",
    value: "google/gemini-2.5-flash-preview-05-20",
  },
  { label: "Google Gemini 2.0 Flash", value: "google/gemini-2.0-flash-001" },
  { label: "OpenAI GPT 4.1", value: "openai/gpt-4.1" },
  { label: "OpenAI GPT 4.1 mini", value: "openai/gpt-4.1-mini" },
  { label: "OpenAI GPT o4 mini", value: "openai/o4-mini" },
  { label: "OpenAI GPT o3 mini", value: "openai/o3-mini" },
  {
    label: "Anthropic Claude Opus 4",
    value: "anthropic/claude-opus-4-20250514",
  },
  {
    label: "Anthropic Claude 4 Sonnet",
    value: "anthropic/claude-sonnet-4-20250514",
  },
  {
    label: "Anthropic Claude 3.7 Sonnet",
    value: "anthropic/claude-3-7-sonnet-20250219",
  },
];

interface ModelSelectorProps {
  onModelSelect: (modelValue: string) => void;
  onConfigApiKeys: () => void;
  localStorageKey: string;
  buttonClassName?: string; // New optional prop
}

export function ModelSelector({
  onModelSelect,
  onConfigApiKeys,
  localStorageKey,
  buttonClassName, // Destructure new prop
}: ModelSelectorProps) {
  const [selectedModel, setSelectedModel] = useState(MODELS[0]?.value);
  const [isClientLoaded, setIsClientLoaded] = useState(false); // New state for client-side loading

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedModel = localStorage.getItem(localStorageKey);
      if (storedModel) {
        setSelectedModel(storedModel);
      }
      setIsClientLoaded(true); // Set to true after localStorage is checked
    }
  }, [localStorageKey]);

  useEffect(() => {
    if (!isClientLoaded) return;
    // Persist to localStorage whenever selectedModel changes
    if (typeof window !== "undefined" && selectedModel) {
      localStorage.setItem(localStorageKey, selectedModel);
    }
    onModelSelect(selectedModel ?? "");
  }, [selectedModel, onModelSelect, localStorageKey, isClientLoaded]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-between",
            buttonClassName, // Apply custom class name
          )}
          size="lg"
        >
          {isClientLoaded ? (
            <span className="truncate">
              {MODELS.find((model) => model.value === selectedModel)?.label ??
                "Select a model"}
            </span>
          ) : (
            <Skeleton className="h-4 w-32" /> // Display skeleton while loading
          )}
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
        <DropdownMenuItem onSelect={onConfigApiKeys}>
          <KeyRoundIcon className="mr-2 h-4 w-4" /> Config API Keys
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
