"use server";

import { signIn } from "@/server/auth";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const result = await signIn("credentials", {
    email,
    password,
    redirect: false,
  });

  if (result?.error) {
    const errorMessage =
      (result.error as string | undefined) ??
      "Login failed. Please check your credentials.";
    throw new Error(errorMessage);
    return;
  }

  redirect("/");
}

export async function githubSignIn() {
  await signIn("github", {
    redirectTo: "/",
  });
}
