"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { useGetModelIds } from "@/hooks/use-get-model-ids";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandList,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface ModelComboboxProps extends React.ComponentProps<typeof Popover> {
  value?: string;
  onValueChange?: (value: string) => void;
}

export function ModelCombobox({
  value,
  onValueChange,
  ...props
}: ModelComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const { data: models, isLoading } = useGetModelIds();

  const handleSelect = (currentValue: string) => {
    onValueChange?.(currentValue === value ? "" : currentValue);
    setOpen(false);
  };

  return (
    <Popover modal open={open} onOpenChange={setOpen} {...props}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between truncate")}
          disabled={isLoading}
        >
          {isLoading
            ? "Loading models..."
            : models?.find((model) => model.id === value)?.id
              ? value
              : "Select a model"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search model..." />
          <CommandList>
            <CommandEmpty>No model found.</CommandEmpty>
            <CommandGroup>
              {(models ?? []).map((model) => (
                <CommandItem
                  key={model.id}
                  value={model.id}
                  onSelect={handleSelect}
                >
                  {model.id}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      value === model.id ? "opacity-100" : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
