"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Import DropdownMenu components
import { Button } from "@/components/ui/button"; // Ensure Button is imported for the trigger
import { ChevronDown } from "lucide-react"; // Import ChevronDown icon
import { api } from "@/trpc/react";
import { KeyRoundIcon } from "lucide-react"; // Import KeyRoundIcon
import { ApiKeyDialog } from "@/app/(protected)/_components/api-key-dialog"; // Import ApiKeyDialog
import { useEffect, useState } from "react"; // Import useState and useEffect

const formSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters."),
  model: z.string().min(1, "Please select a model."),
});

const API_KEY_STORAGE_KEYS = {
  google: "google_ai_api_key",
  openai: "openai_api_key",
  deepseek: "deepseek_api_key",
  anthropic: "anthropic_api_key",
};

const MODELS = [
  { label: "DeepSeek Chat v3", value: "deepseek/deepseek-chat" },
  {
    label: "Google Gemini 2.5 Flash",
    value: "google/gemini-2.5-flash-preview-05-20",
  },
  { label: "Google Gemini 2.0 Flash", value: "google/gemini-2.0-flash-001" },
  { label: "OpenAI GPT 4.1 mini", value: "openai/gpt-4.1-mini" },
  { label: "Anthropic Claude 4 Sonnet", value: "anthropic/claude-4-sonnet" },
  {
    label: "Anthropic Claude 3.7 Sonnet",
    value: "anthropic/claude-3.7-sonnet",
  },
];

type GenerateToolFormValues = z.infer<typeof formSchema>;

interface GenerateToolDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  projectId: string;
}

export function GenerateToolDialog({
  isOpen,
  onOpenChange,
  projectId,
}: GenerateToolDialogProps) {
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

  const form = useForm<GenerateToolFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
      model: MODELS[0]?.value ?? "",
    },
  });

  const [currentProvider] = (form.watch("model") ?? "").split("/");
  console.log({ currentProvider });

  useEffect(() => {
    if (isOpen) {
      // Reset form when dialog opens
      form.reset({
        prompt: "",
        model: MODELS[0]?.value ?? "",
      });
    }
  }, [isOpen, form]);

  const generateToolMutation = api.tool.generateToolFromAI.useMutation({
    onSuccess: () => {
      toast.success("Tool generated successfully!");
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      toast.error("Failed to generate tool.", {
        description: error.message,
      });
    },
  });

  console.log({ data: generateToolMutation.data });

  const onSubmit = (data: GenerateToolFormValues) => {
    console.log("Form submitted with data:", data);
    if (!apiKeys[currentProvider ?? ""]) {
      setIsApiKeyDialogOpen(true);
    } else {
      generateToolMutation.mutate({
        projectId,
        prompt: data.prompt,
        model: data.model,
        apiKeys: apiKeys, // Pass apiKeys
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Generate Tool from AI</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="prompt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prompt</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe how the tool should work, e.g., 'A tool that converts Fahrenheit to Celsius.'"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                        >
                          {field.value
                            ? MODELS.find(
                                (model) => model.value === field.value,
                              )?.label
                            : "Select a model"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-dropdown-menu-trigger-width]">
                      <DropdownMenuLabel>Models</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {MODELS.map((model) => (
                        <DropdownMenuItem
                          key={model.value}
                          onSelect={() => field.onChange(model.value)}
                          className="cursor-pointer"
                        >
                          {model.label}
                        </DropdownMenuItem>
                      ))}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={() => setIsApiKeyDialogOpen(true)}
                        className="cursor-pointer"
                      >
                        <KeyRoundIcon className="mr-2 h-4 w-4" /> Config API
                        Keys
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full"
              disabled={generateToolMutation.status === "pending"}
            >
              {generateToolMutation.status === "pending"
                ? "Generating..."
                : "Generate Tool"}
            </Button>
          </form>
        </Form>
      </DialogContent>
      <ApiKeyDialog
        onSave={handleSaveApiKey}
        isOpen={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
      />
    </Dialog>
  );
}
