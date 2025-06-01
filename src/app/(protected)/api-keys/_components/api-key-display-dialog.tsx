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
import { Textarea } from "@/components/ui/textarea";

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
  const handleCopyConfig = () => {
    if (displayedApiKey) {
      void navigator.clipboard.writeText(displayedApiKey);
    }
    onOpenChange(false);
    setDisplayedApiKey(null); // Clear the displayed key after copying and closing
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Your New API Key</DialogTitle>
          <DialogDescription>
            Please copy your API key now. This is the only time it will be
            displayed.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="displayed-key" className="text-right">
              MCP Config
            </Label>
            <Textarea
              id="displayed-key"
              value={displayedApiKey ?? ""}
              readOnly
              className="col-span-3 h-40 font-mono"
            />
          </div>
        </div>
        <Button onClick={handleCopyConfig}>Copy Config to Clipboard</Button>
      </DialogContent>
    </Dialog>
  );
}
