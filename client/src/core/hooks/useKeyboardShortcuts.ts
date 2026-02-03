import { useEffect } from 'react';
import { useRefresh } from '../services/refresh-service';

export const useKeyboardShortcuts = () => {
  const { refreshCurrentPage } = useRefresh();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+R or Cmd+R
      if ((event.ctrlKey || event.metaKey) && event.key === 'r' && !event.shiftKey) {
        event.preventDefault();
        refreshCurrentPage();
        return;
      }

      // Ctrl+Shift+R or Cmd+Shift+R (hard reload - treat as refresh)
      if ((event.ctrlKey || event.metaKey) && event.key === 'R' && event.shiftKey) {
        event.preventDefault();
        refreshCurrentPage();
        return;
      }

      // F5
      if (event.key === 'F5' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        refreshCurrentPage();
        return;
      }

      // Ctrl+F5 or Cmd+F5 (hard reload - treat as refresh)
      if (event.key === 'F5' && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        refreshCurrentPage();
        return;
      }
    };

    // Add event listener to window
    window.addEventListener('keydown', handleKeyDown);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [refreshCurrentPage]);
};
