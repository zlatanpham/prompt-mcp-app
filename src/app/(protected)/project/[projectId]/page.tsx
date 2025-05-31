"use client";

import React from "react";
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
import DashboardLayout from "@/components/dashboard-layout";
import Tool from "./_components/tool";
import { ProjectForm, type ProjectFormValues } from "@/components/project-form";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const [isEditing, setIsEditing] = React.useState(false);

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
        { label: "Project", href: "/project" },
        { label: !isLoading || project ? (project?.name ?? "") : "..." },
      ]}
    >
      {isLoading || !project ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h1 className="mb-4 text-2xl font-bold">{project.name}</h1>
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
          </div>

          <Tool />
        </>
      )}
    </DashboardLayout>
  );
}
