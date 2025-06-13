"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { api } from "@/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";

const formSchema = z.object({
  toolIds: z.array(z.string()),
});

interface ExportToolsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ExportToolsDialog({
  isOpen,
  onOpenChange,
}: ExportToolsDialogProps) {
  const params = useParams();
  const projectId = params.projectId as string | undefined;

  const { data: tools, isLoading: isLoadingTools } =
    api.tool.getByProjectId.useQuery(
      { project_id: projectId! },
      { enabled: !!projectId },
    );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      toolIds: [],
    } as z.infer<typeof formSchema>,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const selectedToolIds = form.watch("toolIds");

  const filteredTools = tools?.filter((tool) =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (isOpen) {
      form.reset({ toolIds: [] });
      setSearchTerm(""); // Reset search term when dialog opens
    }
  }, [isOpen, form]);

  const handleSelectAll = () => {
    if (filteredTools && selectedToolIds.length === filteredTools.length) {
      // If all filtered tools are selected, deselect all
      form.setValue("toolIds", []);
    } else if (filteredTools) {
      // Otherwise, select all filtered tools
      form.setValue(
        "toolIds",
        filteredTools.map((tool) => tool.id),
      );
    }
  };

  const handleExport = () => {
    if (!tools) return;

    const toolsToExport = tools
      .filter((tool) => selectedToolIds.includes(tool.id))
      .map((tool) => ({
        name: tool.name,
        description: tool.description,
        prompt: tool.prompt,
        args: tool.args ?? [],
      }));

    const jsonString = JSON.stringify(toolsToExport, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `exported_tools_${projectId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Export Tools</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-2">
            {isLoadingTools ? (
              <p>Loading tools...</p>
            ) : (
              <>
                <Input
                  placeholder="Search tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                />
                {filteredTools && filteredTools.length > 0 ? (
                  <>
                    <ScrollArea className="mt-2 h-[300px] rounded-md border">
                      <div className="space-y-2 p-4">
                        {filteredTools.map((tool) => (
                          <FormField
                            key={tool.id}
                            control={form.control}
                            name="toolIds"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={tool.id}
                                  className="flex flex-row items-center space-y-0 space-x-3"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(tool.id)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              tool.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== tool.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="w-5/6 max-w-[400px] font-mono text-sm font-normal">
                                    <span className="truncate">
                                      {tool.name}
                                    </span>
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="flex items-center justify-between">
                      <Button
                        type="button"
                        variant={
                          selectedToolIds.length === filteredTools.length
                            ? "secondary"
                            : "outline"
                        }
                        size="sm"
                        onClick={handleSelectAll}
                      >
                        {selectedToolIds.length === filteredTools.length && (
                          <Check className="h-4 w-4" />
                        )}
                        <span>Select All</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground py-5 text-center">
                    No tools found matching your search.
                  </p>
                )}
              </>
            )}
          </form>
        </Form>
        <DialogFooter>
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="lg"
            type="button"
            onClick={handleExport}
            disabled={selectedToolIds.length === 0}
          >
            Export Selected
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
