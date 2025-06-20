"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { API_KEY_STORAGE_KEYS } from "@/lib/constants"; // Import from constants
import { SquareArrowOutUpRightIcon } from "lucide-react"; // Import Link icon

interface ApiKeyDialogProps {
  onSave: (keys: Record<string, string>) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ApiKeyDialog({
  onSave,
  isOpen,
  onOpenChange,
}: ApiKeyDialogProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      const loadedKeys: Record<string, string> = {};
      for (const provider in API_KEY_STORAGE_KEYS) {
        const key = localStorage.getItem(
          API_KEY_STORAGE_KEYS[provider as keyof typeof API_KEY_STORAGE_KEYS]
            .localStorageKey,
        );
        if (key) {
          loadedKeys[provider] = key;
        }
      }
      setApiKeys(loadedKeys);
    }
  }, [isOpen]);

  const handleSave = () => {
    onSave(apiKeys);
    onOpenChange(false); // Close dialog after saving
  };

  const handleInputChange = (provider: string, value: string) => {
    setApiKeys((prevKeys) => ({
      ...prevKeys,
      [provider]: value,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Enter AI API Keys</DialogTitle>
          <DialogDescription>
            Please enter your API keys for the desired AI providers. These keys
            will be saved locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {Object.entries(API_KEY_STORAGE_KEYS).map(([provider, { link }]) => (
            <div className="grid grid-cols-5 items-center gap-4" key={provider}>
              <Label
                htmlFor={provider}
                className="flex items-center gap-1 text-right capitalize"
              >
                {provider}
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    <SquareArrowOutUpRightIcon className="inline h-3 w-3" />
                  </a>
                )}
              </Label>
              <Input
                id={provider}
                type="password"
                value={apiKeys[provider] ?? ""}
                onChange={(e) => handleInputChange(provider, e.target.value)}
                className="col-span-4"
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button size="lg" onClick={handleSave}>
            Save Keys
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
