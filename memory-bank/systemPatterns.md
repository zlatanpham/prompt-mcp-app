# System Patterns

## Architecture

The application follows a T3 Stack architecture:

- **Frontend**: Next.js 14+ (App Router) with React Server Components (RSCs) where possible, minimal client components.
- **API Layer**: tRPC for end-to-end typesafe APIs.
- **ORM**: Prisma for database access and migrations.
- **Authentication**: Next-Auth.js.
- **UI**: Shadcn UI components with Tailwind CSS.
- **Validation**: Zod for schema validation.
- **Form Handling**: React Hook Form.
- **Database**: PostgreSQL.

## Key Technical Decisions

- **Typesafety**: Prioritized throughout the stack using TypeScript, tRPC, Zod, and Prisma.
- **Server-side Rendering/Components**: Maximizing RSCs for performance and minimizing client-side JavaScript.
- **Modular API**: tRPC routers are organized by feature (e.g., project, tool).

## Component Relationships

- `src/app/(protected)/project/[projectId]/page.tsx`: Main project detail page, imports and uses the `Tool` component.
- `src/app/(protected)/project/[projectId]/_components/prompt.tsx` (now conceptually `Tool` component): Manages fetching, creating, updating, and deleting tools. It imports `ManualToolDialog` and `ToolCard`.
- `src/app/(protected)/project/[projectId]/_components/manual-prompt-dialog.tsx` (now conceptually `ManualToolDialog`): Form for manual tool input/editing.
- `src/app/(protected)/project/[projectId]/_components/prompt-card.tsx` (now conceptually `ToolCard`): Displays individual tool information.

## Critical Implementation Paths

- **Database Schema Updates**: Changes to `prisma/schema.prisma` require `pnpm db:generate` to update the Prisma client. For new projects, `pnpm dlx prisma migrate reset --force` might be needed before `db:generate`.
- **tRPC Procedure Updates**: Changes to Prisma models necessitate updates in corresponding tRPC routers (e.g., `src/server/api/routers/tool.ts`).
- **Frontend Data Fetching**: Components use `api.tool` hooks to interact with the backend.
