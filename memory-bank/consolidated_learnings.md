## General Patterns

### Handling Conflicts Between User Instructions and Technical Necessities

- When a user instruction directly conflicts with resolving critical technical issues (e.g., TypeScript errors, broken dependencies), prompt for clarification from the user. Explain the technical necessity and the conflict.

### Robustness for Interrupted File Operations

- For commands like `mv`, after an interruption, check if the target file/directory already exists before retrying the move operation to avoid unnecessary attempts.

### Handling `replace_in_file` Failures

- When `replace_in_file` fails due to exact match requirements, consider falling back to `write_to_file` for critical file modifications, especially for small to medium-sized files where the full content can be managed.

### Centralizing Validation Logic

- For common validation rules (e.g., string formats, lengths), centralize Zod schemas, regex patterns, and messages into a dedicated shared file (e.g., `src/lib/validators/`). This promotes reusability, consistency, and easier maintenance across frontend and backend.

### Iterative Refinement of User-Facing Messages

- Be prepared to refine user-facing messages (e.g., validation error messages) based on user feedback. Prioritize conciseness and clarity.

### Iterative UI Refinement

- Be prepared to make multiple small UI adjustments based on continuous user feedback to achieve the desired look and feel. This often involves iterative `replace_in_file` operations for styling and component structure.

### Path Alias Resolution

- Always verify `tsconfig.json` for configured path aliases (e.g., `@/*` mapping to `src/*`) at the start of a project or when encountering import resolution issues. Ensure all imports consistently use the defined alias.

### TypeScript and ESLint Error Resolution

- When persistent TypeScript errors (e.g., `Cannot find module`) occur despite correct paths and installed dependencies, it often indicates a stale TypeScript language server or development server cache. A server restart is usually required.
- Explicitly type parameters and variables to resolve `implicit any` and `unsafe argument` ESLint errors, especially when dealing with data from external sources (like tRPC queries) or complex object structures.

### Debugging Persistent ESLint/TypeScript Errors

- When ESLint or TypeScript errors persist despite code appearing type-safe and correct (e.g., "Unsafe argument of type any assigned to a parameter of type string" for clearly typed variables), it often indicates a false positive, a stale language server, or a deeper configuration issue.
- **Crucial Insight**: Persistent and misleading parsing errors (e.g., `Parsing error: '...' expected.`) that do not resolve with code modifications often point to issues external to the file's content, such as misconfigured ESLint, TypeScript, or Babel/SWC setups, or version incompatibilities.
- **Troubleshooting Steps**:
  1.  Verify explicit type annotations are correct.
  2.  Confirm Prisma schema and generated client types are in sync (`pnpm db:generate`).
  3.  Consider restarting the development server or IDE's TypeScript language server to clear caches.
  4.  Review `tsconfig.json` and ESLint configuration for any unusual rules or strictness settings.
  5.  If parsing errors persist despite correct code, investigate tooling configurations (ESLint, TypeScript, Babel/SWC) and their versions.

### Dynamic URL Construction

- When constructing URLs dynamically in client-side code, use `window.location.origin` to get the base URL and then append specific paths (e.g., `/api/tools`). This ensures the URL is correct regardless of the deployment environment.

### Client-Side Clipboard Copy with Visual Feedback

- For client-side copy functionality, use `navigator.clipboard.writeText()` to copy content to the clipboard.
- Provide temporary visual feedback (e.g., changing an icon or displaying a "Copied!" message) using `useState` and `setTimeout` to inform the user of successful copy.

### Providing Multiple Copy Options for Sensitive Information

- When dealing with sensitive information like API keys, offer multiple copy options:
  - A direct copy of the raw key (e.g., for quick use).
  - A copy of the key embedded within a formatted configuration (e.g., for direct pasting into a configuration file).
- This caters to different user needs and contexts for using the key.

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

### Client-Side JSON Export and File Download

- To enable client-side export of data as a JSON file:
  1.  Filter and map the data to the desired export format.
  2.  Use `JSON.stringify(data, null, 2)` to format the JSON with pretty printing.
  3.  Create a `Blob` with `new Blob([jsonString], { type: "application/json" })`.
  4.  Generate a URL for the blob using `URL.createObjectURL(blob)`.
  5.  Create a temporary `<a>` element, set its `href` to the URL and `download` attribute to the desired filename.
  6.  Programmatically click the `<a>` element to trigger the download.
  7.  Clean up by removing the `<a>` element and revoking the object URL (`URL.revokeObjectURL(url)`).

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

### Correct `queryKey` patterns for tRPC `invalidateQueries`

- When invalidating tRPC queries with React Query, ensure the `queryKey` precisely matches the structure used by the `useQuery` hook. For `api.router.procedure.useQuery()`, the `queryKey` is typically an array containing an array, e.g., `[['router', 'procedure']]`. Using a single array like `['router', 'procedure']` will not correctly invalidate the cache.
- **Crucial**: When invalidating queries with parameters, the property names in the invalidation object (e.g., `{ projectId }`) must exactly match the input schema of the tRPC procedure (e.g., `{ project_id }`). Always verify the exact query name and its input schema from the tRPC router definition.

### API Key Management Implementation

- **Database Design**: Use a dedicated `ApiKey` model with a secure `key` field and a many-to-many relationship (`ApiKeyOnProject`) to `Project` for granular access control.
- **Key Generation**: Implement a utility function (e.g., `generateApiKey` using `nanoid`) for creating unique, random API keys.
- **Public API Endpoint**: For external access, create a dedicated Next.js API route (e.g., `src/app/api/external/tools/route.ts`) that validates the API key from headers (`x-api-key`) and filters data based on associated projects.
- **One-Time Key Display**: For security, display newly created or regenerated API keys only once in a dedicated dialog, prompting the user to copy it to their clipboard.
- **UI for Management**: Provide a comprehensive UI for listing, creating, deleting, regenerating, and updating project associations for API keys. Use checkboxes for multi-project selection.
- **Enhanced Key Display and Copy**:
  - Display truncated API keys in tables with a direct copy button for the full key.
  - Provide an option to copy the full MCP server configuration JSON (including dynamic `API_URL`) from the actions dropdown.
  - Show the full MCP server configuration JSON in a read-only textarea in the key display dialog after generation/regeneration.

### Tool Import Functionality

- **Backend Implementation**:
  - Use a Zod schema (`toolImportInputSchema`) to validate the incoming array of tools, ensuring correct structure and data types for each tool.
  - Implement uniqueness checks for tool names:
    - First, check for duplicate names within the incoming batch itself.
    - Then, query the database to check for existing tool names in the target project.
    - If any duplicates are found, reject the entire import batch with a descriptive error message.
  - Use a Prisma transaction (`db.$transaction`) to atomically create all valid tools, ensuring all or none are imported.
- **Frontend Implementation**:
  - Create a dedicated dialog component (`ImportToolsDialog`) for uploading/pasting JSON content.
  - Implement client-side JSON parsing and validation using the same Zod schemas as the backend for immediate user feedback.
  - Handle success and error states, displaying appropriate toast notifications.
