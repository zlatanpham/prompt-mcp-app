# Active Context

## Current Work Focus

The primary focus was to rename the "Prompt" entity to "Tool" across the entire application, including the database schema, tRPC API, and React components. This involved updating model names, field names, router definitions, and component imports/usage.

## Recent Changes

- `prisma/schema.prisma`: `Prompt` model renamed to `Tool`, `tool_name` field removed, `name` field set to unique.
- `src/server/api/routers/tool.ts`: Content updated to reflect `Tool` model and remove `tool_name` references.
- `src/server/api/root.ts`: `promptRouter` replaced with `toolRouter`.
- `src/app/(protected)/project/[projectId]/page.tsx`: `Prompt` import and component usage updated to `Tool`.
- `src/app/(protected)/project/[projectId]/_components/prompt.tsx`: Content updated to function as a `Tool` component, with relevant type and variable name changes.
- `src/app/(protected)/project/[projectId]/_components/manual-prompt-dialog.tsx`: Content updated to function as a `ManualToolDialog`, with relevant type and variable name changes, and removal of `tool_name` field.
- `src/app/(protected)/project/[projectId]/_components/prompt-card.tsx`: Content updated to function as a `ToolCard`, with relevant type and variable name changes.
- `.clinerules/self-improving-cline.md`: Added a constraint regarding conflicts between user instructions and technical requirements.
- `.clinerules/1-coding.md`: Updated "Development Workflow" under "Database Migrations (Prisma)" to clarify initial project setup with `prisma migrate reset --force` and `db:generate`.

## Next Steps

- The TypeScript errors related to the Prisma client not recognizing the `Tool` model persist, as `pnpm db:generate` was skipped as per user instruction. This needs to be addressed by the user or in a future task.
- Verify the application functionality after all changes.

## Active Decisions and Considerations

- The decision to not rename component files (e.g., `prompt.tsx` to `tool.tsx`) was made based on user instruction, focusing on content and import updates instead.
- The conflict between user instruction and technical necessity for `db:generate` was noted and led to a `.clinerules` improvement.

## Important Patterns and Preferences

- Adherence to T3 stack principles.
- Prioritizing typesafety.
- Modular component and API design.

## Learnings and Project Insights

- The importance of clear communication regarding database operations, especially in new projects.
- The need for robust handling of interrupted commands and potential conflicts between user instructions and technical requirements.
