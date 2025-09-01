import React from "react";

export default function Brand() {
  const brand = typeof window !== "undefined"
    ? (localStorage.getItem("novaapp_brand") || "novaapp")
    : "novaapp";

  return (
    <div className="flex items-center gap-2 font-semibold text-lg">
      <span className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-indigo-600 text-white">N</span>
      <span className="truncate">{brand}</span>
    </div>
  );
}
