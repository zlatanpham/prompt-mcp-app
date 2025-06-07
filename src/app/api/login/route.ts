import { signIn } from "@/server/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const data = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log("Sign-in data:", data);

    return NextResponse.json({ message: "Login successful" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("CredentialsSignin")) {
        return NextResponse.json(
          { message: "Invalid credentials." },
          { status: 401 },
        );
      }
      return NextResponse.json(
        { message: `An unexpected error occurred: ${error.message}` },
        { status: 500 },
      );
    }
    return NextResponse.json(
      { message: "An unknown error occurred." },
      { status: 500 },
    );
  }
}
