"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
});

type EditNameFormValues = z.infer<typeof formSchema>;

interface EditNameDialogProps {
  currentName: string;
  onSuccess?: () => Promise<void>;
}

export function EditNameDialog({
  currentName,
  onSuccess,
}: EditNameDialogProps) {
  const [open, setOpen] = useState(false);

  const form = useForm<EditNameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: currentName,
    },
  });

  const updateNameMutation = api.user.updateName.useMutation({
    onSuccess: async () => {
      toast.success("Name updated successfully!");
      await onSuccess?.();
      setOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to update name.", {
        description: error.message,
      });
    },
  });

  function onSubmit(values: EditNameFormValues) {
    updateNameMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Name</DialogTitle>
          <DialogDescription>
            Make changes to your name here. Click save when {"you're"} done.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button
                size="lg"
                variant="outline"
                onClick={() => setOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <Button
                size="lg"
                type="submit"
                isLoading={updateNameMutation.isPending}
              >
                Save
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
