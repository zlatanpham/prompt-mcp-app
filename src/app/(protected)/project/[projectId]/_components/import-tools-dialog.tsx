"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Editor from "react-simple-code-editor";
import { highlight, languages, type Grammar } from "prismjs";
import "prismjs/components/prism-json"; // Import JSON language for Prism
import "prismjs/components/prism-markup"; // Import markup for fallback
import "prismjs/themes/prism.css"; // Or any other theme you prefer

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { api } from "@/trpc/react";
import { toolNameSchema } from "@/lib/validators/tool";
import { argumentSchema } from "@/types/tool";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const toolBaseSchema = z.object({
  name: toolNameSchema,
  description: z.string().optional(),
  prompt: z.string().min(1),
  args: z.array(argumentSchema).optional(),
});

const toolImportInputSchema = z.object({
  project_id: z.string().uuid(), // This will be passed as a prop, not part of the form
  tools: z.array(toolBaseSchema),
});

type ToolImportFormValues = {
  jsonContent: string;
};

interface ImportToolsDialogProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportToolsDialog({
  projectId,
  open,
  onOpenChange,
}: ImportToolsDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const importToolsMutation = api.tool.importTools.useMutation();
  const utils = api.useContext(); // Add this line

  const form = useForm<ToolImportFormValues>({
    resolver: zodResolver(z.object({ jsonContent: z.string().min(1) })),
    defaultValues: {
      jsonContent: "",
    },
  });

  async function onSubmit(data: ToolImportFormValues) {
    setIsLoading(true);
    try {
      const parsedTools = JSON.parse(data.jsonContent);

      // Frontend validation against the full schema
      const validationResult = toolImportInputSchema.safeParse({
        project_id: projectId,
        tools: parsedTools,
      });

      if (!validationResult.success) {
        // Handle Zod errors and display them
        const formattedErrors = validationResult.error.errors
          .map((err) => `${err.path.join(".")} - ${err.message}`)
          .join("\n");
        toast.error("Validation Error", {
          description: formattedErrors,
          duration: 5000,
        });
        setIsLoading(false);
        return;
      }

      await importToolsMutation.mutateAsync({
        project_id: projectId,
        tools: validationResult.data.tools,
      });

      // Invalidate the tools query to refetch the list after successful import
      await utils.tool.getByProjectId.invalidate({ project_id: projectId }); // Corrected property name

      toast.success("Tools imported successfully!");
      onOpenChange(false);
      form.reset();
    } catch (error) {
      if (error instanceof SyntaxError) {
        toast.error("Invalid JSON", {
          description: "Please ensure the content is valid JSON.",
        });
      } else if (error instanceof Error) {
        toast.error("Import Failed", {
          description: error.message,
        });
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const placeholderJson =
    '[{"name": "my_tool", "prompt": "example prompt", "args": []}]';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Tools</DialogTitle>
          <DialogDescription>
            Paste JSON content containing an array of tools to import.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="jsonContent"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>JSON Content</FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "border-input max-h-[calc(100vh-300px)] min-h-[200px] overflow-y-auto rounded-md border",
                        isFocused &&
                          "ring-ring ring-offset-background ring-2 ring-offset-2",
                      )}
                    >
                      <Editor
                        value={field.value}
                        onValueChange={field.onChange}
                        highlight={(code) =>
                          highlight(code, languages.json as Grammar, "json")
                        }
                        padding={10}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className={cn(
                          "bg-background placeholder:text-muted-foreground min-h-[100%] rounded-md text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
                          "font-mono", // Ensure monospaced font for code
                          "whitespace-pre-wrap", // Ensure text wraps within the editor
                        )}
                        placeholder={placeholderJson}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Importing..." : "Import"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
