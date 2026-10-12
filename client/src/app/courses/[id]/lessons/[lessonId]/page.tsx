"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

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

  // Supports stored answers such as "B" and "B. Correct answer".
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

function RenderContent({ value }: { value: unknown }) {
  if (value == null || value === "") return null;

  if (typeof value === "string" || typeof value === "number") {
    return (
      <p className="whitespace-pre-wrap leading-7 text-[#C8BBD0]">
        {String(value)}
      </p>
    );
  }

  if (Array.isArray(value)) {
    return (
      <ul className="space-y-3">
        {value.map((item, index) => (
          <li key={index} className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#D934F7]" />
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

        // Don't display implementation metadata as lesson content.
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
            <p className="text-sm font-medium text-[#E7DDEA]">{label}</p>
            <RenderContent value={item} />
          </div>
        );
      })}
    </div>
  );
}

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
    <section className="rounded-3xl border border-white/[0.09] bg-[#120A18] p-5 sm:p-8">
      <div className="mb-6 flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#D934F7]/20 bg-[#D934F7]/10 text-sm font-semibold text-[#E66AFF]">
          {number}
        </span>

        <div className="min-w-0 pt-1">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {title}
          </h2>
          {description && (
            <p className="mt-1 text-sm leading-6 text-[#95859E]">
              {description}
            </p>
          )}
        </div>
      </div>

      {children}
    </section>
  );
}

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
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0A060D]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.08] bg-white/[0.025] px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#F87171]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#FBBF24]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#BCF429]" />
          </span>
          <span className="text-sm font-medium text-[#D5C9DA]">{title}</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-md bg-white/[0.06] px-2 py-1 text-xs uppercase tracking-wide text-[#A69BAC]">
            {language}
          </span>

          <button
            type="button"
            onClick={copyCode}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-[#D5C9DA] transition hover:border-[#D934F7]/40 hover:text-white"
          >
            {copied ? "✓ Copied" : "Copy"}
          </button>
        </div>
      </div>

      <pre className="overflow-x-auto p-5 text-sm leading-7 text-[#D8C7E4]">
        <code>{code || "No code was provided for this example."}</code>
      </pre>

      {explanation && (
        <div className="border-t border-white/[0.07] px-5 py-4">
          <p className="text-sm leading-7 text-[#A69BAC]">{explanation}</p>
        </div>
      )}

      {canPreview && code && (
        <div className="border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => setShowPreview((current) => !current)}
            className="px-5 py-3 text-sm font-medium text-[#D934F7] transition hover:text-[#E66AFF]"
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
    <article className="rounded-2xl border border-white/[0.08] bg-[#0E0813] p-5 sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="rounded-lg bg-[#D934F7]/10 px-3 py-1.5 text-xs font-semibold text-[#E66AFF]">
          QUESTION {index + 1}
        </span>

        <span className="text-xs text-[#95859E]">
          {getText(question.points, "1")} point(s)
        </span>
      </div>

      <h3 className="text-base font-medium leading-7 text-white">{prompt}</h3>

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
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition disabled:cursor-default ${
                  active
                    ? "border-[#D934F7]/60 bg-[#D934F7]/10"
                    : "border-white/10 bg-white/[0.025] hover:border-[#D934F7]/40"
                }`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 text-xs font-semibold text-[#C8BBD0]">
                  {letter}
                </span>

                <span className="flex-1 text-sm leading-6 text-[#D5C9DA]">
                  {optionText(option)}
                </span>

                {active && <span className="text-[#E66AFF]">✓</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <p className="mt-4 text-sm text-[#95859E]">
          This question has no selectable options yet.
        </p>
      )}
    </article>
  );
}

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
    <article className="rounded-2xl border border-white/[0.08] bg-[#0E0813] p-5 sm:p-6">
      <div className="flex items-start gap-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#BCF429]/10 text-lg text-[#BCF429]">
          ✦
        </span>

        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-white">{title}</h3>
          <p className="mt-2 text-xs uppercase tracking-wider text-[#95859E]">
            {getText(exercise.difficulty, "PRACTICE")}
          </p>
        </div>

        {done && (
          <span className="text-xs font-medium text-[#BCF429]">✓ Done</span>
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
            className="text-sm font-medium text-[#D934F7] hover:text-[#E66AFF]"
          >
            {showHint ? "Hide hints ↑" : "Need a hint? →"}
          </button>

          {showHint && (
            <div className="mt-3 rounded-xl border border-[#D934F7]/15 bg-[#D934F7]/[0.05] p-4">
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
            className="text-sm text-[#A69BAC] transition hover:text-white"
          >
            {showSolution ? "Hide solution ↑" : "Reveal solution →"}
          </button>

          {showSolution && (
            <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4">
              <RenderContent value={solution} />
            </div>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={toggleCompletion}
        disabled={saving || !exerciseId}
        className={`mt-5 rounded-xl border px-4 py-2.5 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${
          done
            ? "border-[#BCF429]/30 bg-[#BCF429]/10 text-[#BCF429]"
            : "border-white/10 text-[#D5C9DA] hover:border-[#BCF429]/40"
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

export default function LessonPage() {
  const params = useParams<{ id: string; lessonId: string }>();
  const courseId = params.id;
  const lessonId = params.lessonId;

  const sessionStartRef = useRef(Date.now());

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

      // Refresh the saved attempt history.
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

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#09030E] text-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-white/10 border-t-[#D934F7]" />
          <p className="mt-4 text-sm text-[#A69BAC]">
            Preparing your learning space...
          </p>
        </div>
      </main>
    );
  }

  if (error && !lesson) {
    return (
      <main className="min-h-screen bg-[#09030E] p-8 text-white">
        <p className="mb-4 text-red-400">{error}</p>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            void fetchLesson();
          }}
          className="rounded-xl bg-[#D934F7] px-5 py-3 font-semibold text-black"
        >
          Try again
        </button>
      </main>
    );
  }

  if (!lesson) return null;

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

  const progress = Math.max(0, Math.min(100, lessonProgress?.progress ?? 0));

  return (
    <main className="min-h-screen bg-[#09030E] text-white">
      <header className="sticky top-0 z-30 border-b border-white/[0.08] bg-[#09030E]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-7">
          <Link
            href={`/courses/${courseId}`}
            className="flex min-w-0 items-center gap-3 text-sm text-[#A69BAC] transition hover:text-white"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#D934F7] font-bold text-black">
              L
            </span>
            <span className="hidden sm:inline">LearnAI</span>
            <span className="text-white/20">/</span>
            <span className="truncate">{lesson.title}</span>
          </Link>

          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-[#95859E] sm:inline">
              {progress}% complete
            </span>
            <div className="h-2 w-20 overflow-hidden rounded-full bg-white/10 sm:w-32">
              <div
                className="h-full rounded-full bg-[#BCF429] transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-7 sm:px-7 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-10 lg:py-10">
        <div className="min-w-0 space-y-7">
          <Link
            href={`/courses/${courseId}`}
            className="inline-flex items-center gap-2 text-sm text-[#A69BAC] transition hover:text-[#D934F7]"
          >
            ← Back to course
          </Link>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/[0.07] p-4 text-sm text-red-300"
            >
              {error}
            </div>
          )}

          <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1C0B25] via-[#130A19] to-[#0D0612] p-6 sm:p-9">
            <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#D934F7]/10 blur-[90px]" />

            <div className="relative">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#D934F7]/20 bg-[#D934F7]/10 px-3 py-1.5 text-xs font-medium text-[#E66AFF]">
                  LESSON
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#A69BAC]">
                  Self-paced learning
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
                {lesson.title}
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-[#B8AABD] sm:text-base">
                Learn the concepts, explore examples, and test your
                understanding at your own pace.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3 text-xs text-[#A69BAC]">
                <span>{concepts.length} concepts</span>
                <span className="text-white/20">•</span>
                <span>{codeExamples.length} code examples</span>
                <span className="text-white/20">•</span>
                <span>{exercises.length} exercises</span>
              </div>
            </div>
          </section>

          <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-white/[0.08] bg-[#120A18] p-2">
            {tabs.map((tab) => (
              <button
                key={tab.name}
                type="button"
                onClick={() => setActiveTab(tab.name)}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-3 text-sm transition ${
                  activeTab === tab.name
                    ? "bg-[#D934F7]/15 font-medium text-[#E66AFF]"
                    : "text-[#A69BAC] hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                {tab.name}
                <span className="rounded-md bg-white/[0.06] px-1.5 py-0.5 text-xs">
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>

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
                  <p className="text-sm leading-7 text-[#B8AABD]">
                    LearnAI can generate an explanation, examples, and practice
                    material for this lesson.
                  </p>

                  <button
                    type="button"
                    onClick={generateContent}
                    disabled={generating}
                    className="mt-5 rounded-xl bg-[#D934F7] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#E66AFF] disabled:opacity-50"
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
                            className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4"
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
                            className="border-l-2 border-[#D934F7]/50 pl-4"
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
                            className="flex gap-3 rounded-xl border border-amber-400/10 bg-amber-400/[0.035] p-4"
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
                  onClick={() => setActiveTab("Code")}
                  className="w-full rounded-xl border border-[#D934F7]/20 bg-[#D934F7]/[0.06] p-4 text-left text-sm text-[#E66AFF] transition hover:bg-[#D934F7]/10"
                >
                  Continue to code examples →
                </button>
              )}
            </div>
          )}

          {activeTab === "Code" && (
            <div className="space-y-6">
              {codeExamples.length === 0 ? (
                <Section
                  number="{}"
                  title="No code examples yet"
                  description="This lesson does not contain code examples."
                >
                  <p className="text-sm text-[#A69BAC]">
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

          {activeTab === "Practice" && (
            <div className="space-y-6">
              {exercises.length === 0 ? (
                <Section
                  number="01"
                  title="No exercises available"
                  description="There are no exercises attached to this lesson yet."
                >
                  <p className="text-sm text-[#A69BAC]">
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

          {activeTab === "Quiz" && (
            <div className="space-y-6">
              {questions.length === 0 ? (
                <Section
                  number="01"
                  title="No quiz questions available"
                  description="This lesson has no quiz questions yet."
                >
                  <p className="text-sm text-[#A69BAC]">
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
                      className="mt-6 rounded-xl bg-[#D934F7] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#E66AFF] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {submittingQuiz ? "Submitting..." : "Submit quiz"}
                    </button>
                  ) : (
                    <div className="mt-6 rounded-2xl border border-[#BCF429]/20 bg-[#BCF429]/[0.06] p-5">
                      <p className="text-sm font-semibold text-[#BCF429]">
                        {quizResult.passed === true
                          ? "Quiz passed!"
                          : "Quiz completed"}
                      </p>

                      <p className="mt-2 text-2xl font-semibold text-white">
                        {getText(quizResult.score, "0")} /{" "}
                        {getText(quizResult.totalPoints, "0")} points
                      </p>

                      <p className="mt-1 text-sm text-[#B8AABD]">
                        Score: {getText(quizResult.percentage, "0")}%
                      </p>

                      <button
                        type="button"
                        onClick={() => {
                          setQuizAnswers({});
                          setQuizResult(null);
                          setQuizError("");
                        }}
                        className="mt-4 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-[#D5C9DA] transition hover:border-[#D934F7]/40 hover:text-white"
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
                              className="flex items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                            >
                              <div>
                                <p className="text-sm font-medium text-white">
                                  Attempt {quizAttempts.length - index}
                                </p>
                                <p className="mt-1 text-xs text-[#95859E]">
                                  {attempt.completedAt
                                    ? new Date(
                                        getText(attempt.completedAt),
                                      ).toLocaleString()
                                    : "Completed"}
                                </p>
                              </div>

                              <div className="text-right">
                                <p className="text-sm font-semibold text-[#BCF429]">
                                  {score}/{total}
                                </p>
                                <p className="text-xs text-[#A69BAC]">
                                  {percentage}%
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <p className="mt-5 text-xs leading-5 text-[#75667C]">
                    These answer checks run in your browser. Quiz attempts and
                    scores are not submitted to the backend by this page yet.
                  </p>
                </Section>
              )}
            </div>
          )}

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
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4"
                    >
                      <div>
                        <p className="font-medium text-white">{title}</p>
                        {resource.description != null && (
                          <div className="mt-1 text-sm text-[#A69BAC]">
                            <RenderContent value={resource.description} />
                          </div>
                        )}
                      </div>

                      {url && (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-medium text-[#D934F7] hover:text-[#E66AFF]"
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

          <section className="rounded-3xl border border-[#BCF429]/15 bg-gradient-to-br from-[#BCF429]/[0.06] to-transparent p-6 sm:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold tracking-[0.15em] text-[#BCF429]">
                  LESSON PROGRESS
                </p>

                <h2 className="mt-2 text-xl font-semibold">
                  {lessonProgress?.completed
                    ? "Lesson completed!"
                    : "Ready to finish this lesson?"}
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#A69BAC]">
                  {lessonProgress?.completed
                    ? "Your saved progress shows this lesson as complete."
                    : "Mark this lesson complete when you're ready."}
                </p>
              </div>

              <button
                type="button"
                onClick={markLessonComplete}
                disabled={savingProgress || lessonProgress?.completed === true}
                className="shrink-0 rounded-xl bg-[#BCF429] px-5 py-3.5 text-sm font-semibold text-[#09030E] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {savingProgress
                  ? "Saving..."
                  : lessonProgress?.completed
                    ? "✓ Completed"
                    : "Complete lesson →"}
              </button>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#BCF429] transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <div className="mt-2 flex justify-between text-xs text-[#A69BAC]">
              <span>Progress saved to your account</span>
              <span>{progress}%</span>
            </div>

            {progressMessage && (
              <p role="status" className="mt-4 text-sm text-[#BCF429]">
                {progressMessage}
              </p>
            )}
          </section>

          <div className="flex items-center justify-between gap-4 pb-6">
            <Link
              href={`/courses/${courseId}`}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm text-[#A69BAC] transition hover:text-white"
            >
              ← Course overview
            </Link>

            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm text-[#A69BAC] transition hover:text-white"
            >
              Back to top ↑
            </button>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="rounded-2xl border border-white/[0.08] bg-[#120A18] p-5">
            <p className="text-xs font-semibold tracking-[0.15em] text-[#BCF429]">
              YOUR LEARNING SPACE
            </p>

            <h2 className="mt-3 text-lg font-semibold">
              Keep making progress.
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#95859E]">
              Work through the concepts, practice with examples, and check your
              understanding.
            </p>

            <div className="mt-5 space-y-3">
              {[
                {
                  label: "Lesson content",
                  done: Boolean(lesson.explanation),
                },
                {
                  label: "Code examples",
                  done: codeExamples.length > 0,
                },
                {
                  label: "Practice exercises",
                  done: exercises.length > 0,
                },
                {
                  label: "Knowledge check",
                  done: questions.length > 0,
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-3 text-sm"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-lg ${
                      item.done
                        ? "bg-[#BCF429]/10 text-[#BCF429]"
                        : "bg-white/[0.05] text-[#75667C]"
                    }`}
                  >
                    {item.done ? "✓" : "·"}
                  </span>

                  <span
                    className={item.done ? "text-[#D5C9DA]" : "text-[#95859E]"}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-white/[0.08] bg-[#120A18] p-5">
            <p className="text-sm font-semibold text-white">Quick navigation</p>

            <div className="mt-4 space-y-1">
              {["Learn", "Code", "Practice", "Quiz"].map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => {
                    setActiveTab(tab);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`w-full rounded-xl px-3 py-2.5 text-left text-sm transition ${
                    activeTab === tab
                      ? "bg-[#D934F7]/10 text-[#E66AFF]"
                      : "text-[#A69BAC] hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {tab}
                  <span className="float-right">→</span>
                </button>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}
