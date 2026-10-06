"use client";

import { Trash2 } from "lucide-react";

export default function DeleteProductButton({ action }: { action: () => Promise<void> }) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm("Delete this product? This cannot be undone.")) e.preventDefault();
      }}
    >
      <button
        type="submit"
        className="inline-flex items-center gap-2 h-10 px-4 rounded-md text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors"
      >
        <Trash2 className="h-4 w-4" /> Delete
      </button>
    </form>
  );
}
