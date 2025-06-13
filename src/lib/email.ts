/* eslint-disable @typescript-eslint/no-unnecessary-type-assertion */
import { Resend } from "resend";
import { env } from "@/env.js";
import * as React from "react";
import { ResetPasswordEmail } from "@/components/emails/reset-password-email";

const resend = new Resend(env.RESEND_API_KEY as string);

export async function sendPasswordResetEmail(
  to: string,
  token: string,
  resetLink: string,
) {
  try {
    const { data, error } = await resend.emails.send({
      from: env.EMAIL_FROM as string,
      to: [to],
      subject: "Reset your password",
      react: React.createElement(ResetPasswordEmail, {
        resetLink,
      }),
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      return { success: false, error: error.message };
    }

    console.log("Password reset email sent:", data);
    return { success: true };
  } catch (error: unknown) {
    let errorMessage = "An unknown error occurred.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error("Error in sendPasswordResetEmail:", error);
    return { success: false, error: errorMessage };
  }
}
