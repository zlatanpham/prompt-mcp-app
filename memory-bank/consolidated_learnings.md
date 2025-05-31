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
  2.  Run `pnpm db:generate` to update the Prisma Client.
  3.  Run `pnpm dlx prisma migrate dev --name your-migration-name` to create and apply a new database migration.
  4.  Update relevant tRPC procedures (e.g., `create`, `update`) in `src/server/api/routers/` to include the new field in input schemas and data operations.

### Zod Validation Patterns for Tool Names

- For tool names, use a Zod schema with a regex `^[a-z0-9_]+$` to enforce lowercase letters, numbers, and underscores.
- Apply length constraints (e.g., `min(1)`, `max(100)`) as required.
- Centralize this schema and related constants in `src/lib/validators/tool.ts` for consistent application across UI and API.

### Shadcn UI Table Implementation for Displaying Lists

- Use Shadcn UI's `Table`, `TableHeader`, `TableBody`, `TableHead`, `TableRow`, and `TableCell` components for displaying lists of data in a structured, tabular format.
- Ensure proper data mapping to `TableRow` and `TableCell` components.

### Direct Action Buttons vs. Dropdowns for Common Actions

- For common actions like "Edit" and "Delete" within a list item, prefer direct icon buttons (e.g., `PencilIcon`, `TrashIcon`) over dropdown menus to simplify the UI and reduce clicks, especially when there are only a few actions.
- For single actions, convert dropdowns to direct buttons for a more streamlined user experience.
