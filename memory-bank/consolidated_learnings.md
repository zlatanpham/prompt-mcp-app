## UI/UX Patterns

### Centralized Confirmation Dialogs

- **Pattern:** Implement a single, reusable `ConfirmActionDialog` component for all actions requiring user confirmation (e.g., delete, regenerate).
- **Benefits:** Ensures consistent UI/UX across the application, reduces code duplication, and improves maintainability by abstracting confirmation logic.
- **Implementation Steps:**
  1. Create a generic `ConfirmActionDialog` component with props for `isOpen`, `onOpenChange`, `onConfirm`, `title`, `description`, `confirmText`, and `cancelText`.
  2. Identify existing `AlertDialog` or similar confirmation implementations.
  3. Replace direct `AlertDialog` usage with the `ConfirmActionDialog` component.
  4. Map existing state variables (e.g., `isConfirmDeleteDialogOpen`, `itemToDelete`) and handlers to the new component's props.

### Displaying Related Entity Counts

- **Pattern:** Enhance UI elements (e.g., cards, lists) to display counts of related entities for improved user engagement and information density.
- **Benefits:** Provides essential at-a-glance information, makes pages more engaging, and helps users quickly understand the scope of an item.
- **Implementation Steps:**
  1. **Backend (tRPC/Prisma):** Modify the data fetching procedure to include `_count` aggregation for the related model (e.g., `Prisma.Project.findMany({ include: { _count: { select: { Tool: true } } })`).
  2. **Frontend (React/Shadcn UI):**
     - Update relevant TypeScript types to include the `_count` property.
     - Utilize Shadcn UI components like `Badge` and `lucide-react` icons (e.g., `Wrench`) to visually represent the count.
     - Apply appropriate Tailwind CSS classes for styling to ensure consistency with the overall design system.

### Prioritizing Lucide React Icons

- **Pattern:** Always prioritize using `lucide-react` icons over raw SVG elements or other icon libraries when available.
- **Benefits:** Ensures consistency in icon design and usage across the application, leverages the `lucide-react` library's optimizations and accessibility features, and simplifies maintenance by centralizing icon management.
- **Implementation Steps:**
  1. Before adding a new icon or replacing an existing one, check if a suitable icon exists in `lucide-react`.
  2. Import the icon component from `lucide-react` (e.g., `import { ChevronDown } from "lucide-react";`).
  3. Use the `lucide-react` component directly in JSX, applying necessary `className` for styling (e.g., `h-4 w-4`).

### Skeleton Loading State

- **Pattern:** Utilize Shadcn UI's `Skeleton` component to replace text-based or simple loading indicators with a visual representation of the content structure.
- **Benefits:** Improves perceived performance and user experience by providing a more engaging and less jarring loading state. Mimics the layout of the actual content, reducing layout shifts once data is loaded.
- **Implementation Steps:**
  1. Import the `Skeleton` component: `import { Skeleton } from "@/components/ui/skeleton";`.
  2. In the loading conditional block, replace the simple loading text with `Skeleton` components.
  3. Mimic the structure of the loaded content (e.g., using `div` with `space-y` and `grid` classes, `Card`, `CardContent`, `Avatar`, `Input`, `Label`, `Button` components) with `Skeleton` placeholders.
  4. Apply Tailwind CSS utility classes to the `Skeleton` components (e.g., `h-`, `w-`, `flex`, `gap-`) to match the dimensions and layout of the content that will eventually load.
  5. **Important:** If rendering a `Skeleton` component (or any React element) in a prop that previously expected a `string`, update the prop's type definition to `React.ReactNode` to avoid TypeScript errors.
  6. **For Data-Dependent Forms/Dialogs:** When a form or dialog fetches data (e.g., for editing an existing item), use the `isLoading` state from the data-fetching hook (e.g., `useQuery`) to conditionally render the skeleton. This ensures the skeleton is displayed while the specific item's data is being loaded.

### Nested Clickable Elements

- **Pattern:** When a larger UI element (e.g., a card) is made clickable (e.g., via `Next/Link`), and it contains smaller interactive elements (e.g., dropdown menus, buttons), use `e.stopPropagation()` on the inner elements' click handlers to prevent the parent's click event from firing.
- **Benefits:** Ensures that specific actions on nested elements are triggered as intended without also activating the parent's navigation or other click behaviors.
- **Implementation Steps:**
  1. Wrap the parent element with `Next/Link` or add an `onClick` handler for the main navigation.
  2. For any interactive child elements (buttons, dropdown triggers, menu items), add an `onClick` handler that calls `e.stopPropagation()`. For `onSelect` events in dropdowns, also call `e.stopPropagation()`.

### Displaying Table Headers for Empty Tables

- **Pattern:** When a table might have no data, always render the `Table` and `TableHeader` components unconditionally. Conditionally render the `TableBody` content: either map over the data to display rows, or display a single `TableRow` with a `TableCell` that spans all columns (`colSpan`) and contains a "no data found" message, optionally with a relevant icon.
- **Benefits:** Provides consistent user experience by always showing the table's context (what data would be there), even when empty. Avoids UI shifts and ensures a predictable layout.
- **Implementation Steps:**
  1. Ensure `Table` and `TableHeader` are outside any conditional rendering blocks.
  2. Inside `TableBody`, use a conditional check (`data && data.length > 0 ? ... : ...`).
  3. For the empty state, render a `TableRow` with a `TableCell` that has `colSpan` set to the number of columns in the table.
  4. Place the "no data found" message and any relevant icon inside this `TableCell`.

### Date Formatting for User Experience

- **Pattern:** Display relative time (e.g., "5 minutes ago", "2 days ago") for timestamps instead of exact dates and times, especially for "last edited" or "created at" fields.
- **Benefits:** Improves readability and provides a more natural, human-friendly representation of time, making it easier for users to quickly grasp recency.
- **Implementation Steps:**
  1. Utilize a date utility library (e.g., `date-fns`) to format dates into a "time ago" string.
  2. Create a reusable utility function (e.g., `timeAgo` in `src/lib/utils.ts`) to encapsulate this logic.
  3. Replace absolute date formatting with the new relative time function in relevant UI components.

### Multi-line Text Input

- **Pattern:** Use a `textarea` HTML element or a corresponding UI component (e.g., Shadcn UI's `Textarea`) for input fields that are expected to contain multi-line text or longer descriptions.
- **Benefits:** Provides a better user experience by allowing users to see and edit more of their input at once, improving usability for fields like descriptions, comments, or content.
- **Implementation Steps:**
  1. Import the `Textarea` component from `src/components/ui/textarea`.
  2. Replace the `Input` component with `Textarea` for the relevant form field.
  3. Ensure the form handling (e.g., `react-hook-form`) correctly binds to the `textarea` element.

### Internal Navigation in Tables/Lists

- **Pattern:** Use `next/link` to enable navigation to detail pages directly from elements within tables or lists.
- **Benefits:** Improves user experience by providing direct access to related information, reducing clicks and improving workflow efficiency.
- **Implementation Steps:**
  1. Import `Link` from `next/link`.
  2. Wrap the clickable text or element within the table cell with the `Link` component.
  3. Construct the `href` attribute dynamically using the relevant ID (e.g., `projectId`) to point to the correct detail page.
  4. Apply appropriate styling (e.g., `text-blue-600 hover:underline`) to indicate clickability.

### Custom UI Component Placement

- **Pattern:** Place custom UI components (not part of a specific UI library like Shadcn UI) directly in `src/components/` rather than in subdirectories like `src/components/ui/`.
- **Benefits:** Maintains clear separation between custom components and library-specific components, improving project organization and adherence to established conventions.

### Notion-like Highlight Styling

- **Pattern:** To create a subtle, Notion-like highlight for text, use a combination of Tailwind CSS classes: `inline-block`, `rounded-md`, `px-2`, `py-0.5`, `bg-gray-100` (for light background), `text-rose-500` (for light red text), and `dark:bg-gray-800 dark:text-gray-200` for dark mode compatibility.
- **Benefits:** Visually emphasizes specific text elements in a clean and modern way, enhancing readability and user focus.

### Drawer/Sheet Component Usage (Shadcn UI)

- **Pattern:** Utilize Shadcn UI's `Drawer` or `Sheet` components for forms or content that require more vertical space or a less intrusive overlay than a traditional dialog. `Sheet` is preferred for side panels.
- **Benefits:** Provides a better user experience for complex forms or detailed views by offering more screen real estate and a smoother transition.
- **Implementation Steps:**
  1. Import `Sheet`, `SheetClose`, `SheetContent`, `SheetDescription`, `SheetFooter`, `SheetHeader`, and `SheetTitle` from `@/components/ui/sheet` for side panels.
  2. Replace `Dialog` or `Drawer` components with `Sheet` components for side panels.
  3. Set `side="right"` (or `left`, `top`, `bottom`) on the `SheetContent` to control its opening direction.
  4. Adjust the `className` on `SheetContent` (e.g., `sm:max-w-lg`, `flex flex-col`) to control its width and layout.
  5. For forms/content within the sheet, ensure the main content area is scrollable using `flex-1 overflow-y-auto p-4` to handle long content.
  6. **Refinement:** Remove redundant close buttons if the `Sheet` component already provides one in the header.

### Dialogs for User Actions (Shadcn UI, React Hook Form, Zod)

- **Pattern:** Implement interactive dialogs for user actions (e.g., editing user details, resetting passwords) using Shadcn UI's `Dialog` component, `react-hook-form` for state management, and `zod` for robust client-side validation.
- **Benefits:** Provides a consistent and validated user input experience for critical actions, improving data integrity and user feedback.
- **Implementation Steps:**
  1. Create a dedicated component for the dialog (e.g., `ResetPasswordDialog.tsx`).
  2. Use `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription` from Shadcn UI.
  3. Integrate `useForm` from `react-hook-form` with `zodResolver` for form state and validation.
  4. Define a Zod schema for input validation, including specific rules (e.g., min length, password matching).
  5. Use `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage` from Shadcn UI's `Form` components for structured form fields.
  6. Connect form submission to a tRPC mutation (e.g., `api.user.resetPassword.useMutation`).
  7. Handle loading states using `mutation.status === "pending"` to disable submit buttons.
  8. Provide `onSuccess` and `onError` callbacks for toast notifications and form reset.

## Data Fetching & Aggregation

### Handling Nested Counts and Aggregations (tRPC/Prisma)

- **Pattern:** When displaying counts of related entities that are several levels deep in the data model (e.g., tools associated with projects linked to an API key), use Prisma's nested `_count` aggregation in tRPC `getAll` procedures for efficient initial data loading.
- **Benefits:** Reduces the number of database queries and simplifies frontend data processing for summary information.
- **Implementation Steps:**
  1. In the Prisma query, include nested relations and their `_count` selects (e.g., `include: { projects: { include: { project: { include: { _count: { select: { Tool: true } } } } } } }`).
  2. In the frontend, use `reduce` or similar array methods to sum up the nested counts.

### Lazy Loading Detailed Data

- **Pattern:** For detailed lists or complex data associated with a summary view (e.g., a list of tools for an API key), fetch the detailed data only when explicitly requested by the user (e.g., by clicking a count or opening a drawer).
- **Benefits:** Optimizes initial page load times and reduces unnecessary data transfer, improving application performance and responsiveness.
- **Implementation Steps:**
  1. Create a separate tRPC procedure to fetch the detailed data (e.g., `getToolsByApiKeyId`).
  2. In the frontend, use `useQuery` with the `enabled` option set to `false` initially, and enable it (`enabled: !!someId`) when the user action triggers the need for the detailed data.

## Component Usage & Consistency

### Always Verify Component Props

- **Pattern:** Before using a component, especially when encountering TypeScript errors related to props, always refer to the component's definition file (e.g., `src/components/highlight.tsx`) to understand its expected props and their types.
- **Benefits:** Prevents common TypeScript errors, ensures correct component usage, and reduces debugging time.

### Applying Consistent UI Patterns

- **Pattern:** Maintain visual and functional consistency across the application by reusing established UI patterns for similar data representations (e.g., using a `Badge` with an icon for counts).
- **Benefits:** Enhances user experience through predictability, reinforces brand identity, and simplifies future development by leveraging existing styles and components.

## UI/UX Design & Interpretation

### Interpreting "Single Line" Layout

- **Pattern:** When user feedback requests "single line" for inputs, clarify whether it means horizontal alignment of multiple inputs on one line, or vertical stacking where each input occupies its own full line.
- **Guidance:** For complex forms with multi-line inputs (e.g., `Textarea`), vertical stacking often provides better readability and prevents cramped layouts, even if it means more vertical space.
- **Benefit:** Avoids misinterpretations and ensures the final UI aligns with user expectations for clarity and usability.

## React Hook Form Patterns

### Centralizing `useFieldArray`

- **Pattern:** For forms with dynamic arrays of inputs (e.g., arguments, items), centralize the `useFieldArray` hook in the parent component that manages the overall form state. Pass `fields` and `remove` (and `append` if needed by a button in the child) as props to the child component responsible for rendering the array items.
- **Benefits:** Simplifies state management, ensures the parent form has direct control over the array, and makes child components more reusable and focused on presentation.

## TypeScript Best Practices

### Type-Only Imports

- **Pattern:** When `verbatimModuleSyntax` is enabled in `tsconfig.json`, import types using `import type { ... } from '...'` to explicitly distinguish them from value imports.
- **Benefits:** Prevents accidental runtime imports of types, improves bundle size, and aligns with modern TypeScript practices.

## ESLint & TypeScript Patterns

### Handling ESLint "Unbound Methods" Warnings

- **Pattern:** When ESLint warns about "unbound methods" (e.g., `Avoid referencing unbound methods which may cause unintentional scoping of 'this'`) for functions obtained from hooks or libraries (like `useRouter().push`), access the method directly from the returned object instead of destructuring it.
- **Example:** Instead of `const { push } = useRouter();`, use `const router = useRouter();` and then call `router.push(...)`.
- **Benefits:** Resolves ESLint warnings by ensuring the method is called with its correct `this` context, leading to cleaner code and preventing potential runtime issues related to `this` binding.

### Secure Password Handling (`bcryptjs`)

- **Pattern:** For secure password management, always hash passwords before storing them in the database using a strong hashing algorithm like `bcryptjs`. When verifying a user's password, compare the provided plaintext password with the stored hash using `bcrypt.compare`.
- **Benefits:** Protects user data by preventing plaintext password storage, making it resilient against database breaches.
- **Implementation Steps:**
  1. Import `bcrypt` from `bcryptjs`.
  2. When registering or updating a password, use `await bcrypt.hash(password, saltRounds)` (e.g., `10` salt rounds) to hash the password.
  3. When verifying a password, use `await bcrypt.compare(plaintextPassword, hashedPassword)` to check for a match.

### Optional Chaining for Null/Undefined Checks

- **Pattern:** Use optional chaining (`?.`) for accessing properties on potentially null or undefined objects. This is more concise and readable than traditional `&&` checks or `if (!obj || !obj.prop)` statements.
- **Benefits:** Improves code readability and reduces verbosity, especially for deeply nested object access, while preventing runtime errors.
- **Example:** Instead of `if (!user || !user.password)`, use `if (!user?.password)`.

## Development Workflow & Troubleshooting

### Handling `replace_in_file` Failures

- **Pattern:** When `replace_in_file` fails due to intermittent errors (e.g., "Failed to open diff editor") or complex changes leading to incorrect matches, retry the operation. If repeated failures occur, consider using `write_to_file` as a more robust fallback to overwrite the entire file with the desired content.
- **Benefits:** Ensures task completion even when targeted edits are problematic, providing a reliable recovery mechanism.

### `replace_in_file` Precision

- **Pattern:** Always refer to the `final_file_content` after any file modification. For complex changes, break them into multiple, smaller `SEARCH/REPLACE` blocks to minimize errors and simplify debugging.
- **Benefits:** Improves reliability and reduces errors during file modifications, especially with auto-formatting.

### Adapting to Dynamic User Requirements

- **Pattern:** Be prepared to adjust the plan and implementation mid-task based on new user instructions or feedback.
- **Benefits:** Ensures the final solution aligns precisely with evolving user needs and preferences, leading to higher satisfaction.

### Troubleshooting Misleading Parsing Errors

- **Pattern:** If persistent and cryptic parsing errors occur in JSX/TSX files, and direct code modifications do not resolve them, investigate external factors such as ESLint, TypeScript, or Babel/SWC configurations and versions.
- **Benefits:** Prevents wasted effort on non-existent code bugs and directs troubleshooting towards the actual environmental root cause.

## Authentication & Session Management

### Next-Auth Session Retrieval

- **Pattern:** For fetching the user session in server components or API routes, use `auth()` from `@/server/auth` instead of `getServerAuthSession`.
- **Benefits:** Aligns with the actual export structure of the Next-Auth configuration, preventing import errors.

## tRPC Patterns

### `useMutation` Error Handling

- **Pattern:** When defining the `onError` callback for `api.yourRouter.yourMutation.useMutation()`, if `TRPCClientError<AppRouter>` causes type incompatibility issues, consider using `any` for the `error` parameter as a pragmatic solution.
- **Benefits:** Unblocks development when precise tRPC error typing is complex or unclear, allowing for continued progress while still providing error messages to the user. Note this as an area for future refinement if a more specific tRPC utility type becomes available or is identified.

### Lazy Data Fetching with tRPC/React Query

- **Pattern:** For manual or lazy data fetching in tRPC/React Query, use `api.yourRouter.yourProcedure.useQuery(input, { enabled: false })` and trigger the fetch using the `refetch()` function returned by the hook.
- **Benefits:** Prevents automatic data fetching on component mount, allowing data to be fetched only when explicitly needed (e.g., on a button click), optimizing initial page load and resource usage.
- **Implementation Steps:**
  1. Initialize the query with `enabled: false`: `const { data, isLoading, refetch } = api.yourRouter.yourProcedure.useQuery(input, { enabled: false });`
  2. Call `await refetch()` in the event handler to trigger the data fetch.
  3. Use the `data` returned from `refetch()` (e.g., `const { data: fetchedData } = await refetch();`) for subsequent logic that depends on the fetched data.

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
