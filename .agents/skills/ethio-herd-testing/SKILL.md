---
name: ethio-herd-testing
description: Testing conventions and patterns for EthioHerd Connect. Use when writing tests, running tests, or ensuring code quality.
---

# EthioHerd Connect Testing Skill

This skill guides testing practices specific to EthioHerd Connect.

## Test Commands

```bash
# Run unit tests
npm run test:run

# Run E2E tests
npm run test:e2e

# Run all tests
npm test

# Watch mode
npm test -- --watch
```

## Test File Location

Tests are co-located with source files:

```
src/
├── services/
│   └── myService.ts
├── __tests__/
│   └── myService.test.ts    # Unit tests
├── components/
│   └── MyComponent.tsx
└── __tests__/
    └── MyComponent.test.tsx # Component tests
```

## Test Patterns Used

### Unit Testing Services

```typescript
// src/__tests__/myService.test.ts
import { myFunction } from '@/services/myService';

describe('myFunction', () => {
  it('should return correct result', async () => {
    const result = await myFunction('input');
    expect(result.success).toBe(true);
  });

  it('should handle errors', async () => {
    const result = await myFunction('');
    expect(result.success).toBe(false);
  });
});
```

### Component Testing

```tsx
// src/__tests__/MyComponent.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyComponent } from '@/components/MyComponent';

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByText('Label')).toBeInTheDocument();
  });

  it('handles click', () => {
    const onClick = vi.fn();
    render(<MyComponent onClick={onClick} />);
    fireEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalled();
  });
});
```

### Integration Testing

```tsx
// src/__tests__/feature.integration.test.tsx
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAnimals } from '@/hooks/useAnimals';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>
    {children}
  </QueryClientProvider>
);

describe('Animals integration', () => {
  it('fetches animals', async () => {
    const { result } = renderHook(() => useAnimals(), { wrapper });
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });
  });
});
```

## Testing Hooks

```tsx
// src/__tests__/useMyHook.test.ts
import { renderHook, act } from '@testing-library/react';
import { useMyHook } from '@/hooks/useMyHook';

describe('useMyHook', () => {
  it('initializes with default value', () => {
    const { result } = renderHook(() => useMyHook());
    expect(result.current.value).toBe('default');
  });

  it('updates value', () => {
    const { result } = renderHook(() => useMyHook());
    
    act(() => {
      result.current.setValue('new value');
    });
    
    expect(result.current.value).toBe('new value');
  });
});
```

## Mocking Dependencies

### Mocking Supabase

```typescript
import { vi } from 'vitest';

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: [{ id: '1', name: 'Test' }],
          error: null,
        }),
      }),
    })),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'user-1' } },
      }),
    },
  },
}));
```

### Mocking Context

```tsx
const mockAuthContext = {
  user: { id: 'user-1', phone: '912345678' },
  signIn: vi.fn(),
  signOut: vi.fn(),
};

vi.mock('@/contexts/AuthContextMVP', () => ({
  useAuth: () => mockAuthContext,
}));
```

### Mocking Language Context

```tsx
vi.mock('@/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'en',
    setLanguage: vi.fn(),
  }),
}));
```

## Test Utilities Available

The project uses:
- **Vitest** for test runner
- **Testing Library** for React component testing
- **Vitest** for mocking

### Common Assertions

```typescript
// Element exists
expect(screen.getByText('Label')).toBeInTheDocument();
expect(screen.queryByText('Label')).toBeNull();

// Element has attributes
expect(button).toBeDisabled();
expect(input).toHaveValue('test');

// Events
fireEvent.click(button);
fireEvent.change(input, { target: { value: 'test' } });

// Async wait
await waitFor(() => {
  expect(screen.getByText('Loaded')).toBeInTheDocument();
});
```

## Running Specific Tests

```bash
# Run tests for a specific file
npm test -- MyComponent

# Run tests matching a pattern
npm test -- --grep "animals"

# Run with coverage
npm test -- --coverage
```

## Code Coverage Requirements

The project aims for meaningful coverage but prioritizes:
- Service functions (business logic)
- Critical user flows
- Edge cases in data handling

## Pre-commit Testing

Before committing, ensure:
- [ ] `npm run build` passes
- [ ] No TypeScript errors
- [ ] Tests pass for changed code
