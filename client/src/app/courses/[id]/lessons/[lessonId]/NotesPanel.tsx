
"use client";

import { useCallback, useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

type Note = {
  id: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
};

type NotesPanelProps = {
  lessonId: string;
};

export default function NotesPanel({ lessonId }: NotesPanelProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await apiFetch(
        `/notes/lesson/${encodeURIComponent(lessonId)}`
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load notes.");
      }

      setNotes(Array.isArray(result.data) ? result.data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load notes."
      );
    } finally {
      setLoading(false);
    }
  }, [lessonId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  async function handleSave() {
    const trimmed = content.trim();

    if (!trimmed || saving) return;

    setSaving(true);
    setError("");
    setMessage("");

    try {
      const isEditing = Boolean(editingId);
      const endpoint = isEditing
        ? `/notes/${encodeURIComponent(editingId!)}`
        : `/notes/lesson/${encodeURIComponent(lessonId)}`;

      const response = await apiFetch(endpoint, {
        method: isEditing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to save note.");
      }

      setContent("");
      setEditingId(null);
      setMessage(isEditing ? "Note updated." : "Note saved.");
      await loadNotes();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save note."
      );
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(note: Note) {
    setEditingId(note.id);
    setContent(note.content);
    setMessage("");
    setError("");
  }

  async function handleDelete(noteId: string) {
    if (!window.confirm("Delete this note?")) return;

    setError("");
    setMessage("");

    try {
      const response = await apiFetch(
        `/notes/${encodeURIComponent(noteId)}`,
        { method: "DELETE" }
      );
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to delete note.");
      }

      setNotes((current) => current.filter((note) => note.id !== noteId));

      if (editingId === noteId) {
        setEditingId(null);
        setContent("");
      }

      setMessage("Note deleted.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete note."
      );
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setContent("");
    setError("");
    setMessage("");
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-[#140B1B] p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#D934F7]/10 text-[#D934F7]">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            className="h-5 w-5"
            aria-hidden="true"
          >
            <path
              d="M8 4h8l4 4v12H4V4h4Z"
              strokeLinejoin="round"
            />
            <path d="M8 12h8M8 16h6M15 4v5h5" strokeLinecap="round" />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">Lesson notes</h2>
          <p className="mt-1 text-sm text-[#A69BAC]">
            Save the important things you learn.
          </p>
        </div>
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void handleSave();
        }}
      >
        <label
          htmlFor="lesson-note"
          className="mb-2 block text-sm font-medium text-[#E7DDEA]"
        >
          {editingId ? "Edit your note" : "Write a note"}
        </label>

        <textarea
          id="lesson-note"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Capture a key idea, example, or question..."
          rows={4}
          maxLength={10000}
          className="w-full resize-y rounded-xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-[#817487] focus:border-[#D934F7]/60 focus:ring-2 focus:ring-[#D934F7]/10"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!content.trim() || saving}
            className="rounded-xl bg-[#D934F7] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#E66AFF] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : editingId
                ? "Update note"
                : "Save note"}
          </button>

          {editingId && (
            <button
              type="button"
              onClick={cancelEdit}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-[#E7DDEA] transition hover:bg-white/5"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      {message && (
        <p role="status" className="mt-4 text-sm text-[#BCF429]">
          {message}
        </p>
      )}

      <div className="mt-7 border-t border-white/[0.08] pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Saved notes</h3>
          <span className="text-xs text-[#897A91]">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-[#A69BAC]">Loading notes...</p>
        ) : notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/10 px-4 py-7 text-center">
            <p className="text-sm text-[#A69BAC]">No notes yet.</p>
            <p className="mt-1 text-xs text-[#817487]">
              Your saved notes will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4"
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-[#E7DDEA]">
                  {note.content}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <time
                    dateTime={note.updatedAt || note.createdAt}
                    className="text-xs text-[#897A91]"
                  >
                    {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                  </time>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(note)}
                      className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#E7DDEA] transition hover:border-[#D934F7]/40 hover:text-white"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(note.id)}
                      className="rounded-lg border border-red-400/20 px-3 py-1.5 text-xs text-red-300 transition hover:bg-red-400/10"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}