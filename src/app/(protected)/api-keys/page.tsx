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
import { Check, Copy, MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { CreateApiKeyDialog } from "./_components/create-api-key-dialog";
import { ApiKeyDisplayDialog } from "./_components/api-key-display-dialog";
import { DeleteApiKeyDialog } from "./_components/delete-api-key-dialog";
import { EditApiKeyProjectsDialog } from "./_components/edit-api-key-projects-dialog";
import { Skeleton } from "@/components/ui/skeleton"; // Added Skeleton import

import DashboardLayout from "@/components/dashboard-layout";

export default function ApiKeysPage() {
  const formatApiKeyNameForMcp = (name: string) => {
    return `mcp-prompt-${name.toLowerCase().replace(/\s+/g, "-")}`;
  };

  const { data: apiKeys, isLoading, refetch } = api.apiKey.getAll.useQuery();
  const { data: projects, isLoading: isLoadingProjects } =
    api.project.getAll.useQuery();

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

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [apiKeyToDelete, setApiKeyToDelete] = useState<string | null>(null);

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
      setIsDeleteDialogOpen(false);
      setApiKeyToDelete(null);
    }
  };

  const handleRegenerateApiKey = (id: string) => {
    regenerateApiKeyMutation.mutate({ id });
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
      bredcrumb={[{ label: "Dashboard", href: "/" }, { label: "API Keys" }]}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">API Keys</h1>
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
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Projects</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead>Updated At</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {apiKeys?.map((apiKey: (typeof apiKeys)[number]) => (
              <TableRow key={apiKey.id}>
                <TableCell className="font-medium">{apiKey.name}</TableCell>
                <TableCell className="font-mono text-sm">
                  <div className="flex items-center gap-2">
                    <span>{apiKey.key.substring(0, 8)}...</span>
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
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell>
                  {apiKey.projects
                    .map((p: { project: { name: string } }) => p.project.name)
                    .join(", ")}
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
                              (p: { projectId: string }) => p.projectId,
                            ),
                          });
                          setEditSelectedProjectIds(
                            apiKey.projects
                              .map((p: { projectId: string }) => p.projectId)
                              .filter((id): id is string => id !== undefined),
                          );
                          setIsEditProjectsDialogOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleRegenerateApiKey(apiKey.id)}
                      >
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
                        Copy Config
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setApiKeyToDelete(apiKey.id);
                          setIsDeleteDialogOpen(true);
                        }}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <ApiKeyDisplayDialog
        isOpen={isApiKeyDisplayDialogOpen}
        onOpenChange={setIsApiKeyDisplayDialogOpen}
        displayedApiKey={displayedApiKey}
        setDisplayedApiKey={setDisplayedApiKey}
      />

      <DeleteApiKeyDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        handleDeleteApiKey={handleDeleteApiKey}
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
    </DashboardLayout>
  );
}
