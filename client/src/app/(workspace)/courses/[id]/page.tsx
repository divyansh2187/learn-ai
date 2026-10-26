
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
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
      <main className="min-h-screen bg-[#09030E] p-8 text-white">
        Loading your course...
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen bg-[#09030E] p-8 text-white">
        <p className="text-red-400">
          {error || "Course not found"}
        </p>

        <Link
          href="/dashboard"
          className="mt-4 inline-block text-[#D934F7]"
        >
          ← Back to dashboard
        </Link>

        <div>
          <Link
            href="/courses/create"
            className="mt-3 inline-block text-[#A69BAC] hover:text-white"
          >
            Create another course →
          </Link>
        </div>
      </main>
    );
  }

  const totalLessons = course.modules.reduce(
    (total, module) => total + module.lessons.length,
    0,
  );

  return (
    <main className="min-h-screen bg-[#09030E] px-5 py-10 text-white sm:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/dashboard"
          className="text-sm text-[#A69BAC] hover:text-white"
        >
          ← Back to dashboard
        </Link>

        <section className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6 sm:p-10">
          <div className="mb-5 flex flex-wrap gap-3">
            <span className="rounded-full bg-[#D934F7]/15 px-3 py-1 text-xs text-[#E66AFF]">
              {course.difficulty}
            </span>

            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#A69BAC]">
              {course.modules.length} modules
            </span>

            <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-[#A69BAC]">
              {totalLessons} lessons
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">
            {course.title}
          </h1>

          {course.subtitle && (
            <p className="mt-4 text-lg text-[#D934F7]">
              {course.subtitle}
            </p>
          )}

          {course.description && (
            <p className="mt-4 max-w-3xl leading-7 text-[#A69BAC]">
              {course.description}
            </p>
          )}

          <div className="mt-6 text-sm text-[#A69BAC]">
            Estimated learning time:{" "}
            {Math.floor(course.estimatedMinutes / 60)} hours{" "}
            {course.estimatedMinutes % 60} minutes
          </div>
        </section>

        <section className="mt-10">
          <h2 className="mb-5 text-2xl font-semibold">
            Your learning path
          </h2>

          <div className="space-y-5">
            {course.modules.map((module, index) => (
              <article
                key={module.id}
                className="rounded-2xl border border-white/10 bg-[#140B1B] p-5 sm:p-7"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D934F7]/15 font-semibold text-[#E66AFF]">
                    {index + 1}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold">
                      {module.title}
                    </h3>

                    {module.description && (
                      <p className="mt-2 text-sm leading-6 text-[#A69BAC]">
                        {module.description}
                      </p>
                    )}

                    <p className="mt-2 text-xs text-[#A69BAC]">
                      {module.lessons.length} lessons ·{" "}
                      {module.estimatedMinutes} minutes
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {module.lessons.map((lesson, lessonIndex) => (
                    <Link
                      key={lesson.id}
                      href={`/courses/${course.id}/lessons/${lesson.id}`}
                      className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4 transition-all duration-200 hover:border-[#D934F7]/50 hover:bg-[#D934F7]/[0.07]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.06] text-sm text-[#A69BAC]">
                        {lessonIndex + 1}
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">
                          {lesson.title}
                        </p>

                        <p className="mt-1 text-xs text-[#A69BAC]">
                          {lesson.estimatedMinutes} min
                        </p>
                      </div>

                      <span className="text-[#D934F7]">→</span>
                    </Link>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
