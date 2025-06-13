---
Date: 2025-06-12
TaskRef: "Update dropdown menu style in API Keys page"

Learnings:
  - Successfully integrated Lucide icons (`Pencil`, `RefreshCw`, `Trash2`) into Shadcn UI `DropdownMenuItem` components.
  - Applied Tailwind CSS classes (`text-red-600`, `focus:text-red-600`) to `DropdownMenuItem` for specific styling (e.g., red text for delete action).
  - Confirmed the process of adding icons to Shadcn UI components involves importing the icon and placing it directly within the component's children, often with a margin utility class (`mr-2`) for spacing.

Difficulties:
  - None encountered. The task was straightforward.

Successes:
  - The dropdown menu now visually matches the provided image, enhancing the UI/UX.
  - The changes were implemented efficiently and accurately using `replace_in_file`.

Improvements_Identified_For_Consolidation:
  - General pattern: Adding icons and specific styling to Shadcn UI dropdown menu items.
---

---

Date: 2025-06-13
TaskRef: "Implement Reset Password Feature with Resend"

Learnings:

- **Handling Interactive CLI Commands:** Direct interaction with running CLI prompts (like `prisma migrate dev` asking for a migration name) is not supported by sending subsequent commands. This requires user intervention or a different approach (e.g., non-interactive flags if available, or piping input).
- **Environment Variable Schema Validation:** Even when `z.string()` is used in `src/env.js` for required environment variables, TypeScript might still infer them as `string | undefined` in other parts of the codebase, leading to type errors. Explicit type assertion (`as string`) might be necessary in consuming files (e.g., `src/lib/email.ts`) to satisfy the type checker, or a more robust way to ensure `env` types are correctly propagated.

Difficulties:

- Misunderstanding how to provide input to an interactive `pnpm db:generate` command, leading to a failed command execution and requiring user intervention.
- Initial type errors related to environment variables (`RESEND_API_KEY`, `EMAIL_FROM`, `NEXTAUTH_URL`) in `src/lib/email.ts` and `src/server/api/routers/user.ts` due to `env.js` type inference.

Successes:

- Successfully implemented the password reset feature end-to-end, including database schema updates, tRPC procedures, email utility, and frontend pages.
- Successfully integrated Resend for email sending.

Improvements_Identified_For_Consolidation:

- Add a rule or guideline on handling interactive CLI commands, suggesting to ask the user for manual input or to look for non-interactive alternatives.
- Add a guideline for environment variable handling, specifically addressing the `string | undefined` inference issue and suggesting explicit type assertions or a review of `env.js` setup for stricter type enforcement.

---
