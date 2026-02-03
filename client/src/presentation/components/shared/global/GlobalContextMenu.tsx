import React, { ReactNode, useEffect, useState } from 'react';
import { RefreshCw, Copy, Type, Search, Printer, ArrowLeft, Plus, Car, TreePine, Users, FileText } from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { useRefresh } from '@/core/services/refresh-service';
import { useRouter, useMatches } from '@tanstack/react-router';

interface GlobalContextMenuProps {
  children: ReactNode;
}

// Route-specific quick actions
const ROUTE_ACTIONS: Record<string, { label: string; icon: any; action: string }> = {
  '/government-emission/vehicles': { label: 'Add Vehicle', icon: Car, action: 'add-vehicle' },
  '/government-emission/offices': { label: 'Add Office', icon: Plus, action: 'add-office' },
  '/government-emission/quarterly-testing': { label: 'Add Test', icon: FileText, action: 'add-test' },
  '/urban-greening/tree-inventory': { label: 'Add Tree', icon: TreePine, action: 'add-tree' },
  '/urban-greening/tree-requests': { label: 'Create Request', icon: Plus, action: 'add-tree-request' },
  '/urban-greening/greening-projects': { label: 'Add Project', icon: Plus, action: 'add-project' },
  '/admin/user-management': { label: 'Add User', icon: Users, action: 'add-user' },
};

export const GlobalContextMenu: React.FC<GlobalContextMenuProps> = ({ children }) => {
  const { refreshCurrentPage } = useRefresh();
  const router = useRouter();
  const matches = useMatches();
  const isDevelopment = import.meta.env.DEV;
  const [clickedElement, setClickedElement] = useState<HTMLElement | null>(null);

  // Get current route
  const currentRoute = matches[matches.length - 1]?.pathname || '/';
  const quickAction = ROUTE_ACTIONS[currentRoute];

  // Listen for Tauri shortcut events
  useEffect(() => {
    let unlisten: (() => void) | undefined;

    const setupTauriListener = async () => {
      if (window.__TAURI__) {
        try {
          const { listen } = await import('@tauri-apps/api/event');
          unlisten = await listen('shortcut-refresh', () => {
            refreshCurrentPage();
          });
        } catch (error) {
          console.log('Tauri event listener not available:', error);
        }
      }
    };

    setupTauriListener();

    return () => {
      if (unlisten) {
        unlisten();
      }
    };
  }, [refreshCurrentPage]);

  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    setClickedElement(e.target as HTMLElement);
  };

  const handleRefresh = () => {
    refreshCurrentPage();
  };

  const handleBack = () => {
    router.history.back();
  };

  const handleCopy = () => {
    document.execCommand('copy');
  };

  const handleSelectAll = () => {
    // Check if clicked element is in sidebar or main content
    const isInSidebar = clickedElement?.closest('nav, aside, [role="navigation"]');
    
    if (!isInSidebar) {
      // Only select content in main area
      const mainContent = document.querySelector('main, [role="main"], .main-content');
      if (mainContent) {
        const range = document.createRange();
        range.selectNodeContents(mainContent);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
      } else {
        document.execCommand('selectAll');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleQuickAction = () => {
    if (!quickAction) return;

    // Dispatch custom event that pages can listen to
    const event = new CustomEvent('context-menu-action', {
      detail: { action: quickAction.action, route: currentRoute }
    });
    window.dispatchEvent(event);
  };

  const handleInspectElement = async () => {
    // Check if running in Tauri
    if (window.__TAURI__) {
      try {
        const { invoke } = await import('@tauri-apps/api/core');
        await invoke('open_devtools');
      } catch (error) {
        console.log('DevTools command not available');
      }
    } else {
      // In browser, the native inspect element is disabled, so show a message
      console.log('Inspect Element: Use browser DevTools (F12)');
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className="w-full h-full" onContextMenu={handleContextMenu}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
          <ContextMenuShortcut>Alt+←</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
          <ContextMenuShortcut>Ctrl+R</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuSeparator />

        {quickAction && (
          <>
            <ContextMenuItem onClick={handleQuickAction}>
              <quickAction.icon className="mr-2 h-4 w-4" />
              {quickAction.label}
            </ContextMenuItem>
            <ContextMenuSeparator />
          </>
        )}
        
        <ContextMenuItem onClick={handleCopy}>
          <Copy className="mr-2 h-4 w-4" />
          Copy
          <ContextMenuShortcut>Ctrl+C</ContextMenuShortcut>
        </ContextMenuItem>
        
        <ContextMenuItem onClick={handleSelectAll}>
          <Type className="mr-2 h-4 w-4" />
          Select All
          <ContextMenuShortcut>Ctrl+A</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={handlePrint}>
          <Printer className="mr-2 h-4 w-4" />
          Print
          <ContextMenuShortcut>Ctrl+P</ContextMenuShortcut>
        </ContextMenuItem>
        
        {isDevelopment && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem onClick={handleInspectElement}>
              <Search className="mr-2 h-4 w-4" />
              Inspect Element
              <ContextMenuShortcut>F12</ContextMenuShortcut>
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
