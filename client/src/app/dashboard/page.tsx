"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

type Course = {
  id?: string;
  _id?: string;
  title?: string;
  name?: string;
  description?: string;
  progress?: number;
  progressPercent?: number;
  totalLessons?: number;
  completedLessons?: number;
  nextLesson?: {
    id?: string;
    title?: string;
    name?: string;
  } | null;
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



function getNumber(value: unknown): number {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function formatDate(value?: string) {
  if (!value) return "Recently";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Recently";
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

export default function DashboardPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDashboard() {
      try {
       const response = await apiFetch("/dashboard/overview", {
  method: "GET",
  cache: "no-store",
});

        const result = await response.json();

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Unable to load your dashboard.");
        }

        if (active) {
          setDashboard(result.data ?? result);
        }
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

  async function handleLogout() {
    setLoggingOut(true);

    try {
     await apiFetch("/auth/logout", {
  method: "POST",
});
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  const stats = dashboard?.stats ?? {};
  const courses = dashboard?.courses ?? dashboard?.recentCourses ?? [];
  const quizzes =
    dashboard?.recentQuizAttempts ?? dashboard?.recentQuizzes ?? [];

  const totalCourses = getNumber(stats.totalCourses ?? stats.courseCount);
  const completedLessons = getNumber(
    stats.completedLessons ?? stats.lessonsCompleted,
  );
  const studyStreak = getNumber(stats.studyStreak ?? stats.streak);
  const averageScore = getNumber(stats.averageQuizScore ?? stats.averageScore);

  return (
    <main className="min-h-screen bg-[#09030E] text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col border-r border-white/[0.08] bg-[#0D0612] px-5 py-7 lg:flex">
          <Link href="/" className="flex items-center gap-3 px-2">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D934F7] text-xl font-bold text-black">
              L
            </span>
            <span className="text-xl font-semibold">
              Learn<span className="text-[#D934F7]">AI</span>
            </span>
          </Link>

          <p className="mb-3 mt-12 px-3 text-[10px] font-semibold tracking-[0.2em] text-[#75667C]">
            WORKSPACE
          </p>

          <nav className="space-y-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 rounded-xl border border-[#D934F7]/20 bg-[#D934F7]/10 px-4 py-3 text-sm text-white"
            >
              <span className="text-[#D934F7]">▦</span>
              Dashboard
            </Link>
            <Link
              href="/courses"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#A69BAC] transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>▤</span>
              My courses
            </Link>
            <Link
              href="/courses/create"
              className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-[#A69BAC] transition hover:bg-white/[0.04] hover:text-white"
            >
              <span>✳</span>
              Create a course
            </Link>
          </nav>

          <div className="mt-auto rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#BCF429]/10 text-[#BCF429]">
              ✦
            </div>
            <p className="mt-4 text-sm font-medium">Keep showing up.</p>
            <p className="mt-2 text-xs leading-5 text-[#897A91]">
              Small learning sessions can build lasting skills.
            </p>
            <Link
              href="/courses/create"
              className="mt-4 inline-flex text-xs font-semibold text-[#D934F7] hover:text-white"
            >
              Create a course ↗
            </Link>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5 sm:px-8 lg:px-10">
            <div className="flex items-center gap-3 lg:hidden">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D934F7] font-bold text-black">
                L
              </span>
              <span className="font-semibold">
                Learn<span className="text-[#D934F7]">AI</span>
              </span>
            </div>

            <div className="hidden lg:block">
              <p className="text-sm text-[#897A91]">Your workspace</p>
              <p className="mt-1 text-xs text-[#75667C]">
                Learn at your own pace.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/courses/create"
                className="rounded-full bg-[#BCF429] px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-[#D4FF61] sm:px-5 sm:text-sm"
              >
                <span className="mr-1">+</span> New course
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="rounded-full border border-white/10 px-3 py-2.5 text-xs text-[#A69BAC] transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50 sm:px-4 sm:text-sm"
              >
                {loggingOut ? "Signing out…" : "Log out"}
              </button>
            </div>
          </header>

          <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1D0C27] via-[#13091A] to-[#0E0712] p-6 sm:p-9">
              <div className="pointer-events-none absolute -right-10 -top-28 h-64 w-64 rounded-full bg-[#D934F7]/15 blur-[90px]" />

              <div className="relative max-w-2xl">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#BCF429]">
                  YOUR LEARNING SPACE
                </p>
                <h1 className="mt-4 text-3xl font-medium tracking-tight sm:text-4xl">
                  Make today count.
                </h1>
                <p className="mt-3 max-w-lg text-sm leading-7 text-[#A69BAC]">
                  Your next skill starts with one lesson. Continue a course or
                  create a new learning path with AI.
                </p>
                <Link
                  href="/courses/create"
                  className="mt-6 inline-flex items-center gap-3 rounded-full bg-[#D934F7] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#E66AFF]"
                >
                  Create with AI <span>↗</span>
                </Link>
              </div>
            </div>

            <div className="mt-9 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
              <div>
                <h2 className="text-xl font-medium">Your overview</h2>
                <p className="mt-2 text-sm text-[#897A91]">
                  A snapshot of your learning activity.
                </p>
              </div>
              <span className="text-xs text-[#75667C]">
                Synced from your account
              </span>
            </div>

            {error && (
              <div
                role="alert"
                className="mt-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-5"
              >
                <p className="text-sm font-medium text-red-300">
                  Could not load your dashboard
                </p>
                <p className="mt-2 text-sm leading-6 text-[#A69BAC]">{error}</p>
                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 text-sm font-medium text-[#D934F7] hover:text-white"
                >
                  Try again ↻
                </button>
              </div>
            )}

            {loading ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-32 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.025]"
                  />
                ))}
              </div>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  {
                    label: "Total courses",
                    value: totalCourses,
                    icon: "▤",
                    color: "#D934F7",
                  },
                  {
                    label: "Lessons completed",
                    value: completedLessons,
                    icon: "✓",
                    color: "#BCF429",
                  },
                  {
                    label: "Learning streak",
                    value: `${studyStreak} days`,
                    icon: "↗",
                    color: "#E4A1F4",
                  },
                  {
                    label: "Average quiz score",
                    value: `${averageScore}%`,
                    icon: "%",
                    color: "#BCF429",
                  },
                ].map((stat) => (
                  <article
                    key={stat.label}
                    className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 transition hover:border-white/[0.16]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-[#A69BAC]">{stat.label}</p>
                      <span
                        className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-sm"
                        style={{ color: stat.color }}
                      >
                        {stat.icon}
                      </span>
                    </div>
                    <p className="mt-5 text-3xl font-medium tracking-tight">
                      {stat.value}
                    </p>
                  </article>
                ))}
              </div>
            )}

            <div className="mt-10 grid gap-8 xl:grid-cols-[1.4fr_0.8fr]">
              <section>
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-medium">Continue learning</h2>
                    <p className="mt-2 text-sm text-[#897A91]">
                      Pick up where you left off.
                    </p>
                  </div>
                  <Link
                    href="/courses"
                    className="shrink-0 text-xs text-[#D934F7] hover:text-white"
                  >
                    All courses ↗
                  </Link>
                </div>

                {loading ? (
                  <div className="mt-5 h-52 animate-pulse rounded-2xl border border-white/[0.08] bg-white/[0.025]" />
                ) : courses.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {courses.map((course, index) => {
                      const progress = Math.min(
                        100,
                        Math.max(
                          0,
                          getNumber(course.progressPercent ?? course.progress),
                        ),
                      );

                      const courseId = course.id ?? course._id;
                      const title =
                        course.title ?? course.name ?? "Untitled course";

                      return (
                        <article
                          key={courseId ?? `${title}-${index}`}
                          className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D934F7]/20 to-[#7E078E]/20 text-xl text-[#E4A1F4]">
                              ◈
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-medium">{title}</h3>
                              <p className="mt-2 text-xs leading-5 text-[#897A91]">
                                {course.nextLesson?.title ??
                                  course.nextLesson?.name ??
                                  course.description ??
                                  "Continue your learning journey"}
                              </p>
                            </div>
                          </div>

                          <div className="mt-6 flex items-center justify-between text-xs">
                            <span className="text-[#897A91]">Progress</span>
                            <span className="text-[#BCF429]">{progress}%</span>
                          </div>
                          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-[#D934F7] to-[#BCF429] transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>

                          <Link
                            href={
                              courseId ? `/courses/${courseId}` : "/courses"
                            }
                            className="mt-5 inline-flex text-sm font-medium text-[#D934F7] hover:text-white"
                          >
                            Continue course ↗
                          </Link>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-5 rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D934F7]/10 text-xl text-[#D934F7]">
                      ✳
                    </div>
                    <h3 className="mt-4 font-medium">
                      Your next course starts here
                    </h3>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#897A91]">
                      Create a personalized course and it will appear here when
                      the dashboard API returns it.
                    </p>
                    <Link
                      href="/courses/create"
                      className="mt-5 inline-flex rounded-full bg-[#D934F7] px-5 py-3 text-sm font-semibold text-black hover:bg-[#E66AFF]"
                    >
                      Create your first course ↗
                    </Link>
                  </div>
                )}
              </section>

              <section>
                <div>
                  <h2 className="text-xl font-medium">Recent quizzes</h2>
                  <p className="mt-2 text-sm text-[#897A91]">
                    Review your latest results.
                  </p>
                </div>

                <div className="mt-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  {loading ? (
                    <div className="h-32 animate-pulse rounded-xl bg-white/[0.04]" />
                  ) : quizzes.length > 0 ? (
                    <div className="space-y-5">
                      {quizzes.slice(0, 5).map((quiz, index) => {
                        const quizScore = getNumber(
                          quiz.percentage ?? quiz.score,
                        );
                        const quizTitle =
                          quiz.title ?? quiz.quizTitle ?? "Quiz attempt";

                        return (
                          <div
                            key={quiz.id ?? quiz._id ?? `${quizTitle}-${index}`}
                            className="flex items-center gap-3"
                          >
                            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#BCF429]/10 text-[#BCF429]">
                              ✓
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {quizTitle}
                              </p>
                              <p className="mt-1 text-xs text-[#897A91]">
                                {formatDate(quiz.createdAt)}
                              </p>
                            </div>
                            <span className="text-sm font-medium text-[#BCF429]">
                              {quizScore}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-7 text-center">
                      <span className="text-2xl text-[#897A91]">◎</span>
                      <p className="mt-3 text-sm font-medium">
                        No quiz attempts yet
                      </p>
                      <p className="mt-2 text-xs leading-5 text-[#897A91]">
                        Your results will show up here when available.
                      </p>
                    </div>
                  )}
                </div>

                <div className="mt-5 rounded-2xl border border-[#7E078E]/25 bg-[#7E078E]/10 p-5">
                  <p className="text-sm font-medium">
                    A little progress adds up.
                  </p>
                  <p className="mt-2 text-xs leading-6 text-[#A69BAC]">
                    Set aside a little time today to learn something new.
                  </p>
                </div>
              </section>
            </div>

            <footer className="mt-12 border-t border-white/[0.08] pt-6 text-xs text-[#75667C]">
              LearnAI · Your personal learning workspace
            </footer>
          </div>
        </section>
      </div>
    </main>
  );
}
