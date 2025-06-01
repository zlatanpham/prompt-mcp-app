## UI/UX Patterns

### Centralized Confirmation Dialogs

- **Pattern:** Implement a single, reusable `ConfirmActionDialog` component for all actions requiring user confirmation (e.g., delete, regenerate).
- **Benefits:** Ensures consistent UI/UX across the application, reduces code duplication, and improves maintainability by abstracting confirmation logic.
- **Implementation Steps:**
  1. Create a generic `ConfirmActionDialog` component with props for `isOpen`, `onOpenChange`, `onConfirm`, `title`, `description`, `confirmText`, and `cancelText`.
  2. Identify existing `AlertDialog` or similar confirmation implementations.
  3. Replace direct `AlertDialog` usage with the `ConfirmActionDialog` component.
  4. Map existing state variables (e.g., `isConfirmDialogOpen`, `itemToDelete`) and handlers to the new component's props.

### Displaying Related Entity Counts

- **Pattern:** Enhance UI elements (e.g., cards, lists) to display counts of related entities for improved user engagement and information density.
- **Benefits:** Provides essential at-a-glance information, makes pages more engaging, and helps users quickly understand the scope of an item.
- **Implementation Steps:**
  1. **Backend (tRPC/Prisma):** Modify the data fetching procedure to include `_count` aggregation for the related model (e.g., `Prisma.Project.findMany({ include: { _count: { select: { Tool: true } } })`).
  2. **Frontend (React/Shadcn UI):**
     - Update relevant TypeScript types to include the `_count` property.
     - Utilize Shadcn UI components like `Badge` and `lucide-react` icons (e.g., `Wrench`) to visually represent the count.
     - Apply appropriate Tailwind CSS classes for styling to ensure consistency with the overall design system.

### Skeleton Loading State

- **Pattern:** Utilize Shadcn UI's `Skeleton` component to replace text-based or simple loading indicators with a visual representation of the content structure.
- **Benefits:** Improves perceived performance and user experience by providing a more engaging and less jarring loading state. Mimics the layout of the actual content, reducing layout shifts once data is loaded.
- **Implementation Steps:**
  1. Import the `Skeleton` component: `import { Skeleton } from "@/components/ui/skeleton";`.
  2. In the loading conditional block, replace the simple loading text with `Skeleton` components.
  3. Apply Tailwind CSS utility classes to the `Skeleton` components (e.g., `h-`, `w-`, `flex`, `gap-`) to match the dimensions and layout of the content that will eventually load.
  4. **Important:** If rendering a `Skeleton` component (or any React element) in a prop that previously expected a `string`, update the prop's type definition to `React.ReactNode` to avoid TypeScript errors.

### Nested Clickable Elements

- **Pattern:** When a larger UI element (e.g., a card) is made clickable (e.g., via `Next/Link`), and it contains smaller interactive elements (e.g., dropdown menus, buttons), use `e.stopPropagation()` on the inner elements' click handlers to prevent the parent's click event from firing.
- **Benefits:** Ensures that specific actions on nested elements are triggered as intended without also activating the parent's navigation or other click behaviors.
- **Implementation Steps:**
  1. Wrap the parent element with `Next/Link` or add an `onClick` handler for the main navigation.
  2. For any interactive child elements (buttons, dropdown triggers, menu items), add an `onClick` handler that calls `e.stopPropagation()`. For `onSelect` events in dropdowns, also call `e.stopPropagation()`.

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
