# Prompt MCP

An open-source application for managing AI prompts and tools.

## About

This application helps you manage and organize your AI prompts and tools. It provides a structured way to define, store, and utilize various AI-powered functionalities.

## Features

- **Prompt Management:** Define and manage AI prompts for various tasks.
- **Tool Integration:** Integrate and manage custom AI tools.
- **API Key Management:** Securely manage API keys for different services.
- **Project Organization:** Organize prompts and tools within projects.
- **User Management:** Handle user accounts and permissions.

## Built with T3 Stack

This project is built using the T3 stack, which includes:

- [Next.js](https://nextjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Prisma](https://www.prisma.io/)
- [tRPC](https://trpc.io)
- [NextAuth.js](https://next-auth.js.org)

Further details about the T3 stack can be found in the [T3 Stack documentation](https://create.t3.gg/).

## Getting Started for Developers

To get started with development, follow these steps:

### Requirements

- Node.js >= 18.0.0
- pnpm >= 8.6.12
- Docker Desktop (for local Postgres)

### Setup

1.  **Environment Variables:** Create a `.env` file from `.env.example` and configure necessary environment variables (e.g., `NEXTAUTH_SECRET`, `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
2.  **Database:**
    ```bash
    ./start-database
    ```
3.  **Install Dependencies:**
    ```bash
    pnpm install
    ```
    Database migrations will run automatically during the installation process.

### Running the app

To run the app locally for development:

```bash
pnpm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app in your browser.
