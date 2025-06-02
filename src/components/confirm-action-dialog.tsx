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
}

export function ConfirmActionDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
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
          <AlertDialogAction onClick={onConfirm}>
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
}

export function useConfirmAction() {
  const [dialogState, setDialogState] = React.useState<ConfirmActionState>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    cancelText: "",
    onConfirm: () => void 0,
  });

  const confirm = (
    title: string,
    description: string,
    confirmText = "Confirm",
    cancelText = "Cancel",
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
