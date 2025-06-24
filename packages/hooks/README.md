# Hooks Package

Collection of type-safe React hooks for API calls, form handling, feature flags, and performance instrumentation.

## Purpose

- **API Integration**: tRPC hooks with caching, optimistic updates, and error handling
- **Form Management**: Hooks for complex forms with validation and multi-step flows
- **Performance**: Monitoring hooks for Core Web Vitals and user analytics
- **Feature Gates**: Dynamic feature toggling based on subscription tiers
- **Canvas Operations**: Specialized hooks for design canvas interactions

## Hook Categories

### API Hooks
- **useApiForm**: Form submission with tRPC integration and error handling
- **useFilterForm**: Advanced filtering with URL persistence
- **useUploadForm**: File upload with progress tracking and validation

### Canvas Hooks
- **useUndoRedo**: Undo/redo functionality for canvas operations
- **useFocusManagement**: Keyboard navigation and accessibility
- **useMetrics**: Performance and usage tracking

### UI/UX Hooks
- **useToast**: Notification system integration
- **useFeatureGate**: Subscription-based feature access
- **usePerformance**: Core Web Vitals monitoring

### Form Hooks
- **useFormErrors**: Centralized error state management
- **useMultiStepForm**: Wizard-style form flows

## Usage

```tsx
import { useApiForm, useFeatureGate, useUndoRedo } from '@terrashaper/hooks'

export function ProjectForm() {
  const { canAccess } = useFeatureGate('premium-templates')
  const { undo, redo, canUndo, canRedo } = useUndoRedo()
  const { submit, isLoading, errors } = useApiForm({
    onSubmit: async (data) => {
      // Handle form submission
    }
  })
  
  return (
    <form onSubmit={submit}>
      {canAccess && <PremiumTemplates />}
      {/* Form content */}
    </form>
  )
}
```

## Key Features

- **Type Safety**: Full TypeScript support with generic hooks
- **Performance**: Optimized with proper dependency arrays and memoization  
- **Error Handling**: Consistent error boundaries and user feedback
- **Accessibility**: Keyboard navigation and ARIA support
- **Caching**: Intelligent caching strategies for API calls

## Development

```bash
# Install dependencies
npm install

# Build package
npm run build

# Run tests
npm run test

# Type check
npm run typecheck
```

## Dependencies

- **React**: ^18.0.0
- **@trpc/react-query**: API integration
- **React Query**: Caching and synchronization
- **Zustand**: Lightweight state management