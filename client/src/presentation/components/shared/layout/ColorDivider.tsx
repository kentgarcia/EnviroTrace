import React from "react";
import { motion } from "framer-motion";

interface ColorDividerProps {
  variant?: "default" | "secondary";
}

export default function ColorDivider({ variant = "default" }: ColorDividerProps) {
  if (variant === "secondary") {
    return (
      <div className="flex w-full h-4">
        <motion.div
          className="bg-[#ffd700]"
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 0.8, delay: 0 }}
        />
        <motion.div
          className="bg-[#ee1c25]"
          initial={{ width: 0 }}
          animate={{ width: "50%" }}
          transition={{ duration: 0.8, delay: 0.2 }}
        />
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex w-full h-4">
      <motion.div
        className="bg-[#0033a0]"
        initial={{ width: 0 }}
        animate={{ width: "60%" }}
        transition={{ duration: 0.8, delay: 0 }}
      />
      <motion.div
        className="bg-[#ffd700]"
        initial={{ width: 0 }}
        animate={{ width: "15%" }}
        transition={{ duration: 0.8, delay: 0.2 }}
      />
      <motion.div
        className="bg-[#ee1c25]"
        initial={{ width: 0 }}
        animate={{ width: "25%" }}
        transition={{ duration: 0.8, delay: 0.4 }}
      />
    </div>
  );
}
