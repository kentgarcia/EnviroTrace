import { useEffect } from 'react';

/**
 * Hook to listen for context menu quick actions
 * Usage in your page component:
 * 
 * useContextMenuAction('add-vehicle', () => {
 *   // Open add vehicle dialog
 *   setIsAddDialogOpen(true);
 * });
 */
export const useContextMenuAction = (
  action: string,
  handler: () => void
) => {
  useEffect(() => {
    const handleContextMenuAction = (event: Event) => {
      const customEvent = event as CustomEvent<{ action: string; route: string }>;
      if (customEvent.detail.action === action) {
        handler();
      }
    };

    window.addEventListener('context-menu-action', handleContextMenuAction);

    return () => {
      window.removeEventListener('context-menu-action', handleContextMenuAction);
    };
  }, [action, handler]);
};
