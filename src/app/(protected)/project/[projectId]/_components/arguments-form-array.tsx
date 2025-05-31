"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
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
import { MinusCircle } from "lucide-react";
import type { Argument } from "@/types/tool";

interface ArgumentsFormArrayProps {
  name: string;
}

export function ArgumentsFormArray({ name }: ArgumentsFormArrayProps) {
  const { control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name,
  });

  return (
    <div className="space-y-4">
      {fields.map((field, index) => (
        <div key={field.id} className="flex items-end space-x-2">
          <FormField
            control={control}
            name={`${name}.${index}.name`}
            render={({ field: formField }) => (
              <FormItem className="flex-1">
                <FormLabel className={index === 0 ? "block" : "sr-only"}>
                  Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Argument name" {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.description`}
            render={({ field: formField }) => (
              <FormItem className="flex-1">
                <FormLabel className={index === 0 ? "block" : "sr-only"}>
                  Description
                </FormLabel>
                <FormControl>
                  <Textarea placeholder="Description" {...formField} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.type`}
            render={({ field: formField }) => (
              <FormItem className="w-[120px]">
                <FormLabel className={index === 0 ? "block" : "sr-only"}>
                  Type
                </FormLabel>
                <Select
                  onValueChange={formField.onChange}
                  defaultValue={formField.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="string">String</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => remove(index)}
          >
            <MinusCircle className="text-destructive h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() =>
          append({ name: "", description: "", type: "string" } as Argument)
        }
      >
        Add Argument
      </Button>
    </div>
  );
}
