import { useState, useEffect } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Link } from "@tanstack/react-router";
import { Minus, Square, X, Copy } from "lucide-react";

const appWindow = getCurrentWindow();

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const updateState = async () => {
      setIsMaximized(await appWindow.isMaximized());
    };
    updateState();

    const unlisten = appWindow.listen('tauri://resize', updateState);
    return () => {
      unlisten.then((f) => f());
    };
  }, []);

  const handleMaximizeToggle = async () => {
    await appWindow.toggleMaximize();
    setIsMaximized(await appWindow.isMaximized());
  };

  return (
    <div
      data-tauri-drag-region
      className="flex items-center justify-between h-[40px] px-3 bg-main text-white select-none fixed top-0 left-0 right-0 z-50 border-b border-[#002a78]"
    >
      <div className="flex items-center gap-4">
        {/* Logo Section - No Drag Region to allow clicking */}
        <Link 
          to="/dashboard-selection" 
          className="flex items-center gap-2 group cursor-pointer"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <div className="flex items-center gap-1.5">
            <img src="/images/logo_munti.png" alt="Muntinlupa" className="w-6 h-6 object-contain" />
            <img src="/images/logo_epnro.png" alt="EPNRO" className="w-6 h-6 object-contain" />
          </div>
          <div className="flex flex-col border-l border-white/20 pl-2">
            <span className="text-white font-black text-xs leading-none tracking-tighter">ENVIROTRACE</span>
          </div>
        </Link>
      </div>

       {/* Center Portal Target for Search/Actions */}
       <div id="titlebar-center-portal" className="flex-1 flex justify-center px-4" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}></div>

      <div className="flex items-center gap-1" style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
        <button
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          onClick={() => appWindow.minimize()}
          aria-label="Minimize"
          tabIndex={-1}
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          onClick={handleMaximizeToggle}
          aria-label={isMaximized ? "Restore" : "Maximize"}
          tabIndex={-1}
        >
          {isMaximized ? (
            <Copy className="w-4 h-4 rotate-180" /> 
          ) : (
            <Square className="w-4 h-4" />
          )}
        </button>
        <button
          className="flex items-center justify-center w-8 h-8 rounded hover:bg-red-500 hover:text-white text-white/80 transition-colors"
          onClick={() => appWindow.close()}
          aria-label="Close"
          tabIndex={-1}
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
