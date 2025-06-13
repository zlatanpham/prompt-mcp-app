"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "@/lib/utils";

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "focus-visible:ring-offset-background peer inline-flex h-4 w-8 shrink-0 cursor-pointer items-center rounded-full border ring-blue-600 transition-all outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600 data-[state=unchecked]:bg-gray-100",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background pointer-events-none block size-[calc(theme(spacing.4)_-2px)] rounded-full shadow-sm ring-0 transition-transform data-[state=checked]:translate-x-[theme(spacing.4)] data-[state=unchecked]:translate-x-0 dark:bg-black",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
