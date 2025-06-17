"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { ApiKeyDialog } from "@/app/(protected)/_components/api-key-dialog";
import {
  ManualToolForm,
  manualToolFormSchema,
  type ManualToolFormValues,
} from "./manual-tool-form";
import { type Argument } from "@/types/tool";
import { useQueryClient } from "@tanstack/react-query";
import { ModelSelector } from "@/components/model-selector"; // Import ModelSelector
import { API_KEY_STORAGE_KEYS } from "@/lib/constants"; // Import from constants

const generatePromptFormSchema = z.object({
  prompt: z.string().min(10, "Prompt must be at least 10 characters."),
  model: z.string().min(1, "Please select a model."),
});

type GeneratePromptFormValues = z.infer<typeof generatePromptFormSchema>;

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
  const [step, setStep] = useState(1); // 1: Prompt form, 2: Manual tool form
  const queryClient = useQueryClient();

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
      google:
        localStorage.getItem(API_KEY_STORAGE_KEYS.google.localStorageKey) ?? "",
      openai:
        localStorage.getItem(API_KEY_STORAGE_KEYS.openai.localStorageKey) ?? "",
      deepseek:
        localStorage.getItem(API_KEY_STORAGE_KEYS.deepseek.localStorageKey) ??
        "",
      anthropic:
        localStorage.getItem(API_KEY_STORAGE_KEYS.anthropic.localStorageKey) ??
        "",
    };
  });

  const [isApiKeyDialogOpen, setIsApiKeyDialogOpen] = useState(false);

  const handleSaveApiKey = (keys: Record<string, string>) => {
    for (const provider in keys) {
      localStorage.setItem(
        API_KEY_STORAGE_KEYS[provider as keyof typeof API_KEY_STORAGE_KEYS]
          .localStorageKey,
        keys[provider] ?? "",
      );
    }
    setApiKeys(keys);
  };

  const promptForm = useForm<GeneratePromptFormValues>({
    resolver: zodResolver(generatePromptFormSchema),
    defaultValues: {
      prompt: "",
      model: "", // Model will be set by ModelSelector's onModelSelect
    },
  });

  const manualToolForm = useForm<ManualToolFormValues>({
    resolver: zodResolver(manualToolFormSchema),
    defaultValues: {
      name: "",
      description: "",
      prompt: "",
      arguments: [],
    },
  });

  const [currentProvider] = (promptForm.watch("model") ?? "").split("/");

  const generateToolMutation = api.tool.generateToolFromAI.useMutation({
    onSuccess: (data) => {
      toast.success("Tool generated successfully! Review and save.");
      setStep(2); // Move to the second step
      manualToolForm.reset({
        name: data.name,
        description: data.description ?? "",
        prompt: data.prompt,
        arguments: (data.args as Argument[]) ?? [],
      });
    },
    onError: (error) => {
      toast.error("Failed to generate tool.", {
        description: error.message,
      });
    },
  });

  const createToolMutation = api.tool.create.useMutation({
    onSuccess: async () => {
      toast.success("Tool saved successfully!");
      await queryClient.invalidateQueries({
        queryKey: [["tool", "getByProjectId"]],
      });
      onOpenChange(false);
      promptForm.reset();
      manualToolForm.reset();
      setStep(1); // Reset to first step
    },
    onError: (error) => {
      toast.error("Failed to save tool.", {
        description: error.message,
      });
    },
  });

  useEffect(() => {
    if (isOpen) {
      // Reset forms and step when dialog opens
      promptForm.reset({
        prompt: "",
        model: "", // Model will be set by ModelSelector's onModelSelect
      });
      manualToolForm.reset({
        name: "",
        description: "",
        prompt: "",
        arguments: [],
      });
      setStep(1);
    }
  }, [isOpen, promptForm, manualToolForm]);

  const onGeneratePromptSubmit = (data: GeneratePromptFormValues) => {
    if (!apiKeys[currentProvider ?? ""]) {
      setIsApiKeyDialogOpen(true);
    } else {
      generateToolMutation.mutate({
        projectId,
        prompt: data.prompt,
        model: data.model,
        apiKeys: apiKeys,
      });
    }
  };

  const onManualToolSubmit = (data: ManualToolFormValues) => {
    createToolMutation.mutate({
      project_id: projectId,
      name: data.name,
      description: data.description,
      prompt: data.prompt,
      args: data.arguments,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {step === 1 ? "Generate Tool with AI" : "Review & Save Tool"}
          </DialogTitle>
        </DialogHeader>
        {step === 1 && (
          <Form {...promptForm}>
            <form
              onSubmit={promptForm.handleSubmit(onGeneratePromptSubmit)}
              className="space-y-4"
            >
              <FormField
                control={promptForm.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Describe how the tool should work, e.g., 'A tool that converts Fahrenheit to Celsius.'"
                        className="max-h-[calc(100vh-400px)] min-h-[100px]"
                        {...field}
                        disabled={generateToolMutation.status === "pending"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={promptForm.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model</FormLabel>
                    <FormControl>
                      <ModelSelector
                        onModelSelect={field.onChange}
                        onConfigApiKeys={() => setIsApiKeyDialogOpen(true)}
                        localStorageKey="generate_tool_selected_model"
                        buttonClassName="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                size="lg"
                isLoading={generateToolMutation.status === "pending"}
              >
                Generate Tool
              </Button>
            </form>
          </Form>
        )}

        {step === 2 && (
          <ManualToolForm
            form={manualToolForm}
            onSubmit={onManualToolSubmit}
            isLoading={false} // Data is already generated
            isSubmitting={createToolMutation.status === "pending"}
            submitButtonText="Save Tool"
            showBackButton={true}
            onBackButtonClick={() => setStep(1)}
          />
        )}
      </DialogContent>
      <ApiKeyDialog
        onSave={handleSaveApiKey}
        isOpen={isApiKeyDialogOpen}
        onOpenChange={setIsApiKeyDialogOpen}
      />
    </Dialog>
  );
}
