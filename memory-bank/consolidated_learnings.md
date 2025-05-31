## General Patterns

### Handling Conflicts Between User Instructions and Technical Necessities

- When a user instruction directly conflicts with resolving critical technical issues (e.g., TypeScript errors, broken dependencies), prompt for clarification from the user. Explain the technical necessity and the conflict.

### Robustness for Interrupted File Operations

- For commands like `mv`, after an interruption, check if the target file/directory already exists before retrying the move operation to avoid unnecessary attempts.

### Handling `replace_in_file` Failures

- When `replace_in_file` fails due to exact match requirements, consider falling back to `write_to_file` for critical file modifications, especially for small to medium-sized files where the full content can be easily managed.

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
