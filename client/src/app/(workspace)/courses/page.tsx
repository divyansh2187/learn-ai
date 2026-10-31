
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  BookOpen,
  CheckCircle2,
  Clock3,
  GraduationCap,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import "@/app/globals.css";

type Course = {
  id: string;
  title: string;
  subtitle?: string | null;
  description?: string | null;
  thumbnail?: string | null;
  category?: string | null;
  difficulty?: string;
  estimatedMinutes?: number | null;
  durationLabel?: string | null;
  createdAt?: string;
  updatedAt?: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  courseType: "Generated" | "Enrolled";
};

type MyCoursesData = {
  generated: Omit<Course, "courseType">[];
  enrolled: Omit<Course, "courseType">[];
  totalGenerated: number;
  totalEnrolled: number;
  totalCourses: number;
};

const muted = "text-[#A9BAD3]";

const glass =
  "rounded-[22px] border border-white/[0.16] " +
  "bg-[#1B2738]/80 backdrop-blur-xl " +
  "shadow-[0_8px_32px_rgba(0,0,0,0.20)]";

function getCourseImage(course: Course) {
  if (course.thumbnail) return course.thumbnail;

  const text = `${course.title} ${course.category ?? ""}`.toLowerCase();

  if (
    text.includes("devops") ||
    text.includes("docker") ||
    text.includes("kubernetes") ||
    text.includes("cloud")
  ) {
    return "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?auto=format&fit=crop&w=900&q=85";
  }

  if (
    text.includes("html") ||
    text.includes("web") ||
    text.includes("javascript") ||
    text.includes("programming")
  ) {
    return "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85";
  }

  if (
    text.includes("graphic") ||
    text.includes("design") ||
    text.includes("figma") ||
    text.includes("ui/ux")
  ) {
    return "https://images.unsplash.com/photo-1558655146-d09347e92766?auto=format&fit=crop&w=900&q=85";
  }

  if (text.includes("animation") || text.includes("video")) {
    return "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=900&q=85";
  }

  return "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=85";
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

function formatDuration(minutes?: number | null) {
  if (!minutes) return null;

  const hours = Math.floor(minutes / 60);
  const remaining = minutes % 60;

  if (!hours) return `${remaining} min`;

  return remaining ? `${hours}h ${remaining}m` : `${hours}h`;
}

function getProgress(value: number) {
  return Math.min(100, Math.max(0, Number(value) || 0));
}

export default function MyCoursesPage() {
  const router = useRouter();

  const [data, setData] = useState<MyCoursesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        setLoading(true);
        setError("");

        const response = await apiFetch("/courses/my-courses", {
          method: "GET",
          cache: "no-store",
        });

        const result = await response.json();

        if (response.status === 401 || response.status === 403) {
          router.replace("/login");
          return;
        }

        if (!response.ok || result.success === false) {
          throw new Error(result.message || "Unable to load your courses.");
        }

        if (active) {
          setData(result.data ?? result);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not connect to the server."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, [router]);

  const allCourses = useMemo(() => {
    const generated = (data?.generated ?? []).map((course) => ({
      ...course,
      courseType: "Generated" as const,
    }));

    const enrolled = (data?.enrolled ?? []).map((course) => ({
      ...course,
      courseType: "Enrolled" as const,
    }));

    return [...generated, ...enrolled];
  }, [data]);

  const filteredCourses = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return allCourses;

    return allCourses.filter((course) =>
      [
        course.title,
        course.subtitle ?? "",
        course.description ?? "",
        course.category ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [allCourses, search]);

  return (
    <main className="relative isolate min-h-screen overflow-x-clip px-3 py-4 text-white sm:px-5 sm:py-6 lg:px-7">
      {/* Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 opacity-30"
        style={{
          backgroundImage: `
            linear-gradient(rgba(120,164,211,0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120,164,211,0.08) 1px, transparent 1px)
          `,
          backgroundSize: "36px 36px",
        }}
      />

      <div className="mx-auto max-w-[1500px]">
        {/* HEADER */}
        <header className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <p className="text-lg font-semibold tracking-tight">
              Hello there! <span>👋</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`${glass} flex h-11 min-w-0 flex-1 items-center gap-2.5 px-3 sm:w-[280px] sm:flex-none`}
            >
              <Search size={17} className="shrink-0 text-[#61C5FA]" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search anything here..."
                className="w-full min-w-0 bg-transparent text-xs text-white outline-none placeholder:text-[#A9BAD3]/65"
              />
            </div>
          </div>
        </header>

        {/* HERO BANNER */}
        <section className="relative mb-8 min-h-[175px] overflow-hidden rounded-[24px] border border-white/15 bg-gradient-to-br from-[#1135CC] via-[#377FE4] to-[#77C2F7] shadow-[0_15px_45px_rgba(0,0,0,0.25)] sm:min-h-[195px]">
          <div className="relative z-10 flex min-h-[175px] flex-col justify-top p-5 sm:min-h-[195px] sm:p-8">
            <h2 className="max-w-xl text-xl font-bold leading-tight tracking-tight text-white sm:text-3xl">
              The right course can change your <p className="font-thin text-7xl">FUTURE</p>
            </h2>

            {/* <p className="mt-2 max-w-md text-xs leading-5 text-[#D2E8FF]/80 sm:text-sm">
              Explore your learning paths, build new skills and make progress
              every day.
            </p> */}
          </div>
        </section>

        {/* COURSE HEADING */}
        <section className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight sm:text-xl">
              Your Courses
            </h2>

            <p className={`mt-1 text-[11px] ${muted}`}>
              Continue where you left off.
            </p>
          </div>

          <span className="text-xs font-medium text-[#61C5FA]">
            {loading ? "Loading..." : `All Courses (${allCourses.length})`}
          </span>
        </section>

        {/* ERROR */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-white">
            {error}
          </div>
        )}

        {/* COURSE CARDS */}
        {loading ? (
          <div className="min-w-0 rounded-[22px] border border-white/[0.12] bg-[#101722]/80 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.20)]">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className={`${glass} h-[340px] animate-pulse`}
              />
            ))}
          </div>
        ) : filteredCourses.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-[repeat(auto-fill,minmax(280px,330px))]">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <div
            className={`${glass} flex flex-col items-center justify-center px-5 py-14 text-center`}
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#61C5FA]/20 bg-[#2684FF]/10 text-[#61C5FA]">
              <BookOpen size={27} />
            </div>

            <h3 className="mt-4 text-base font-semibold">
              {search
                ? "No courses found"
                : "Your learning journey starts here"}
            </h3>

            <p className={`mt-2 max-w-sm text-xs leading-5 ${muted}`}>
              {search
                ? "Try searching with a different course name."
                : "Create your first personalized course and start learning today."}
            </p>

            {!search && (
              <Link
                href="/courses/create"
                className="group relative flex min-h-[500px] w-full max-w-[330px] min-w-0 flex-col overflow-hidden rounded-[26px] border border-white/[0.12] bg-[#10111B] p-4 shadow-[0_12px_40px_rgba(0,0,0,0.45)] transition duration-300 hover:-translate-y-1 hover:border-white/20"
              >
                <Plus size={15} />
                Create your first course
              </Link>
            )}
          </div>
        )}

        {/* FOOTER */}
        <footer
          className={`mt-8 border-t border-white/[0.10] py-4 text-center text-[10px] ${muted}`}
        >
          LearnAI · Learn smarter. Grow faster.
        </footer>
      </div>
    </main>
  );
}

function CourseCard({ course }: { course: Course }) {
  const progress = getProgress(course.progressPercent);
  const duration = formatDuration(course.estimatedMinutes);

  return (
    <Link
      href={`/courses/${course.id}`}
      aria-label={`Open ${course.title}`}
      className="group/card relative block w-full min-w-0 [perspective:1200px]"
    >
      {/* FLIP CONTAINER */}
      <div className="relative w-full [transform-style:preserve-3d] transition-transform duration-700 ease-in-out group-hover/card:[transform:rotateY(180deg)] group-focus-visible/card:[transform:rotateY(180deg)]">

        {/* FRONT SIDE - THIS SIDE DEFINES THE CARD SIZE */}
        <div className="relative flex min-w-0 flex-col overflow-hidden rounded-[22px] border border-white/[0.16] bg-[#101722]/55 p-4 shadow-[0_12px_35px_rgba(0,0,0,0.4)] backdrop-blur-xl [backface-visibility:hidden]">

          {/* BLUE GLOW */}
          <div className="pointer-events-none absolute -bottom-8 left-1/2 h-24 w-[85%] -translate-x-1/2 rounded-full bg-[#2684FF]/60 blur-[45px]" />

          {/* COURSE IMAGE */}
          <div className="relative h-[200px] shrink-0 overflow-hidden rounded-[16px] border border-white/[0.12] bg-[#171827]">
            <img
              src={getCourseImage(course)}
              alt={course.title}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover/card:scale-105"
            />

            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-[#11111B]/40" />
          </div>

          {/* COURSE CONTENT */}
          <div className="relative z-10 flex flex-1 flex-col px-1.5 pb-1 pt-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-[#f7f6fa]">
              {course.title}
            </h3>

            {/* PROGRESS */}
            <div className="mt-5">
              <div className="mb-1 flex items-center justify-between text-[9px] text-white/55">
                <span>Course progress</span>
                <span>{progress}%</span>
              </div>

              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2684FF] to-[#61C5FA]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* BUTTON */}
            <div className="mt-5 inline-flex w-fit items-center rounded-full bg-[#F2EFFF] px-6 py-2.5 text-[11px] font-semibold text-[#171322] transition group-hover/card:bg-white">
              Learn more
            </div>
          </div>
        </div>

        {/* BACK SIDE - ABSOLUTE, SO IT CANNOT CHANGE THE CARD HEIGHT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden rounded-[22px] border border-[#60A5FA]/40 bg-[#07152C] p-4 shadow-[0_0_30px_rgba(37,99,235,0.15)] [transform:rotateY(180deg)] [backface-visibility:hidden]">

          {/* SUBTLE BLUE BACKGROUND GLOW */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#2684FF]/25 blur-[65px]" />

          <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#61C5FA]/20 blur-[65px]" />

          {/* COURSE DETAILS */}
          <div className="relative z-10 flex w-full flex-col items-center text-center">
            <div className="mb-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#61C5FA]/30 bg-[#2684FF]/15 text-[#8BD6FF]">
              <Sparkles size={18} />
            </div>

            <h3 className="line-clamp-2 text-sm font-bold text-white">
              {course.title}
            </h3>

            <p className="mt-2 line-clamp-2 text-[10px] leading-4 text-white/70">
              {course.description ||
                course.subtitle ||
                course.category ||
                "Explore this course and build new skills with your personalized learning path."}
            </p>

            {/* COURSE STATISTICS */}
            <div className="mt-3 grid w-full grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2">
                <BookOpen size={15} className="mx-auto text-[#8BD6FF]" />

                <p className="mt-1 text-base font-bold text-white">
                  {course.totalLessons}
                </p>

                <p className="text-[9px] text-white/55">
                  Total lessons
                </p>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.06] p-2">
                <CheckCircle2 size={15} className="mx-auto text-[#8BD6FF]" />

                <p className="mt-1 text-base font-bold text-white">
                  {course.completedLessons}
                </p>

                <p className="text-[9px] text-white/55">
                  Completed
                </p>
              </div>
            </div>

            {/* PROGRESS */}
            <div className="mt-3 w-full">
              <div className="mb-1 flex justify-between text-[9px] text-white/60">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>

              <div className="h-1 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2684FF] to-[#61C5FA]"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* DURATION */}
            <div className="mt-2 flex items-center gap-2 text-[9px] text-white/65">
              <Clock3 size={12} />
              {duration || "Self-paced learning"}
            </div>

            {/* CLICK TO OPEN */}
            <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#61C5FA]/30 bg-[#2684FF]/20 px-5 py-2 text-[10px] font-semibold text-white transition group-hover/card:bg-[#2684FF]/35">
              Continue Learning
              <ArrowRight size={13} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
