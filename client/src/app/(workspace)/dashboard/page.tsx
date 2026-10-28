
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Layers3,
  Pause,
  Play,
  Plus,
  RefreshCw,
  RotateCcw,
  Target,
  Timer,
  TrendingUp,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type Course = {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  description?: string;
  progress?: number;
  progressPercent?: number;
  createdAt?: string;
  updatedAt?: string;
};

type QuizAttempt = {
  id?: string;
  _id?: string;
  title?: string;
  quizTitle?: string;
  score?: number;
  percentage?: number;
  createdAt?: string;
};

type DashboardData = {
  stats?: Record<string, unknown>;
  courses?: Course[];
  recentCourses?: Course[];
  recentQuizAttempts?: QuizAttempt[];
  recentQuizzes?: QuizAttempt[];
};

const glass =
  "min-w-0 rounded-[22px] border border-white/[0.12] " +
  "bg-transparent backdrop-blur-xl backdrop-saturate-150 " +
  "shadow-[0_6px_24px_rgba(0,0,0,0.10)] " +
  "ring-1 ring-inset ring-white/[0.025]";

const muted = "text-[#A9BAD3]";

function numberValue(value: unknown): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function courseProgress(course: Course): number {
  return Math.min(
    100,
    Math.max(0, numberValue(course.progressPercent ?? course.progress)),
  );
}

function formatDate(value?: string): string {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remaining = seconds % 60;

  return [hours, minutes, remaining]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

function smoothPath(points: { x: number; y: number }[]): string {
  if (!points.length) return "";

  return points
    .map((point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`;
      const previous = points[index - 1];
      const middleX = (previous.x + point.x) / 2;

      return `C ${middleX} ${previous.y}, ${middleX} ${point.y}, ${point.x} ${point.y}`;
    })
    .join(" ");
}

export default function DashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [coursePickerOpen, setCoursePickerOpen] = useState(false);
  const [timerRunning, setTimerRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
        setError("");

        const response = await apiFetch("/dashboard/overview", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok || result.success === false) {
          throw new Error(
            result.message || "Unable to load your dashboard.",
          );
        }

        if (active) setDashboard(result.data ?? result);
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not connect to the server.",
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDashboard();

    return () => {
      active = false;
    };
  }, [router]);

  useEffect(() => {
    if (!timerRunning) return;

    const interval = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1);
    }, 1000);

    return () => window.clearInterval(interval);
  }, [timerRunning]);

  const stats = dashboard?.stats ?? {};
  const courses = dashboard?.courses ?? dashboard?.recentCourses ?? [];
  const quizzes =
    dashboard?.recentQuizAttempts ?? dashboard?.recentQuizzes ?? [];

  const totalCourses =
    numberValue(stats.totalCourses ?? stats.courseCount) || courses.length;

  const completedLessons = numberValue(
    stats.completedLessons ?? stats.lessonsCompleted,
  );

  const studyStreak = numberValue(stats.studyStreak ?? stats.streak);

  const averageScore = numberValue(
    stats.averageQuizScore ?? stats.averageScore,
  );

  const selectedCourse = courses.find(
    (course) => (course.id ?? course._id ?? "") === selectedCourseId,
  );

  useEffect(() => {
    if (!selectedCourseId && courses.length) {
      setSelectedCourseId(courses[0].id ?? courses[0]._id ?? "");
    }
  }, [courses, selectedCourseId]);

  const weeklyActivity = useMemo(() => {
    const today = new Date();
    const start = new Date(today);

    start.setHours(0, 0, 0, 0);
    start.setDate(today.getDate() - 6);

    const days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      return {
        date,
        label: date.toLocaleDateString("en", { weekday: "short" }),
        count: 0,
      };
    });

    quizzes.forEach((quiz) => {
      if (!quiz.createdAt) return;

      const date = new Date(quiz.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const day = days.find(
        (item) => item.date.toDateString() === date.toDateString(),
      );

      if (day) day.count += 1;
    });

    return days;
  }, [quizzes]);

  const maxActivity = Math.max(
    1,
    ...weeklyActivity.map((day) => day.count),
  );

  const recentQuizData = useMemo(
    () =>
      quizzes
        .slice(0, 7)
        .reverse()
        .map((quiz) => ({
          score: Math.min(
            100,
            Math.max(0, numberValue(quiz.percentage ?? quiz.score)),
          ),
          date: quiz.createdAt,
        })),
    [quizzes],
  );

  const quizPoints = recentQuizData.map((quiz, index) => ({
    x:
      recentQuizData.length === 1
        ? 310
        : 42 + (index / (recentQuizData.length - 1)) * 555,
    y: 185 - (quiz.score / 100) * 155,
  }));

  const quizLine = smoothPath(quizPoints);

  const quizArea =
    quizPoints.length > 0
      ? `${quizLine} L ${quizPoints[quizPoints.length - 1].x} 185 L ${quizPoints[0].x} 185 Z`
      : "";

  const scoreLabels = recentQuizData.map((quiz, index) =>
    quiz.date ? formatDate(quiz.date) : `Quiz ${index + 1}`,
  );

  return (
    <main className="relative isolate min-h-screen w-full min-w-0 overflow-x-clip px-3 py-3 text-white sm:px-5 sm:py-4 lg:px-6">
     

      {/* Subtle login-page grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(120,164,211,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120,164,211,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px",
          maskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 78%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 18%, black 78%, transparent)",
        }}
      />

      <div className="mx-auto w-full min-w-0 max-w-[1600px]">
        {/* Header */}
        <header className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#61C5FA]">
              LearnAI
            </p>

            <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
              Dashboard
            </h1>

            <p className={`mt-1 text-xs sm:text-sm ${muted}`}>
              Plan, prioritize, and make progress on your learning.
            </p>
          </div>

          <Link
            href="/courses/create"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-[#61C5FA]/30 bg-[#2684FF]/15 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-xl transition hover:border-[#61C5FA]/60 hover:bg-[#2684FF]/25 sm:text-sm"
          >
            <Plus size={16} />
            Create new course
          </Link>
        </header>

        {error && (
          <div
            role="alert"
            className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/[0.12] bg-transparent p-3 backdrop-blur-xl"
          >
            <p className="text-sm text-white">{error}</p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#61C5FA]"
            >
              <RefreshCw size={14} />
              Try again
            </button>
          </div>
        )}

        {/* Summary cards */}
        <section className="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
          <MetricCard
            label="Total Courses"
            value={loading ? "—" : totalCourses}
            note="Your learning library"
            icon={<GraduationCap size={19} />}
            color="blue"
            featured
          />

          <MetricCard
            label="Lessons Completed"
            value={loading ? "—" : completedLessons}
            note="Keep the momentum"
            icon={<CheckCircle2 size={19} />}
            color="cyan"
          />

          <MetricCard
            label="Learning Streak"
            value={loading ? "—" : `${studyStreak} days`}
            note="Consistency matters"
            icon={<TrendingUp size={19} />}
            color="blue"
          />

          <MetricCard
            label="Average Quiz Score"
            value={loading ? "—" : `${averageScore}%`}
            note="Knowledge checks"
            icon={<Target size={19} />}
            color="purple"
          />
        </section>

        {/* Activity and performance */}
        <section className="mt-3 grid min-w-0 grid-cols-1 items-stretch gap-3 xl:grid-cols-2">
          {/* Weekly Activity */}
          <article
            className={`${glass} relative flex h-[clamp(300px,40vh,360px)] min-h-0 flex-col overflow-hidden p-4 sm:h-[clamp(320px,42vh,380px)] sm:p-5`}
          >
            <GlassReflection />

            <div className="relative flex shrink-0 items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white sm:text-xl">
                  Weekly Activity
                </h2>

                <p className={`mt-1 text-xs ${muted}`}>
                  Quiz attempts over the last seven days
                </p>
              </div>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#61C5FA]/20 bg-transparent text-[#61C5FA]">
                <TrendingUp size={19} />
              </span>
            </div>

            <div className="relative mt-4 flex min-h-0 min-w-0 flex-1 items-stretch justify-between gap-2 sm:gap-3">
              {weeklyActivity.map((day, index) => {
                const isToday =
                  day.date.toDateString() === new Date().toDateString();

                const height =
                  day.count === 0
                    ? 8
                    : Math.max(14, (day.count / maxActivity) * 100);

                return (
                  <div
                    key={day.date.toISOString()}
                    className="flex min-w-0 flex-1 flex-col items-center gap-2"
                  >
                    <div className="flex min-h-0 w-full flex-1 items-end justify-center">
                      <div
                        title={`${day.count} quiz attempts`}
                        className={`w-full max-w-[42px] rounded-full transition-all duration-300 ${
                          isToday
                            ? "bg-gradient-to-t from-[#155EAB] to-[#61C5FA]"
                            : index % 3 === 1
                              ? "bg-[#2684FF]/80"
                              : "bg-[#61C5FA]/40"
                        }`}
                        style={{ height: `${height}%`, minHeight: "8px" }}
                      />
                    </div>

                    <span
                      className={`shrink-0 text-[10px] ${
                        isToday ? "font-semibold text-white" : muted
                      }`}
                    >
                      {day.label}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="relative mt-3 flex shrink-0 items-center justify-between border-t border-white/[0.10] pt-3">
              <p className={`text-xs ${muted}`}>
                Attempts recorded this week
              </p>

              <p className="text-sm font-semibold text-white">
                {weeklyActivity.reduce((sum, day) => sum + day.count, 0)}
              </p>
            </div>
          </article>

          {/* Quiz Performance */}
          <article
            className={`${glass} relative flex h-[clamp(300px,40vh,360px)] min-h-0 flex-col overflow-hidden p-4 sm:h-[clamp(320px,42vh,380px)] sm:p-5`}
          >
            <GlassReflection />

            <div className="relative flex shrink-0 items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.17em] text-[#61C5FA]">
                  Analytics
                </p>

                <h2 className="mt-0.5 text-lg font-semibold text-white sm:text-xl">
                  Quiz Performance
                </h2>

                <p className={`mt-1 text-xs ${muted}`}>
                  Your quiz scores over time
                </p>
              </div>

              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#61C5FA]/20 bg-transparent text-[#61C5FA]">
                <TrendingUp size={19} />
              </span>
            </div>

            <div className="relative mt-3 flex min-h-0 flex-1 flex-col">
              {recentQuizData.length > 0 ? (
                <>
                  <div className="mb-2 flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                    <span className="inline-flex items-center gap-2 text-white">
                      <span className="h-2 w-2 rounded-full bg-[#61C5FA]" />
                      Quiz score
                    </span>

                    {quizzes.length > 7 && (
                      <span className="inline-flex items-center gap-2 text-white/75">
                        <span className="h-2 w-2 rounded-full bg-[#A78BFA]" />
                        Previous scores
                      </span>
                    )}
                  </div>

                  <div className="relative min-h-0 min-w-0 flex-1">
                    <svg
                      viewBox="0 0 620 215"
                      className="absolute inset-0 h-full w-full"
                      role="img"
                      aria-label="Quiz performance line graph"
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient
                          id="quizBlueFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#61C5FA"
                            stopOpacity="0.18"
                          />
                          <stop
                            offset="100%"
                            stopColor="#61C5FA"
                            stopOpacity="0"
                          />
                        </linearGradient>

                        <linearGradient
                          id="quizBlueLine"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#2684FF" />
                          <stop offset="100%" stopColor="#61C5FA" />
                        </linearGradient>

                        <linearGradient
                          id="quizPurpleFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="0%"
                            stopColor="#A78BFA"
                            stopOpacity="0.15"
                          />
                          <stop
                            offset="100%"
                            stopColor="#A78BFA"
                            stopOpacity="0"
                          />
                        </linearGradient>

                        <linearGradient
                          id="quizPurpleLine"
                          x1="0"
                          y1="0"
                          x2="1"
                          y2="0"
                        >
                          <stop offset="0%" stopColor="#8B5CF6" />
                          <stop offset="100%" stopColor="#C4B5FD" />
                        </linearGradient>
                      </defs>

                      {[0, 25, 50, 75, 100].map((score) => {
                        const y = 185 - (score / 100) * 155;

                        return (
                          <g key={score}>
                            <line
                              x1="38"
                              y1={y}
                              x2="610"
                              y2={y}
                              stroke="white"
                              strokeOpacity="0.09"
                              strokeDasharray="4 7"
                            />

                            <text
                              x="27"
                              y={y + 4}
                              fill="#A9BAD3"
                              fontSize="10"
                              textAnchor="end"
                            >
                              {score}
                            </text>
                          </g>
                        );
                      })}

                      {(() => {
                        const previousScores = quizzes
                          .slice(7, 14)
                          .reverse()
                          .map((quiz) =>
                            Math.min(
                              100,
                              Math.max(
                                0,
                                numberValue(quiz.percentage ?? quiz.score),
                              ),
                            ),
                          );

                        const previousPoints = previousScores.map(
                          (score, index) => ({
                            x:
                              previousScores.length === 1
                                ? 310
                                : 42 +
                                  (index / (previousScores.length - 1)) * 555,
                            y: 185 - (score / 100) * 155,
                          }),
                        );

                        const previousLine = smoothPath(previousPoints);

                        const previousArea =
                          previousPoints.length > 0
                            ? `${previousLine} L ${previousPoints[previousPoints.length - 1].x} 185 L ${previousPoints[0].x} 185 Z`
                            : "";

                        return (
                          <>
                            {previousPoints.length > 0 && (
                              <>
                                <path
                                  d={previousArea}
                                  fill="url(#quizPurpleFill)"
                                />

                                <path
                                  d={previousLine}
                                  fill="none"
                                  stroke="url(#quizPurpleLine)"
                                  strokeWidth="2.5"
                                  strokeLinecap="round"
                                />

                                {previousPoints.map((point, index) => (
                                  <circle
                                    key={`previous-${index}`}
                                    cx={point.x}
                                    cy={point.y}
                                    r="3.5"
                                    fill="#A78BFA"
                                    stroke="#07152C"
                                    strokeWidth="2"
                                  />
                                ))}
                              </>
                            )}

                            <path d={quizArea} fill="url(#quizBlueFill)" />

                            <path
                              d={quizLine}
                              fill="none"
                              stroke="url(#quizBlueLine)"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            />

                            {quizPoints.map((point, index) => (
                              <circle
                                key={`quiz-${index}`}
                                cx={point.x}
                                cy={point.y}
                                r="4"
                                fill="#61C5FA"
                                stroke="#07152C"
                                strokeWidth="2"
                              />
                            ))}

                            {scoreLabels.map((label, index) => (
                              <text
                                key={`label-${index}`}
                                x={quizPoints[index].x}
                                y="207"
                                fill="#A9BAD3"
                                fontSize="10"
                                textAnchor="middle"
                              >
                                {label}
                              </text>
                            ))}
                          </>
                        );
                      })()}
                    </svg>
                  </div>

                  <div className="relative mt-2 flex shrink-0 items-center justify-between gap-3 border-t border-white/[0.10] pt-2">
                    <div>
                      <p className={`text-xs ${muted}`}>
                        Latest quiz score
                      </p>
                      <p className="mt-0.5 text-xl font-semibold text-white">
                        {recentQuizData[recentQuizData.length - 1].score}%
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`text-xs ${muted}`}>Attempts shown</p>
                      <p className="mt-0.5 text-sm font-semibold text-[#61C5FA]">
                        {recentQuizData.length}
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center text-center">
                  <Brain size={25} className="text-[#61C5FA]" />
                  <p className="mt-2 text-sm font-medium text-white">
                    No quiz scores yet
                  </p>
                  <p className={`mt-1 text-xs ${muted}`}>
                    Complete a quiz to build your graph.
                  </p>
                </div>
              )}
            </div>
          </article>
        </section>

        {/* Course Progress and Courses */}
        <section className="mt-3 grid min-w-0 grid-cols-1 items-stretch gap-3 xl:grid-cols-2">
          <article className={`${glass} relative overflow-hidden p-4 sm:p-5`}>
            <GlassReflection />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white sm:text-xl">
                  Course Progress
                </h2>
                <p className={`mt-1 text-xs ${muted}`}>
                  Choose a course to inspect
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCoursePickerOpen(true)}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-white/[0.16] bg-transparent px-3 py-2 text-sm font-medium text-white backdrop-blur-xl transition hover:border-[#61C5FA]/50 hover:bg-white/[0.04]"
              >
                Select <ChevronDown size={14} />
              </button>
            </div>

            {selectedCourse ? (
              <>
                <button
                  type="button"
                  onClick={() => setCoursePickerOpen(true)}
                  className="relative mt-4 flex w-full items-center justify-between gap-3 text-left"
                >
                  <span className="min-w-0 truncate text-sm font-semibold text-white">
                    {selectedCourse.title ??
                      selectedCourse.name ??
                      "Untitled course"}
                  </span>
                  <span className="shrink-0 text-sm font-semibold text-[#61C5FA]">
                    {courseProgress(selectedCourse)}%
                  </span>
                </button>

                <div className="relative mx-auto mt-3 flex h-[125px] w-full max-w-[230px] items-end justify-center sm:h-[140px]">
                  <svg
                    viewBox="0 0 240 145"
                    className="h-full w-full"
                    role="img"
                    aria-label={`${courseProgress(selectedCourse)} percent complete`}
                  >
                    <defs>
                      <linearGradient
                        id="courseProgressGradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="0"
                      >
                        <stop offset="0%" stopColor="#155EAB" />
                        <stop offset="100%" stopColor="#61C5FA" />
                      </linearGradient>
                    </defs>

                    <path
                      d="M 27 125 A 93 93 0 0 1 213 125"
                      fill="none"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="24"
                      strokeLinecap="round"
                    />

                    <path
                      d="M 27 125 A 93 93 0 0 1 213 125"
                      fill="none"
                      stroke="url(#courseProgressGradient)"
                      strokeWidth="24"
                      strokeLinecap="round"
                      pathLength="100"
                      strokeDasharray={`${courseProgress(selectedCourse)} 100`}
                    />
                  </svg>

                  <div className="absolute bottom-0 left-0 right-0 text-center">
                    <p className="text-2xl font-semibold text-white">
                      {courseProgress(selectedCourse)}%
                    </p>
                    <p className={`mt-0.5 text-[10px] ${muted}`}>
                      Course completed
                    </p>
                  </div>
                </div>

                <div className="relative mt-3 flex items-center justify-between gap-3 border-t border-white/[0.10] pt-3 text-xs">
                  <span className="inline-flex items-center gap-2 text-[#61C5FA]">
                    <span className="h-2 w-2 rounded-full bg-[#2684FF]" />
                    Completed
                  </span>

                  <span className={`inline-flex items-center gap-2 ${muted}`}>
                    <span className="h-2 w-2 rounded-full bg-white/35" />
                    {100 - courseProgress(selectedCourse)}% remaining
                  </span>
                </div>
              </>
            ) : (
              <EmptyState
                icon={<Layers3 size={23} />}
                title="Choose a course"
                description="Select a course to see its progress."
              />
            )}
          </article>

          <article className={`${glass} relative overflow-hidden p-4 sm:p-5`}>
            <GlassReflection />

            <div className="relative flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-white sm:text-xl">
                  Courses
                </h2>
                <p className={`mt-1 text-xs ${muted}`}>
                  Continue your learning
                </p>
              </div>

              <Link
                href="/courses"
                aria-label="View all courses"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.16] bg-transparent text-white transition hover:border-[#61C5FA]/50 hover:bg-white/[0.04]"
              >
                <ArrowUpRight size={18} />
              </Link>
            </div>

            {loading ? (
              <div className="relative mt-3 space-y-2">
                {[1, 2].map((item) => (
                  <div
                    key={item}
                    className="h-12 animate-pulse rounded-xl border border-white/[0.08] bg-transparent"
                  />
                ))}
              </div>
            ) : courses.length > 0 ? (
              <div className="relative mt-3 space-y-1">
                {courses.slice(0, 3).map((course, index) => {
                  const id = course.id ?? course._id;
                  const title =
                    course.title ?? course.name ?? "Untitled course";

                  const colors = ["#61C5FA", "#2684FF", "#A78BFA"];

                  return (
                    <Link
                      key={id ?? `${title}-${index}`}
                      href={id ? `/courses/${id}` : "/courses"}
                      className="flex min-w-0 items-center gap-3 rounded-xl border border-transparent px-2 py-2 transition hover:border-white/[0.10] hover:bg-white/[0.035]"
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.12] bg-transparent"
                        style={{ color: colors[index % colors.length] }}
                      >
                        <BookOpen size={18} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-medium text-white sm:text-sm">
                          {title}
                        </span>
                        <span className={`mt-1 block text-[10px] ${muted}`}>
                          Updated{" "}
                          {formatDate(course.updatedAt ?? course.createdAt)}
                        </span>
                      </span>

                      <ChevronRight
                        size={15}
                        className="shrink-0 text-white/65"
                      />
                    </Link>
                  );
                })}
              </div>
            ) : (
              <EmptyState
                icon={<BookOpen size={23} />}
                title="No courses yet"
                description="Create your first personalized learning path."
              />
            )}

            <Link
              href="/courses/create"
              className="relative mt-2 inline-flex items-center gap-2 text-xs font-semibold text-[#61C5FA] transition hover:text-white"
            >
              <Plus size={14} />
              Create a course
            </Link>

            <Link
              href="/courses"
              className="relative mt-2 flex items-center justify-between border-t border-white/[0.10] pt-2.5 text-xs font-medium text-white/85 transition hover:text-[#61C5FA]"
            >
              View all courses
              <ChevronRight size={14} />
            </Link>
          </article>
        </section>

        {/* Time Tracker */}
        <section className="mt-3">
          <article className="relative overflow-hidden rounded-[22px] border border-white/[0.12] bg-transparent p-4 backdrop-blur-xl sm:px-5 sm:py-4">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-[#2684FF]/[0.025]"
            />

            <div className="relative flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#61C5FA]/20 bg-transparent text-[#61C5FA]">
                  <Timer size={20} />
                </span>

                <div>
                  <h2 className="text-base font-semibold text-white sm:text-lg">
                    Time Tracker
                  </h2>
                  <p className={`mt-0.5 text-xs ${muted}`}>
                    Focus session
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                <div>
                  <p className="font-mono text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                    {formatDuration(elapsedSeconds)}
                  </p>
                  <p className={`mt-0.5 text-[11px] ${muted}`}>
                    {timerRunning
                      ? "Focus session running"
                      : elapsedSeconds > 0
                        ? "Session paused"
                        : "Ready when you are"}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTimerRunning((running) => !running)}
                    aria-label={timerRunning ? "Pause timer" : "Start timer"}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#61C5FA]/35 bg-transparent text-[#61C5FA] transition hover:bg-[#2684FF]/10"
                  >
                    {timerRunning ? (
                      <Pause size={17} />
                    ) : (
                      <Play size={17} />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTimerRunning(false);
                      setElapsedSeconds(0);
                    }}
                    aria-label="Reset timer"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.15] bg-transparent text-white transition hover:border-[#61C5FA]/40 hover:text-[#61C5FA]"
                  >
                    <RotateCcw size={16} />
                  </button>
                </div>
              </div>
            </div>
          </article>
        </section>

        <footer
          className={`mt-4 flex flex-col gap-1.5 border-t border-white/[0.12] pt-3 text-[10px] ${muted} sm:flex-row sm:items-center sm:justify-between`}
        >
          <p>LearnAI · Your personal learning workspace</p>
          <p className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#61C5FA]" />
            Keep learning. Keep growing.
          </p>
        </footer>
      </div>

      {/* Course selector modal */}
      {coursePickerOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-[#020305]/70 p-4 backdrop-blur-md"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setCoursePickerOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="course-picker-title"
            className="w-full max-w-md rounded-3xl border border-white/[0.16] bg-[#07152C]/65 p-5 shadow-[0_25px_90px_rgba(0,0,0,0.35)] backdrop-blur-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="course-picker-title"
                  className="text-xl font-semibold text-white"
                >
                  Select course
                </h2>
                <p className={`mt-1 text-sm ${muted}`}>
                  Choose which course progress to display.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setCoursePickerOpen(false)}
                aria-label="Close course selector"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/[0.15] text-white transition hover:bg-white/[0.06]"
              >
                ×
              </button>
            </div>

            {courses.length > 0 ? (
              <div className="mt-4 max-h-[55vh] space-y-2 overflow-y-auto">
                {courses.map((course, index) => {
                  const id =
                    course.id ??
                    course._id ??
                    `${course.title ?? course.name ?? "course"}-${index}`;

                  const selected =
                    (course.id ?? course._id ?? "") === selectedCourseId;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        setSelectedCourseId(course.id ?? course._id ?? "");
                        setCoursePickerOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        selected
                          ? "border-[#61C5FA]/45 bg-[#2684FF]/10"
                          : "border-white/[0.10] bg-transparent hover:border-white/25 hover:bg-white/[0.035]"
                      }`}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#61C5FA]/20 bg-transparent text-[#61C5FA]">
                        <BookOpen size={18} />
                      </span>

                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold text-white">
                          {course.title ?? course.name ?? "Untitled course"}
                        </span>
                        <span className={`mt-1 block text-xs ${muted}`}>
                          {courseProgress(course)}% complete
                        </span>
                      </span>

                      {selected && (
                        <CheckCircle2
                          size={18}
                          className="shrink-0 text-[#61C5FA]"
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-sm text-white">
                  You do not have any courses to select yet.
                </p>

                <Link
                  href="/courses/create"
                  onClick={() => setCoursePickerOpen(false)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#61C5FA]/30 bg-transparent px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2684FF]/10"
                >
                  <Plus size={15} />
                  Create a course
                </Link>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}

function GlassReflection() {
  return (
    <>
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-white/[0.025] via-transparent to-[#2684FF]/[0.025]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-[#2684FF]/[0.04] blur-3xl"
      />
    </>
  );
}

function MetricCard({
  label,
  value,
  note,
  icon,
  color,
  featured = false,
}: {
  label: string;
  value: string | number;
  note: string;
  icon: React.ReactNode;
  color: "cyan" | "purple" | "blue";
  featured?: boolean;
}) {
  const styles = {
    cyan: {
      icon: "border-[#61C5FA]/25 text-[#8EDAFF]",
      dot: "bg-[#61C5FA]",
    },
    purple: {
      icon: "border-[#A78BFA]/25 text-[#C4B5FD]",
      dot: "bg-[#A78BFA]",
    },
    blue: {
      icon: "border-[#61C5FA]/25 text-[#8EDAFF]",
      dot: "bg-[#2684FF]",
    },
  };

  const style = styles[color];

  return (
    <article
      className={`relative min-w-0 overflow-hidden rounded-[20px] border border-white/[0.12] bg-transparent p-3 backdrop-blur-xl backdrop-saturate-150 shadow-[0_6px_24px_rgba(0,0,0,0.08)] sm:p-4 ${
        featured ? "border-[#61C5FA]/25" : ""
      }`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.025] via-transparent to-[#2684FF]/[0.025]"
      />

      <div className="relative flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-medium text-white sm:text-sm">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            {value}
          </p>
        </div>

        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-transparent sm:h-9 sm:w-9 ${style.icon}`}
        >
          {icon}
        </span>
      </div>

      <p className={`relative mt-2 flex items-center gap-2 text-[10px] ${muted}`}>
        <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
        {note}
      </p>
    </article>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="relative flex flex-col items-center py-6 text-center">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#61C5FA]/20 bg-transparent text-[#61C5FA]">
        {icon}
      </span>

      <p className="mt-2 text-sm font-medium text-white">{title}</p>

      <p className={`mx-auto mt-1 max-w-[240px] text-xs leading-5 ${muted}`}>
        {description}
      </p>
    </div>
  );
}
