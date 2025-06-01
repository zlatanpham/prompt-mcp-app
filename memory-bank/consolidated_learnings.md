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

- When persistent TypeScript errors (e.g., `Cannot find module`) occur despite code appearing type-safe and correct (e.g., "Unsafe argument of type any assigned to a parameter of type string" for clearly typed variables), it often indicates a false positive, a stale TypeScript language server or development server cache. A server restart is usually required.
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

### Refactoring Large Page Components

- Refactor large page components into smaller, page-specific sub-components. This improves modularity, reduces file length, and enhances readability and maintainability.

### Handling `useState` Setter Type Issues

- When encountering `useState` setter type issues with functional updates in complex component interactions (e.g., with UI library components), consider calculating the new state directly and passing it, or explicitly typing all intermediate parameters.

### Breaking Down Large `replace_in_file` Operations

- Break down large `replace_in_file` operations into smaller, sequential blocks for increased reliability and to avoid "SEARCH block does not match" errors.

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

### Tool Active Status Management

- **Database Field**: Added an `is_active` boolean field with a default of `true` to the `Tool` model in `prisma/schema.prisma`.
- **API Filtering**: Modified `src/app/api/tools/route.ts` to filter tools by `is_active: true` when fetched via API key.
- **tRPC Mutation**: Created a `toggleActive` mutation in `src/server/api/routers/tool.ts` to update the `is_active` status.
- **UI Integration**: Integrated a Shadcn UI `Switch` component in `src/app/(protected)/project/[projectId]/_components/tool.tsx` to allow users to toggle the `is_active` status directly from the tool table.
- **Known Issue (Hydration Error)**: Persistent hydration errors related to whitespace in JSX (`<tr>` children) due to auto-formatting. This requires user intervention to configure their local formatter.
