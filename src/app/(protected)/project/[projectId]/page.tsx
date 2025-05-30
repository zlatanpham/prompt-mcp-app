"use client";

import React from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import DashboardLayout from "@/components/dashboard-layout";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Prompt from "./_components/prompt";

const projectFormSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

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

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
    },
  });

  React.useEffect(() => {
    if (project) {
      form.reset({
        name: project.name,
        description: project.description ?? "",
      });
    }
  }, [project, form.reset]);

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
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                    noValidate
                  >
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Project Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Textarea {...field} rows={4} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex space-x-2">
                      <Button type="submit" variant="default">
                        Save
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-3">
            <div className="col-span-2"></div>
            <div className="col-span-1 space-y-4">
              <Prompt />
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
