
/// <reference types="vite/client" />

// Add type definition for Safari's standalone mode
interface Navigator {
  standalone?: boolean;
}

// Add type definition for Tauri
interface Window {
  __TAURI__?: {
    invoke: (cmd: string, args?: any) => Promise<any>;
    event: {
      listen: (event: string, handler: (event: any) => void) => Promise<() => void>;
      emit: (event: string, payload?: any) => Promise<void>;
    };
  };
}
