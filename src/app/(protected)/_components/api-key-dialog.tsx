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

import { DialogTrigger } from "@/components/ui/dialog";

const API_KEY_STORAGE_KEYS = {
  google: "google_ai_api_key",
  openai: "openai_api_key",
  deepseek: "deepseek_api_key",
  anthropic: "anthropic_api_key",
};

interface ApiKeyDialogProps {
  onSave: (keys: Record<string, string>) => void;
  onClose: () => void;
}

export function ApiKeyDialog({ onSave, onClose }: ApiKeyDialogProps) {
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      const loadedKeys: Record<string, string> = {};
      for (const provider in API_KEY_STORAGE_KEYS) {
        const key = localStorage.getItem(
          API_KEY_STORAGE_KEYS[provider as keyof typeof API_KEY_STORAGE_KEYS],
        );
        if (key) {
          loadedKeys[provider] = key;
        }
      }
      setApiKeys(loadedKeys);
    }
  }, [open]);

  const handleSave = () => {
    onSave(apiKeys);
    setOpen(false); // Close dialog after saving
  };

  const handleInputChange = (provider: string, value: string) => {
    setApiKeys((prevKeys) => ({
      ...prevKeys,
      [provider]: value,
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Enter API Keys</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Enter AI API Keys</DialogTitle>
          <DialogDescription>
            Please enter your API keys for the desired AI providers. These keys
            will be saved locally in your browser.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {Object.entries(API_KEY_STORAGE_KEYS).map(
            ([provider, storageKey]) => (
              <div
                className="grid grid-cols-4 items-center gap-4"
                key={provider}
              >
                <Label htmlFor={provider} className="text-right capitalize">
                  {provider} API Key
                </Label>
                <Input
                  id={provider}
                  type="password"
                  value={apiKeys[provider] ?? ""}
                  onChange={(e) => handleInputChange(provider, e.target.value)}
                  className="col-span-3"
                />
              </div>
            ),
          )}
        </div>
        <DialogFooter>
          <Button onClick={handleSave}>Save Keys</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
