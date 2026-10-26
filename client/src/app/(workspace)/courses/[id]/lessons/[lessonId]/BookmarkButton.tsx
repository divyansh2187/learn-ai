
"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function BookmarkButton({
  lessonId,
}: {
  lessonId: string;
}) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadBookmark() {
      try {
        const response = await apiFetch(
          `/bookmarks/lesson/${encodeURIComponent(lessonId)}`
        );
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load bookmark.");
        }

        if (!cancelled) {
          setBookmarked(result.data.bookmarked === true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Could not load bookmark."
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadBookmark();

    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  async function toggleBookmark() {
    if (saving || loading) return;

    setSaving(true);
    setError("");

    try {
      const response = await apiFetch(
        `/bookmarks/lesson/${encodeURIComponent(lessonId)}`,
        {
          method: bookmarked ? "DELETE" : "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not update bookmark.");
      }

      setBookmarked(!bookmarked);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not update bookmark."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={toggleBookmark}
        disabled={loading || saving}
        aria-pressed={bookmarked}
        className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:opacity-50 ${
          bookmarked
            ? "border-[#BCF429]/30 bg-[#BCF429]/10 text-[#BCF429]"
            : "border-white/10 bg-white/[0.03] text-[#D5C9DA] hover:border-[#D934F7]/40 hover:text-white"
        }`}
      >
        {loading
          ? "Loading..."
          : saving
            ? "Saving..."
            : bookmarked
              ? "★ Bookmarked"
              : "☆ Bookmark lesson"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-300">
          {error}
        </p>
      )}
    </div>
  );
}
