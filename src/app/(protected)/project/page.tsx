"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ConfirmActionDialog } from "@/components/confirm-action-dialog";
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/trpc/react";
import { useOrganization } from "../_context/organization";
import DashboardLayout from "@/components/dashboard-layout";
import Link from "next/link";
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
import { MoreHorizontal } from "lucide-react";
import { ProjectForm, type ProjectFormValues } from "@/components/project-form";

const formSchema = z.object({
  name: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
});

export default function ProjectPage() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { data: projects, isLoading } = api.project.getAll.useQuery();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

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
      bredcrumb={[{ label: "Dashboard", href: "/" }, { label: "Projects" }]}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>Create Project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create new Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onCreateSubmit)}
                className="grid gap-4 py-4"
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
                        <Input placeholder="Project description" {...field} />
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="mb-2 h-40 w-full" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
          {projects?.map((project: Project) => {
            const date = project.updated_at ?? project.created_at;
            const formattedDate = date
              ? format(new Date(date), "PPP p")
              : "N/A";
            return (
              <Card key={project.id} className="p-4">
                <div className="flex items-center justify-between">
                  <Link href={`/project/${project.id}`} key={project.id}>
                    <h2 className="mb-2 text-lg font-semibold">
                      {project.name}
                    </h2>
                  </Link>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedProject(project);
                          setIsEditOpen(true);
                        }}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onSelect={(e) => {
                          e.preventDefault(); // Prevent dropdown from closing
                          handleDeleteClick(project.id);
                        }}
                        className="text-red-600"
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <p className="mb-4 text-sm">
                  {project.description ?? "No description"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Updated at: {formattedDate}
                </p>
              </Card>
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
        title="Are you absolutely sure?"
        description="This action cannot be undone. This will permanently delete your project and remove its data from our servers."
        confirmText="Continue"
        cancelText="Cancel"
      />
    </DashboardLayout>
  );
}
