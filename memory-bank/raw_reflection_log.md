---

Date: 2025-06-13
TaskRef: "Migrate Prisma schema fields and database columns from camelCase to underscore_case"

Learnings:

-   Prisma `@map` attribute is essential for renaming existing database columns while updating schema field names.
-   `pnpm dlx prisma migrate dev --name [migration_name]` is the correct command to generate and apply migrations for column renames detected via `@map`.
-   Relation fields in Prisma schema should not use `@map`.
-   `@@id` declarations must refer to the updated field names (underscore_case) after renaming.
-   **New Coding Standard**: Database column names and Prisma schema field names should consistently use `underscore_case`. All new fields created must adhere to this standard.

Difficulties:

-   Initially misunderstood the behavior of `pnpm db:generate` with `@map` for column renames, leading to an "Already in sync" message.
-   Incorrectly applied `@map` to relation fields, causing Prisma errors.

Successes:

-   Successfully updated `ApiKey`, `ApiKeyOnProject`, and `User` models to use underscore_case with `@map` for existing camelCase database columns.
-   Successfully generated and applied the migration to rename the database columns.

Improvements_Identified_For_Consolidation:

-   Prisma migration strategy for column renames using `@map` and `prisma migrate dev`.
-   Enforce `underscore_case` for all new database columns and Prisma schema fields.
---
