"use client";

import { useEffect, useRef, useState } from "react";

const features = [
  {
    number: "01",
    title: "Courses built around you",
    description:
      "Turn any subject into a structured learning path tailored to your goals, skill level, and pace.",
    icon: "✳",
  },
  {
    number: "02",
    title: "Learn by watching",
    description:
      "Bring YouTube lessons into your course and keep every resource organized by topic.",
    icon: "▷",
  },
  {
    number: "03",
    title: "Remember what matters",
    description:
      "Test your understanding with AI-generated quizzes and track your learning progress.",
    icon: "↗",
  },
];

const lessons = [
  { title: "Introduction to neural networks", time: "12 min", done: true },
  { title: "Understanding model training", time: "18 min", done: true },
  { title: "Building your first AI model", time: "24 min", done: false },
];

type PublicCourse = {
  id: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  thumbnail: string | null;
  category: string | null;
  difficulty: string | null;
  estimatedMinutes: number | null;
  modules: {
    _count: {
      lessons: number;
    };
  }[];
};

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courseTopic, setCourseTopic] = useState("");
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [coursesError, setCoursesError] = useState("");
  const coursesTrackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    async function loadCourses() {
      try {
        const response = await fetch(`${apiUrl}/courses/public`);
        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error("Unable to load courses.");
        }

        setCourses(Array.isArray(result.data) ? result.data : []);
      } catch {
        setCoursesError("Courses couldn't load. Please try again.");
      } finally {
        setCoursesLoading(false);
      }
    }

    void loadCourses();
  }, []);

  useEffect(() => {
    const track = coursesTrackRef.current;
    if (!track) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduceMotion) return;

    let frame = 0;
    let previousTime = 0;
    let paused = false;
    const speed = 22; // pixels per second

    const animate = (time: number) => {
      if (previousTime && !paused) {
        const delta = Math.min(time - previousTime, 32);
        const maxScroll = track.scrollWidth - track.clientWidth;

        if (maxScroll > 0) {
          track.scrollLeft += (speed * delta) / 1000;
          if (track.scrollLeft >= maxScroll - 1) {
            track.scrollLeft = 0;
          }
        }
      }
      previousTime = time;
      frame = window.requestAnimationFrame(animate);
    };

    const pause = () => { paused = true; };
    const resume = () => { paused = false; previousTime = 0; };

    track.addEventListener("mouseenter", pause);
    track.addEventListener("mouseleave", resume);
    track.addEventListener("focusin", pause);
    track.addEventListener("focusout", resume);
    track.addEventListener("touchstart", pause, { passive: true });
    track.addEventListener("touchend", resume, { passive: true });

    frame = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frame);
      track.removeEventListener("mouseenter", pause);
      track.removeEventListener("mouseleave", resume);
      track.removeEventListener("focusin", pause);
      track.removeEventListener("focusout", resume);
      track.removeEventListener("touchstart", pause);
      track.removeEventListener("touchend", resume);
    };
  }, []);

  function selectCourse(courseId: string) {
    window.location.href = `/login?courseId=${encodeURIComponent(courseId)}`;
  }

  return (
    <main className="learnai-page relative min-h-screen overflow-hidden text-[#F4F7FF]">
      <style jsx global>{`
        .learnai-page {
          --blue: #2878e8;
          --sky: #9edfff;
          --muted: #aebbd0;
          background:
            radial-gradient(ellipse at 16% 0%, rgba(238, 225, 255, .78), transparent 38%),
            radial-gradient(ellipse at 82% 28%, rgba(67, 150, 255, .92), transparent 48%),
            linear-gradient(145deg, #b7c9f4 0%, #4b8fe9 45%, #06428e 100%);
        }
        .learnai-frame {
          background:
            radial-gradient(ellipse at 50% 104%, rgba(230, 250, 255, .98) 0%, rgba(113, 201, 255, .92) 13%, rgba(45, 126, 240, .78) 29%, transparent 54%),
            radial-gradient(ellipse at 82% 72%, rgba(55, 137, 255, .48), transparent 38%),
            linear-gradient(to bottom, #020305 0%, #020305 35%, #050a16 55%, #0b1d3c 75%, #8fd9ff 100%);
          box-shadow: 0 0 0 1px rgba(219, 239, 255, .35), 0 24px 70px rgba(0, 28, 83, .28);
        }
        .learnai-grid {
          background-image:
            linear-gradient(rgba(183, 225, 255, .10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(183, 225, 255, .10) 1px, transparent 1px);
          background-size: 38px 38px;
          mask-image: linear-gradient(to bottom, transparent, black 18%, black 75%, transparent);
        }
        .learnai-reveal {
          opacity: 0;
          transform: translateY(12px);
          animation: learnai-rise-in 700ms cubic-bezier(.2, 0, 0, 1) forwards;
        }
        .learnai-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(14px);
          animation: learnai-rise-in 700ms cubic-bezier(.2, 0, 0, 1) forwards;
        }
        .learnai-wave {
          border: 1px solid rgba(10, 73, 148, .3);
          border-color: rgba(10, 73, 148, .3) transparent transparent transparent;
          border-radius: 50%;
          transform: rotate(-3deg);
        }
        @keyframes learnai-rise-in {
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .learnai-reveal, .learnai-word {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
      <div className="relative z-10 min-h-screen w-full p-0">
        <section aria-labelledby="hero-title" className="learnai-frame relative isolate min-h-screen w-full max-w-none overflow-hidden rounded-none border-0 px-5 pb-8 pt-5 sm:px-9 sm:pb-10 sm:pt-6 lg:px-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="learnai-grid absolute inset-0 opacity-70" />
            <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(to_bottom,transparent,rgba(52,143,255,.2)_28%,rgba(145,222,255,.45)_76%,rgba(224,249,255,.75))]" />
            <div className="learnai-wave absolute -bottom-14 left-[-8%] h-28 w-[116%]" />
            <div className="learnai-wave absolute -bottom-20 left-[-6%] h-28 w-[112%] opacity-70" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(225,248,255,.58))]" />
          </div>

          <header className="learnai-reveal relative z-20 flex items-center justify-between" style={{ animationDelay: "50ms" }}>
            <a href="/" aria-label="LearnAI home" className="flex items-center gap-2.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/60 text-[10px] text-white sm:h-8 sm:w-8">
                <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4" aria-hidden="true">
                  <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                </svg>
              </span>
              <span className="text-sm font-medium tracking-[-0.04em] sm:text-base">Learn<span className="text-[#8BD6FF]">AI</span></span>
            </a>

            <nav aria-label="Main navigation" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 text-[10px] text-white/75 sm:flex md:gap-8 md:text-xs">
              <a href="#features" className="transition hover:text-white">Features</a>
              <a href="#courses" className="transition hover:text-white">Courses</a>
              <a href="#how-it-works" className="whitespace-nowrap transition hover:text-white">How it works</a>
              <a href="#preview" className="transition hover:text-white">Preview</a>
            </nav>

            <div className="flex items-center gap-3 sm:gap-5">
              <a href="/login" className="text-[10px] text-white/80 transition hover:text-white sm:text-xs">Log in</a>
              <a href="/register" className="hidden rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[10px] text-white backdrop-blur transition hover:bg-white/20 sm:inline-flex sm:text-xs">Get started ↗</a>
              <button type="button" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={() => setMenuOpen((open) => !open)} className="rounded-full border border-white/25 px-3 py-1.5 text-[10px] text-white sm:hidden">
                {menuOpen ? "Close" : "Menu"}
              </button>
            </div>
            {menuOpen && (
              <nav id="mobile-navigation" aria-label="Mobile navigation" className="absolute right-0 top-11 z-50 flex w-44 flex-col gap-1 rounded-xl border border-white/15 bg-[#080D18]/95 p-2 text-xs shadow-2xl backdrop-blur-xl sm:hidden">
                <a href="#features" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10">Features</a>
                <a href="#courses" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10">Courses</a>
                <a href="#how-it-works" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2 hover:bg-white/10">How it works</a>
                <a href="/register" className="rounded-lg px-3 py-2 hover:bg-white/10">Get started</a>
              </nav>
            )}
          </header>

          <div className="relative z-10 mx-auto flex max-w-[720px] flex-col items-center pb-5 pt-12 text-center sm:pt-16 lg:pt-20">
            <p className="learnai-reveal text-[9px] font-medium tracking-[.2em] text-[#B8DFFF] sm:text-[10px]" style={{ animationDelay: "120ms" }}>
              YOUR PERSONAL AI LEARNING SPACE
            </p>
            <h1 id="hero-title" className="learnai-reveal mt-4 max-w-[700px] text-3xl font-medium leading-[1.06] tracking-[-.055em] text-white sm:mt-5 sm:text-4xl lg:text-[clamp(2.6rem,4vw,3.5rem)]" style={{ animationDelay: "220ms" }}>
              Learn Anything. <span className="bg-gradient-to-r from-white via-[#D8F2FF] to-[#83C8FF] bg-clip-text text-transparent">Your Way.</span>
            </h1>
            <p className="learnai-reveal mt-3 max-w-[480px] text-[10px] leading-[1.7] text-white/65 sm:mt-4 sm:text-xs" style={{ animationDelay: "300ms" }}>
              Turn your ideas into a personalized learning path with AI-powered courses,
              <br className="hidden sm:block" /> curated video lessons, and smart practice.
            </p>

            <form onSubmit={(event) => {
              event.preventDefault();
              const topic = courseTopic.trim();
              window.location.href = topic ? `/register?topic=${encodeURIComponent(topic)}` : "/register";
            }} className="learnai-reveal mt-6 flex min-h-[108px] w-full max-w-[490px] flex-col justify-between rounded-[18px] border border-white/55 bg-[rgba(238,247,255,.86)] p-3 text-left shadow-[0_18px_45px_rgba(0,30,88,.18)] backdrop-blur-xl sm:mt-7 sm:min-h-[132px] sm:rounded-[22px] sm:p-4" style={{ animationDelay: "390ms" }}>
              <label htmlFor="course-topic" className="sr-only">What do you want to learn?</label>
              <input
                id="course-topic"
                value={courseTopic}
                onChange={(event) => setCourseTopic(event.target.value)}
                placeholder="What would you like to learn?"
                aria-label="What would you like to learn?"
                className="h-9 w-full bg-transparent px-1 text-[10px] text-[#15243A] outline-none placeholder:text-[#718096] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4388FF] sm:h-12 sm:text-xs"
              />
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap gap-1.5">
                  {["AI", "Coding", "Design", "Business"].map((topic) => (
                    <button key={topic} type="button" onClick={() => setCourseTopic(topic)} className={`rounded-full border px-2.5 py-1.5 text-[8px] transition sm:px-3 sm:text-[9px] ${courseTopic === topic ? "border-[#4388FF]/50 bg-[#D6EAFF] text-[#123E78]" : "border-white/80 bg-white/35 text-[#64748B] hover:bg-white/70"}`}>
                      {topic}
                    </button>
                  ))}
                </div>
                <button type="submit" className="rounded-full bg-[#05070D] px-4 py-2 text-[9px] font-medium text-white transition hover:bg-[#142744] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4388FF] sm:px-5 sm:text-[10px]">
                  Generate <span aria-hidden="true">↗</span>
                </button>
              </div>
            </form>

            <p className="learnai-reveal mt-6 flex items-center gap-2 text-[9px] text-[#173A63]/75 sm:mt-7 sm:text-[10px]" style={{ animationDelay: "470ms" }}>
              <span className="inline-block h-1 w-1 rounded-full bg-[#173A63]/60" />
              A smarter way to learn, one step at a time.
            </p>
          </div>
        </section>
      </div>

     <section
  id="features"
  className="features-section relative isolate scroll-mt-20 overflow-hidden border-t border-white/[0.08] bg-[#070B14] px-5 py-20 sm:px-10 sm:py-24 lg:px-16 lg:py-28"
>

  <div
    aria-hidden="true"
    className="pointer-events-none absolute -left-36 top-1/3 h-80 w-80 rounded-full bg-[#4388FF]/[0.06] blur-3xl"
  />

  <div className="relative mx-auto max-w-7xl">
    <div className="max-w-2xl">
      <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.22em] text-[#8BD6FF]">
        <span className="h-px w-6 bg-[#8BD6FF]/70" />
        BUILT FOR THE WAY YOU LEARN
      </p>

      <h2 className="mt-5 text-3xl font-medium leading-[1.1] tracking-[-0.045em] sm:text-5xl">
        More than a course.
        <br />
        <span className="bg-gradient-to-r from-[#A0AABC] via-[#D7E6FA] to-[#8BD6FF] bg-clip-text text-transparent">
          A better way to grow.
        </span>
      </h2>

      <p className="mt-5 max-w-xl text-sm leading-7 text-[#8995A9] sm:text-base">
        A focused learning space that turns curiosity into momentum, one useful
        step at a time.
      </p>
    </div>

    <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-3">
      {features.map((feature, index) => (
        <article
          key={feature.number}
          style={{ animationDelay: `${index * 130}ms` }}
          className="feature-card group min-h-[270px] rounded-[26px] border border-white/[0.10] p-6 transition duration-300 hover:-translate-y-1.5 hover:border-[#6FAAFF]/35 hover:shadow-[0_22px_60px_rgba(18,83,180,0.13)] sm:p-8"
        >
          <div className="flex items-center justify-between">
            <span className="feature-icon flex h-12 w-12 items-center justify-center rounded-2xl border border-[#6FAAFF]/20 bg-[#4388FF]/[0.11] text-2xl text-[#8BD6FF]">
              {feature.icon}
            </span>

            <span className="feature-number font-mono text-xs tracking-[0.12em] text-[#68768D]">
              {feature.number}
            </span>
          </div>

          <h3 className="mt-8 text-xl font-medium tracking-[-0.025em] text-[#F1F5FC] transition-colors duration-300 group-hover:text-white">
            {feature.title}
          </h3>

          <p className="mt-3 text-sm leading-7 text-[#A0AABC]">
            {feature.description}
          </p>

          <div className="mt-6 flex items-center gap-2 text-xs font-medium text-[#8BD6FF] opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100">
            <span>Explore feature</span>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              className="h-3.5 w-3.5"
              aria-hidden="true"
            >
              <path
                d="M4 10h11M10 5l5 5-5 5"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>

     {/* Courses Section */}
<section className="courses-section" id="courses">
  <div className="courses-container">
    <div className="courses-header">
      <span className="courses-eyebrow">LEARN WITHOUT LIMITS</span>

      <h2 className="courses-title">
        Discover Your Next Skill
      </h2>

      <p className="courses-description">
        Explore courses designed to help you learn faster,
        build real skills, and achieve more with AI.
      </p>
    </div>

  <div className="courses-grid" ref={coursesTrackRef}>
      {courses.length > 0 ? (
        courses.map((course) => (
          <button
            key={course.id}
            type="button"
            className="course-card"
            onClick={() => {
              window.location.href = `/login?courseId=${course.id}`;
            }}
            aria-label={`Explore ${course.title}`}
          >
            <span className="course-card-strap" aria-hidden="true">
              <span className="course-card-strap-band" />
              <span className="course-card-clip" />
            </span>
            <span className="course-card-star" aria-hidden="true">✳</span>

            <div>
              <div className="course-card-category">
                {course.category || "LEARNING"}
              </div>

              <h3 className="course-card-title">
                {course.title}
              </h3>
            </div>

            <div className="course-card-meta">
              <span>learnai.</span>

              <span className="course-card-action">
                Explore <span aria-hidden="true">↗</span>
              </span>
            </div>
          </button>
        ))
      ) : (
        <div className="courses-status">
          No courses available yet. Check back soon!
        </div>
      )}
    </div>
  </div>
</section>

      {/* HOW IT WORKS */}
  
{/* HOW IT WORKS */}
<section
  id="how-it-works"
  className="border-t border-white/[0.08] bg-[#05070D] px-5 py-20 sm:px-10 lg:px-16 lg:py-24"
>
  <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-2 lg:items-center lg:gap-20">
    <div>
      <p className="text-xs font-semibold tracking-[0.18em] text-[#79C8FF]">
        HOW IT WORKS
      </p>

      <h2 className="mt-5 text-3xl font-semibold tracking-tight text-[#F2F5FC] sm:text-5xl">
        Learn something new.
        <br />
        <span className="text-[#79C8FF]">Make it yours.</span>
      </h2>

      <p className="mt-5 max-w-md text-sm leading-7 text-[#A0AABC] sm:text-base">
        Create a course, learn at your pace, and track your progress.
      </p>

      <a
        href="/register"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#79C8FF] px-6 py-3 text-sm font-semibold text-[#05070D] transition hover:bg-[#B7E6FF]"
      >
        Start learning <span>↗</span>
      </a>
    </div>

    <div className="space-y-3">
      {[
        {
          n: "01",
          title: "Choose a topic",
          body: "Tell AI what you want to learn.",
        },
        {
          n: "02",
          title: "Create your course",
          body: "Get structured lessons and resources.",
        },
        {
          n: "03",
          title: "Learn and practice",
          body: "Test your knowledge and track progress.",
        },
      ].map((step) => (
        <div
          key={step.n}
          className="flex items-center gap-5 rounded-xl border border-white/[0.08] bg-white/[0.02] p-5 transition hover:border-[#3478F6]/40"
        >
          <span className="text-sm font-semibold text-[#79C8FF]">
            {step.n}
          </span>

          <div>
            <h3 className="text-base font-medium text-[#F2F5FC]">
              {step.title}
            </h3>
            <p className="mt-1 text-sm text-[#A0AABC]">{step.body}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
</section>

{/* CTA */}
<section className="bg-[#05070D] px-5 pb-20 sm:px-10 lg:px-16">
  <div className="relative mx-auto max-w-7xl overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0B101B] px-6 py-14 text-center sm:px-12 sm:py-16">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(52,120,246,0.16),transparent_65%)]"
    />

    <div className="relative">
      <h2 className="text-3xl font-semibold tracking-tight text-[#F2F5FC] sm:text-5xl">
        Ready to start learning?
      </h2>

      <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-[#A0AABC]">
        Turn your curiosity into real skills.
      </p>

      <a
        href="/register"
        className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F2F5FC] px-6 py-3 text-sm font-semibold text-[#05070D] transition hover:bg-[#79C8FF]"
      >
        Get started <span>↗</span>
      </a>
    </div>
  </div>
</section>

{/* FOOTER */}
<footer className="border-t border-white/[0.08] bg-[#05070D] px-5 py-6 sm:px-10 lg:px-16">
  <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
    <a href="#" className="text-lg font-bold text-[#F2F5FC]">
      Learn<span className="text-[#4388FF]">AI</span>
    </a>

    <p className="text-xs text-[#8995A9]">
      Learn with intention. Grow with confidence.
    </p>

    <div className="flex gap-5 text-xs text-[#A0AABC]">
      <a href="/login" className="transition hover:text-[#79C8FF]">
        Log in
      </a>
      <a href="/register" className="transition hover:text-[#79C8FF]">
        Sign up
      </a>
    </div>
  </div>
</footer>


    </main>
  );
}
