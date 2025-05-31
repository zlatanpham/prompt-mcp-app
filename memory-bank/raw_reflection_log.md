---
Date: 2025-05-31
TaskRef: "Rename Prompt to Tool, update schema, routes, and components"

Learnings:
  - Successfully renamed the `Prompt` model to `Tool` in `prisma/schema.prisma`, removed `tool_name`, and added `@unique` to `name`.
  - Updated `src/server/api/routers/tool.ts` (previously `prompt.ts`) to reflect the `Tool` model and remove `tool_name` references.
  - Updated `src/server/api/root.ts` to use `toolRouter`.
  - Updated `src/app/(protected)/project/[projectId]/page.tsx` to import and use the `Tool` component.
  - Updated `src/app/(protected)/project/[projectId]/_components/prompt.tsx` (now acting as `Tool` component) to reflect the `Tool` model, remove `tool_name` references, and update text.
  - Updated `src/app/(protected)/project/[projectId]/_components/manual-prompt-dialog.tsx` to reflect the `Tool` model, remove `tool_name` references, and update text.
  - Updated `src/app/(protected)/project/[projectId]/_components/prompt-card.tsx` to reflect the `Tool` model and update text.
  - Encountered persistent TypeScript errors related to Prisma client not recognizing the `Tool` model, which were skipped as per user instruction. This highlights a potential conflict between user instructions and technical dependencies.
  - Identified and proposed improvements to `.clinerules/self-improving-cline.md` and `.clinerules/1-coding.2md` to address command interruption handling, database operation clarity, and prioritizing user instructions vs. technical requirements.

Difficulties:
  - Repeated interruptions during `mv` commands and `pnpm db:generate`.
  - Initial `pnpm db:generate` failure due to database drift, requiring `prisma migrate reset`.
  - Conflict between user instruction to skip `db:generate` and the necessity of running it to resolve TypeScript errors.

Successes:
  - Successfully applied all requested code changes across schema, router, and components.
  - Identified and proposed valuable improvements to `.clinerules` for future interactions.

Improvements_Identified_For_Consolidation:
  - General pattern: Handling conflicts between user instructions and technical necessities.
  - General pattern: Robustness for interrupted file operations (e.g., `mv`).
  - Project-specific: Initial Prisma setup for new projects (reset and generate).
---

---

Date: 2025-05-31
TaskRef: "Add args: jsonb to the Tool column"

Learnings:

- Successfully added `args: Json?` to the `Tool` model in `prisma/schema.prisma`.
- Updated `create` and `update` tRPC procedures in `src/server/api/routers/tool.ts` to handle the new `args` field.
- Resolved TypeScript errors by running `pnpm db:generate` after schema modification and tRPC router updates.
- Encountered and resolved `replace_in_file` matching issues by falling back to `write_to_file` for schema modification.

Difficulties:

- `replace_in_file` failed twice due to exact match requirements, necessitating a fallback to `write_to_file`.

Successes:

- Successfully implemented the requested schema change and API updates.
- Successfully resolved the resulting TypeScript error.

Improvements_Identified_For_Consolidation:

- General pattern: Handling `replace_in_file` failures by falling back to `write_to_file` for critical file modifications.
- Project-specific: Steps for adding new fields to Prisma models and updating tRPC.

---

---

Date: 2025-05-31
TaskRef: "Update validation for Tool name (regex and length)"

Learnings:

- Implemented Zod validation for tool names to accept only lowercase letters, numbers, and underscores, with a maximum length of 100 characters.
- Centralized validation logic (regex, min/max lengths, messages) into a new shared file `src/lib/validators/tool.ts` for reusability across frontend and backend.
- Successfully integrated the shared validation schema (`toolNameSchema`) into the UI form (`src/app/(protected)/project/[projectId]/_components/manual-tool-dialog.tsx`) and backend tRPC procedures (`src/server/api/routers/tool.ts`).
- Refined validation messages to be more concise based on user feedback.

Difficulties:

- Initial `plan_mode_respond` call failed due to incorrect XML formatting (missing `<response>` tag). Corrected and re-sent.
- Needed to iterate on validation message conciseness based on user feedback.

Successes:

- Achieved consistent and robust validation across the application.
- Successfully refactored validation logic into a reusable module.
- Responded effectively to user feedback for message conciseness.

Improvements_Identified_For_Consolidation:

- General pattern: Centralizing validation schemas and constants for reusability.
- General pattern: Iterative refinement of user-facing messages based on feedback.
- Project-specific: Zod validation patterns for common string constraints (regex, length).

---

---

Date: 2025-05-31
TaskRef: "Implement Project Management UI (List Update, Delete, Edit)"

Learnings:

- Corrected `invalidateQueries` key from `["project.getAll"]` to `["project", "getAll"]` for proper cache invalidation in tRPC/React Query.
- Successfully extracted a reusable `ProjectForm` component for both project creation and editing, promoting code reusability.
- Implemented a dropdown menu for project actions (Edit, Delete) on the project list page, improving UI/UX.
- Integrated `AlertDialog` for delete confirmation and `Dialog` with `ProjectForm` for editing within the dropdown.
- Handled TypeScript type compatibility issues when passing Prisma `Project` object to `ProjectForm`'s `defaultValues` (specifically `description: string | null` to `string | undefined`).
- Encountered and resolved `replace_in_file` matching issues due to large blocks by falling back to `write_to_file`.

Difficulties:

- Initial `attempt_completion` denied, indicating user dissatisfaction with the UI/UX, leading to the request for dropdown and edit form.
- `replace_in_file` failures due to large SEARCH blocks, necessitating a fallback to `write_to_file`.

Successes:

- Successfully implemented all requested UI/UX improvements for project management.
- Demonstrated ability to refactor existing code into reusable components.
- Effectively used `write_to_file` as a fallback when `replace_in_file` was problematic.

Improvements_Identified_For_Consolidation:

- General pattern: Using `write_to_file` as a reliable fallback for large or complex file modifications when `replace_in_file` fails.
- General pattern: Refactoring common form patterns into reusable components for consistency and maintainability.
- General pattern: Implementing complex UI interactions (dropdowns, nested dialogs) with proper state management and `onSelect` handling.
- Project-specific: Correct `queryKey` patterns for tRPC `invalidateQueries`.

---
