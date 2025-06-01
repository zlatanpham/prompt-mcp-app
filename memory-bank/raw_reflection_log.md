---
Date: 2025-05-31
TaskRef: "Fix parsing error in src/app/(protected)/project/[projectId]/_components/import-tools-dialog.tsx"

Learnings:
- Encountered a persistent `Parsing error: '...' expected.` in `import-tools-dialog.tsx` related to the `Textarea` component's `placeholder` prop.
- Attempts to fix by modifying the placeholder string content (from `...` to "some prompt content" to "example prompt"), moving the string to a variable, and explicitly listing `react-hook-form`'s `field` properties instead of using the spread operator `{field}` were unsuccessful.
- The error message remained consistent and misleading, suggesting the issue is not a code bug within the file but rather an environmental parsing problem (e.g., ESLint, TypeScript, or Babel/SWC configuration/version incompatibility).
- **New Learning (Functional Fix):** To update the UI after importing tools, it's necessary to invalidate the relevant tRPC query cache. The correct query to invalidate for tools by project ID was found to be `utils.tool.getByProjectId.invalidate()`.
- **New Learning (Typo Fix):** When invalidating tRPC queries with parameters, the property names in the invalidation object must exactly match the input schema of the tRPC procedure (e.g., `project_id` instead of `projectId`).

Difficulties:
- The cryptic and persistent nature of the parsing error made it difficult to diagnose and resolve through direct code modifications. The error message did not accurately reflect the actual syntax issue, leading to multiple failed attempts at fixing the string literal.
- Initially assumed an incorrect tRPC query name (`getTools` instead of `getByProjectId`) and an incorrect parameter name (`projectId` instead of `project_id`), requiring further investigation of the tRPC router definition.

Successes:
- Systematically ruled out common causes for JSX parsing errors related to string literals and prop spreading.
- Identified that the root cause of the parsing error is likely external to the file's content, residing in the project's tooling configuration.
- Successfully identified and implemented the tRPC query invalidation logic to refresh the tool list after import.
- Corrected the tRPC query name and parameter name for invalidation based on the router definition.

Improvements_Identified_For_Consolidation:
- General pattern: Troubleshooting persistent and misleading parsing errors in JSX/TSX.
- Specific action: When code appears syntactically correct but parsing errors persist, investigate ESLint, TypeScript, or Babel/SWC configurations.
- General pattern: Invalidating tRPC queries after mutations for UI updates.
- Specific action: Always verify exact tRPC query names and input schema property names from router definitions when invalidating queries.
---

---

Date: 2025-06-01
TaskRef: "Update API key reader for truncated display and config copy"

Learnings:

- Implemented truncation for API keys in table display.
- Added a direct copy button for the raw API key in the table column.
- Modified API key display dialog to show full MCP server configuration JSON.
- Updated copy functionality in the dialog and added a new dropdown option to copy the full MCP config JSON.
- Used `window.location.origin` to dynamically construct the `API_URL` for the MCP config.
- Handled temporary visual feedback for copy actions using `useState` and `setTimeout`.

Difficulties:

- Ensuring all copy actions (raw key, full config) were correctly implemented and triggered.
- Integrating new UI elements (copy button, dropdown item) while maintaining existing functionality.

Successes:

- Successfully implemented all requested features for API key display and copying.
- Ensured the MCP config JSON is correctly formatted and includes dynamic `API_URL`.
- Maintained typesafety and addressed ESLint warnings during the process.

Improvements_Identified_For_Consolidation:

- General pattern: Dynamic construction of URLs based on `window.location.origin`.
- General pattern: Implementing client-side clipboard copy with visual feedback.
- General pattern: Providing multiple copy options (raw data vs. formatted config) for sensitive information.

---

---

Date: 2025-06-01
TaskRef: "Implement authentication redirection for protected pages"

Learnings:

- Implemented server-side authentication check and redirection in Next.js App Router layout (`src/app/(protected)/layout.tsx`).
- Used `auth()` from `@/server/auth` to get the session on the server.
- Used `redirect()` from `next/navigation` for server-side redirection.
- Encountered and resolved a TypeScript path alias issue (`~/server/auth` vs `@/server/auth`) by checking `tsconfig.json` and aligning with existing aliases.
- Encountered and resolved an incorrect import name (`getServerAuthSession` vs `auth`) by inspecting the export from `src/server/auth/index.ts`.

Difficulties:

- Initial path alias mismatch and incorrect import name required iterative debugging and file inspection.

Successes:

- Successfully implemented the required authentication redirection logic.
- Correctly identified and fixed path and import issues.

Improvements_Identified_For_Consolidation:

- General pattern: Server-side authentication and redirection in Next.js App Router.
- Specific action: When encountering module resolution errors with aliases, check `tsconfig.json` and verify exported members from the target module.

---
