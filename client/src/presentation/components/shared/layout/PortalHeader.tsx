// src/presentation/components/shared/layout/PortalHeader.tsx
import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface PortalHeaderProps {
  children: React.ReactNode;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({ children }) => {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const target = document.getElementById("titlebar-center-portal");
  if (!target) return null;

  return createPortal(children, target);
};
