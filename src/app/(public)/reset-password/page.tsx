"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import Link from "next/link";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");

  const confirmReset = api.user.confirmPasswordReset.useMutation({
    onSuccess: () => {
      setMessage("Your password has been reset successfully!");
      toast.success("Your password has been reset successfully!");
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    },
    onError: (error) => {
      setMessage(error.message);
      toast.error(error.message);
    },
  });

  useEffect(() => {
    if (!token) {
      setMessage("No reset token found. Please request a new password reset.");
      toast.error("No reset token found. Please request a new password reset.");
    }
  }, [token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setMessage("No reset token found. Please request a new password reset.");
      toast.error("No reset token found. Please request a new password reset.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setMessage("Passwords do not match.");
      toast.error("Passwords do not match.");
      return;
    }
    confirmReset.mutate({ token, newPassword, confirmPassword });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="mt-1 block w-full"
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="mt-1 block w-full"
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={confirmReset.status === "pending" || !token}
          >
            {confirmReset.status === "pending"
              ? "Resetting..."
              : "Reset Password"}
          </Button>
        </form>
        {message && (
          <p className="mt-4 text-center text-sm text-gray-600">{message}</p>
        )}
        <p className="mt-4 text-center text-sm">
          <Link href="/login" className="text-blue-600 hover:underline">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
