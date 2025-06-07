import { signIn } from "@/server/auth";

export async function POST() {
  await signIn("github", { redirectTo: "/" });
}
