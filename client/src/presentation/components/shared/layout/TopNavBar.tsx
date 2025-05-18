import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils/utils";
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
  // Dropdown state for only one open at a time
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
    }, 100);
  };

  return (
    <nav
      className={cn(
        "w-full bg-main px-8 py-5 flex items-center gap-2 shadow text-white min-h-[64px]",
        className
      )}
    >
      {items.map((item, idx) => (
        <React.Fragment key={idx}>
          {idx !== 0 && (
            <span className="mx-2 h-5 w-px bg-white/30 inline-block align-middle" />
          )}
          <div
            className="relative group"
            onMouseEnter={() => handleDropdownEnter(idx)}
            onMouseLeave={handleDropdownLeave}
            onFocus={() => handleDropdownEnter(idx)}
            onBlur={handleDropdownLeave}
          >
            <button
              className={cn(
                "font-bold text-sm px-2 transition-colors focus:outline-none uppercase",
                item.active
                  ? "text-yellow-400"
                  : "text-white hover:text-yellow-300"
              )}
              onClick={item.onClick}
              type="button"
            >
              <div className="flex items-center">
                {item.label}
                {item.children && <ChevronDown className="w-4 h-4 ml-1" />}
              </div>
            </button>
            {item.children && (
              <div
                className={cn(
                  "absolute left-0 top-full z-[9999] bg-main text-white border-none min-w-[180px] shadow-none transition-all duration-200 opacity-0 scale-y-95 pointer-events-none",
                  openDropdownIdx === idx &&
                    "opacity-100 scale-y-100 pointer-events-auto"
                )}
                style={{ transformOrigin: "top" }}
                onMouseEnter={() => handleDropdownEnter(idx)}
                onMouseLeave={handleDropdownLeave}
              >
                {React.Children.map(item.children, (child, childIdx) =>
                  React.isValidElement(child)
                    ? React.cloneElement(
                        child as React.ReactElement<any, any>,
                        {
                          onClick: (...args: any[]) => {
                            setOpenDropdownIdx(null);
                            if (
                              (child as React.ReactElement<any, any>).props
                                .onClick
                            )
                              (
                                child as React.ReactElement<any, any>
                              ).props.onClick(...args);
                          },
                          className: cn(
                            (child as React.ReactElement<any, any>).props
                              .className,
                            "block w-full text-left px-4 py-2 uppercase bg-main text-white border-0",
                            childIdx !== 0 ? "border-t border-white/30" : ""
                          ),
                        }
                      )
                    : child
                )}
              </div>
            )}
          </div>
        </React.Fragment>
      ))}
    </nav>
  );
}
