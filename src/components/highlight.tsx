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
        className={cn("inline-block px-1 font-mono text-sm", className)}
        {...props}
      >
        {children}
      </span>
    );
  },
);
Highlight.displayName = "Highlight";

export { Highlight };
