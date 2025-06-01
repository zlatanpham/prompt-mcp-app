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
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface EditApiKeyProjectsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  apiKeyToEditProjects: {
    id: string;
    name: string;
    currentProjectIds: string[];
  } | null;
  editSelectedProjectIds: string[];
  setEditSelectedProjectIds: (ids: string[]) => void;
  projectOptions: { value: string; label: string }[];
  handleUpdateProjects: () => void;
}

export function EditApiKeyProjectsDialog({
  isOpen,
  onOpenChange,
  apiKeyToEditProjects,
  editSelectedProjectIds,
  setEditSelectedProjectIds,
  projectOptions,
  handleUpdateProjects,
}: EditApiKeyProjectsDialogProps) {
  const handleEditCheckboxChange = (checked: boolean, projectId: string) => {
    let newEditSelectedProjectIds: string[];
    if (checked) {
      newEditSelectedProjectIds = [...editSelectedProjectIds, projectId];
    } else {
      newEditSelectedProjectIds = editSelectedProjectIds.filter(
        (id) => id !== projectId,
      );
    }
    setEditSelectedProjectIds(newEditSelectedProjectIds);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Edit Projects for {apiKeyToEditProjects?.name}
          </DialogTitle>
          <DialogDescription>
            Select projects this API key can access.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="edit-projects" className="pt-2 text-right">
              Projects
            </Label>
            <div className="col-span-3 flex flex-col gap-2">
              {projectOptions.map((project) => (
                <div
                  key={project.value}
                  className="flex items-center space-x-2"
                >
                  <Checkbox
                    id={`edit-project-${project.value}`}
                    checked={editSelectedProjectIds.includes(project.value)}
                    onCheckedChange={(checked: boolean) =>
                      handleEditCheckboxChange(checked, project.value)
                    }
                  />
                  <Label htmlFor={`edit-project-${project.value}`}>
                    {project.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Button onClick={handleUpdateProjects}>Save Changes</Button>
      </DialogContent>
    </Dialog>
  );
}
