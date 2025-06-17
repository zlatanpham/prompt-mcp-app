"use client";

import React from "react";
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

interface ConfirmActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  isDanger?: boolean;
}

export function ConfirmActionDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isDanger = true,
}: ConfirmActionDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelText}</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            variant={isDanger ? "destructive" : "default"}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface ConfirmActionState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  isDanger: boolean;
}

export function useConfirmAction() {
  const [dialogState, setDialogState] = React.useState<ConfirmActionState>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => void 0,
    isDanger: true,
  });

  const confirm = (
    title: string,
    description: string,
    confirmText = "Confirm",
    cancelText = "Cancel",
    isDanger = true,
  ): Promise<boolean> => {
    return new Promise((resolve) => {
      setDialogState({
        isOpen: true,
        title,
        description,
        onConfirm: () => {
          resolve(true);
          setDialogState((prev) => ({ ...prev, isOpen: false }));
        },
        confirmText,
        cancelText,
        isDanger,
      });
    });
  };

  const onOpenChange = (open: boolean) => {
    setDialogState((prev) => ({ ...prev, isOpen: open }));
  };

  return {
    confirm,
    ConfirmActionDialog: (
      <ConfirmActionDialog {...dialogState} onOpenChange={onOpenChange} />
    ),
  };
}
