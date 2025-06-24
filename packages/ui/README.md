# UI Package

Reusable React component library and design system for TerraShaper Pro built with Tailwind CSS and Radix primitives.

## Purpose

- **Design System**: Centralized component library ensuring consistent UI across all applications
- **Accessibility**: WCAG-compliant components with keyboard navigation and screen reader support
- **Theming**: Unified color system, typography, and spacing tokens
- **Performance**: Optimized components with lazy loading and minimal bundle impact

## Components

### Core Components
- **Button**: Multiple variants (primary, secondary, outline, ghost)
- **Input/Textarea**: Form inputs with validation states
- **Select/Dropdown**: Accessible selection components
- **Dialog/Modal**: Overlay components for modals and dialogs
- **Card**: Content containers with consistent styling
- **Badge**: Status indicators and labels

### Data Display
- **Table**: Sortable, filterable data tables
- **Progress**: Loading indicators and progress bars
- **Skeleton**: Loading state placeholders
- **Alert**: Notification and status messages

### Navigation
- **Tabs**: Tab navigation with keyboard support
- **Accordion**: Collapsible content sections
- **Sheet**: Slide-out panels and sidebars

### Specialized Components
- **Billing Components**: Invoice lists, usage analytics, payment methods
- **Loading States**: Spinners, skeletons, and empty states
- **Error Boundaries**: Graceful error handling components

## Usage

```tsx
import { Button, Card, Dialog } from '@terrashaper/ui'

export function MyComponent() {
  return (
    <Card>
      <Button variant="primary" size="lg">
        Create Project
      </Button>
    </Card>
  )
}
```

## Development

```bash
# Install dependencies
npm install

# Build package
npm run build

# Run Storybook (if configured)
npm run storybook

# Type check
npm run typecheck
```

## Design Tokens

The package includes standardized design tokens:

- **Colors**: Primary, secondary, accent, and semantic color scales
- **Typography**: Font families, sizes, weights, and line heights  
- **Spacing**: Consistent margin and padding scale
- **Borders**: Radius and border width standards
- **Shadows**: Elevation system for depth

## Dependencies

- **React**: ^18.0.0
- **Tailwind CSS**: Utility-first styling
- **Radix UI**: Accessible primitive components
- **Lucide React**: Consistent icon system
- **clsx**: Conditional className utility