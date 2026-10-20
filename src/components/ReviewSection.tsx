"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Stars } from "./Stars";

type Review = {
  id: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
};

type Viewer = "signedOut" | "ineligible" | "eligible";

export function ReviewSection({
  productId,
  average,
  count,
  reviews,
  viewer,
  ownReview,
}: {
  productId: string;
  average: number;
  count: number;
  reviews: Review[];
  viewer: Viewer;
  ownReview: { id: string; rating: number; comment: string } | null;
}) {
  const router = useRouter();
  const [rating, setRating] = useState(ownReview?.rating ?? 0);
  const [comment, setComment] = useState(ownReview?.comment ?? "");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  async function submitReview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not save your review");
      setMessage("Your review has been saved.");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Could not save your review");
    } finally {
      setSaving(false);
    }
  }

  async function deleteReview() {
    if (!window.confirm("Delete your review?")) return;
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "DELETE",
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Could not delete your review");
      setRating(0);
      setComment("");
      setMessage("Your review has been deleted.");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Could not delete your review");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="reviews" className="card flex flex-col gap-5 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-2xl font-bold text-ink">Reviews</h2>
        {count > 0 ? (
          <div className="flex items-center gap-2">
            <Stars rating={average} />
            <span className="text-sm font-semibold text-ink">
              {average.toFixed(1)} · {count} {count === 1 ? "review" : "reviews"}
            </span>
          </div>
        ) : (
          <p className="text-sm font-semibold text-muted">No reviews yet.</p>
        )}
      </div>

      {reviews.length > 0 && (
        <ul className="divide-y divide-ink/10">
          {reviews.map((review) => (
            <li key={review.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-display font-bold text-ink">{review.name}</span>
                <time className="text-xs text-muted">{review.date}</time>
              </div>
              <Stars rating={review.rating} size="sm" />
              {review.comment && (
                <p className="whitespace-pre-line text-sm text-ink/80">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <div className="border-t border-ink/10 pt-5">
        {viewer === "signedOut" ? (
          <p className="text-sm text-ink">
            <Link href="/account/login" className="font-semibold text-coralDark hover:underline">
              Sign in to write a review
            </Link>
          </p>
        ) : viewer === "ineligible" ? (
          <p className="text-sm font-semibold text-muted">
            You can review this product after it&apos;s delivered to you.
          </p>
        ) : (
          <form onSubmit={submitReview} className="flex flex-col gap-4">
            <h3 className="font-display text-xl font-bold text-ink">
              {ownReview ? "Update your review" : "Write a review"}
            </h3>
            <div>
              <span className="sr-only">Rating</span>
              <Stars rating={rating} size="lg" onChange={setRating} />
            </div>
            <label htmlFor="review-comment" className="flex flex-col gap-2 text-sm font-semibold">
              Comment
              <textarea
                id="review-comment"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                maxLength={1000}
                rows={4}
                className="input resize-y"
                placeholder="Share what you think..."
              />
              <span className="self-end text-xs font-normal text-muted">
                {comment.length}/1000
              </span>
            </label>
            {error && <p role="alert" className="text-sm font-semibold text-berry">{error}</p>}
            {message && <p role="status" className="text-sm font-semibold text-leaf">{message}</p>}
            <div className="flex flex-wrap gap-3">
              <button type="submit" disabled={saving || rating < 1} className="btn-primary">
                {ownReview ? "Update review" : "Submit review"}
              </button>
              {ownReview && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={deleteReview}
                  className="btn-ghost"
                >
                  Delete review
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
