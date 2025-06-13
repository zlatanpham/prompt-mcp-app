---
Date: 2025-06-13
TaskRef: "Maintain UI order of projects, API keys, and tools after updates"

Learnings:
  - Default sorting in tRPC queries (without explicit `orderBy`) can lead to inconsistent UI order, especially when `updated_at` is implicitly used or when no order is specified.
  - Explicitly sorting by `created_at` (or `createdAt` for `ApiKey` model) provides a stable order for UI elements that should maintain their position regardless of updates.
  - Prisma field naming conventions (camelCase vs. snake_case) must be carefully verified against `schema.prisma` to avoid TypeScript errors in `orderBy` clauses.
  - Strict adherence to tool parameter XML formatting is crucial to avoid tool execution failures.

Difficulties:
  - Repeated errors with `ask_followup_question` due to incorrect XML formatting (missing `<question>` tag).
  - Misidentifying the `createdAt` field name for the `ApiKey` model in Prisma (used `created_at` instead of `createdAt`), leading to a TypeScript error.

Successes:
  - Successfully identified the root cause of the ordering issue (sorting by `updated_at`).
  - Implemented the correct stable sorting by `created_at` across projects, API keys, and tools.
  - Corrected the `ApiKey` field name issue after inspecting `prisma/schema.prisma`.
  - Successfully updated `.clinerules/writing-effective-cline-rules.md` to improve future interactions based on lessons learned.

Improvements_Identified_For_Consolidation:
  - General pattern: Stable UI ordering by `created_at` for lists that should not reorder on update.
  - General pattern: Always verify database schema field names (camelCase vs. snake_case) before using them in queries.
  - General pattern: Double-check tool parameter XML formatting, especially for required tags.
---
