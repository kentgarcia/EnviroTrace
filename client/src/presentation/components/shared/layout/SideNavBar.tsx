import React, { useState } from "react";
import { cn } from "@/core/utils/utils";
import { ChevronDown, ChevronRight } from "lucide-react";

export interface NavItem {
  label: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  children?: React.ReactNode;
  icon?: React.ReactNode;
}

interface SideNavBarProps {
  items: NavItem[];
  className?: string;
  isCollapsed?: boolean;
  variant?: "light" | "dark";
  onExpand?: () => void;
}

export default function SideNavBar({ items, className, isCollapsed, variant = "light", onExpand }: SideNavBarProps) {
  const [openDropdownIdx, setOpenDropdownIdx] = useState<number | null>(null);

  const toggleDropdown = (idx: number) => {
    setOpenDropdownIdx(openDropdownIdx === idx ? null : idx);
  };

  const isDark = variant === "dark";

  return (
    <nav className={cn("flex flex-col gap-1 w-full relative", className)}>
      {items.map((item, idx) => (
        <div key={idx} className={cn("w-full relative")}>
          <button
            className={cn(
              "flex items-center w-full px-3 py-2.5 rounded-lg transition-all duration-200 group text-left outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
              // Active state
              item.active
                ? (isDark 
                    ? "bg-main text-white shadow-md font-medium" 
                    : "bg-main text-white shadow-sm")
                : (isDark
                    ? "text-slate-400 hover:bg-white/5 hover:text-slate-100"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900")
            )}
            onClick={(e) => {
              // Toggle dropdown if it has children, regardless of collapsed state.
              if (item.children) {
                if (isCollapsed && onExpand) {
                  onExpand();
                }
                toggleDropdown(idx);
              } else if (item.onClick) {
                item.onClick();
              }
            }}
            title={typeof item.label === 'string' ? item.label : undefined}
          >
            {item.icon && (
              <span className={cn(
                "mr-3", 
                item.active 
                  ? "text-current" 
                  : (isDark ? "text-slate-500 group-hover:text-slate-300" : "text-slate-400 group-hover:text-slate-600")
              )}>
                {item.icon}
              </span>
            )}
            
            {!isCollapsed && (
              <>
                <span className="flex-1 font-medium text-sm truncate">
                  {item.label}
                </span>
                
                {item.children && (
                  <ChevronRight
                    className={cn(
                      "w-4 h-4 transition-transform duration-200",
                      openDropdownIdx === idx ? "rotate-90" : ""
                    )}
                  />
                )}
              </>
            )}
          </button>
          
          {/* Children Dropdown */}
          {!isCollapsed && item.children && openDropdownIdx === idx && (
            <div className={cn(
              "mt-1 ml-4 pl-2 border-l-2 space-y-1",
              isDark ? "border-slate-800" : "border-slate-100"
            )}>
              {React.Children.map(item.children, (child) =>
                React.isValidElement(child)
                  ? React.cloneElement(child as React.ReactElement<any, any>, {
                      className: cn(
                        (child as React.ReactElement<any, any>).props.className,
                        "flex items-center w-full text-left px-3 py-2 text-sm font-medium rounded-md transition-colors",
                        isDark 
                          ? "text-slate-400 hover:text-white hover:bg-white/5" 
                          : "text-slate-600 hover:text-main hover:bg-slate-50"
                      ),
                    })
                  : child
              )}
            </div>
          )}
        </div>
      ))}
    </nav>
  );
}
