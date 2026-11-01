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
    <section className="rounded-2xl border border-white/[0.14] bg-white/[0.045] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.16)] backdrop-blur-2xl backdrop-saturate-150 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#61C5FA]/20 bg-[#61C5FA]/10 text-[#8EDBFF] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
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
          <h2 className="text-lg font-semibold tracking-tight text-white">
            Lesson notes
          </h2>
          <p className="mt-1 text-sm text-slate-300/80">
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
          className="mb-2 block text-sm font-medium text-slate-100"
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
          className="w-full resize-y rounded-xl border border-white/[0.14] bg-slate-950/35 p-4 text-sm leading-6 text-white outline-none transition placeholder:text-slate-400/75 hover:border-white/20 focus:border-[#61C5FA]/60 focus:ring-2 focus:ring-[#61C5FA]/15"
        />

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button
            type="submit"
            disabled={!content.trim() || saving}
            className="rounded-xl border border-[#8EDBFF]/30 bg-[#61C5FA] px-5 py-2.5 text-sm font-semibold text-[#071521] shadow-[0_4px_18px_rgba(97,197,250,0.16)] transition hover:bg-[#8EDBFF] hover:shadow-[0_6px_22px_rgba(97,197,250,0.22)] disabled:cursor-not-allowed disabled:opacity-50"
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
              className="rounded-xl border border-white/[0.14] bg-white/[0.035] px-4 py-2.5 text-sm text-slate-200 transition hover:border-white/25 hover:bg-white/[0.07] hover:text-white"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-red-400/20 bg-red-400/[0.07] px-3 py-2 text-sm text-red-300"
        >
          {error}
        </p>
      )}

      {message && (
        <p
          role="status"
          className="mt-4 rounded-lg border border-[#61C5FA]/20 bg-[#61C5FA]/[0.07] px-3 py-2 text-sm text-[#BDEAFF]"
        >
          {message}
        </p>
      )}

      <div className="mt-7 border-t border-white/[0.10] pt-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">Saved notes</h3>
          <span className="rounded-full border border-white/[0.10] bg-white/[0.04] px-2.5 py-1 text-xs tabular-nums text-slate-300">
            {notes.length} {notes.length === 1 ? "note" : "notes"}
          </span>
        </div>

        {loading ? (
          <p className="text-sm text-slate-300/80">Loading notes...</p>
        ) : notes.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/[0.16] bg-white/[0.025] px-4 py-8 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#61C5FA]/20 bg-[#61C5FA]/[0.08] text-[#8EDBFF]">
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
            <p className="text-sm font-medium text-slate-200">No notes yet.</p>
            <p className="mt-1 text-xs text-slate-400">
              Your saved notes will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-xl border border-white/[0.11] bg-white/[0.035] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] backdrop-blur-xl transition hover:border-white/[0.17] hover:bg-white/[0.05]"
              >
                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-slate-100">
                  {note.content}
                </p>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <time
                    dateTime={note.updatedAt || note.createdAt}
                    className="text-xs text-slate-400"
                  >
                    {new Date(note.updatedAt || note.createdAt).toLocaleString()}
                  </time>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleEdit(note)}
                      className="rounded-lg border border-white/[0.13] bg-white/[0.025] px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-[#61C5FA]/35 hover:bg-[#61C5FA]/[0.08] hover:text-[#BDEAFF]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => void handleDelete(note.id)}
                      className="rounded-lg border border-red-400/20 bg-red-400/[0.035] px-3 py-1.5 text-xs font-medium text-red-300 transition hover:border-red-400/35 hover:bg-red-400/[0.10]"
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
