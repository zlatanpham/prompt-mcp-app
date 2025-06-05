"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <Settings2 className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Tools
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[250px]">
        {!selectedProjectId ? (
          <>
            <DropdownMenuLabel>Select Project</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {projects?.map((project) => (
              <DropdownMenuItem
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <Badge className="flex h-5 w-5 items-center justify-center rounded-full p-0">
                    {project.name.charAt(0).toUpperCase()}
                  </Badge>
                  <span>{project.name}</span>
                </div>
                <span className="text-muted-foreground text-sm">
                  {project._count.Tool}
                </span>
              </DropdownMenuItem>
            ))}
          </>
        ) : (
          <>
            <DropdownMenuItem onClick={() => setSelectedProjectId(null)}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center justify-between">
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
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="px-2 py-1">
              <Input
                placeholder="Search tools..."
                value={toolSearchQuery}
                onChange={(e) => setToolSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
            <DropdownMenuSeparator />
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <DropdownMenuItem
                  key={tool.id}
                  className="flex items-center justify-between"
                  onSelect={(e) => e.preventDefault()} // Prevent menu close on switch click
                >
                  <span>{tool.name}</span>
                  <Switch
                    checked={enabledToolIds.has(tool.id)}
                    onCheckedChange={(checked) =>
                      handleToggleTool(tool.id, checked)
                    }
                  />
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>No tools found</DropdownMenuItem>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
