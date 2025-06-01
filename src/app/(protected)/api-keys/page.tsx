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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { Textarea } from "@/components/ui/textarea";

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
  const updateProjectsMutation = api.apiKey.updateProjects.useMutation({
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

  const handleUpdateProjects = () => {
    if (apiKeyToEditProjects) {
      updateProjectsMutation.mutate(
        {
          id: apiKeyToEditProjects.id,
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

  if (isLoading || isLoadingProjects) {
    return <div>Loading API Keys...</div>;
  }

  const projectOptions =
    projects?.map((p) => ({
      value: p.id,
      label: p.name,
    })) ?? [];

  return (
    <div className="container mx-auto py-10">
      <h1 className="mb-6 text-3xl font-bold">API Keys</h1>

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogTrigger asChild>
          <Button className="mb-4">Create New API Key</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New API Key</DialogTitle>
            <DialogDescription>
              Generate a new API key and select projects it can access.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <div className="col-span-3 flex flex-col gap-2">
                {projectOptions.map((project) => (
                  <div
                    key={project.value}
                    className="flex items-center space-x-2"
                  >
                    <Checkbox
                      id={`create-project-${project.value}`}
                      checked={selectedProjectIds.includes(project.value)}
                      onCheckedChange={(checked) => {
                        setSelectedProjectIds((prev) =>
                          checked
                            ? [...prev, project.value]
                            : prev.filter((id) => id !== project.value),
                        );
                      }}
                    />
                    <Label htmlFor={`create-project-${project.value}`}>
                      {project.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <Button onClick={handleCreateApiKey}>Create API Key</Button>
        </DialogContent>
      </Dialog>

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
                      Edit Projects
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

      {/* API Key Display Dialog */}
      <Dialog
        open={isApiKeyDisplayDialogOpen}
        onOpenChange={setIsApiKeyDisplayDialogOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Your New API Key</DialogTitle>
            <DialogDescription>
              Please copy your API key now. This is the only time it will be
              displayed.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="displayed-key" className="text-right">
                MCP Config
              </Label>
              <Textarea
                id="displayed-key"
                value={displayedApiKey ?? ""}
                readOnly
                className="col-span-3 h-40 font-mono"
              />
            </div>
          </div>
          <Button
            onClick={() => {
              if (displayedApiKey) {
                void navigator.clipboard.writeText(displayedApiKey);
              }
              setIsApiKeyDisplayDialogOpen(false);
            }}
          >
            Copy Config to Clipboard
          </Button>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              API Key.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteApiKey}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Projects Dialog */}
      <Dialog
        open={isEditProjectsDialogOpen}
        onOpenChange={setIsEditProjectsDialogOpen}
      >
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
                      onCheckedChange={(checked) => {
                        setEditSelectedProjectIds((prev) =>
                          checked
                            ? [...prev, project.value]
                            : prev.filter((id) => id !== project.value),
                        );
                      }}
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
    </div>
  );
}
