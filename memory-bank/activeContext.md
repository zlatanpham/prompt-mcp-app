## Current Work Focus

The primary focus is on implementing client-side toast notifications for login failures in the `LoginForm` component. This involves refactoring server action calls and ensuring proper error propagation from the server to the client.

## Recent Changes

- **`src/components/login-form.tsx`:**
  - Converted to a client component (`"use client"`).
  - Implemented `useTransition` for pending state.
  - Integrated `toast` from `sonner` for displaying error messages.
  - Refactored `handleSubmit` to call a new server action (`login`) instead of directly calling `signIn`.
  - Removed local `error` state and its display in JSX, relying solely on toasts.
- **`src/app/actions/auth.ts` (New File):**
  - Created a new server action file to encapsulate `signIn` logic for credentials and GitHub.
  - The `login` function now explicitly checks the `result?.error` from `signIn` and throws a new `Error` with a user-friendly message if authentication fails. This ensures errors are properly propagated to the client.
- **`src/app/(public)/layout.tsx`:**
  - Added the `Toaster` component from `sonner` to the public layout to enable toast notifications across public pages.

## Next Steps

- Verify the toast functionality by attempting to log in with invalid credentials.
- Ensure no unexpected redirects occur on login failure.

## Active Decisions and Considerations

- Moving `signIn` logic to a dedicated server action (`src/app/actions/auth.ts`) is crucial to prevent bundling server-side code (like Prisma Client) into client components, which caused "Code generation for chunk item errored" build errors.
- Using `signIn` with `redirect: false` and explicitly checking `result?.error` is the correct pattern for handling authentication failures in server actions and propagating them to the client.
- `sonner` is used for consistent and user-friendly toast notifications.

## Important Patterns and Preferences

- **Server Actions:** Encapsulate server-side logic that interacts with the database or sensitive operations within dedicated server actions to maintain separation of concerns and prevent client-side bundling issues.
- **Error Handling:** Implement robust error handling in server actions and propagate meaningful error messages to the client for user feedback (e.g., via toasts).
- **UI Consistency:** Utilize existing UI component libraries (Shadcn UI, Sonner) for a consistent user experience.

## Learnings and Project Insights

- Deepened understanding of Next.js Server Actions, client/server component boundaries, and `next-auth`'s `signIn` behavior with `redirect: false`.
- Learned to diagnose and resolve "Code generation for chunk item errored" errors related to server-side dependencies in client bundles.
- Reinforced the importance of careful error propagation from server to client in Next.js applications.
