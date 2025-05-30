# Project Configuration: T3 Stack with Prisma, Next-Auth, Shadcn UI

## Tech Stack

- Framework: Next.js 14+ (App Router)
- Language: TypeScript
- API Layer: tRPC (for end-to-end typesafe APIs)
- ORM: Prisma (Database access and migrations)
- Authentication: Next-Auth.js
- UI Components: Shadcn UI
- Styling: Tailwind CSS
- Validation: Zod (Integrated with tRPC, forms, etc.)
- Form Handling: React Hook Form (validation with Zod, UI with Shadcn form components)
- Database: PostgreSQL - Configured via Prisma
- Deployment: Vercel
- Version Control: Git (GitHub)

## Project Structure (Typical T3 Layout)

```
.
├── .github/              # GitHub Actions/workflows (optional)
├── .vscode/              # VSCode settings (optional)
├── prisma/               # Prisma schema, migrations, seeds
│   └── schema.prisma     # Defines database models and relations
├── public/               # Static assets (images, fonts, favicon)
├── src/
│   ├── app/              # Next.js App Router: pages, layouts, API routes, loading states
│   ├── components/       # Reusable React components
│   │   └── ui/           # Shadcn UI components (added via CLI)
│   ├── env.mjs           # Environment variable validation (T3 specific)
│   ├── lib/              # Shared utility functions, helpers, constants
│   │   ├── db.ts         # Prisma client instance export
│   │   ├── auth.ts       # Next-Auth configuration (providers, adapter, callbacks)
│   │   ├── utils.ts      # General utility functions (e.g., cn for Tailwind)
│   │   └── validators/   # Zod schemas (optional, can be co-located)
│   ├── server/           # Server-side logic
│   │   ├── api/          # tRPC definitions
│   │   │   ├── routers/  # tRPC routers for different features (e.g., _app, post, auth)
│   │   │   ├── root.ts   # Root tRPC router merging all sub-routers
│   │   │   └── trpc.ts   # tRPC context creation and procedure helpers
│   │   └── db.ts         # (Often re-exports lib/db.ts)
│   ├── styles/           # Global CSS styles
│   │   └── globals.css
│   └── types/            # Shared TypeScript types and interfaces (optional)
├── .env                  # Local environment variables (MUST be gitignored)
├── .env.example          # Example environment variables
├── .eslintrc.cjs         # ESLint configuration
├── next.config.mjs       # Next.js configuration
├── package.json          # Project dependencies and scripts
├── postcss.config.cjs    # PostCSS configuration (for Tailwind)
├── prettier.config.cjs   # Prettier configuration (optional)
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

_Note: File extensions (.js, .mjs, .cjs, .ts) might vary slightly based on project setup choices._

## Development Workflow

- Cline helps write and review code changes
- Vercel automatically deploys from main branch

## Security

DO NOT read or modify:

- .env files
- \*_/config/secrets._
- Any file containing API keys or credentials
