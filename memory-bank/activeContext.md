# Active Context

## Current Work Focus

The primary focus was to implement project management features, including ensuring the project list updates correctly after creation, adding a delete project functionality with confirmation, and refactoring the project edit form into a reusable component for both the project list and detail pages. More recently, the focus shifted to enhancing API key management and implementing a shared layout container across protected pages.

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
- `src/app/(protected)/project/page.tsx`:
  - Fixed project list not updating after creation by correcting `invalidateQueries` key.
  - Added project delete functionality with a confirmation dialog.
  - Integrated project edit functionality via a dropdown menu and a reusable form component.
  - Refactored to use `DashboardLayout` for consistent page structure.
- `src/server/api/routers/project.ts`: Added a `delete` mutation for projects.
- `src/components/project-form.tsx`: Created a new reusable component for project creation and editing forms.
- `src/app/(protected)/project/[projectId]/page.tsx`: Updated to use the new `ProjectForm` component for editing.
- `src/app/(protected)/api-keys/page.tsx`:
  - Modified API key display: truncated in table, full MCP config JSON in a read-only textarea in the display dialog.
  - Added a direct copy button for the raw API key in the table's "Key" column.
  - Added a "Copy Config" option to the actions dropdown menu for each API key, copying the full MCP config JSON.
  - Updated the main copy button in the display dialog to copy the full MCP config JSON.
  - Refactored to use `DashboardLayout` for consistent page structure.
  - Implemented skeleton UI for the API key table during loading, ensuring the `DashboardLayout` remains visible.
- `src/app/(protected)/page.tsx`: Refactored to use `DashboardLayout` for consistent page structure.

## Next Steps

- The TypeScript errors related to the Prisma client not recognizing the `Tool` model still exist because `pnpm db:generate` was skipped. This needs to be resolved by running the command.
- Full application functionality needs to be verified by the user.

## Active Decisions and Considerations

- The decision to not rename component files (e.g., `prompt.tsx` to `tool.tsx`) was made based on user instruction, focusing on content and import updates instead.
- The conflict between user instruction and technical necessity for `db:generate` was noted and led to a `.clinerules` improvement.
- Refactored project forms into a shared component to promote reusability and maintainability.
- Implemented dropdown menus for project actions to improve UI/UX.
- Enhanced API key display and copy functionality to provide more flexibility and ease of use for users.
- Standardized protected page layouts using `DashboardLayout` for consistency.
- Improved loading state handling in API Keys page for better user experience.

## Important Patterns and Preferences

- Adherence to T3 stack principles.
- Prioritizing typesafety.
- Modular component and API design.
- Reusable UI components (e.g., `ProjectForm`, `DashboardLayout`).
- Effective use of React Query's `invalidateQueries` for UI updates.
- Dynamic URL construction using `window.location.origin`.
- Client-side clipboard operations with visual feedback.
- Granular loading states with skeleton UIs for improved user experience.

## Learnings and Project Insights

- The importance of clear communication regarding database operations, especially in new projects.
- The need for robust handling of interrupted commands and potential conflicts between user instructions and technical requirements.
- The benefits of extracting reusable form components for consistent UI and logic across different parts of the application.
- How to effectively manage multiple dialogs and dropdowns for complex UI interactions.
- The importance of providing flexible and user-friendly options for handling sensitive data like API keys, including various copy formats.
- The value of a shared layout component for maintaining UI consistency across different pages.
- The importance of implementing granular loading states (e.g., skeleton UIs for specific data tables) rather than hiding entire page layouts during data fetching.
