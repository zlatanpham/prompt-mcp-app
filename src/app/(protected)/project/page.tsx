"use client";

import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const formSchema = z.object({
  name: z.string().min(1, { message: "Title is required." }),
  description: z.string().optional(),
});

export default function ProjectPage() {
  const queryClient = useQueryClient();
  const { organization } = useOrganization();
  const { data: projects, isLoading } = api.project.getAll.useQuery();

  const [open, setOpen] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const ProjectMutation = api.project.create.useMutation({
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["project.getAll"] });
      setOpen(false);
      form.reset();
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    const organization_id = organization?.id ?? "";
    ProjectMutation.mutate({
      ...values,
      organization_id,
    });
  };

  return (
    <DashboardLayout
      bredcrumb={[{ label: "Dashboard", href: "/" }, { label: "projects" }]}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">projects</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Create Project</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create new Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
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
                    disabled={ProjectMutation.status === "pending"}
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
              <Link href={`/project/${project.id}`} key={project.id}>
                <Card key={project.id} className="p-4">
                  <h2 className="mb-2 text-lg font-semibold">{project.name}</h2>
                  <p className="mb-4 text-sm">
                    {project.description ?? "No description"}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    Updated at: {formattedDate}
                  </p>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
