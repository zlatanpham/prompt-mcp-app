"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface ExportToolsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportToolsDialog({
  isOpen,
  onOpenChange,
}: ExportToolsDialogProps) {
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const { data: tools, isLoading: isLoadingTools } =
    api.tool.getByProjectId.useQuery(
      { project_id: projectId! },
      { enabled: !!projectId },
    );

  const [selectedToolIds, setSelectedToolIds] = useState<Set<string>>(
    new Set(),
  );
  const [isSelectAll, setIsSelectAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedToolIds(new Set());
      setIsSelectAll(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (tools && selectedToolIds.size === tools.length && tools.length > 0) {
      setIsSelectAll(true);
    } else {
      setIsSelectAll(false);
    }
  }, [selectedToolIds, tools]);

  const handleSelectTool = (toolId: string, checked: boolean) => {
    setSelectedToolIds((prev) => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(toolId);
      } else {
        newSet.delete(toolId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    setIsSelectAll(checked);
    setSelectedToolIds(() => {
      const newSet = new Set<string>();
      if (checked && tools) {
        tools.forEach((tool) => newSet.add(tool.id));
      }
      return newSet;
    });
  };

  const handleExport = () => {
    if (!tools) return;

    const toolsToExport = tools
      .filter((tool) => selectedToolIds.has(tool.id))
      .map((tool) => ({
        name: tool.name,
        description: tool.description,
        prompt: tool.prompt,
        args: tool.args ?? [],
      }));

    const jsonString = JSON.stringify(toolsToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exported_tools_${projectId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Export Tools</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isLoadingTools ? (
            <p>Loading tools...</p>
          ) : tools && tools.length > 0 ? (
            <>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="selectAll"
                  checked={isSelectAll}
                  onCheckedChange={(checked: boolean) =>
                    handleSelectAll(checked)
                  }
                />
                <Label htmlFor="selectAll" className="text-base font-semibold">
                  Select All
                </Label>
              </div>
              <div className="grid gap-2">
                {tools.map((tool) => (
                  <div key={tool.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={tool.id}
                      checked={selectedToolIds.has(tool.id)}
                      onCheckedChange={(checked: boolean) =>
                        handleSelectTool(tool.id, checked)
                      }
                    />
                    <Label htmlFor={tool.id}>{tool.name}</Label>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p>No tools available to export.</p>
          )}
        </div>
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleExport}
            disabled={selectedToolIds.size === 0}
          >
            Export Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
