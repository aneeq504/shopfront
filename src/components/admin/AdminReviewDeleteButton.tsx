"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function AdminReviewDeleteButton({ reviewId }: { reviewId: string }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  async function removeReview() {
    if (!window.confirm("Delete this review?")) return;
    setError("");
    setDeleting(true);

    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not delete review");
      router.refresh();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Could not delete review");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" disabled={deleting} onClick={removeReview} className="btn-ghost text-sm">
        Delete
      </button>
      {error && <span role="alert" className="text-xs font-semibold text-berry">{error}</span>}
    </div>
  );
}
