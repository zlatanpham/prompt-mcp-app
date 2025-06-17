"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface CreateApiKeyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  newApiKeyName: string;
  setNewApiKeyName: (name: string) => void;
  selectedProjectIds: string[];
  setSelectedProjectIds: (ids: string[]) => void;
  projectOptions: { value: string; label: string }[];
  handleCreateApiKey: () => void;
}

export function CreateApiKeyDialog({
  isOpen,
  onOpenChange,
  newApiKeyName,
  setNewApiKeyName,
  selectedProjectIds,
  setSelectedProjectIds,
  projectOptions,
  handleCreateApiKey,
}: CreateApiKeyDialogProps) {
  const handleCheckboxChange = (checked: boolean, projectId: string) => {
    let newSelectedProjectIds: string[];
    if (checked) {
      newSelectedProjectIds = [...selectedProjectIds, projectId];
    } else {
      newSelectedProjectIds = selectedProjectIds.filter(
        (id) => id !== projectId,
      );
    }
    setSelectedProjectIds(newSelectedProjectIds);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">New API Key</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New API Key</DialogTitle>
          <DialogDescription>
            Generate a new API key and select projects it can access.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={newApiKeyName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setNewApiKeyName(e.target.value)
              }
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="projects" className="pt-2 text-right">
              Projects
            </Label>
            <div className="col-span-3 flex flex-col gap-2 rounded-md border p-3">
              {projectOptions.map((project) => (
                <div
                  key={project.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`create-project-${project.value}`}
                    checked={selectedProjectIds.includes(project.value)}
                    onCheckedChange={(checked: boolean) =>
                      handleCheckboxChange(checked, project.value)
                    }
                  />
                  <Label
                    className="cursor-pointer font-normal"
                    htmlFor={`create-project-${project.value}`}
                  >
                    {project.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Button size="lg" onClick={handleCreateApiKey}>
          Create API Key
        </Button>
      </DialogContent>
    </Dialog>
  );
}
