"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import Editor from "react-simple-code-editor";
import { highlight, languages, type Grammar } from "prismjs";
import "prismjs/components/prism-json"; // Import JSON language for Prism
import "prismjs/themes/prism.css"; // Or any other theme you prefer
import { cn } from "@/lib/utils";

interface ApiKeyDisplayDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  displayedApiKey: string | null;
  setDisplayedApiKey: (key: string | null) => void;
}

export function ApiKeyDisplayDialog({
  isOpen,
  onOpenChange,
  displayedApiKey,
  setDisplayedApiKey,
}: ApiKeyDisplayDialogProps) {
  const [isFocused, setIsFocused] = React.useState(false);

  const handleCopyConfig = () => {
    if (displayedApiKey) {
      void navigator.clipboard.writeText(displayedApiKey);
    }
    onOpenChange(false);
    setDisplayedApiKey(null); // Clear the displayed key after copying and closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="!max-w-xl">
        <DialogHeader>
          <DialogTitle>Your New API Key</DialogTitle>
          <DialogDescription>
            Please copy your API key now. This is the only time it will be
            displayed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-2">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="displayed-key">MCP Config</Label>
            <div
              className={cn(
                "border-input rounded-md border",
                isFocused &&
                  "ring-ring ring-offset-background ring-2 ring-offset-2",
              )}
            >
              <Editor
                value={displayedApiKey ?? ""}
                onValueChange={
                  // eslint-disable-next-line @typescript-eslint/no-empty-function
                  () => {}
                } // Read-only, so no change handler needed
                highlight={(code) =>
                  // eslint-disable-next-line
                  highlight(code, languages.json as Grammar, "json")
                }
                padding={10}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={cn(
                  "bg-background placeholder:text-muted-foreground max-h-[calc(100vh-300px)] min-h-[200px] overflow-y-auto rounded-md text-sm outline-none disabled:cursor-not-allowed disabled:opacity-50",
                  "font-mono", // Ensure monospaced font for code
                  "whitespace-pre-wrap", // Ensure text wraps within the editor
                )}
                readOnly
              />
            </div>
          </div>
        </div>
        <Button onClick={handleCopyConfig}>Copy Config to Clipboard</Button>
      </DialogContent>
    </Dialog>
  );
}
