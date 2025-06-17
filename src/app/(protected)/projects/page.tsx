"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
import { timeAgo } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { useOrganization } from "../_context/organization";
import DashboardLayout from "@/components/dashboard-layout";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Project } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MoreHorizontal, Wrench, Pencil, Trash2 } from "lucide-react";
import { ProjectForm, type ProjectFormValues } from "@/components/project-form";
import { Badge } from "@/components/ui/badge"; // Import Badge component

const formSchema = z.object({
  name: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
});

// Extend the Project type to include the _count property from Prisma
type ProjectWithToolCount = Project & {
  _count: {
    Tool: number;
  };
};

export default function ProjectPage() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { organization } = useOrganization();
  const { data: projects, isLoading } =
    api.project.getAll.useQuery<ProjectWithToolCount[]>();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  React.useEffect(() => {
    if (searchParams.get("showCreateProject") === "true") {
      setIsCreateOpen(true);
      // Optionally, remove the query param from the URL to prevent re-opening on refresh
      // This would require using useRouter and shallow routing, but for simplicity, we'll just open it once.
    }
  }, [searchParams]);
  const [selectedProject, setSelectedProject] =
    useState<ProjectWithToolCount | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createProjectMutation = api.project.create.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["project", "getAll"]],
      });
      setIsCreateOpen(false);
      form.reset();
    },
  });

  const updateProjectMutation = api.project.updateById.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["project", "getAll"]],
      });
      setIsEditOpen(false);
      setSelectedProject(null);
    },
  });

  const deleteProjectMutation = api.project.delete.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: [["project", "getAll"]],
      });
    },
  });

  const onCreateSubmit = (values: z.infer<typeof formSchema>) => {
    const organization_id = organization?.id ?? "";
    createProjectMutation.mutate({
      ...values,
      organization_id,
    });
  };

  const onEditSubmit = (values: ProjectFormValues) => {
    if (!selectedProject) return;
    updateProjectMutation.mutate({
      project_id: selectedProject.id,
      name: values.name,
      description: values.description,
    });
  };

  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] =
    useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  const handleDeleteClick = (projectId: string) => {
    setProjectToDelete(projectId);
    setIsConfirmDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (projectToDelete) {
      deleteProjectMutation.mutate({ project_id: projectToDelete });
      setIsConfirmDeleteDialogOpen(false);
      setProjectToDelete(null);
    }
  };

  return (
    <DashboardLayout
      bredcrumb={[{ label: "Playground", href: "/" }, { label: "Projects" }]}
    >
      <div className="-mx-4 flex items-center justify-between border-b px-4 py-2">
        <h1 className="text-md font-medium">Projects</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">New Project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>New Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreateSubmit)}
                className="grid gap-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Project description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end pt-4">
                  <Button
                    type="submit"
                    disabled={createProjectMutation.status === "pending"}
                  >
                    Create
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="mb-2 h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="mx-auto grid w-full max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2">
          {projects?.map((project: ProjectWithToolCount) => {
            const date = project.updated_at ?? project.created_at;
            const timeAgoString = date ? timeAgo(date) : "N/A";
            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="flex h-full w-full flex-col justify-between p-3 transition-all">
                  <div>
                    <div className="flex items-center justify-between">
                      <h2 className="mb-2 text-base font-medium">
                        {project.name}
                      </h2>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                            }}
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        >
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedProject(project);
                              setIsEditOpen(true);
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onSelect={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteClick(project.id);
                            }}
                            className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-inherit" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {project.description ?? "No description"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between border-t pt-3">
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <Wrench className="h-3 w-3" />
                      <span>{project._count.Tool} Tools</span>
                    </Badge>
                    <p className="text-muted-foreground text-sm">
                      Last edited {timeAgoString}
                    </p>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ProjectForm
              defaultValues={{
                name: selectedProject.name,
                description: selectedProject.description ?? "",
              }}
              onSubmit={onEditSubmit}
              isPending={updateProjectMutation.status === "pending"}
              onCancel={() => setIsEditOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <ConfirmActionDialog
        isOpen={isConfirmDeleteDialogOpen}
        onOpenChange={setIsConfirmDeleteDialogOpen}
        onConfirm={confirmDelete}
        title="Delete project?"
        description="This action cannot be undone. This will permanently delete your project and all associated tools."
        confirmText="Continue"
        cancelText="Cancel"
        isDanger
      />
    </DashboardLayout>
  );
}
