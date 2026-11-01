"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import NotesPanel from "./NotesPanel";
import FlashcardsPanel from "./FlashcardsPanel";

type DataRecord = Record<string, unknown>;

type LessonData = {
  id: string;
  title: string;
  explanation?: unknown;
  keyConcepts?: unknown;
  examples?: unknown;
  codeExamples?: unknown;
  commonMistakes?: unknown;
  exercises?: DataRecord[];
  quiz?: {
    questions?: DataRecord[];
  } | null;
  resources?: DataRecord[];
};

type LessonProgressData = {
  progress: number;
  completed: boolean;
  timeSpent: number;
};

const glassSurface =
  "border border-white/[0.16] bg-white/[0.07] " +
  "backdrop-blur-2xl backdrop-saturate-150 " +
  "shadow-[0_8px_32px_rgba(0,0,0,0.18)] " +
  "ring-1 ring-inset ring-white/[0.04]";

const colors = {
  primary: "#61C5FA",
  highlight: "#BDEAFF",
  text: "#FFFFFF",
  description: "#E2E8F0",
  muted: "#CBD5E1",
};

function asRecord(value: unknown): DataRecord | null {
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return value as DataRecord;
  }

  return null;
}

function getText(value: unknown, fallback = ""): string {
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return fallback;
}

function getList(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  if (value == null || value === "") return [];
  return [value];
}

function getOptions(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => getText(item));
  }

  const record = asRecord(value);

  if (record) {
    return Object.entries(record).map(([key, item]) => {
      const text = getText(item);
      return /^[A-Z]$/i.test(key) ? `${key}. ${text}` : text;
    });
  }

  if (typeof value === "string") {
    return value
      .split(/\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  }

  return [];
}

function normalizeAnswer(value: unknown): string {
  const answer = getText(value).trim();
  const letter = answer.match(/^([A-Z])(?:[.)\s:]|$)/i);

  return letter ? letter[1].toUpperCase() : answer.toLowerCase();
}

function optionLetter(option: string, index: number): string {
  const match = option.match(/^\s*([A-Z])(?:[.)\s:]|$)/i);
  return match ? match[1].toUpperCase() : String(index + 1);
}

function optionText(option: string): string {
  return option.replace(/^\s*[A-Z](?:[.)]\s*|\s+)/i, "").trim();
}

function isCorrectOption(
  selected: string,
  answer: unknown,
  options: string[],
): boolean {
  const expected = normalizeAnswer(answer);

  if (!expected) return false;

  const selectedIndex = options.findIndex(
    (option, index) => optionLetter(option, index) === selected,
  );

  if (selectedIndex < 0) return false;

  const selectedOption = options[selectedIndex];
  const selectedText = optionText(selectedOption);

  return (
    expected === selected ||
    expected === selectedText.toLowerCase() ||
    expected === selectedOption.trim().toLowerCase()
  );
}

function formatLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

/* -------------------------------------------------------
   LESSON CONTENT
------------------------------------------------------- */

function RenderContent({ value }: { value: unknown }) {
  if (value == null || value === "") return null;

  if (typeof value === "string" || typeof value === "number") {
    return (
      <p className="whitespace-pre-wrap text-sm font-medium leading-7 text-[#E2E8F0]">
        {String(value)}
      </p>
    );
  }

  if (Array.isArray(value)) {
    return (
      <ul className="space-y-3">
        {value.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#61C5FA]" />

            <div className="min-w-0 flex-1">
              <RenderContent value={item} />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  const record = asRecord(value);

  if (!record) return null;

  const entries = Object.entries(record).filter(
    ([, item]) => item != null && item !== "",
  );

  const primaryKey = ["title", "name", "heading"].find(
    (key) => typeof record[key] === "string",
  );

  const descriptionKey = ["description", "content", "text", "explanation"].find(
    (key) => typeof record[key] === "string",
  );

  const primaryValue = primaryKey ? record[primaryKey] : null;
  const descriptionValue = descriptionKey ? record[descriptionKey] : null;

  const remaining = entries.filter(
    ([key]) => key !== primaryKey && key !== descriptionKey,
  );

  return (
    <div className="space-y-4">
      {primaryValue != null && (
        <h3 className="text-base font-semibold text-white">
          {getText(primaryValue)}
        </h3>
      )}

      {descriptionValue != null && <RenderContent value={descriptionValue} />}

      {remaining.map(([key, item]) => {
        const label = formatLabel(key);

        if (
          [
            "id",
            "lesson id",
            "quiz id",
            "created at",
            "updated at",
            "order",
          ].includes(label.toLowerCase())
        ) {
          return null;
        }

        return (
          <div key={key} className="space-y-2">
            <p className="text-sm font-semibold text-[#F1F5F9]">{label}</p>
            <RenderContent value={item} />
          </div>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------
   REUSABLE GLASS SECTION
------------------------------------------------------- */

function Section({
  number,
  title,
  description,
  children,
}: {
  number: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={`${glassSurface} rounded-3xl p-5 sm:p-8`}>
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#61C5FA]/20 bg-[#61C5FA]/[0.09] text-sm font-semibold text-[#BDEAFF]">
          {number}
        </span>

        <div className="min-w-0 pt-1">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-sm font-medium leading-6 text-[#CBD5E1]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

/* -------------------------------------------------------
   CODE EXAMPLE
------------------------------------------------------- */

function CodeExample({ value }: { value: unknown }) {
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const record = asRecord(value);

  const code =
    typeof value === "string"
      ? value
      : getText(
          record?.code ??
            record?.content ??
            record?.sourceCode ??
            record?.example,
        );

  const title = getText(record?.title ?? record?.name, "Code example");

  const language = getText(
    record?.language ?? record?.lang,
    "html",
  ).toLowerCase();

  const explanation = getText(record?.explanation ?? record?.description);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  const canPreview = ["html", "htm"].includes(language);

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.12] bg-[#091321] shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-white/[0.025] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#61C5FA]" />
          </span>

          <span className="text-sm font-medium text-[#F1F5F9]">
            {title}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs uppercase tracking-wide text-[#CBD5E1]">
            {language}
          </span>

          <button
            type="button"
            onClick={copyCode}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#F1F5F9] transition hover:border-[#61C5FA]/40 hover:bg-white/[0.06] hover:text-white"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      <pre className="overflow-x-auto p-5 text-sm leading-7 text-[#E2E8F0]">
        <code>{code || "No code was provided for this example."}</code>
      </pre>

      {explanation && (
        <div className="border-t border-white/[0.07] px-5 py-4">
          <p className="text-sm font-medium leading-7 text-[#CBD5E1]">
            {explanation}
          </p>
        </div>
      )}

      {canPreview && code && (
        <div className="border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setShowPreview((current) => !current)}
            className="px-5 py-3 text-sm font-medium text-[#61C5FA] transition hover:text-[#BDEAFF]"
          >
            {showPreview ? "Hide preview ↑" : "▶ Run HTML preview"}
          </button>

          {showPreview && (
            <div className="border-t border-white/10 bg-white p-2">
              <iframe
                title={`${title} preview`}
                srcDoc={code}
                sandbox=""
                referrerPolicy="no-referrer"
                className="h-64 w-full rounded-lg border border-gray-200 bg-white"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------
   QUIZ CARD
------------------------------------------------------- */

function QuizCard({
  question,
  index,
  selected,
  onSelect,
  disabled,
}: {
  question: DataRecord;
  index: number;
  selected: string;
  onSelect: (questionId: string, answer: string) => void;
  disabled: boolean;
}) {
  const questionId = getText(question.id);

  const prompt = getText(
    question.question ?? question.title ?? question.text,
    `Question ${index + 1}`,
  );

  const options = getOptions(question.options ?? question.choices);

  return (
    <article className="rounded-2xl border border-white/[0.18] bg-slate-950/50 p-5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.25)] backdrop-blur-2xl backdrop-saturate-150 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-lg border border-[#61C5FA]/15 bg-[#61C5FA]/[0.09] px-3 py-1.5 text-xs font-semibold text-[#BDEAFF]">
          QUESTION {index + 1}
        </span>

        <span className="text-xs font-medium text-[#CBD5E1]">
          {getText(question.points, "1")} point(s)
        </span>
      </div>

      <h3 className="text-base font-semibold leading-7 text-white">
        {prompt}
      </h3>

      {options.length > 0 ? (
        <div className="mt-5 space-y-3">
          {options.map((option, optionIndex) => {
            const letter = optionLetter(option, optionIndex);
            const active = selected === letter;

            return (
              <button
                key={`${letter}-${optionIndex}`}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(questionId, letter)}
                className={`group flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-colors duration-200 disabled:cursor-default ${
                  active
                    ? "border-[#61C5FA]/50 bg-[#61C5FA]/[0.10]"
                    : "border-white/[0.16] bg-slate-950/45 backdrop-blur-xl hover:!border-[#E2EEFB] hover:!bg-[#E2EEFB] hover:!text-black"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border text-xs font-semibold ${
                    active
                      ? "border-[#61C5FA]/40 bg-[#61C5FA]/10 text-[#BDEAFF]"
                      : "border-white/10 text-[#E2E8F0] group-hover:!border-black/20 group-hover:!text-black"
                  }`}
                >
                  {letter}
                </span>

                <span className="flex-1 text-sm font-medium leading-6 text-[#F1F5F9] group-hover:!text-black">
                  {optionText(option)}
                </span>

                {active && <span className="text-[#BDEAFF] group-hover:!text-black">✓</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#CBD5E1]">
          This question has no selectable options yet.
        </p>
      )}
    </article>
  );
}

/* -------------------------------------------------------
   EXERCISE CARD
------------------------------------------------------- */

function ExerciseCard({
  exercise,
  index,
}: {
  exercise: DataRecord;
  index: number;
}) {
  const [showHint, setShowHint] = useState(false);
  const [showSolution, setShowSolution] = useState(false);
  const [done, setDone] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const exerciseId = getText(exercise.id);

  const title = getText(
    exercise.title ?? exercise.name,
    `Exercise ${index + 1}`,
  );

  const description = exercise.description ?? exercise.instructions;
  const hints = getList(exercise.hints ?? exercise.hint);
  const solution = exercise.solution ?? exercise.answer;

  useEffect(() => {
    if (!exerciseId) return;

    let cancelled = false;

    async function loadProgress() {
      try {
        const response = await apiFetch(
          `/exercises/progress/${encodeURIComponent(exerciseId)}`,
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load progress");
        }

        if (!cancelled) {
          setDone(result.data.completed === true);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not load exercise progress.",
          );
        }
      }
    }

    void loadProgress();

    return () => {
      cancelled = true;
    };
  }, [exerciseId]);

  async function toggleCompletion() {
    if (!exerciseId || saving) return;

    const nextDone = !done;

    try {
      setSaving(true);
      setError("");

      const response = await apiFetch(
        `/exercises/progress/${encodeURIComponent(exerciseId)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ completed: nextDone }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not save progress");
      }

      setDone(result.data.completed === true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not save exercise progress.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded-2xl border border-white/[0.18] bg-slate-950/50 p-5 text-white shadow-[0_12px_36px_rgba(0,0,0,0.25)] backdrop-blur-2xl backdrop-saturate-150 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#61C5FA]/15 bg-[#61C5FA]/[0.09] text-lg text-[#BDEAFF]">
          ✦
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">{title}</h3>

          <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-[#CBD5E1]">
            {getText(exercise.difficulty, "PRACTICE")}
          </p>
        </div>

        {done && (
          <span className="text-xs font-semibold text-[#61C5FA]">
            ✓ Done
          </span>
        )}
      </div>

      <div className="mt-5">
        <RenderContent value={description} />
      </div>

      {hints.length > 0 && (
        <div className="mt-5">
          <button
            type="button"
            onClick={() => setShowHint((current) => !current)}
            className="text-sm font-semibold text-[#61C5FA] transition hover:text-[#BDEAFF]"
          >
            {showHint ? "Hide hints ↑" : "Need a hint? →"}
          </button>

          {showHint && (
            <div className="mt-3 rounded-xl border border-white/[0.16] bg-slate-950/50 p-4 text-white shadow-inner backdrop-blur-2xl backdrop-saturate-150">
              <RenderContent value={hints} />
            </div>
          )}
        </div>
      )}

      {solution != null && solution !== "" && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => setShowSolution((current) => !current)}
            className="text-sm font-medium text-[#CBD5E1] transition hover:text-white"
          >
            {showSolution ? "Hide solution ↑" : "Reveal solution →"}
          </button>

          {showSolution && (
            <div className="mt-3 rounded-xl border border-white/[0.16] bg-slate-950/50 p-4 text-white shadow-inner backdrop-blur-2xl backdrop-saturate-150">
              <RenderContent value={solution} />
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={toggleCompletion}
        disabled={saving || !exerciseId}
        className={`mt-5 rounded-xl border px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
          done
            ? "border-[#61C5FA]/30 bg-[#61C5FA]/[0.09] text-[#BDEAFF]"
            : "border-white/15 text-[#F1F5F9] hover:border-[#61C5FA]/40 hover:bg-white/[0.06]"
        }`}
      >
        {saving
          ? "Saving..."
          : done
            ? "✓ Completed — undo"
            : "Mark as complete"}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-300">
          {error}
        </p>
      )}
    </article>
  );
}

/* -------------------------------------------------------
   MAIN LESSON PAGE
------------------------------------------------------- */

export default function LessonPage() {
  const params = useParams<{ id: string; lessonId: string }>();
  const courseId = params.id;
  const lessonId = params.lessonId;

  const sessionStartRef = useRef(Date.now());
  const tabsNavRef = useRef<HTMLDivElement | null>(null);
  const tabContentRef = useRef<HTMLDivElement | null>(null);
  const [portalReady, setPortalReady] = useState(false);
  const [tabsFixed, setTabsFixed] = useState(false);
  const [tabsPosition, setTabsPosition] = useState({ left: 0, width: 0 });

  const [lessonProgress, setLessonProgress] =
    useState<LessonProgressData | null>(null);
  const [savingProgress, setSavingProgress] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");

  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Learn");
  const [quizData, setQuizData] = useState<DataRecord | null>(null);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizResult, setQuizResult] = useState<DataRecord | null>(null);
  const [quizAttempts, setQuizAttempts] = useState<DataRecord[]>([]);
  const [submittingQuiz, setSubmittingQuiz] = useState(false);
  const [quizError, setQuizError] = useState("");

  const fetchLesson = useCallback(async () => {
    try {
      setError("");

      const response = await apiFetch(
        `/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`,
      );

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load lesson.");
      }

      setLesson(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [courseId, lessonId]);

  const fetchProgress = useCallback(async () => {
    try {
      const response = await apiFetch(
        `/progress/lesson/${encodeURIComponent(lessonId)}`,
      );

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load progress.");
      }

      setLessonProgress(result.data);
    } catch (err) {
      console.error("Failed to load lesson progress:", err);
    }
  }, [lessonId]);

  const fetchQuiz = useCallback(async () => {
    try {
      setQuizError("");

      const response = await apiFetch(
        `/quiz/lesson/${encodeURIComponent(lessonId)}`,
      );

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not load quiz.");
      }

      setQuizData(result.data);

      const attemptsResponse = await apiFetch(
        `/quiz/${encodeURIComponent(result.data.id)}/attempts`,
      );

      if (attemptsResponse.ok) {
        const attemptsResult = await attemptsResponse.json();

        if (attemptsResult.success) {
          setQuizAttempts(attemptsResult.data);
        }
      }
    } catch (err) {
      setQuizError(err instanceof Error ? err.message : "Could not load quiz.");
    }
  }, [lessonId]);

  useEffect(() => {
    void fetchLesson();
    void fetchProgress();
    void fetchQuiz();
  }, [fetchLesson, fetchProgress, fetchQuiz]);

  useEffect(() => {
    setPortalReady(true);

    const updateTabsPosition = () => {
      const element = tabsNavRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setTabsPosition({ left: rect.left, width: rect.width });
      setTabsFixed(rect.top <= 12);
    };

    updateTabsPosition();
    window.addEventListener("scroll", updateTabsPosition, true);
    window.addEventListener("resize", updateTabsPosition);

    const observer = new ResizeObserver(updateTabsPosition);
    if (tabsNavRef.current) observer.observe(tabsNavRef.current);

    return () => {
      window.removeEventListener("scroll", updateTabsPosition, true);
      window.removeEventListener("resize", updateTabsPosition);
      observer.disconnect();
    };
  }, []);

  function handleTabChange(tabName: string) {
    setActiveTab(tabName);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const target = tabContentRef.current;
        if (!target) return;

        const top =
          target.getBoundingClientRect().top + window.scrollY - 112;

        window.scrollTo({
          top: Math.max(0, top),
          behavior: "smooth",
        });
      });
    });
  }

  async function submitQuiz() {
    if (!quizData?.id || submittingQuiz) return;

    const quizQuestions = getList(quizData.questions).filter(
      (item): item is DataRecord => asRecord(item) !== null,
    );

    if (quizQuestions.length === 0) {
      setQuizError("This quiz has no questions to submit.");
      return;
    }

    const unanswered = quizQuestions.filter(
      (question) => !quizAnswers[getText(question.id)],
    );

    if (unanswered.length > 0) {
      setQuizError(
        `Please answer all questions. ${unanswered.length} remaining.`,
      );
      return;
    }

    try {
      setSubmittingQuiz(true);
      setQuizError("");

      const answers = quizQuestions.map((question) => ({
        questionId: getText(question.id),
        answer: quizAnswers[getText(question.id)],
      }));

      const response = await apiFetch(
        `/quiz/${encodeURIComponent(getText(quizData.id))}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        },
      );

      if (response.status === 401) {
        window.location.assign("/login");
        return;
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Quiz submission failed.");
      }

      setQuizResult(result.data);

      const attemptsResponse = await apiFetch(
        `/quiz/${encodeURIComponent(getText(quizData.id))}/attempts`,
      );

      if (attemptsResponse.ok) {
        const attemptsResult = await attemptsResponse.json();

        if (attemptsResult.success) {
          setQuizAttempts(attemptsResult.data);
        }
      }
    } catch (err) {
      setQuizError(
        err instanceof Error ? err.message : "Quiz submission failed.",
      );
    } finally {
      setSubmittingQuiz(false);
    }
  }

  async function markLessonComplete() {
    try {
      setSavingProgress(true);
      setProgressMessage("");

      const sessionTime = Math.max(
        1,
        Math.floor((Date.now() - sessionStartRef.current) / 1000),
      );

      const response = await apiFetch(
        `/progress/lesson/${encodeURIComponent(lessonId)}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            progress: 100,
            completed: true,
            timeSpent: sessionTime,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Could not save progress.");
      }

      setLessonProgress(result.data.lessonProgress);
      setProgressMessage("Lesson completed! Your progress has been saved.");
    } catch (err) {
      setProgressMessage(
        err instanceof Error ? err.message : "Failed to save progress.",
      );
    } finally {
      setSavingProgress(false);
    }
  }

  async function generateContent() {
    try {
      setGenerating(true);
      setError("");

      const response = await apiFetch(
        `/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/generate-content`,
        { method: "POST" },
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Content generation failed.");
      }

      await fetchLesson();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setGenerating(false);
    }
  }

  /* -------------------------------------------------------
     LOADING
  ------------------------------------------------------- */

  if (loading) {
    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#071321] text-white">
        <div className="pointer-events-none absolute -bottom-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-[#2684FF]/20 blur-[120px]" />

        <div className="relative text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#61C5FA]" />

          <p className="mt-4 text-sm font-medium text-[#CBD5E1]">
            Preparing your learning space...
          </p>
        </div>
      </main>
    );
  }

  /* -------------------------------------------------------
     ERROR
  ------------------------------------------------------- */

  if (error && !lesson) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#071321] p-8 text-white">
        <div className={`${glassSurface} max-w-md rounded-2xl p-7 text-center`}>
          <p className="mb-5 text-sm text-red-300">{error}</p>

          <button
            type="button"
            onClick={() => {
              setLoading(true);
              void fetchLesson();
            }}
            className="rounded-xl bg-[#61C5FA] px-5 py-3 text-sm font-semibold text-[#071321] transition hover:bg-[#BDEAFF]"
          >
            Try again
          </button>
        </div>
      </main>
    );
  }

  if (!lesson) return null;

  const hasGeneratedLesson =
    lesson.explanation != null ||
    getList(lesson.keyConcepts).length > 0 ||
    getList(lesson.examples).length > 0;

  if (!hasGeneratedLesson) {
    return (
      <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-transparent px-4 py-12 text-white">
        <div className="relative w-full max-w-2xl">
          <Link
            href={`/courses/${courseId}`}
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-[#CBD5E1] transition hover:text-white"
          >
            ← Back to course
          </Link>

          <section className="relative overflow-hidden bg-transparent p-7 text-center sm:p-12">
            {generating && (
              <>
                <div className="relative mx-auto mb-7 flex h-24 w-24 items-center justify-center">
                  <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#61C5FA] border-r-[#61C5FA]/40" />
                  <div className="absolute inset-2 animate-[spin_3s_linear_infinite_reverse] rounded-full border border-dashed border-[#BDEAFF]/40" />
                  <div className="h-10 w-10 animate-pulse rounded-2xl bg-gradient-to-br from-[#61C5FA] to-[#3978F6] shadow-[0_0_35px_rgba(97,197,250,0.5)]" />
                  <span className="absolute -right-1 top-3 h-3 w-3 animate-ping rounded-full bg-[#BDEAFF]" />
                  <span className="absolute bottom-2 -left-1 h-2.5 w-2.5 animate-pulse rounded-full bg-[#61C5FA]" />
                </div>
                <p className="relative text-xs font-bold uppercase tracking-[0.25em] text-[#8EDBFF]">
                  LearnAI is working
                </p>
                <h1 className="relative mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Creating your lesson
                </h1>
                <p className="relative mx-auto mt-3 max-w-md text-sm leading-6 text-[#CBD5E1]">
                  Building explanations, key concepts, and examples. This may take a little while.
                </p>
                <div className="relative mx-auto mt-8 flex max-w-xs items-center justify-center gap-2">
                  {[0, 1, 2, 3, 4].map((dot) => (
                    <span
                      key={dot}
                      className="h-1.5 w-8 animate-pulse rounded-full bg-[#61C5FA]"
                      style={{ animationDelay: `${dot * 160}ms` }}
                    />
                  ))}
                </div>
                <p className="relative mt-4 text-xs text-[#94A3B8]">
                  Please keep this page open while generation is in progress.
                </p>
              </>
            )}

            {!generating && (
              <>
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center text-3xl text-[#BDEAFF]">
                  ✦
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#8EDBFF]">
                  Ready when you are
                </p>
                <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Generate your lesson
                </h1>
                <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-[#CBD5E1]">
                  Create the lesson content with AI, including explanations, key concepts, and examples.
                </p>
                <button
                  type="button"
                  onClick={generateContent}
                  className="mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[#61C5FA] px-7 py-3.5 text-sm font-bold text-[#071321] shadow-[0_8px_30px_rgba(97,197,250,0.2)] transition hover:-translate-y-0.5 hover:bg-[#BDEAFF] hover:shadow-[0_12px_36px_rgba(97,197,250,0.3)]"
                >
                  <span aria-hidden="true">✦</span>
                  Generate lesson
                </button>
              </>
            )}

            {error && (
              <p role="alert" className="relative mt-5 text-sm text-red-300">
                {error}
              </p>
            )}
          </section>
        </div>
      </main>
    );
  }

  const concepts = getList(lesson.keyConcepts);
  const examples = getList(lesson.examples);
  const codeExamples = getList(lesson.codeExamples);
  const mistakes = getList(lesson.commonMistakes);

  const exercises = getList(lesson.exercises).filter(
    (item): item is DataRecord => asRecord(item) !== null,
  );

  const questions = getList(quizData?.questions).filter(
    (item): item is DataRecord => asRecord(item) !== null,
  );

  const resources = getList(lesson.resources).filter(
    (item): item is DataRecord => asRecord(item) !== null,
  );

  const tabs = [
    { name: "Learn", count: 1 + concepts.length + examples.length },
    { name: "Code", count: codeExamples.length },
    { name: "Practice", count: exercises.length },
    { name: "Quiz", count: questions.length },
  ];

  const tabNavigation = (
    <nav
      className={`${glassSurface} flex w-full items-center gap-2 overflow-x-auto rounded-full p-2 shadow-[0_12px_35px_rgba(0,0,0,0.25)] scrollbar-hide`}
    >
      {tabs.map((tab) => (
        <button
          key={tab.name}
          type="button"
          onClick={() => handleTabChange(tab.name)}
          className={`flex shrink-0 items-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition-all duration-200 ${
            activeTab === tab.name
              ? "border border-[#A9C9E8]/50 bg-[#D0DFEF] text-[#101722]"
              : "border border-transparent text-[#CBD5E1] hover:bg-white/[0.07] hover:text-white"
          }`}
        >
          {tab.name}
          <span className="rounded-full bg-black/[0.08] px-2 py-0.5 text-xs text-current">
            {tab.count}
          </span>
        </button>
      ))}
    </nav>
  );

  return (
<main className="relative isolate min-h-screen overflow-x-clip bg-transparent text-white">


  {portalReady && tabsFixed && tabsPosition.width > 0 &&
    createPortal(
      <div
        className="pointer-events-none fixed top-3 z-[99999]"
        style={{ left: tabsPosition.left, width: tabsPosition.width }}
      >
        <div className="pointer-events-auto">{tabNavigation}</div>
      </div>,
      document.body,
    )}

      {/* MAIN LAYOUT */}

      <div className="mx-auto w-full max-w-7xl px-3 py-7 pr-16 sm:px-5 sm:pr-20 lg:px-8 lg:pr-24 lg:py-10">

        {/* LEFT CONTENT */}

        <div className="min-w-0 space-y-7">
          <div className="mb-7 flex w-full items-center justify-start">
            <Link
              href={`/courses/${courseId}`}
              className="inline-flex items-center gap-2 text-sm font-medium text-[#CBD5E1] transition hover:text-[#BDEAFF]"
            >
              ← Back to course
            </Link>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300 backdrop-blur-xl"
            >
              {error}
            </div>
          )}

          {/* LESSON HERO */}

          <section className={`relative overflow-hidden rounded-3xl p-6 sm:p-9 ${glassSurface}`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#61C5FA]/[0.09] blur-[90px]"
            />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#61C5FA]/25 bg-[#61C5FA]/[0.09] px-3 py-1.5 text-xs font-semibold text-[#BDEAFF]">
                  LESSON
                </span>

                <span className="rounded-full border border-white/15 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#E2E8F0]">
                  Self-paced learning
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-tight text-white sm:text-5xl">
                {lesson.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[#E2E8F0] sm:text-base">
                Learn the concepts, explore examples, and test your
                understanding at your own pace.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3 text-xs font-medium text-[#CBD5E1]">
                <span>{concepts.length} concepts</span>
                <span className="text-white/20">•</span>
                <span>{codeExamples.length} code examples</span>
                <span className="text-white/20">•</span>
                <span>{exercises.length} exercises</span>
              </div>
            </div>
          </section>

          {/* TABS */}
          <div ref={tabsNavRef} className="relative h-[58px]">
            <div className="absolute inset-x-0 top-0">{tabNavigation}</div>
          </div>

          <div ref={tabContentRef} className="scroll-mt-28">
          {/* LEARN TAB */}

          {activeTab === "Learn" && (
            <div className="space-y-6">
              {!lesson.explanation &&
              concepts.length === 0 &&
              examples.length === 0 ? (
                <Section
                  number="01"
                  title="Your lesson is ready to build"
                  description="Generate the lesson material to get started."
                >
                  <p className="text-sm font-medium leading-7 text-[#E2E8F0]">
                    LearnAI can generate an explanation, examples, and practice
                    material for this lesson.
                  </p>

                  <button
                    type="button"
                    onClick={generateContent}
                    disabled={generating}
                    className="mt-5 rounded-xl bg-[#61C5FA] px-5 py-3 text-sm font-semibold text-[#071321] transition hover:bg-[#BDEAFF] disabled:opacity-50"
                  >
                    {generating
                      ? "Generating lesson..."
                      : "Generate lesson content"}
                  </button>
                </Section>
              ) : (
                <>
                  {lesson.explanation != null && (
                    <Section
                      number="01"
                      title="Lesson overview"
                      description="Build your understanding step by step."
                    >
                      <RenderContent value={lesson.explanation} />
                    </Section>
                  )}

                  {concepts.length > 0 && (
                    <Section
                      number="02"
                      title="Key concepts"
                      description="The essential ideas to remember."
                    >
                      <div className="space-y-4">
                        {concepts.map((concept, index) => (
                          <div
                            key={index}
                            className="rounded-xl border border-white/[0.18] bg-slate-950/45 p-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150"
                          >
                            <RenderContent value={concept} />
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {examples.length > 0 && (
                    <Section
                      number="03"
                      title="Examples"
                      description="Connect the theory to practical situations."
                    >
                      <div className="space-y-5">
                        {examples.map((example, index) => (
                          <div
                            key={index}
                            className="border-l-2 border-[#61C5FA]/50 pl-4"
                          >
                            <RenderContent value={example} />
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}

                  {mistakes.length > 0 && (
                    <Section
                      number="04"
                      title="Common mistakes"
                      description="Watch out for these while learning."
                    >
                      <div className="space-y-3">
                        {mistakes.map((mistake, index) => (
                          <div
                            key={index}
                            className="flex gap-3 rounded-xl border border-white/[0.16] bg-slate-950/45 p-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150"
                          >
                            <span className="text-amber-300">!</span>

                            <div className="min-w-0 flex-1">
                              <RenderContent value={mistake} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Section>
                  )}
                </>
              )}

              {codeExamples.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleTabChange("Code")}
                  className="w-full rounded-xl border border-[#61C5FA]/20 bg-[#61C5FA]/[0.06] p-4 text-left text-sm font-semibold text-[#BDEAFF] transition hover:bg-[#61C5FA]/[0.10]"
                >
                  Continue to code examples →
                </button>
              )}
            </div>
          )}

          {/* CODE TAB */}

          {activeTab === "Code" && (
            <div className="space-y-6">
              {codeExamples.length === 0 ? (
                <Section
                  number="{}"
                  title="No code examples yet"
                  description="This lesson does not contain code examples."
                >
                  <p className="text-sm text-[#CBD5E1]">
                    Try another lesson or generate lesson content.
                  </p>
                </Section>
              ) : (
                codeExamples.map((example, index) => (
                  <Section
                    key={index}
                    number={String(index + 1).padStart(2, "0")}
                    title={getText(
                      asRecord(example)?.title,
                      `Code example ${index + 1}`,
                    )}
                  >
                    <CodeExample value={example} />
                  </Section>
                ))
              )}
            </div>
          )}

          {/* PRACTICE TAB */}

          {activeTab === "Practice" && (
            <div className="space-y-6">
              {exercises.length === 0 ? (
                <Section
                  number="01"
                  title="No exercises available"
                  description="There are no exercises attached to this lesson yet."
                >
                  <p className="text-sm text-[#CBD5E1]">
                    You can continue learning and return when exercises are
                    available.
                  </p>
                </Section>
              ) : (
                exercises.map((exercise, index) => (
                  <Section
                    key={getText(exercise.id, String(index))}
                    number={String(index + 1).padStart(2, "0")}
                    title={getText(exercise.title, `Exercise ${index + 1}`)}
                  >
                    <ExerciseCard exercise={exercise} index={index} />
                  </Section>
                ))
              )}
            </div>
          )}

          {/* QUIZ TAB */}

          {activeTab === "Quiz" && (
            <div className="space-y-6">
              {questions.length === 0 ? (
                <Section
                  number="01"
                  title="No quiz questions available"
                  description="This lesson has no quiz questions yet."
                >
                  <p className="text-sm text-[#CBD5E1]">
                    Review the lesson material or try another lesson.
                  </p>
                </Section>
              ) : (
                <Section
                  number="Q"
                  title="Knowledge check"
                  description="Choose an answer and check your understanding."
                >
                  <div className="space-y-5">
                    {questions.map((question, index) => {
                      const questionId = getText(question.id);

                      return (
                        <QuizCard
                          key={questionId || String(index)}
                          question={question}
                          index={index}
                          selected={quizAnswers[questionId] ?? ""}
                          onSelect={(id, answer) => {
                            setQuizAnswers((current) => ({
                              ...current,
                              [id]: answer,
                            }));

                            setQuizError("");
                          }}
                          disabled={Boolean(quizResult)}
                        />
                      );
                    })}
                  </div>

                  {quizError && (
                    <p role="alert" className="mt-4 text-sm text-red-300">
                      {quizError}
                    </p>
                  )}

                  {!quizResult ? (
                    <button
                      type="button"
                      onClick={submitQuiz}
                      disabled={submittingQuiz || questions.length === 0}
                      className="mt-6 rounded-xl bg-[#61C5FA] px-5 py-3 text-sm font-semibold text-[#071321] transition hover:bg-[#BDEAFF] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingQuiz ? "Submitting..." : "Submit quiz"}
                    </button>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-[#61C5FA]/20 bg-[#61C5FA]/[0.06] p-5 backdrop-blur-xl">
                      <p className="text-sm font-semibold text-[#BDEAFF]">
                        {quizResult.passed === true
                          ? "Quiz passed!"
                          : "Quiz completed"}
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-white">
                        {getText(quizResult.score, "0")} /{" "}
                        {getText(quizResult.totalPoints, "0")} points
                      </p>

                      <p className="mt-1 text-sm text-[#E2E8F0]">
                        Score: {getText(quizResult.percentage, "0")}%
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizResult(null);
                          setQuizError("");
                        }}
                        className="mt-4 rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-[#F1F5F9] transition hover:border-[#61C5FA]/40 hover:bg-white/[0.05]"
                      >
                        Try again
                      </button>
                    </div>
                  )}

                  {quizAttempts.length > 0 && (
                    <div className="mt-8 border-t border-white/10 pt-5">
                      <h3 className="font-semibold text-white">
                        Previous attempts
                      </h3>

                      <div className="mt-3 space-y-3">
                        {quizAttempts.map((attempt, index) => {
                          const total = Number(attempt.totalPoints ?? 0);
                          const score = Number(attempt.score ?? 0);

                          const percentage =
                            total > 0 ? Math.round((score / total) * 100) : 0;

                          return (
                            <div
                              key={getText(attempt.id, String(index))}
                              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.16] bg-slate-950/45 p-4 text-white shadow-[0_8px_24px_rgba(0,0,0,0.20)] backdrop-blur-2xl"
                            >
                              <div>
                                <p className="text-sm font-medium text-white">
                                  Attempt {quizAttempts.length - index}
                                </p>

                                <p className="mt-1 text-xs text-[#CBD5E1]">
                                  {attempt.completedAt
                                    ? new Date(
                                        getText(attempt.completedAt),
                                      ).toLocaleString()
                                    : "Completed"}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-semibold text-[#BDEAFF]">
                                  {score}/{total}
                                </p>

                                <p className="text-xs text-[#CBD5E1]">
                                  {percentage}%
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <p className="mt-5 text-xs leading-5 text-[#94A3B8]">
                    These answer checks run in your browser. Quiz attempts and
                    scores are not submitted to the backend by this page yet.
                  </p>
                </Section>
              )}
            </div>
          )}

          </div>

          {/* LEARNING RESOURCES */}

          {resources.length > 0 && (
            <Section
              number="↗"
              title="Learning resources"
              description="Explore additional material for this lesson."
            >
              <div className="space-y-3">
                {resources.map((resource, index) => {
                  const url = getText(resource.url);

                  const title = getText(
                    resource.title,
                    `Learning resource ${index + 1}`,
                  );

                  return (
                    <div
                      key={getText(resource.id, String(index))}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.18] bg-slate-950/45 p-4 text-white shadow-[0_10px_30px_rgba(0,0,0,0.22)] backdrop-blur-2xl backdrop-saturate-150"
                    >
                      <div>
                        <p className="font-medium text-white">{title}</p>

                        {resource.description != null && (
                          <div className="mt-1 text-sm text-[#CBD5E1]">
                            <RenderContent value={resource.description} />
                          </div>
                        )}
                      </div>

                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold text-[#61C5FA] transition hover:text-[#BDEAFF]"
                        >
                          Open ↗
                        </a>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {/* EXISTING COMPONENTS */}

          <NotesPanel lessonId={lessonId} />
          <FlashcardsPanel lessonId={lessonId} />



          {/* FOOTER NAVIGATION */}

          <div className="flex items-center justify-between gap-4 pb-6">
            <Link
              href={`/courses/${courseId}`}
              className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-[#E2E8F0] transition hover:bg-white/[0.08] hover:text-white"
            >
              ← Course overview
            </Link>

            <button
              type="button"
              onClick={markLessonComplete}
              disabled={savingProgress || lessonProgress?.completed === true}
              className={`rounded-xl border px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-70 ${
                lessonProgress?.completed
                  ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                  : "border-[#61C5FA]/40 bg-[#61C5FA] text-[#071321] hover:bg-[#BDEAFF]"
              }`}
            >
              {savingProgress
                ? "Saving..."
                : lessonProgress?.completed
                  ? "✓ Marked as completed"
                  : "Mark as completed"}
            </button>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="rounded-xl border border-white/15 bg-white/[0.04] px-4 py-3 text-sm font-medium text-[#E2E8F0] transition hover:bg-white/[0.08] hover:text-white"
            >
              Back to top ↑
            </button>
          </div>

          {progressMessage && (
            <p
              role="status"
              className={`pb-5 text-right text-sm ${
                lessonProgress?.completed ? "text-emerald-300" : "text-[#CBD5E1]"
              }`}
            >
              {progressMessage}
            </p>
          )}
        </div>

      </div>
    </main>
  );
}