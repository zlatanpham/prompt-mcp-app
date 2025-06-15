import React from "react";
import { useFieldArray, type UseFormReturn } from "react-hook-form";
import * as z from "zod";
import { toolNameSchema } from "@/lib/validators/tool";
import { argumentSchema, type Argument } from "@/types/tool";
import { ArgumentsFormArray } from "./arguments-form-array";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

export const manualToolFormSchema = z
  .object({
    name: toolNameSchema,
    description: z.string().min(1, "Description is required"),
    prompt: z.string().min(1, "Prompt is required"),
    arguments: z.array(argumentSchema).optional(),
  })
  .refine(
    (data) => {
      if (data.arguments && data.arguments.length > 0) {
        for (const arg of data.arguments) {
          const placeholder = `{${arg.name}}`;
          if (!data.prompt.includes(placeholder)) {
            return false; // Validation fails
          }
        }
      }
      return true; // Validation passes
    },
    {
      message:
        "Prompt must contain placeholders for all arguments in the format {argumentName}.",
      path: ["prompt"], // Attach error to the prompt field
    },
  );

export type ManualToolFormValues = z.infer<typeof manualToolFormSchema>;

interface ManualToolFormProps {
  form: UseFormReturn<ManualToolFormValues>;
  onSubmit: (data: ManualToolFormValues) => void;
  isLoading?: boolean;
  isSubmitting?: boolean;
  submitButtonText: string;
  showBackButton?: boolean;
  onBackButtonClick?: () => void;
}

export function ManualToolForm({
  form,
  onSubmit,
  isLoading = false,
  isSubmitting = false,
  submitButtonText,
  showBackButton = false,
  onBackButtonClick,
}: ManualToolFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "arguments",
  });

  return (
    <Form {...form}>
      <form
        id="manual-tool-form"
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4"
        noValidate
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>
        ) : (
          <>
            <div className="-mx-6 max-h-[calc(100dvh-200px)] space-y-4 overflow-y-auto px-6 sm:max-w-[600px]">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Tool name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Briefly describe the tool..."
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Write prompt here..."
                        className="max-h-[400px] min-h-40"
                        rows={8}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <FormLabel>Arguments</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        name: "",
                        description: "",
                        type: "string",
                      } as Argument)
                    }
                  >
                    Add Argument
                  </Button>
                </div>
                <ArgumentsFormArray fields={fields} remove={remove} />
              </div>
            </div>

            <div className="flex justify-between">
              {showBackButton && (
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  onClick={onBackButtonClick}
                >
                  Back
                </Button>
              )}
              <Button
                type="submit"
                size="lg"
                variant="default"
                disabled={isSubmitting}
                className={showBackButton ? "ml-auto" : "w-full"}
              >
                {submitButtonText}
              </Button>
            </div>
          </>
        )}
      </form>
    </Form>
  );
}
