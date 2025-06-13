"use client";

import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Check,
  Copy,
  MoreHorizontal,
  Pencil,
  RefreshCw,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { CreateApiKeyDialog } from "./_components/create-api-key-dialog";
import { ApiKeyDisplayDialog } from "./_components/api-key-display-dialog";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { EditApiKeyProjectsDialog } from "./_components/edit-api-key-projects-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import { ApiKeyToolsDrawer } from "./_components/api-key-tools-drawer";
import { Badge } from "@/components/ui/badge";
import { Wrench } from "lucide-react";
import { truncate } from "@/utils/string";

export default function ApiKeysPage() {
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);
  const [apiKeyIdForTools, setApiKeyIdForTools] = useState<string | null>(null);

  const formatApiKeyNameForMcp = (name: string) => {
    return `mcp-prompt-${name.toLowerCase().replace(/\s+/g, "-")}`;
  };

  const { data: apiKeys, isLoading, refetch } = api.apiKey.getAll.useQuery();
  const { data: projects } = api.project.getAll.useQuery();

  const createApiKeyMutation = api.apiKey.create.useMutation({
    onSuccess: (data: { key: string; name: string }) => {
      void refetch();
      setNewApiKeyName("");
      setSelectedProjectIds([]);
      setIsCreateDialogOpen(false);
      const mcpConfig = {
        mcpServers: {
          [formatApiKeyNameForMcp(data.name)]: {
            command: "npx",
            args: ["-y", "@x-mcp/prompt@latest"],
            env: {
              API_URL: `${window.location.origin}/api/tools`,
              API_KEY: data.key,
            },
          },
        },
      };
      setDisplayedApiKey(JSON.stringify(mcpConfig, null, 2));
      setIsApiKeyDisplayDialogOpen(true);
    },
  });
  const deleteApiKeyMutation = api.apiKey.delete.useMutation({
    onSuccess: () => void refetch(),
  });
  const regenerateApiKeyMutation = api.apiKey.regenerate.useMutation({
    onSuccess: (data: { key: string; name: string }) => {
      void refetch();
      const mcpConfig = {
        mcpServers: {
          [formatApiKeyNameForMcp(data.name)]: {
            command: "npx",
            args: ["-y", "@x-mcp/prompt@latest"],
            env: {
              API_URL: `${window.location.origin}/api/tools`,
              API_KEY: data.key,
            },
          },
        },
      };
      setDisplayedApiKey(JSON.stringify(mcpConfig, null, 2));
      setIsApiKeyDisplayDialogOpen(true);
    },
  });
  const updateApiKeyMutation = api.apiKey.updateApiKey.useMutation({
    onSuccess: () => void refetch(),
  });

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<string | null>(null);

  const [isConfirmRegenerateDialogOpen, setIsConfirmRegenerateDialogOpen] =
    useState(false);
  const [apiKeyToRegenerate, setApiKeyToRegenerate] = useState<string | null>(
    null,
  );

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newApiKeyName, setNewApiKeyName] = useState("");
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const [isApiKeyDisplayDialogOpen, setIsApiKeyDisplayDialogOpen] =
    useState(false);
  const [displayedApiKey, setDisplayedApiKey] = useState<string | null>(null);
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  const [isEditProjectsDialogOpen, setIsEditProjectsDialogOpen] =
    useState(false);
  const [apiKeyToEditProjects, setApiKeyToEditProjects] = useState<{
    id: string;
    name: string;
    currentProjectIds: string[];
  } | null>(null);
  const [editSelectedProjectIds, setEditSelectedProjectIds] = useState<
    string[]
  >([]);

  const handleCreateApiKey = () => {
    createApiKeyMutation.mutate({
      name: newApiKeyName,
      projectIds: selectedProjectIds,
    });
  };

  const handleDeleteApiKey = () => {
    if (apiKeyToDelete) {
      deleteApiKeyMutation.mutate({ id: apiKeyToDelete });
      setIsConfirmDeleteDialogOpen(false);
      setApiKeyToDelete(null);
    }
  };

  const handleRegenerateApiKeyClick = (id: string) => {
    setApiKeyToRegenerate(id);
    setIsConfirmRegenerateDialogOpen(true);
  };

  const handleConfirmRegenerateApiKey = () => {
    if (apiKeyToRegenerate) {
      regenerateApiKeyMutation.mutate({ id: apiKeyToRegenerate });
      setIsConfirmRegenerateDialogOpen(false);
      setApiKeyToRegenerate(null);
    }
  };

  const handleUpdateProjects = (newName: string) => {
    if (apiKeyToEditProjects) {
      updateApiKeyMutation.mutate(
        {
          id: apiKeyToEditProjects.id,
          name: newName,
          projectIds: editSelectedProjectIds,
        },
        {
          onSuccess: () => {
            setIsEditProjectsDialogOpen(false);
            setApiKeyToEditProjects(null);
            setEditSelectedProjectIds([]);
          },
        },
      );
    }
  };

  const projectOptions =
    projects?.map((p) => ({
      value: p.id,
      label: p.name,
    })) ?? [];

  return (
    <DashboardLayout
      bredcrumb={[{ label: "Playground", href: "/" }, { label: "API Keys" }]}
    >
      <div className="-mx-4 flex items-center justify-between border-b px-4 py-2">
        <h1 className="text-md font-medium">API Keys</h1>
        <CreateApiKeyDialog
          isOpen={isCreateDialogOpen}
          onOpenChange={setIsCreateDialogOpen}
          newApiKeyName={newApiKeyName}
          setNewApiKeyName={setNewApiKeyName}
          selectedProjectIds={selectedProjectIds}
          setSelectedProjectIds={setSelectedProjectIds}
          projectOptions={projectOptions}
          handleCreateApiKey={handleCreateApiKey}
        />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead>Tools</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Updated At</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys && apiKeys.length > 0 ? (
                apiKeys.map((apiKey) => {
                  const totalToolCount = apiKey.projects.reduce(
                    (sum, ap) => sum + (ap.project._count?.Tool || 0),
                    0,
                  );
                  return (
                    <TableRow key={apiKey.id}>
                      <TableCell className="font-medium">
                        {apiKey.name}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        <div className="flex items-center gap-2">
                          <span>{truncate(apiKey.key, 10, true)}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              void navigator.clipboard.writeText(apiKey.key);
                              setCopiedKeyId(apiKey.id);
                              setTimeout(() => setCopiedKeyId(null), 2000);
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {copiedKeyId === apiKey.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-x-1">
                          {apiKey.projects.map((p, index) => (
                            <Link
                              key={p.project.id}
                              href={`/projects/${p.project.id}`}
                              className="text-blue-600 hover:underline"
                            >
                              {p.project.name}
                              {index < apiKey.projects.length - 1 ? "," : ""}
                            </Link>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="link"
                          className="h-auto cursor-pointer p-0"
                          onClick={() => {
                            setApiKeyIdForTools(apiKey.id);
                            setIsToolsDrawerOpen(true);
                          }}
                        >
                          <Badge
                            variant="secondary"
                            className="flex items-center gap-1"
                          >
                            <Wrench className="h-3 w-3" />
                            <span>{totalToolCount} Tools</span>
                          </Badge>
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(apiKey.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(apiKey.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setApiKeyToEditProjects({
                                  id: apiKey.id,
                                  name: apiKey.name,
                                  currentProjectIds: apiKey.projects.map(
                                    (p) => p.projectId,
                                  ),
                                });
                                setEditSelectedProjectIds(
                                  apiKey.projects
                                    .map((p) => p.projectId)
                                    .filter(
                                      (id): id is string => id !== undefined,
                                    ),
                                );
                                setIsEditProjectsDialogOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleRegenerateApiKeyClick(apiKey.id)
                              }
                            >
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Regenerate Key
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                const mcpConfig = {
                                  mcpServers: {
                                    [formatApiKeyNameForMcp(apiKey.name)]: {
                                      command: "npx",
                                      args: ["-y", "@x-mcp/prompt@latest"],
                                      env: {
                                        API_URL: `${window.location.origin}/api/tools`,
                                        API_KEY: apiKey.key,
                                      },
                                    },
                                  },
                                };
                                void navigator.clipboard.writeText(
                                  JSON.stringify(mcpConfig, null, 2),
                                );
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Copy Config
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setApiKeyToDelete(apiKey.id);
                                setIsConfirmDeleteDialogOpen(true);
                              }}
                              className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4 text-inherit" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7}>
                    <div className="flex w-full flex-col items-center justify-center space-y-2 py-5">
                      <Wrench className="text-muted-foreground" />
                      <p className="text-muted-foreground text-sm">
                        No API Keys found.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <ApiKeyDisplayDialog
        isOpen={isApiKeyDisplayDialogOpen}
        onOpenChange={setIsApiKeyDisplayDialogOpen}
        displayedApiKey={displayedApiKey}
        setDisplayedApiKey={setDisplayedApiKey}
      />

      <ConfirmActionDialog
        isOpen={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        onConfirm={handleDeleteApiKey}
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your API Key."
        confirmText="Continue"
        cancelText="Cancel"
      />

      <ConfirmActionDialog
        isOpen={isConfirmRegenerateDialogOpen}
        onOpenChange={setIsConfirmRegenerateDialogOpen}
        onConfirm={handleConfirmRegenerateApiKey}
        title="Are you sure you want to regenerate this API Key?"
        description="Regenerating the API Key will invalidate the old key and generate a new one. This action cannot be undone."
        confirmText="Regenerate"
        cancelText="Cancel"
      />

      <EditApiKeyProjectsDialog
        isOpen={isEditProjectsDialogOpen}
        onOpenChange={setIsEditProjectsDialogOpen}
        apiKeyToEditProjects={apiKeyToEditProjects}
        editSelectedProjectIds={editSelectedProjectIds}
        setEditSelectedProjectIds={setEditSelectedProjectIds}
        projectOptions={projectOptions}
        handleUpdateProjects={handleUpdateProjects}
      />

      <ApiKeyToolsDrawer
        isOpen={isToolsDrawerOpen}
        onOpenChange={setIsToolsDrawerOpen}
        apiKeyId={apiKeyIdForTools}
      />
    </DashboardLayout>
  );
}
