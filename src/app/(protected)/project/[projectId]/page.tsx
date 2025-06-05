"use client";

import React, { useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardLayout from "@/components/dashboard-layout";
import Tool from "./_components/tool";
import { ProjectForm, type ProjectFormValues } from "@/components/project-form";
import ExportToolsDialog from "./_components/export-tools-dialog";
import { ImportToolsDialog } from "./_components/import-tools-dialog";
import { MoveToolsDialog } from "./_components/move-tools-dialog";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const [isEditing, setIsEditing] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isMoveToolsDialogOpen, setIsMoveToolsDialogOpen] = useState(false);

  const {
    data: project,
    isLoading,
    error,
    refetch,
  } = api.project.getById.useQuery(
    { project_id: projectId! },
    { enabled: !!projectId },
  );

  if (error) {
    return (
      <div>Error loading project: {error?.message ?? "Unknown error"}</div>
    );
  }

  const updateProjectMutation = api.project.updateById.useMutation({
    onSuccess: async () => {
      setIsEditing(false);
      await refetch();
    },
  });

  const onSubmit = (data: ProjectFormValues) => {
    if (!projectId) return;
    updateProjectMutation.mutate({
      project_id: projectId,
      name: data.name,
      description: data.description,
    });
  };

  return (
    <DashboardLayout
      bredcrumb={[
        { label: "Dashboard", href: "/" },
        { label: "Projects", href: "/project" },
        {
          label:
            !isLoading || project ? (
              (project?.name ?? "")
            ) : (
              <Skeleton className="h-4 w-20" />
            ),
        },
      ]}
    >
      {isLoading || !project ? (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-1/3" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-28" />
              <Skeleton className="h-9 w-28" />
            </div>
          </div>
          <Skeleton className="h-[calc(100vh-200px)] w-full" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="mb-4 text-2xl font-bold">{project.name}</h1>
            <div className="flex items-center gap-2">
              <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogTrigger asChild>
                  <Button>Edit Project</Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Edit Project</DialogTitle>
                  </DialogHeader>
                  <ProjectForm
                    defaultValues={{
                      name: project.name,
                      description: project.description ?? "",
                    }}
                    onSubmit={onSubmit}
                    isPending={updateProjectMutation.status === "pending"}
                    onCancel={() => setIsEditing(false)}
                  />
                </DialogContent>
              </Dialog>
              <Dialog
                open={isExportDialogOpen}
                onOpenChange={setIsExportDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Export Tools</Button>
                </DialogTrigger>
                <ExportToolsDialog
                  isOpen={isExportDialogOpen}
                  onOpenChange={setIsExportDialogOpen}
                />
              </Dialog>
              <Dialog
                open={isImportDialogOpen}
                onOpenChange={setIsImportDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Import Tools</Button>
                </DialogTrigger>
                <ImportToolsDialog
                  projectId={projectId!}
                  open={isImportDialogOpen}
                  onOpenChange={setIsImportDialogOpen}
                />
              </Dialog>
              <Dialog
                open={isMoveToolsDialogOpen}
                onOpenChange={setIsMoveToolsDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button variant="outline">Move Tools</Button>
                </DialogTrigger>
                <MoveToolsDialog
                  isOpen={isMoveToolsDialogOpen}
                  onOpenChange={setIsMoveToolsDialogOpen}
                  currentProjectId={projectId!}
                />
              </Dialog>
            </div>
          </div>
          <Tool />
        </>
      )}
    </DashboardLayout>
  );
}
