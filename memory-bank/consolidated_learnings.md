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
  1. **Backend (tRPC/Prisma):** Modify the data fetching procedure to include `_count` aggregation for the related model (e.g., `Prisma.Project.findMany({ include: { _count: { select: { Tool: true } } } })`).
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
