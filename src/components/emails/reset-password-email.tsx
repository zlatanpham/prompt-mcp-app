import {
  Body,
  Button,
  Container,
  Head,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface ResetPasswordEmailProps {
  resetLink: string;
}

const main = {
  backgroundColor: "#ffffff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "26px",
};

const btnContainer = {
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#171717",
  borderRadius: "3px",
  color: "#fff",
  fontSize: "14px",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "12px",
};

const hr = {
  borderColor: "#cccccc",
  margin: "20px 0",
};

const footer = {
  color: "#999999",
  fontSize: "12px",
};

export const ResetPasswordEmail = ({ resetLink }: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section>
          <Text style={paragraph}>Hi,</Text>
          <Text style={paragraph}>
            You recently requested to reset the password for your account. Click
            the button below to proceed.
          </Text>
          <Section style={btnContainer}>
            <Button style={button} href={resetLink}>
              Reset password
            </Button>
          </Section>
          <Text style={paragraph}>
            If you did not request a password reset, please ignore this email or
            reply to let us know. This password reset link is only valid for the
            next 60 minutes.
          </Text>
          <Text style={paragraph}>
            Thanks,
            <br />
            Thanh
          </Text>
        </Section>
        <hr style={hr} />
        <Text style={footer}>
          If you were not expecting this email, you can ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
);
