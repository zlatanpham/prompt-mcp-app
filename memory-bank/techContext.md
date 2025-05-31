# Tech Context

## Technologies Used

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **API Layer**: tRPC
- **ORM**: Prisma
- **Authentication**: Next-Auth.js
- **UI Components**: Shadcn UI
- **Styling**: Tailwind CSS
- **Validation**: Zod
- **Form Handling**: React Hook Form
- **Database**: PostgreSQL

## Development Setup

- **Package Manager**: pnpm
- **Environment Variables**: Managed via `.env` and validated with `src/env.mjs`.
- **Linting**: ESLint (`eslint.config.js`)
- **Formatting**: Prettier (`prettier.config.js`)

## Technical Constraints

- The application is built on the T3 Stack, adhering to its principles.
- Database schema changes require Prisma operations (`db:generate`, `migrate reset`).
- Frontend components are primarily React, with a mix of Server and Client Components.

## Tool Usage Patterns

- `pnpm install`: To install dependencies.
- `pnpm dev`: To run the development server.
- `pnpm db:generate`: To generate Prisma client after schema changes.
- `pnpm dlx prisma migrate reset --force`: To reset the database in development.
- `pnpm lint`, `pnpm format`: For code quality checks.
