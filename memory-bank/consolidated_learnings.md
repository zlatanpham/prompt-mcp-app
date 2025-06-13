## Database & Schema Naming Conventions

**Standard**: All new database column names and Prisma schema field names should consistently use `underscore_case`.

**Rationale**: Ensures consistency across the application's data layer and adheres to common SQL naming conventions.

## Prisma Migrations

**Strategy: Column Renames with `@map`**

- When renaming an existing database column (e.g., from `camelCase` to `underscore_case`), update the Prisma schema field to the new desired name (e.g., `my_field`).
- Add the `@map("originalCamelCaseName")` attribute to the updated field in `schema.prisma` (e.g., `my_field String @map("myField")`).
- Generate and apply the migration using `pnpm dlx prisma migrate dev --name [migration_name]`. Prisma will detect the `@map` change as a column rename and generate the appropriate `ALTER TABLE ... RENAME COLUMN` SQL.
- **Important**: The `@map` attribute should _not_ be used on relation fields.
- Ensure `@@id` and `@@unique` declarations refer to the updated (underscore_case) field names in the Prisma schema.

**General Migration Workflow**:

- For schema changes requiring data preservation, use `pnpm dlx prisma migrate dev` to generate and apply migrations.
- For production deployments, use `pnpm db:migrate` to apply pending migrations.
