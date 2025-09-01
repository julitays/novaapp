import React from "react";

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "px-4 py-2 rounded-xl text-sm font-medium transition";
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700",
    ghost:
      "bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700",
  };
  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
