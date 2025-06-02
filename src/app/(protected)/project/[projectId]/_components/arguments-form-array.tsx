"use client";

import {
  useFormContext,
  type FieldArrayWithId,
  type UseFieldArrayRemove,
} from "react-hook-form"; // Added type keyword
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Trash2 } from "lucide-react";
import type { ManualToolFormValues } from "./manual-tool-dialog"; // Import ManualToolFormValues

interface ArgumentsFormArrayProps {
  fields: FieldArrayWithId<ManualToolFormValues, "arguments", "id">[];
  remove: UseFieldArrayRemove;
}

export function ArgumentsFormArray({
  fields,
  remove,
}: ArgumentsFormArrayProps) {
  const { control } = useFormContext();

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div
          key={field.id}
          className="relative mb-2 rounded-md border bg-gray-50 p-4 pt-5"
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
            className="absolute top-1 right-1"
          >
            <Trash2 className="text-destructive h-4 w-4" />
          </Button>
          <div className="space-y-4">
            <FormField
              control={control}
              name={`arguments.${index}.name`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input
                      className="bg-white"
                      placeholder="Argument name"
                      {...formField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`arguments.${index}.description`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      className="bg-white"
                      placeholder="Description"
                      {...formField}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`arguments.${index}.type`}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select
                    onValueChange={formField.onChange}
                    defaultValue={formField.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full bg-white">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="string">String</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="array">Array</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
