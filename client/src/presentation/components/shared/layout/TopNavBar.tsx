import React, { useState, useRef } from "react";
import { cn } from "@/core/utils/utils";
import { ChevronDown } from "lucide-react";

export interface NavItem {
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
}

interface TopNavBarProps {
  items: NavItem[];
  className?: string;
}

export default function TopNavBar({ items, className }: TopNavBarProps) {
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);

  const handleDropdownEnter = (idx: number) => {
    if (closeTimeout.current) {
      clearTimeout(closeTimeout.current);
      closeTimeout.current = null;
    }
    setOpenDropdownIdx(idx);
  };

  const handleDropdownLeave = () => {
    if (closeTimeout.current) clearTimeout(closeTimeout.current);
    closeTimeout.current = setTimeout(() => {
      setOpenDropdownIdx(null);
    }, 150);
  };

  return (
    <nav
      className={cn(
        "flex items-center gap-0.5 sm:gap-1 px-1 sm:px-2 lg:px-4 w-full justify-center sm:justify-start flex-wrap",
        className
      )}
    >
      {items.map((item, idx) => (
        <div
          key={idx}
          className="relative"
          onMouseEnter={() => handleDropdownEnter(idx)}
          onMouseLeave={handleDropdownLeave}
        >
          <button
            className={cn(
              "relative flex items-center gap-1 sm:gap-1.5 px-2 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold transition-all duration-200 focus:outline-none uppercase tracking-wide sm:tracking-wider min-h-[40px] sm:min-h-[44px] lg:min-h-[48px] whitespace-nowrap",
              item.active
                ? "text-white bg-white/20"
                : "text-white hover:text-white hover:bg-white/10"
            )}
            onClick={item.onClick}
            type="button"
          >
            {item.label}
            {item.children && (
              <ChevronDown 
                className={cn(
                  "w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-200",
                  openDropdownIdx === idx ? "rotate-180 text-white" : "opacity-70"
                )} 
              />
            )}
            {item.active && (
              <div
                className="absolute bottom-1 sm:bottom-1.5 left-2 right-2 sm:left-4 sm:right-4 lg:left-6 lg:right-6 h-0.5 sm:h-1 bg-secondary rounded-full"
              />
            )}
          </button>

          {item.children && openDropdownIdx === idx && (
            <div
              className="absolute left-0 sm:left-auto sm:right-0 top-full pt-1 sm:pt-2 z-20 min-w-[180px] sm:min-w-[220px]"
            >
              <div className="bg-white border border-slate-200 rounded-lg sm:rounded-xl overflow-hidden py-1 sm:py-1.5 shadow-lg">
                {React.Children.map(item.children, (child, childIdx) =>
                  React.isValidElement(child)
                    ? React.cloneElement(
                      child as React.ReactElement<any, any>,
                      {
                        onClick: (e: any) => {
                          setOpenDropdownIdx(null);
                          if ((child as React.ReactElement<any, any>).props.onClick) {
                            (child as React.ReactElement<any, any>).props.onClick(e);
                          }
                        },
                        className: cn(
                          (child as React.ReactElement<any, any>).props.className,
                          "flex items-center w-full text-left px-3 sm:px-5 py-2.5 sm:py-3.5 text-[11px] sm:text-[13px] font-black uppercase tracking-wide sm:tracking-widest text-slate-800 hover:text-main hover:bg-slate-50 transition-all border-0"
                        ),
                      }
                    )
                    : child
                )}
              </div>
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}

