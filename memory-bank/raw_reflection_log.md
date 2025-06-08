---

Date: 2025-06-07
TaskRef: "Implement client-side toast for login failures"

Learnings:

- Next.js Server Actions called directly in client components can lead to bundling server-side code (like Prisma Client) into client chunks, causing "Code generation for chunk item errored" errors.
- `signIn` from `next-auth` with `redirect: false` returns a `SignInResponse` object, which contains an `error` property on authentication failure. It does not throw an error directly in a `try...catch` block in the same way a standard function might.
- Explicitly checking `result?.error` from `signIn` and then throwing a new `Error` with a string message is the correct way to propagate authentication errors from server actions to client components for toast display.
- Type casting `result.error as string | undefined` and using nullish coalescing (`??`) helps satisfy TypeScript and ESLint when handling potentially `any` types from external libraries.

Difficulties:

- Initial attempt to handle `signIn` errors directly in client component's `try...catch` failed due to server-side bundling of Prisma.
- Misunderstanding of `signIn`'s `redirect: false` behavior led to incorrect error propagation, resulting in unexpected redirects to GitHub login page instead of client-side error handling.
- ESLint/TypeScript errors related to `any` type from `result.error` required explicit type handling.

Successes:

- Successfully refactored login logic into a dedicated server action (`src/app/actions/auth.ts`) to prevent server-side code bundling on the client.
- Correctly implemented error propagation from the server action to the client component using `SignInResponse`'s `error` property.
- Integrated `sonner` toast notifications for client-side display of login errors.
- Added `Toaster` component to `src/app/(public)/layout.tsx` for toast rendering.

Improvements_Identified_For_Consolidation:

- General pattern: Handling server action errors in client components, especially with `next-auth`'s `signIn` function.
- Specific: Correct usage of `signIn` with `redirect: false` and checking `result.error`.
---

---

Date: 2025-06-08
TaskRef: "Implement reset password function"

Learnings:

- Creating private components within page directories (e.g., `src/app/(protected)/account/_components/`) is a good practice for encapsulating page-specific UI logic.
- Integrating `react-hook-form` with `zod` for form validation provides robust client-side input validation.
- Using `api.user.resetPassword.useMutation` for handling form submissions and interacting with tRPC mutations.
- Handling `useMutation` loading state with `status === "pending"` is the correct way to disable buttons during API calls.
- `bcrypt.compare` is essential for securely verifying current passwords against hashed passwords in the database.
- `bcrypt.hash` is used to securely hash new passwords before storing them.
- Optional chaining (`?.`) is preferred for checking nested properties to avoid ESLint warnings and improve readability (e.g., `!user?.password`).

Difficulties:

- Initial TypeScript errors due to `api.user.resetPassword` not existing before the tRPC mutation was defined. This highlighted the dependency order between frontend component and backend API.
- Misuse of `isLoading` property on `useMutation` result, which was resolved by using `status === "pending"`.

Successes:

- Successfully created a reusable `ResetPasswordDialog` component.
- Implemented a secure `resetPassword` tRPC mutation with proper validation and password hashing/comparison.
- Seamlessly integrated the dialog into the account page, providing a complete password reset flow.

Improvements_Identified_For_Consolidation:

- General pattern: Implementing dialogs for user actions (e.g., password reset, name edit) using Shadcn UI, React Hook Form, and Zod.
- General pattern: Secure password handling (hashing, comparison) with `bcryptjs`.
- Specific: Correct `useMutation` loading state handling (`status === "pending"`).
- Specific: Using optional chaining for null/undefined checks.

---
