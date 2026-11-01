
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Layers3,
  Play,
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Lesson {
  id: string;
  title: string;
  estimatedMinutes: number;
  explanation?: string | null;
}

interface Module {
  id: string;
  title: string;
  description?: string | null;
  estimatedMinutes: number;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  difficulty: string;
  estimatedMinutes: number;
  modules: Module[];
}

const glass =
  "rounded-[22px] border border-white/[0.18] bg-white/[0.07] backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-1 ring-inset ring-white/[0.04]";

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (hours === 0) return `${remaining} minutes`;
  if (remaining === 0) return `${hours} hours`;

  return `${hours}h ${remaining}m`;
}

export default function CourseDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCourse() {
      setLoading(true);
      setError("");

      try {
        const response = await apiFetch(
          `/courses/${encodeURIComponent(params.id)}`,
          {
            method: "GET",
            cache: "no-store",
          },
        );

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        if (response.status === 403) {
          throw new Error(
            "You don't have permission to access this course.",
          );
        }

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || "Could not load course");
        }

        if (!cancelled) {
          setCourse(result.data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Something went wrong while loading your course.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (params.id) {
      fetchCourse();
    }

    return () => {
      cancelled = true;
    };
  }, [params.id, router]);

  if (loading) {
    return (
      <main className="min-h-screen px-5 py-10 text-white sm:px-10">
        <div className="mx-auto w-full max-w-none">
          <div className={`${glass} animate-pulse p-8`}>
            <div className="h-3 w-28 rounded bg-white/10" />
            <div className="mt-7 h-9 w-2/3 rounded-lg bg-white/10" />
            <div className="mt-4 h-4 w-1/2 rounded bg-white/10" />
            <div className="mt-8 h-20 rounded-xl bg-white/10" />
          </div>

          <p className="mt-5 text-sm text-[#F1F5F9]">
            Loading your learning path...
          </p>
        </div>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen px-5 py-10 text-white sm:px-10">
        <div className={`${glass} mx-auto max-w-2xl p-8`}>
          <h1 className="text-xl font-semibold">
            Unable to open course
          </h1>

          <p className="mt-3 text-sm text-red-300">
            {error || "Course not found"}
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#2684FF] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#377FE4]"
          >
            <ArrowLeft size={16} />
            Back to dashboard
          </Link>

          <div>
            <Link
              href="/courses/create"
              className="mt-4 inline-block text-sm text-[#F1F5F9] transition hover:text-white"
            >
              Create another course →
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  const totalModules = course.modules.length;

  return (
    <main className="relative isolate min-h-screen overflow-hidden px-4 py-6 text-white sm:px-7 sm:py-9">
      {/* Background lighting */}

      <div className="mx-auto w-full max-w-none">

        {/* TOP NAVIGATION */}
        <div className="flex items-center justify-between">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm text-[#F1F5F9] transition hover:text-white"
          >
            <ArrowLeft size={16} />
            Back to My Courses
          </Link>

         
         
        </div>

        {/* COURSE OVERVIEW */}
        <section className={`${glass} relative mt-8 overflow-hidden p-6 sm:p-9`}>
          {/* Glass reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/[0.04] bg-gradient-to-br from-white/[0.07] via-transparent to-sky-300/[0.04]"
          />

          <div className="relative z-10">

         

            {/* TITLE */}
            <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
              {course.title}
            </h1>

            {course.subtitle && (
              <p className="mt-4 max-w-2xl text-base leading-7 font-semibold text-[#DDF4FF]">
                {course.subtitle}
              </p>
            )}

            {course.description && (
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-[#F1F5F9]">
                {course.description}
              </p>
            )}

            {/* COURSE STATISTICS */}
            <div className="mt-8 grid grid-cols-1 gap-3 border-t border-white/10 pt-6 sm:grid-cols-3">

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2684FF]/15 text-[#BDEAFF]">
                  <Layers3 size={19} />
                </div>

                <div>
                  <p className="text-lg font-semibold text-white">
                    {totalModules}
                  </p>
                  <p className="text-xs font-medium text-[#F1F5F9]">
                    Learning modules
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2684FF]/15 text-[#BDEAFF]">
                  <BookOpen size={19} />
                </div>

                <div>
                  <p className="text-lg font-semibold text-white">
                    {totalLessons}
                  </p>
                  <p className="text-xs font-medium text-[#F1F5F9]">
                    Total lessons
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2684FF]/15 text-[#BDEAFF]">
                  <Clock3 size={19} />
                </div>

                <div>
                  <p className="text-lg font-semibold text-white">
                    {formatDuration(course.estimatedMinutes)}
                  </p>
                  <p className="text-xs font-medium text-[#F1F5F9]">
                    Estimated duration
                  </p>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* LEARNING PATH */}
        <section className="mt-10">

          <div className="mb-6 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#61C5FA]">
                Course curriculum
              </p>

              <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">
                Your learning path
              </h2>

              <p className="mt-1 text-xs text-[#F1F5F9]">
                Follow each module and progress through your course.
              </p>
            </div>

            <span className="hidden text-xs text-[#F1F5F9] sm:block">
              {totalModules} sections
            </span>
          </div>

          {/* MODULES */}
          <div className="space-y-4">
            {course.modules.map((module, index) => (
              <article
                key={module.id}
                className={`${glass} relative overflow-hidden p-5 transition duration-200 hover:border-white/[0.24] sm:p-6`}
              >
                {/* Glass reflection */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/[0.04] bg-gradient-to-br from-white/[0.06] via-transparent to-sky-300/[0.03]"
                />

                <div className="relative z-10">

                  {/* MODULE HEADER */}
                  <div className="flex items-start gap-4">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#61C5FA]/20 bg-[#2684FF]/10 text-sm font-semibold text-[#BDEAFF]">
                      {String(index + 1).padStart(2, "0")}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="text-base font-semibold text-white sm:text-lg">
                        {module.title}
                      </h3>

                      {module.description && (
                        <p className="mt-2 text-sm font-medium leading-6 text-[#F1F5F9]">
                          {module.description}
                        </p>
                      )}

                      <p className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-[#F1F5F9]">
                        <span className="inline-flex items-center gap-1.5">
                          <BookOpen size={13} />
                          {module.lessons.length} lessons
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 size={13} />
                          {formatDuration(module.estimatedMinutes)}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* LESSON LIST */}
                  <div className="mt-5 border-t border-white/[0.08] pt-3">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <Link
                        key={lesson.id}
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className="group flex items-center gap-3 rounded-xl px-3 py-3.5 transition duration-200 hover:bg-[#D1E0F1] hover:shadow-sm"
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.08] text-xs font-semibold text-[#F1F5F9] transition group-hover:bg-white/70 group-hover:text-black">
                          {String(lessonIndex + 1).padStart(2, "0")}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-white transition group-hover:text-black">
                            {lesson.title}
                          </p>

                          <p className="mt-1 text-xs font-medium text-[#E2E8F0] transition-colors group-hover:text-black">
                            {lesson.estimatedMinutes} min
                          </p>
                        </div>

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/[0.12] text-[#CBD5E1] transition group-hover:border-black/15 group-hover:bg-white/70 group-hover:text-black">
                          <ArrowRight size={15} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* BOTTOM NAVIGATION */}
        <div className="mt-10 border-t border-white/[0.08] py-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-[#F1F5F9] transition hover:text-white"
          >
            <ArrowLeft size={15} />
            Back to My Courses
          </Link>
        </div>

      </div>
    </main>
  );
}
