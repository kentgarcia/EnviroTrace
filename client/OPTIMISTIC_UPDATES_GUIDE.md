# Quick Reference: Optimistic Updates Pattern

## When to Use
Use this pattern when:
- ✅ User expects instant feedback (forms, toggles, checkboxes)
- ✅ Network latency would be noticeable
- ✅ You can predict the server response
- ✅ Changes are frequent (auto-save scenarios)

Don't use when:
- ❌ Server might reject the change (complex validation)
- ❌ Response is unpredictable (e.g., AI generation)
- ❌ Change has side effects you can't predict

## Basic Pattern

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const updateMutation = useMutation({
  mutationFn: (updates) => api.update(id, updates),
  
  // 1. BEFORE API call - Update UI optimistically
  onMutate: async (updates) => {
    // Cancel ongoing fetches
    await queryClient.cancelQueries({ queryKey: ['items'] });
    
    // Snapshot current state for rollback
    const previous = queryClient.getQueryData(['items']);
    
    // Update cache optimistically
    queryClient.setQueryData(['items'], (old) => 
      old.map(item => item.id === id ? { ...item, ...updates } : item)
    );
    
    return { previous }; // Return for rollback
  },
  
  // 2. ON ERROR - Rollback changes
  onError: (err, updates, context) => {
    queryClient.setQueryData(['items'], context.previous);
    toast.error('Failed to save');
  },
  
  // 3. ON SUCCESS - Update with server response
  onSuccess: (serverResponse) => {
    queryClient.setQueryData(['items'], (old) =>
      old.map(item => item.id === id ? serverResponse : item)
    );
    toast.success('Saved');
  }
});
```

## Debouncing Auto-Save

```typescript
const debounceTimer = useRef<NodeJS.Timeout | null>(null);

const handleChange = (field: string, value: any) => {
  // Update UI immediately
  setLocalState({ ...localState, [field]: value });
  
  // Clear existing timer
  if (debounceTimer.current) {
    clearTimeout(debounceTimer.current);
  }
  
  // Save after 2 seconds of inactivity
  debounceTimer.current = setTimeout(() => {
    updateMutation.mutate({ [field]: value });
  }, 2000);
};

// Cleanup on unmount
useEffect(() => {
  return () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };
}, []);
```

## Save State Indicators

```typescript
type SaveState = 'idle' | 'saving' | 'saved' | 'error';
const [saveState, setSaveState] = useState<SaveState>('idle');

const updateMutation = useMutation({
  mutationFn: api.update,
  onMutate: () => setSaveState('saving'),
  onSuccess: () => {
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 2000); // Clear after 2s
  },
  onError: () => {
    setSaveState('error');
    setTimeout(() => setSaveState('idle'), 3000); // Clear after 3s
  }
});

// UI
{saveState === 'saving' && <Loader2 className="animate-spin" />}
{saveState === 'saved' && <CheckCircle2 className="text-green-600" />}
{saveState === 'error' && <AlertCircle className="text-red-600" />}
```

## Smart Cache Updates vs Invalidation

### ❌ BAD: Aggressive Invalidation
```typescript
onSuccess: () => {
  // This refetches ALL items from server
  queryClient.invalidateQueries({ queryKey: ['items'] });
}
```

### ✅ GOOD: Surgical Update
```typescript
onSuccess: (updatedItem) => {
  // This updates only the changed item in cache
  queryClient.setQueryData(['items'], (old) =>
    old.map(item => item.id === updatedItem.id ? updatedItem : item)
  );
}
```

### ✅ GOOD: Add to Cache
```typescript
onSuccess: (newItem) => {
  queryClient.setQueryData(['items'], (old = []) => [newItem, ...old]);
}
```

### ✅ GOOD: Remove from Cache
```typescript
onSuccess: () => {
  queryClient.setQueryData(['items'], (old = []) =>
    old.filter(item => item.id !== deletedId)
  );
}
```

## Retry Logic

```typescript
const updateMutation = useMutation({
  mutationFn: api.update,
  retry: 2,              // Retry failed requests 2 times
  retryDelay: 1000,      // Wait 1 second between retries
  
  // Or custom retry logic
  retry: (failureCount, error) => {
    if (error.status === 404) return false; // Don't retry 404s
    return failureCount < 3; // Max 3 retries
  }
});
```

## Common Pitfalls

### 1. Forgetting to Cancel Queries
```typescript
// ❌ BAD: Race condition possible
onMutate: async (updates) => {
  queryClient.setQueryData(['items'], ...);
}

// ✅ GOOD: Cancel ongoing fetches first
onMutate: async (updates) => {
  await queryClient.cancelQueries({ queryKey: ['items'] });
  queryClient.setQueryData(['items'], ...);
}
```

### 2. Not Returning Context for Rollback
```typescript
// ❌ BAD: Can't rollback on error
onMutate: async (updates) => {
  queryClient.setQueryData(['items'], ...);
}

// ✅ GOOD: Return snapshot for rollback
onMutate: async (updates) => {
  const previous = queryClient.getQueryData(['items']);
  queryClient.setQueryData(['items'], ...);
  return { previous };
}
```

### 3. Ignoring Server Response
```typescript
// ❌ BAD: Optimistic data might be wrong
onSuccess: () => {
  // Do nothing, keep optimistic data
}

// ✅ GOOD: Update with server response
onSuccess: (serverResponse) => {
  queryClient.setQueryData(['items'], (old) =>
    old.map(item => item.id === serverResponse.id ? serverResponse : item)
  );
}
```

### 4. Not Clearing Debounce Timers
```typescript
// ❌ BAD: Timer keeps running after unmount
const handleChange = (value) => {
  setTimeout(() => mutate(value), 2000);
}

// ✅ GOOD: Clear timer on unmount
const timerRef = useRef(null);
const handleChange = (value) => {
  if (timerRef.current) clearTimeout(timerRef.current);
  timerRef.current = setTimeout(() => mutate(value), 2000);
}
useEffect(() => () => clearTimeout(timerRef.current), []);
```

## Debounce Timing Guidelines

- **Typing/Text input:** 2000ms (2 seconds)
- **Dropdowns/Selects:** 500ms
- **Checkboxes/Toggles:** 300ms or instant
- **Number inputs:** 1000ms

## Testing Optimistic Updates

### 1. Test Instant UI Feedback
```typescript
// Change value → Check UI updates immediately (before API call)
fireEvent.change(input, { target: { value: 'New Value' } });
expect(screen.getByText('New Value')).toBeInTheDocument();
```

### 2. Test Rollback on Error
```typescript
// Mock API error → Check UI reverts to previous value
server.use(
  rest.put('/api/items/:id', (req, res, ctx) => {
    return res(ctx.status(500));
  })
);
fireEvent.change(input, { target: { value: 'New Value' } });
await waitFor(() => {
  expect(screen.getByText('Old Value')).toBeInTheDocument();
});
```

### 3. Test Save State Indicators
```typescript
// Change value → Check "Saving..." appears → Check "Saved" appears
fireEvent.change(input, { target: { value: 'New' } });
expect(screen.getByText('Saving...')).toBeInTheDocument();
await waitFor(() => {
  expect(screen.getByText('Saved')).toBeInTheDocument();
});
```

## Real-World Example

See [ISOTreeRequestDetails.tsx](../src/presentation/roles/urban-greening/pages/tree-requests/components/ISOTreeRequestDetails.tsx) for a complete implementation with:
- ✅ Optimistic updates
- ✅ 2-second debounce
- ✅ Save state indicators
- ✅ Retry logic
- ✅ Error rollback
- ✅ Smart cache management

## Resources

- [TanStack Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [React Query Best Practices](https://tkdodo.eu/blog/practical-react-query)
- [Debouncing in React](https://usehooks.com/useDebounce/)
