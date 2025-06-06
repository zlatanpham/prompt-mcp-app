"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { ChevronLeft, Settings2 } from "lucide-react";
import { api } from "@/trpc/react";
import { type Tool } from "@/types/tool";

interface ToolSelectorDropdownProps {
  onToolsChange: (tools: Tool[]) => void;
}

const LOCAL_STORAGE_PREFIX = "tool_enabled_";

export function ToolSelectorDropdown({
  onToolsChange,
}: ToolSelectorDropdownProps) {
  const { data: projects, isLoading: isLoadingProjects } =
    api.project.getAll.useQuery();
  const { data: allTools, isLoading: isLoadingTools } =
    api.tool.getAllByUserId.useQuery();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [toolSearchQuery, setToolSearchQuery] = useState("");
  const [enabledToolIds, setEnabledToolIds] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      const storedEnabledTools = new Set<string>();
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(LOCAL_STORAGE_PREFIX)) {
          const toolId = key.substring(LOCAL_STORAGE_PREFIX.length);
          if (localStorage.getItem(key) === "true") {
            storedEnabledTools.add(toolId);
          }
        }
      }
      return storedEnabledTools;
    }
    return new Set();
  });

  useEffect(() => {
    if (allTools) {
      const activeTools = allTools.filter((tool) =>
        enabledToolIds.has(tool.id),
      );
      onToolsChange(activeTools);
    }
  }, [enabledToolIds, allTools, onToolsChange]);

  const handleToggleTool = (toolId: string, isEnabled: boolean) => {
    setEnabledToolIds((prev) => {
      const newSet = new Set(prev);
      if (isEnabled) {
        newSet.add(toolId);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${toolId}`, "true");
      } else {
        newSet.delete(toolId);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${toolId}`, "false");
      }
      return newSet;
    });
  };

  const handleDisableAllTools = () => {
    if (!selectedProjectId || !allTools) return;

    const toolsInSelectedProject = allTools.filter(
      (tool) => tool.project_id === selectedProjectId,
    );

    setEnabledToolIds((prev) => {
      const newSet = new Set(prev);
      toolsInSelectedProject.forEach((tool) => {
        newSet.delete(tool.id);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${tool.id}`, "false");
      });
      return newSet;
    });
  };

  const currentProjectTools = useMemo(() => {
    if (!selectedProjectId || !allTools) return [];
    return allTools.filter((tool) => tool.project_id === selectedProjectId);
  }, [selectedProjectId, allTools]);

  const filteredTools = useMemo(() => {
    if (!toolSearchQuery) return currentProjectTools;
    return currentProjectTools.filter((tool) =>
      tool.name.toLowerCase().includes(toolSearchQuery.toLowerCase()),
    );
  }, [toolSearchQuery, currentProjectTools]);

  if (isLoadingProjects || isLoadingTools) {
    return (
      <Button variant="outline" size="sm" className="h-8 gap-1">
        <Settings2 className="h-3.5 w-3.5" />
        <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
          Loading Tools...
        </span>
      </Button>
    );
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Settings2 className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Tools
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[250px] p-0">
        {!selectedProjectId ? (
          <>
            <div className="px-4 py-2 text-sm font-semibold">
              Select Project
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />{" "}
            {/* Separator */}
            {projects?.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-4 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
              >
                <div className="flex items-center gap-2">
                  <Badge className="flex h-5 w-5 items-center justify-center rounded-full p-0">
                    {project.name.charAt(0).toUpperCase()}
                  </Badge>
                  <span>{project.name}</span>
                </div>
                <span className="text-muted-foreground ml-auto text-sm">
                  {project._count.Tool}
                </span>
              </div>
            ))}
          </>
        ) : (
          <>
            <div
              onClick={() => setSelectedProjectId(null)}
              className="hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-4 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />{" "}
            {/* Separator */}
            <div className="flex items-center justify-between px-4 py-2 text-sm font-semibold">
              <span>
                Tools for{" "}
                {projects?.find((p) => p.id === selectedProjectId)?.name}
              </span>
              <div className="flex items-center space-x-2">
                <span className="text-muted-foreground text-xs">
                  Disable All
                </span>
                <Switch
                  checked={currentProjectTools.every(
                    (tool) => !enabledToolIds.has(tool.id),
                  )}
                  onCheckedChange={handleDisableAllTools}
                />
              </div>
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />{" "}
            {/* Separator */}
            <div className="px-2 py-1">
              <Input
                placeholder="Search tools..."
                value={toolSearchQuery}
                onChange={(e) => setToolSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />{" "}
            {/* Separator */}
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-4 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span>{tool.name}</span>
                  <Switch
                    checked={enabledToolIds.has(tool.id)}
                    onCheckedChange={(checked) =>
                      handleToggleTool(tool.id, checked)
                    }
                    className="ml-auto"
                  />
                </div>
              ))
            ) : (
              <div className="text-muted-foreground relative flex cursor-default items-center rounded-sm px-4 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                No tools found
              </div>
            )}
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
