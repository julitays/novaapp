import React from "react";

export default function Button({ children, variant = "primary", className = "", ...props }) {
  const base = "px-4 py-2 rounded-xl text-sm font-medium transition";
  const styles = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-soft",
  ghost: "bg-white border border-slate-100 hover:bg-slate-50",
  outline: "bg-white border border-slate-200 hover:border-brand-200 hover:bg-brand-50",
  gradient: "text-white shadow-card bg-gradient-to-r from-brand-500 via-indigo-500 to-fuchsia-500 hover:opacity-95",
};
  return (
    <button className={`${base} ${styles[variant] || styles.primary} ${className}`} {...props}>
      {children}
    </button>
  );
}
