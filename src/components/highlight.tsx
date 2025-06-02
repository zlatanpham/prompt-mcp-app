import React from "react";
import { cn } from "@/lib/utils";

interface HighlightProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

const Highlight = React.forwardRef<HTMLSpanElement, HighlightProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(
          "inline-block rounded-sm border border-rose-200 bg-rose-100 px-1 py-0.25 font-mono text-xs text-rose-700",
          className,
        )}
        {...props}
      >
        {children}
      </span>
    );
  },
);
Highlight.displayName = "Highlight";

export { Highlight };
