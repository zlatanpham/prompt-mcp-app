## General Patterns

### Handling Conflicts Between User Instructions and Technical Necessities

- When a user instruction directly conflicts with resolving critical technical issues (e.g., TypeScript errors, broken dependencies), prompt for clarification from the user. Explain the technical necessity and the conflict.

### Robustness for Interrupted File Operations

- For commands like `mv`, after an interruption, check if the target file/directory already exists before retrying the move operation to avoid unnecessary attempts.

### Handling `replace_in_file` Failures

- When `replace_in_file` fails due to exact match requirements, consider falling back to `write_to_file` for critical file modifications, especially for small to medium-sized files where the full content can be easily managed.

### Centralizing Validation Logic

- For common validation rules (e.g., string formats, lengths), centralize Zod schemas, regex patterns, and messages into a dedicated shared file (e.g., `src/lib/validators/`). This promotes reusability, consistency, and easier maintenance across frontend and backend.

### Iterative Refinement of User-Facing Messages

- Be prepared to refine user-facing messages (e.g., validation error messages) based on user feedback. Prioritize conciseness and clarity.

### Iterative UI Refinement

- Be prepared to make multiple small UI adjustments based on continuous user feedback to achieve the desired look and feel. This often involves iterative `replace_in_file` operations for styling and component structure.

## Project-Specific Learnings

### Initial Prisma Setup for New Projects

- For brand new projects or when extensive schema changes are made and data preservation is not critical, the recommended workflow for Prisma is to:
  1.  Modify `prisma/schema.prisma`.
  2.  Run `pnpm dlx prisma migrate reset --force` to clear the database and re-apply all migrations.
  3.  Run `pnpm db:generate` to ensure the Prisma Client is updated.
- This process ensures the database schema and Prisma client are in sync with the latest `schema.prisma` without concern for existing data.

### Adding New Fields to Prisma Models and Updating tRPC

- **Workflow:**
  1.  Modify `prisma/schema.prisma` to add the new field (e.g., `args Json?`).
  2.  **Crucial Step**: Run `pnpm db:generate` to regenerate the Prisma Client. This is essential for the application's types to recognize the new schema changes.
  3.  Run `pnpm dlx prisma migrate dev --name your-migration-name` to create and apply a new database migration (if schema changes require it).
  4.  Update relevant tRPC procedures (e.g., `create`, `update`) in `src/server/api/routers/` to include the new field in input schemas and data operations.

### Prisma JSON Type Handling

- When working with `Json` fields in Prisma, avoid explicit casting to `Prisma.JsonArray` or `Prisma.JsonObject` in the data payload for `create` or `update` operations. Prisma can typically handle the serialization of plain JavaScript arrays or objects directly.
- **Debugging `Unknown argument` errors**: If you encounter `Unknown argument` errors when interacting with Prisma, the primary cause is usually an outdated Prisma Client. Always ensure `pnpm db:generate` has been run successfully after any `prisma/schema.prisma` modifications.

### Dynamic Form Arrays

- **Pattern**: For managing dynamic lists of input fields (e.g., tool arguments), use `react-hook-form`'s `useFieldArray`. This simplifies adding, removing, and managing individual items within a form.
- **Component Structure**: Create a dedicated component (e.g., `ArgumentsFormArray`) to encapsulate the logic and UI for the form array, promoting reusability and separation of concerns.
- **Type-only Imports**: When `verbatimModuleSyntax` is enabled in TypeScript, use `import type { TypeName }` for importing types to prevent runtime issues.

### Zod Validation Patterns for Tool Names

- For tool names, use a Zod schema with a regex `^[a-z0-9_]+$` to enforce lowercase letters, numbers, and underscores.
- Apply length constraints (e.g., `min(1)`, `max(100)`) as required.
- Centralize this schema and related constants in `src/lib/validators/tool.ts` for consistent application across UI and API.

### Shadcn UI Table Implementation for Displaying Lists

- Use Shadcn UI's `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, and `TableCell` components for displaying lists of data in a structured, tabular format.
- Ensure proper data mapping to `TableRow` and `TableCell` components.

### Reusable Form Components

- Extract common form structures and logic into reusable components (e.g., `ProjectForm`). This promotes consistency, reduces code duplication, and improves maintainability across different parts of the application (e.g., create and edit forms).

### Complex UI Interactions (Dropdowns, Dialogs)

- When implementing multiple actions for an item, use dropdown menus to consolidate options and maintain a clean UI.
- For actions requiring confirmation or detailed input, integrate `AlertDialog` (for confirmation) and `Dialog` (for forms) within dropdown menu items.
- Ensure proper state management for dialog visibility and selected items.

## Project-Specific Learnings

### Correct `queryKey` patterns for tRPC `invalidateQueries`

- When invalidating tRPC queries with React Query, ensure the `queryKey` precisely matches the structure used by the `useQuery` hook. For `api.router.procedure.useQuery()`, the `queryKey` is typically an array containing an array, e.g., `[['router', 'procedure']]`. Using a single array like `['router', 'procedure']` will not correctly invalidate the cache.
