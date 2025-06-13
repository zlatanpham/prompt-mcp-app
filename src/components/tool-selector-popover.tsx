"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
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
import { useRouter } from "next/navigation";

interface ToolSelectorPopoverProps {
  onToolsChange: (tools: Tool[]) => void;
}

const LOCAL_STORAGE_PREFIX = "tool_enabled_";

export function ToolSelectorPopover({
  onToolsChange,
}: ToolSelectorPopoverProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const { data: projects, isLoading: isLoadingProjects } =
    api.project.getAll.useQuery();
  const { data: allTools, isLoading: isLoadingTools } =
    api.tool.getAllByUserId.useQuery();

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );
  const [contentHeight, setContentHeight] = useState<number>(0);

  const projectListRef = React.useRef<HTMLDivElement>(null);
  const toolListRef = React.useRef<HTMLDivElement>(null);

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

  const allProjectsEnabledToolCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    if (projects && allTools) {
      projects.forEach((project) => {
        const projectTools = allTools.filter(
          (tool) => tool.project_id === project.id,
        );
        const enabledCount = projectTools.filter((tool) =>
          enabledToolIds.has(tool.id),
        ).length;
        counts[project.id] = enabledCount;
      });
    }
    return counts;
  }, [projects, allTools, enabledToolIds]);

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

  useEffect(() => {
    if (allTools) {
      const activeTools = allTools.filter((tool) =>
        enabledToolIds.has(tool.id),
      );
      onToolsChange(activeTools);
    }
  }, [enabledToolIds, allTools, onToolsChange]);

  useEffect(() => {
    const updateHeight = () => {
      if (selectedProjectId) {
        // Tool list is active
        if (toolListRef.current) {
          setContentHeight(toolListRef.current.offsetHeight);
          console.log("tools", toolListRef.current.offsetHeight);
        }
      } else {
        // Project list is active
        if (projectListRef.current) {
          setContentHeight(projectListRef.current.offsetHeight);
          console.log("projects", projectListRef.current.offsetHeight);
        }
      }
    };

    // Update height on mount and when selectedProjectId changes
    updateHeight();

    // Add a small delay to ensure content is rendered before measuring
    const timeoutId = setTimeout(updateHeight, 50);

    // Clean up timeout
    return () => clearTimeout(timeoutId);
  }, [selectedProjectId, projects, allTools, filteredTools, open]); // Re-run when data or filtered tools change

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

    // Only disable tools that are currently enabled
    const enabledToolsInSelectedProject = toolsInSelectedProject.filter(
      (tool) => enabledToolIds.has(tool.id),
    );

    setEnabledToolIds((prev) => {
      const newSet = new Set(prev);
      enabledToolsInSelectedProject.forEach((tool) => {
        newSet.delete(tool.id);
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${tool.id}`, "false");
      });
      return newSet;
    });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1"
          disabled={isLoadingProjects || isLoadingTools}
        >
          <Settings2 className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Tools
          </span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[320px] overflow-hidden p-0">
        <motion.div
          initial={false}
          animate={{
            x: selectedProjectId ? -320 : 0,
          }}
          style={{ height: contentHeight }}
          transition={{ duration: 0.2 }}
          className="flex w-[640px] items-start"
        >
          {/* Pane 1: Project List */}
          <div ref={projectListRef} className="w-[320px] p-1">
            {projects?.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 text-center">
                <p className="text-muted-foreground mb-4 text-sm">
                  No active projects found.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => {
                    setOpen(false);
                    router.push("/projects?showCreateProject=true");
                  }}
                >
                  Create a Project
                </Button>
              </div>
            ) : (
              projects?.map((project) => (
                <div
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className="hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="h-6 w-6 flex-shrink-0">
                      {project.name.charAt(0).toUpperCase()}
                    </Badge>
                    <span>{project.name}</span>
                  </div>
                  <span className="ml-auto text-sm">
                    {allProjectsEnabledToolCounts[project.id] === 0 ? (
                      <span className="text-muted-foreground text-xs">
                        Disabled
                      </span>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        {allProjectsEnabledToolCounts[project.id]}
                      </Badge>
                    )}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Pane 2: Tool List */}
          <div ref={toolListRef} className="w-[320px] p-1">
            <div
              onClick={() => setSelectedProjectId(null)}
              className="hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />{" "}
            {/* Separator */}
            <div className="flex items-center justify-between px-2 py-2 text-sm font-medium">
              <span>
                Tools for{" "}
                {projects?.find((p) => p.id === selectedProjectId)?.name}
              </span>
              {currentProjectTools.length > 1 && (
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
              )}
            </div>
            <div className="h-px bg-gray-200 dark:bg-gray-700" />{" "}
            {/* Separator */}
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <div
                  key={tool.id}
                  className="hover:bg-accent hover:text-accent-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm transition-colors outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                >
                  <span className="mr-2 truncate overflow-hidden font-mono text-[13px] whitespace-nowrap">
                    {tool.name}
                  </span>
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
              <div className="text-muted-foreground relative flex cursor-default items-center rounded-sm px-2 py-1.5 text-sm outline-none select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50">
                No tools found
              </div>
            )}
            <div className="h-px bg-gray-200 dark:bg-gray-700" />{" "}
            {/* Separator */}
            <div className="px-2 pt-2 pb-1">
              <Input
                placeholder="Search tools..."
                value={toolSearchQuery}
                onChange={(e) => setToolSearchQuery(e.target.value)}
                className="h-8"
              />
            </div>
          </div>
        </motion.div>
      </PopoverContent>
    </Popover>
  );
}
