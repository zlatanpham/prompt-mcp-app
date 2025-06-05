# Coding Standards: T3 Stack (Next.js, tRPC, Prisma, Tailwind, Next-Auth, Shadcn)

## Objective

- Deliver typesafe, performant, and maintainable Next.js applications using the T3 stack principles.
- Prioritize developer experience, end-to-end typesafety, and clean architecture.

## Code Style

- Use modern TypeScript with functional patterns; leverage inference.
- Follow T3 structure: `server/api` for tRPC, `prisma/schema.prisma` for DB, `lib` for utils/auth.
- Name variables and functions descriptively (e.g., `isLoadingUser`, `getUserById`).
- Organize files logically within `app`, `components`, `lib`, `server`.
- For UI components (forms, dialogs) that are specific to a particular page, place them in a private `_components` folder located within that page's directory (e.g., `src/app/(protected)/page-name/_components`).
- Avoid making page files excessively long; break down large page files into multiple, smaller, and reusable components.
- Use lowercase-kebab-case for directory and file names (e.g., `components/user-profile`, `lib/utils.ts`).

## Optimization & Performance

- Maximize React Server Components (RSCs); minimize `'use client'`.
- Leverage tRPC for typesafe data fetching/mutations and batching.
- Optimize Prisma queries (select specific fields, use transactions appropriately).
- Use Next.js `dynamic` imports for code splitting.
- Design mobile-first, responsive UIs with Tailwind.
- Optimize images (Next.js `<Image>`, modern formats like WebP).
- Implement granular loading states (e.g., skeleton UIs for specific data tables or components) rather than hiding entire page layouts during data fetching.

## Error Handling & Validation

- Use Zod for robust schema validation (env vars via `env.mjs`, tRPC inputs/outputs, forms).
- Handle errors gracefully in tRPC procedures and UI components.
- Use guard clauses and early returns for clarity.

## UI & Styling

- Utilize Shadcn UI components built on Radix UI and Tailwind CSS. Add components using `pnpm ui:add -- [component]`.
- **Prioritize Shadcn UI Design:** When making UI enhancements or adding new UI elements, always prioritize using existing Shadcn UI components and adhering to their design patterns and styling conventions. If a direct Shadcn component is not available, ensure custom components align seamlessly with the Shadcn aesthetic using Tailwind CSS.
- Maintain consistency using Tailwind utility classes and `tailwind.config.ts`.
- Ensure accessibility and responsive design across devices.
- **Centralized Dialogs:** For common UI patterns like confirmation dialogs, use a single, reusable component (e.g., `ConfirmActionDialog`) to ensure consistency across the application and reduce code duplication.

## Form Handling

- Use React Hook Form for form state management and validation.
- Integrate Zod for schema validation with React Hook Form.
- Use Shadcn UI components for form elements (e.g.,form, inputs, buttons) to ensure consistent styling and behavior.

## State & Data Management

- Rely on tRPC (React Query integration) for server state management (fetching, caching, mutations).
- Use React state/context or Zustand for minimal client-side UI state when necessary.
- Define database models and relations clearly in `prisma/schema.prisma`.
- For manual or lazy data fetching with tRPC/React Query, use `api.yourRouter.yourProcedure.useQuery(input, { enabled: false })` and trigger the fetch using the `refetch()` function returned by the hook.

## Database Migrations (Prisma)

- **Schema First:** All database schema changes MUST originate from modifications to the `prisma/schema.prisma` file.
- **Development Workflow:** For brand new projects or when schema changes are extensive and data preservation is not critical, use `pnpm dlx prisma migrate reset --force` to clear the database and re-apply all migrations, followed by `pnpm db:generate` to ensure the Prisma Client is updated. For incremental changes where data preservation is important, use `pnpm db:generate` to automatically generate SQL migration files, apply them to the development database, and ensure the Prisma Client is updated. This command will also apply the generated migration to your development database. Consider `pnpm db:push` for schema prototyping without generating migrations (use cautiously). If TypeScript errors related to Prisma types persist after schema changes, explicitly run `pnpm dlx prisma generate` or consider restarting your IDE's TypeScript server.
- **Production Workflow:** Use `pnpm db:migrate` to apply all pending migration files to the production database. This command is non-destructive and will not alter existing data unless explicitly instructed by the migration SQL.
- **Resetting:** Use `pnpm dlx prisma migrate reset` primarily in development or testing to clear the database and re-apply all migrations. Avoid in production. (Note: No specific script provided for reset).
- **Seeding:** If necessary, use `pnpm dlx prisma db seed` (requires configuration in `package.json` and a seed script) to populate the database with initial or test data, typically after migrations. (Note: No specific script provided for seed).
- **Studio:** Use `pnpm db:studio` to open Prisma Studio for database inspection.

## Security

- Manage secrets strictly via `.env` and validate with `src/env.mjs`.
- Implement authentication and authorization using Next-Auth.js middleware and utilities.
- Protect tRPC procedures based on user session/roles.
- Validate all inputs rigorously using Zod.

## Testing & Documentation

- **Type Checking:** Run `pnpm typecheck` or `pnpm check` to ensure TypeScript validity.
- **Linting:** Run `pnpm lint` to check for code style issues and `pnpm lint:fix` to automatically fix them.
- **Formatting:** Run `pnpm format:check` to verify code formatting and `pnpm format:write` to apply formatting rules.
- Write tests for critical logic (e.g., utility functions, complex components) using Jest/Vitest and React Testing Library.
- Add JSDoc comments for tRPC procedures, complex functions, and components.
- Keep `prisma/schema.prisma` well-documented.

## Methodology

1.  **Analyze**: Understand requirements and data models.
2.  **Plan**: Define Prisma schema, tRPC procedures, and component structure.
3.  **Implement**: Build features iteratively, ensuring typesafety.
4.  **Refine**: Optimize queries, components, and user experience.

## Workflow

1.  Define/update `prisma/schema.prisma`.
2.  Run `pnpm db:generate` (development) or generate migration for later deployment.
3.  Define/update tRPC routers/procedures in `src/server/api/`.
4.  Implement UI components in `src/components/` (using `pnpm ui:add -- [component]`) and pages/layouts in `src/app/`.
5.  Integrate data fetching/mutations using tRPC hooks.
6.  Run checks (`pnpm check`, `pnpm format:check`).
7.  Test, review, and optimize.
8.  Deploy application and run `pnpm db:migrate` (production).
