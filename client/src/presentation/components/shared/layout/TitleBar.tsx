import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X } from "lucide-react";

const appWindow = getCurrentWindow();

export default function TitleBar() {
  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-[30px] px-3 bg-white text-gray-900 select-none fixed top-0 left-0 right-0 z-50 shadow-sm"
    >
      <span className="font-semibold tracking-wide text-sm">
        EPNRO Management System
      </span>
      <div className="flex items-center gap-1">
        <button
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
          onClick={() => appWindow.minimize()}
          aria-label="Minimize"
          tabIndex={-1}
        >
          <Minus className="w-4 h-4 text-gray-500" />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-100 transition-colors"
          onClick={() => appWindow.toggleMaximize()}
          aria-label="Maximize"
          tabIndex={-1}
        >
          <Square className="w-4 h-4 text-gray-500" />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-red-100 hover:text-red-600 transition-colors"
          onClick={() => appWindow.close()}
          aria-label="Close"
          tabIndex={-1}
        >
          <X className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}
