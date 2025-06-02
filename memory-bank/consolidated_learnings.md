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

### Custom UI Component Placement

- **Pattern:** Place custom UI components (not part of a specific UI library like Shadcn UI) directly in `src/components/` rather than in subdirectories like `src/components/ui/`.
- **Benefits:** Maintains clear separation between custom components and library-specific components, improving project organization and adherence to established conventions.

### Notion-like Highlight Styling

- **Pattern:** To create a subtle, Notion-like highlight for text, use a combination of Tailwind CSS classes: `inline-block`, `rounded-md`, `px-2`, `py-0.5`, `bg-gray-100` (for light background), `text-rose-500` (for light red text), and `dark:bg-gray-800 dark:text-gray-200` for dark mode compatibility.
- **Benefits:** Visually emphasizes specific text elements in a clean and modern way, enhancing readability and user focus.

### Drawer Component Usage (Shadcn UI)

- **Pattern:** Utilize the Shadcn UI `Drawer` component for forms or content that require more vertical space or a less intrusive overlay than a traditional dialog, especially when opening from the side of the screen.
- **Benefits:** Provides a better user experience for complex forms or detailed views by offering more screen real estate and a smoother transition.
- **Implementation Steps:**
  1. Import `Drawer`, `DrawerContent`, `DrawerHeader`, and `DrawerTitle` from `@/components/ui/drawer`.
  2. Replace `Dialog` components with `Drawer` components.
  3. Set `direction="right"` on the `Drawer` component to open it from the right edge of the window.
  4. Adjust the `className` on `DrawerContent` (e.g., `sm:max-w-lg`) to control its width.
  5. For forms within the drawer, move action buttons (submit/cancel) to the `DrawerHeader` for persistent visibility.
  6. Associate submit buttons in the header with the form using the `form` prop on the `Button` and an `id` on the `<form>` element.
  7. Wrap the form content in a scrollable `div` (e.g., `overflow-y-auto p-4`) to handle long content and provide internal padding.
  8. **Refinement:** Ensure title and action buttons in the `DrawerHeader` are on one line by applying `flex items-center` to their container.
  9. **Refinement:** Style the cancel button to be smaller and appear as a link using `variant="ghost"` and `size="sm"`.

## Development Workflow & Troubleshooting

### Handling `replace_in_file` Failures

- **Pattern:** When `replace_in_file` fails due to intermittent errors (e.g., "Failed to open diff editor") or complex changes leading to incorrect matches, retry the operation. If repeated failures occur, consider using `write_to_file` as a more robust fallback to overwrite the entire file with the desired content.
- **Benefits:** Ensures task completion even when targeted edits are problematic, providing a reliable recovery mechanism.

### Adapting to Dynamic User Requirements

- **Pattern:** Be prepared to adjust the plan and implementation mid-task based on new user instructions or feedback.
- **Benefits:** Ensures the final solution aligns precisely with evolving user needs and preferences, leading to higher satisfaction.

### Troubleshooting Misleading Parsing Errors

- **Pattern:** If persistent and cryptic parsing errors occur in JSX/TSX files, and direct code modifications do not resolve them, investigate external factors such as ESLint, TypeScript, or Babel/SWC configurations and versions.
- **Benefits:** Prevents wasted effort on non-existent code bugs and directs troubleshooting towards the actual environmental root cause.
