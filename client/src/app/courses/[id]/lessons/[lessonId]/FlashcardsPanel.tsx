
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Flashcard = {
  id: string;
  front: string;
  back: string;
  difficulty: number;
  reviewCount: number;
  nextReviewAt?: string | null;
};

export default function FlashcardsPanel({
  lessonId,
}: {
  lessonId: string;
}) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [difficulty, setDifficulty] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadCards = useCallback(async () => {
    try {
      setError("");
      const response = await apiFetch(
        `/flashcards/lesson/${encodeURIComponent(lessonId)}`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load flashcards.");
      }

      setCards(result.data);
      setActiveIndex(0);
      setFlipped(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not load flashcards."
      );
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  async function createCard(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!front.trim() || !back.trim() || saving) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await apiFetch(
        `/flashcards/lesson/${encodeURIComponent(lessonId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ front, back, difficulty }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not create flashcard.");
      }

      setFront("");
      setBack("");
      setDifficulty(0);
      setMessage("Flashcard created successfully.");
      await loadCards();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not create flashcard."
      );
    } finally {
      setSaving(false);
    }
  }

  async function reviewCard(rating: number) {
    const card = cards[activeIndex];
    if (!card || saving) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await apiFetch(
        `/flashcards/${encodeURIComponent(card.id)}/review`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ difficulty: rating }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not save review.");
      }

      setCards((current) =>
        current.map((item) => item.id === card.id ? result.data : item)
      );
      setMessage("Review saved. Next review scheduled.");
      setFlipped(false);

      if (activeIndex < cards.length - 1) {
        setActiveIndex((index) => index + 1);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not save review."
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteCard() {
    const card = cards[activeIndex];
    if (!card || saving) return;

    try {
      setSaving(true);
      setError("");
      setMessage("");

      const response = await apiFetch(
        `/flashcards/${encodeURIComponent(card.id)}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not delete flashcard.");
      }

      setMessage("Flashcard deleted.");
      await loadCards();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Could not delete flashcard."
      );
    } finally {
      setSaving(false);
    }
  }

  const card = cards[activeIndex];

  return (
    <section className="space-y-6 rounded-3xl border border-white/[0.09] bg-[#120A18] p-5 sm:p-8">
      <div>
        <p className="text-xs font-semibold tracking-[0.15em] text-[#D934F7]">
          ACTIVE RECALL
        </p>
        <h2 className="mt-2 text-2xl font-semibold text-white">
          Lesson flashcards
        </h2>
        <p className="mt-2 text-sm text-[#A69BAC]">
          Create cards, test your memory, and schedule reviews.
        </p>
      </div>

      <form onSubmit={createCard} className="space-y-4 rounded-2xl border border-white/10 p-4">
        <h3 className="font-medium text-white">Create a flashcard</h3>

        <label className="block">
          <span className="mb-2 block text-sm text-[#C8BBD0]">Front — question or concept</span>
          <textarea
            value={front}
            onChange={(event) => setFront(event.target.value)}
            required
            maxLength={3000}
            rows={2}
            placeholder="What do you want to remember?"
            className="w-full rounded-xl border border-white/10 bg-[#09030E] p-3 text-sm text-white outline-none focus:border-[#D934F7]"
          />
        </label>

        <label className="block">
          <span className="mb-2 block text-sm text-[#C8BBD0]">Back — answer</span>
          <textarea
            value={back}
            onChange={(event) => setBack(event.target.value)}
            required
            maxLength={5000}
            rows={3}
            placeholder="Write the answer here..."
            className="w-full rounded-xl border border-white/10 bg-[#09030E] p-3 text-sm text-white outline-none focus:border-[#D934F7]"
          />
        </label>

        <button
          type="submit"
          disabled={saving || !front.trim() || !back.trim()}
          className="rounded-xl bg-[#D934F7] px-5 py-3 text-sm font-semibold text-black disabled:opacity-50"
        >
          {saving ? "Saving..." : "+ Create flashcard"}
        </button>
      </form>

      {loading ? (
        <p className="text-sm text-[#A69BAC]">Loading flashcards...</p>
      ) : cards.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center">
          <p className="font-medium text-white">No flashcards yet</p>
          <p className="mt-2 text-sm text-[#A69BAC]">
            Create your first card above to start practicing.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-[#A69BAC]">
              Card {activeIndex + 1} of {cards.length}
            </p>
            <p className="text-xs text-[#A69BAC]">
              Reviewed {card.reviewCount} times
            </p>
          </div>

          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            className="flex min-h-56 w-full flex-col items-center justify-center rounded-2xl border border-[#D934F7]/20 bg-gradient-to-br from-[#D934F7]/10 to-[#7E078E]/10 p-7 text-center transition hover:border-[#D934F7]/50"
          >
            <span className="text-xs font-semibold tracking-widest text-[#E66AFF]">
              {flipped ? "ANSWER" : "QUESTION"}
            </span>
            <span className="mt-5 whitespace-pre-wrap text-lg font-medium leading-8 text-white">
              {flipped ? card.back : card.front}
            </span>
            <span className="mt-6 text-xs text-[#A69BAC]">
              Click to {flipped ? "see question" : "reveal answer"}
            </span>
          </button>

          {flipped && (
            <div className="space-y-3">
              <p className="text-sm text-[#A69BAC]">
                How well did you remember it?
              </p>
              <div className="grid grid-cols-3 gap-2">
                {[0, 2, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    disabled={saving}
                    onClick={() => void reviewCard(rating)}
                    className="rounded-xl border border-white/10 px-3 py-3 text-sm text-[#D5C9DA] transition hover:border-[#D934F7]/50 hover:text-white disabled:opacity-50"
                  >
                    {rating === 0 ? "Again" : rating === 2 ? "Hard" : "Easy"}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              disabled={activeIndex === 0}
              onClick={() => {
                setActiveIndex((index) => index - 1);
                setFlipped(false);
              }}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-[#D5C9DA] disabled:opacity-30"
            >
              ← Previous
            </button>

            <button
              type="button"
              onClick={() => void deleteCard()}
              disabled={saving}
              className="rounded-xl border border-red-400/20 px-4 py-2.5 text-sm text-red-300 disabled:opacity-50"
            >
              Delete card
            </button>

            <button
              type="button"
              disabled={activeIndex >= cards.length - 1}
              onClick={() => {
                setActiveIndex((index) => index + 1);
                setFlipped(false);
              }}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-[#D5C9DA] disabled:opacity-30"
            >
              Next →
            </button>
          </div>

          {card.nextReviewAt && (
            <p className="text-xs text-[#A69BAC]">
              Next scheduled review:{" "}
              {new Date(card.nextReviewAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {error && <p role="alert" className="text-sm text-red-300">{error}</p>}
      {message && <p role="status" className="text-sm text-[#BCF429]">{message}</p>}
    </section>
  );
}
