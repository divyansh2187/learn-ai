"use client";

import { useEffect, useRef, useState } from "react";

const contactDetails = {
  github: "https://github.com/divyansh2187",
  linkedin: "https://www.linkedin.com/in/divyanshu-sargara-8b5802325/",
  email: "Divyanshbhati1227@gmail.com",
  phone: "+919509102373",
};

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

const featureCards = [
  {
    number: "01",
    label: "CREATE",
    title: "AI Course Builder",
    description:
      "Turn your ideas into structured, personalized courses with AI in seconds.",
    icon: (
      <>
        <path d="M12 3v18M3 12h18" />
        <circle cx="12" cy="12" r="8.5" />
      </>
    ),
    className: "learnai-card-1",
    accent: "from-violet-300 to-fuchsia-400",
  },
  {
    number: "02",
    label: "EXPLORE",
    title: "YouTube Learning",
    description:
      "Transform videos into organized lessons, notes, and useful takeaways.",
    icon: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="4" />
        <path d="m10 9 5 3-5 3V9Z" />
      </>
    ),
    className: "learnai-card-2",
    accent: "from-cyan-300 to-blue-400",
  },
  {
    number: "03",
    label: "PRACTICE",
    title: "Smart Quizzes",
    description:
      "Test your understanding with AI-generated questions and instant feedback.",
    icon: (
      <>
        <rect x="5" y="3" width="14" height="18" rx="3" />
        <path d="m8 9 1.5 1.5L12 8M14 10h2M8 15h2M14 15h2" />
      </>
    ),
    className: "learnai-card-3",
    accent: "from-violet-300 to-indigo-400",
  },
  {
    number: "04",
    label: "ANALYZE",
    title: "Progress Tracking",
    description:
      "See your learning progress, completed lessons, and growth at a glance.",
    icon: (
      <>
        <path d="M4 19V5M4 19h17" />
        <rect x="7" y="12" width="3" height="5" rx="1" />
        <rect x="12" y="8" width="3" height="9" rx="1" />
        <rect x="17" y="4" width="3" height="13" rx="1" />
      </>
    ),
    className: "learnai-card-4",
    accent: "from-sky-300 to-cyan-400",
  },
  {
    number: "05",
    label: "REMEMBER",
    title: "AI Flashcards",
    description:
      "Remember more with focused flashcards and repeatable revision sessions.",
    icon: (
      <>
        <rect x="6" y="4" width="14" height="16" rx="2.5" />
        <path d="M9 8h8M9 12h5M4 7v13a2 2 0 0 0 2 2h11" />
      </>
    ),
    className: "learnai-card-5",
    accent: "from-fuchsia-300 to-violet-400",
  },
];

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
      "(prefers-reduced-motion: reduce)",
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

    const pause = () => {
      paused = true;
    };
    const resume = () => {
      paused = false;
      previousTime = 0;
    };

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

  useEffect(() => {
    const track = coursesTrackRef.current;
    const section = track?.closest(".courses-section");

    if (!track || !section) return;

    let stopTimer: ReturnType<typeof setTimeout>;
    let settleTimer: ReturnType<typeof setTimeout>;

    const triggerSwing = () => {
      clearTimeout(stopTimer);
      clearTimeout(settleTimer);

      section.classList.remove("is-settling");
      section.classList.add("is-scrolling");

      stopTimer = setTimeout(() => {
        section.classList.remove("is-scrolling");
        section.classList.add("is-settling");

        settleTimer = setTimeout(() => {
          section.classList.remove("is-settling");
        }, 1200);
      }, 180);
    };

    // Detect horizontal carousel movement, including auto-scroll.
    track.addEventListener("scroll", triggerSwing, { passive: true });

    // Detect vertical page scrolling.
    window.addEventListener("scroll", triggerSwing, { passive: true });

    return () => {
      track.removeEventListener("scroll", triggerSwing);
      window.removeEventListener("scroll", triggerSwing);

      clearTimeout(stopTimer);
      clearTimeout(settleTimer);

      section.classList.remove("is-scrolling", "is-settling");
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
            radial-gradient(
              ellipse at 16% 0%,
              rgba(238, 225, 255, 0.78),
              transparent 38%
            ),
            radial-gradient(
              ellipse at 82% 28%,
              rgba(67, 150, 255, 0.92),
              transparent 48%
            ),
            linear-gradient(145deg, #b7c9f4 0%, #4b8fe9 45%, #06428e 100%);
        }
        .learnai-frame {
          background:
            radial-gradient(
              ellipse at 50% 104%,
              rgba(230, 250, 255, 0.98) 0%,
              rgba(113, 201, 255, 0.92) 13%,
              rgba(45, 126, 240, 0.78) 29%,
              transparent 54%
            ),
            radial-gradient(
              ellipse at 82% 72%,
              rgba(55, 137, 255, 0.48),
              transparent 38%
            ),
            linear-gradient(
              to bottom,
              #020305 0%,
              #020305 35%,
              #050a16 55%,
              #0b1d3c 75%,
              #8fd9ff 100%
            );
          box-shadow:
            0 0 0 1px rgba(219, 239, 255, 0.35),
            0 24px 70px rgba(0, 28, 83, 0.28);
        }
        .learnai-grid {
          background-image:
            linear-gradient(rgba(183, 225, 255, 0.1) 1px, transparent 1px),
            linear-gradient(
              90deg,
              rgba(183, 225, 255, 0.1) 1px,
              transparent 1px
            );
          background-size: 38px 38px;
          mask-image: linear-gradient(
            to bottom,
            transparent,
            black 18%,
            black 75%,
            transparent
          );
        }
        .learnai-reveal {
          opacity: 0;
          transform: translateY(12px);
          animation: learnai-rise-in 700ms cubic-bezier(0.2, 0, 0, 1) forwards;
        }
        .learnai-word {
          display: inline-block;
          opacity: 0;
          transform: translateY(14px);
          animation: learnai-rise-in 700ms cubic-bezier(0.2, 0, 0, 1) forwards;
        }
        .learnai-wave {
          border: 1px solid rgba(10, 73, 148, 0.3);
          border-color: rgba(10, 73, 148, 0.3) transparent transparent
            transparent;
          border-radius: 50%;
          transform: rotate(-3deg);
        }
        @keyframes learnai-rise-in {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .learnai-card-stage {
          position: relative;
          width: 100%;
          height: clamp(360px, 54vh, 470px);
          max-width: 1120px;
          margin-inline: auto;
          perspective: 1400px;
          isolation: isolate;
        }
        .learnai-glass-card {
          position: absolute;
          top: 0;
          left: 0;
          display: flex;
          flex-direction: column;
          width: clamp(180px, 19vw, 245px);
          height: clamp(245px, 36vh, 300px);
          min-width: 0;
          padding: clamp(1rem, 1.5vw, 1.4rem);
          overflow: hidden;
          overflow-wrap: anywhere;
          border: 1px solid rgba(35, 70, 115, 0.16);
          border-radius: 17px;
          color: #111827;
          background: #d0e0f1;
          box-shadow: 0 22px 45px rgba(0, 0, 0, 0.22);
          transform-origin: center center;
          transition:
            transform 420ms cubic-bezier(0.2, 0.75, 0.25, 1),
            box-shadow 350ms ease,
            border-color 350ms ease;
        }
        .learnai-feature-icon-wrap {
          position: relative;
          background: #b6cde9 !important;
          color: #102c50;
          border: 1px solid rgba(25, 54, 91, 0.12);
        }
        .learnai-feature-icon svg {
          display: block;
          width: 100%;
          height: 100%;
          stroke: currentColor;
          stroke-width: 1.7;
          stroke-linecap: round;
          stroke-linejoin: round;
        }
        .learnai-feature-title {
          background: linear-gradient(
            100deg,
            #101827 0%,
            #2458a6 48%,
            #3988d8 78%,
            #173b73 100%
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          -webkit-text-fill-color: transparent;
        }
        .learnai-glass-card p {
          color: #263b55 !important;
        }
        .learnai-glass-card > div:first-child span {
          color: #304965 !important;
        }
        .learnai-glass-card:hover {
          background: #d0e0f1 !important;
          border-color: rgba(35, 70, 115, 0.16) !important;
          box-shadow: 0 22px 45px rgba(0, 0, 0, 0.22);
        }
        .learnai-card-1 {
          top: 34%;
          left: 1%;
          z-index: 1;
          transform: rotate(-7deg);
        }
        .learnai-card-2 {
          top: 22%;
          left: 17%;
          z-index: 2;
          transform: rotate(4deg);
        }
        .learnai-card-3 {
          top: 12%;
          left: 34%;
          z-index: 3;
          transform: rotate(-3deg);
        }
        .learnai-card-4 {
          top: 4%;
          left: 51%;
          z-index: 4;
          transform: rotate(3deg);
        }
        .learnai-card-5 {
          top: 0;
          left: 68%;
          z-index: 5;
          transform: rotate(-3deg);
        }
        .learnai-glass-card:hover {
          z-index: 20;
          background: #d0e0f1 !important;
          border-color: rgba(35, 70, 115, 0.16) !important;
          box-shadow: 0 22px 45px rgba(0, 0, 0, 0.22);
        }
        .learnai-card-1:hover {
          transform: translateY(-16px) rotate(-3deg) scale(1.035);
        }
        .learnai-card-2:hover {
          transform: translateY(-16px) rotate(1deg) scale(1.035);
        }
        .learnai-card-3:hover {
          transform: translateY(-16px) rotate(0deg) scale(1.035);
        }
        .learnai-card-4:hover {
          transform: translateY(-16px) rotate(1deg) scale(1.035);
        }
        .learnai-card-5:hover {
          transform: translateY(-16px) rotate(-1deg) scale(1.035);
        }
        @media (max-width: 1024px) {
          .learnai-card-stage {
            height: 470px;
          }
          .learnai-glass-card {
            width: clamp(170px, 23vw, 220px);
            height: 260px;
          }
          .learnai-card-1 {
            top: 36%;
            left: 0%;
          }
          .learnai-card-2 {
            top: 25%;
            left: 14%;
          }
          .learnai-card-3 {
            top: 14%;
            left: 29%;
          }
          .learnai-card-4 {
            top: 5%;
            left: 44%;
          }
          .learnai-card-5 {
            top: 0;
            left: 59%;
          }
        }
        @media (max-width: 640px) {
          #features {
            min-height: 100svh;
            padding-top: 2.5rem;
            padding-bottom: 2.5rem;
          }
          #features .learnai-features-header {
            margin-bottom: 1.25rem;
          }
          .learnai-card-stage {
            height: 660px;
            max-width: 430px;
          }
          .learnai-glass-card {
            width: min(225px, 64vw);
            height: 245px;
            padding: 1rem;
          }
          .learnai-card-1 {
            top: 57%;
            left: 0%;
            transform: rotate(-6deg);
          }
          .learnai-card-2 {
            top: 43%;
            left: 7%;
            transform: rotate(4deg);
          }
          .learnai-card-3 {
            top: 29%;
            left: 14%;
            transform: rotate(-3deg);
          }
          .learnai-card-4 {
            top: 15%;
            left: 21%;
            transform: rotate(3deg);
          }
          .learnai-card-5 {
            top: 1%;
            left: 28%;
            transform: rotate(-3deg);
          }
          .learnai-card-1:hover {
            transform: translateY(-8px) rotate(-3deg) scale(1.02);
          }
          .learnai-card-2:hover {
            transform: translateY(-8px) rotate(1deg) scale(1.02);
          }
          .learnai-card-3:hover {
            transform: translateY(-8px) rotate(0deg) scale(1.02);
          }
          .learnai-card-4:hover {
            transform: translateY(-8px) rotate(1deg) scale(1.02);
          }
          .learnai-card-5:hover {
            transform: translateY(-8px) rotate(-1deg) scale(1.02);
          }
        }
        @media (max-width: 390px) {
          .learnai-card-stage {
            height: 620px;
          }
          .learnai-glass-card {
            width: 66vw;
            height: 225px;
            padding: 0.85rem;
          }
          .learnai-card-1 {
            top: 60%;
            left: -2%;
          }
          .learnai-card-2 {
            top: 47%;
            left: 5%;
          }
          .learnai-card-3 {
            top: 34%;
            left: 12%;
          }
          .learnai-card-4 {
            top: 21%;
            left: 19%;
          }
          .learnai-card-5 {
            top: 8%;
            left: 26%;
          }
        }
        @media (min-width: 1025px) and (max-height: 760px) {
          #features {
            padding-top: 1.25rem;
            padding-bottom: 1.25rem;
          }
          #features .learnai-features-header {
            margin-bottom: 0.5rem;
          }
          #features .learnai-card-stage {
            height: clamp(340px, 48vh, 410px);
          }
          #features .learnai-glass-card {
            height: clamp(220px, 31vh, 255px);
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .learnai-glass-card,
          .learnai-glass-card::before {
            transition: none !important;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .learnai-reveal,
          .learnai-word {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>
      <div className="relative z-10 min-h-screen w-full p-0">
        <section
          aria-labelledby="hero-title"
          className="learnai-frame relative isolate min-h-screen w-full max-w-none overflow-hidden rounded-none border-0 px-5 pb-8 pt-5 sm:px-9 sm:pb-10 sm:pt-6 lg:px-12"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 -z-10"
          >
            <div className="learnai-grid absolute inset-0 opacity-70" />
            <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(to_bottom,transparent,rgba(52,143,255,.2)_28%,rgba(145,222,255,.45)_76%,rgba(224,249,255,.75))]" />
            <div className="learnai-wave absolute -bottom-14 left-[-8%] h-28 w-[116%]" />
            <div className="learnai-wave absolute -bottom-20 left-[-6%] h-28 w-[112%] opacity-70" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(225,248,255,.58))]" />
          </div>

          <header
            className="learnai-reveal relative z-20 flex items-center justify-between"
            style={{ animationDelay: "50ms" }}
          >
            <a
              href="/"
              aria-label="LearnAI home"
              className="flex items-center gap-2.5"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/60 text-[10px] text-white sm:h-8 sm:w-8">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="h-4 w-4"
                  aria-hidden="true"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                </svg>
              </span>
              <span className="text-sm font-medium tracking-[-0.04em] sm:text-base">
                Learn<span className="text-[#8BD6FF]">AI</span>
              </span>
            </a>

            <nav
              aria-label="Main navigation"
              className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-5 text-[10px] text-white/75 sm:flex md:gap-8 md:text-xs"
            >
              <a href="#features" className="transition hover:text-white">
                Features
              </a>
              <a href="#courses" className="transition hover:text-white">
                Courses
              </a>
            </nav>

            <div className="flex items-center gap-3 sm:gap-5">
              <a
                href="/login"
                className="text-[10px] text-white/80 transition hover:text-white sm:text-xs"
              >
                Log in
              </a>
              <a
                href="/register"
                className="hidden rounded-full border border-white/25 bg-white/10 px-3 py-2 text-[10px] text-white backdrop-blur transition hover:bg-white/20 sm:inline-flex sm:text-xs"
              >
                Get started ↗
              </a>
              <button
                type="button"
                aria-label={menuOpen ? "Close navigation" : "Open navigation"}
                aria-expanded={menuOpen}
                aria-controls="mobile-navigation"
                onClick={() => setMenuOpen((open) => !open)}
                className="rounded-full border border-white/25 px-3 py-1.5 text-[10px] text-white sm:hidden"
              >
                {menuOpen ? "Close" : "Menu"}
              </button>
            </div>
            {menuOpen && (
              <nav
                id="mobile-navigation"
                aria-label="Mobile navigation"
                className="absolute right-0 top-11 z-50 flex w-44 flex-col gap-1 rounded-xl border border-white/15 bg-[#080D18]/95 p-2 text-xs shadow-2xl backdrop-blur-xl sm:hidden"
              >
                <a
                  href="#features"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  Features
                </a>
                <a
                  href="#courses"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  Courses
                </a>
                <a
                  href="#how-it-works"
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  How it works
                </a>
                <a
                  href="/register"
                  className="rounded-lg px-3 py-2 hover:bg-white/10"
                >
                  Get started
                </a>
              </nav>
            )}
          </header>

          <div className="relative z-10 mx-auto flex max-w-[720px] flex-col items-center pb-5 pt-12 text-center sm:pt-16 lg:pt-20">
            <h1
              id="hero-title"
              className="learnai-reveal mt-4 max-w-[700px] text-3xl font-medium leading-[1.06] tracking-[-.055em] text-white sm:mt-5 sm:text-4xl lg:text-[clamp(2.6rem,4vw,3.5rem)]"
              style={{ animationDelay: "220ms" }}
            >
              Learn Anything.{" "}
              <span className="bg-gradient-to-r from-white via-[#D8F2FF] to-[#83C8FF] bg-clip-text text-transparent">
                Your Way.
              </span>
            </h1>
            <p
              className="learnai-reveal mt-3 max-w-[480px] text-[10px] leading-[1.7] text-white/65 sm:mt-4 sm:text-xs"
              style={{ animationDelay: "300ms" }}
            >
              Turn your ideas into a personalized learning path with AI-powered
              courses,
              <br className="hidden sm:block" /> curated video lessons, and
              smart practice.
            </p>

            <form
              onSubmit={(event) => {
                event.preventDefault();
                const topic = courseTopic.trim();
                window.location.href = topic
                  ? `/register?topic=${encodeURIComponent(topic)}`
                  : "/register";
              }}
              className="learnai-reveal mt-6 flex min-h-[108px] w-full max-w-[490px] flex-col justify-between rounded-[18px] border border-white/55 bg-[rgba(238,247,255,.86)] p-3 text-left shadow-[0_18px_45px_rgba(0,30,88,.18)] backdrop-blur-xl sm:mt-7 sm:min-h-[132px] sm:rounded-[22px] sm:p-4"
              style={{ animationDelay: "390ms" }}
            >
              <label htmlFor="course-topic" className="sr-only">
                What do you want to learn?
              </label>
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
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setCourseTopic(topic)}
                      className={`rounded-full border px-2.5 py-1.5 text-[8px] transition sm:px-3 sm:text-[9px] ${courseTopic === topic ? "border-[#4388FF]/50 bg-[#D6EAFF] text-[#123E78]" : "border-white/80 bg-white/35 text-[#64748B] hover:bg-white/70"}`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>

                <button
                  type="submit"
                  className="liquid-metal-button rounded-full text-[9px] font-medium text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4388FF] sm:text-[10px]"
                >
                  <span
                    className="liquid-metal-button__shine"
                    aria-hidden="true"
                  />
                  <span className="liquid-metal-button__content gap-1.5 px-4 py-2 sm:px-5">
                    Generate <span aria-hidden="true">↗</span>
                  </span>
                </button>
              </div>
            </form>

            <p
              className="learnai-reveal mt-6 flex items-center gap-2 text-[9px] text-[#173A63]/75 sm:mt-7 sm:text-[10px]"
              style={{ animationDelay: "470ms" }}
            >
              <span className="inline-block h-1 w-1 rounded-full bg-[#173A63]/60" />
              A smarter way to learn, one step at a time.
            </p>
          </div>
        </section>
      </div>

      {/* Courses Section */}
      <section className="courses-section" id="courses">
        <div className="courses-container">
          <div className="courses-header">
            <h2 className="courses-title">Discover Your Next Skill</h2>

            <p className="courses-description">
              Explore courses designed to help you learn faster, build real
              skills, and achieve more with AI.
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
                  <span className="course-card-star" aria-hidden="true">
                    ✳
                  </span>

                  <div>
                    <div className="course-card-category">
                      {course.category || "LEARNING"}
                    </div>

                    <h3 className="course-card-title">{course.title}</h3>
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

      {/* FEATURES SECTION */}
      <section
        id="features"
        className="learnai-frame relative isolate flex min-h-[100svh] flex-col justify-center overflow-hidden px-5 py-10 text-white sm:px-8 lg:px-12"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="learnai-grid absolute inset-0 opacity-70" />
          <div className="absolute inset-x-0 bottom-0 h-[48%] bg-[linear-gradient(to_bottom,transparent,rgba(52,143,255,.2)_28%,rgba(145,222,255,.45)_76%,rgba(224,249,255,.75))]" />
          <div className="learnai-wave absolute -bottom-14 left-[-8%] h-28 w-[116%]" />
          <div className="learnai-wave absolute -bottom-20 left-[-6%] h-28 w-[112%] opacity-70" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(225,248,255,.58))]" />
        </div>

        <div className="relative mx-auto w-full max-w-7xl">
          <header className="learnai-features-header mb-6 text-left sm:mb-8">
            <h2 className="text-3xl font-semibold leading-[1.08] tracking-[-0.055em] sm:text-4xl lg:text-5xl">
              <span className="text-white">Learning, </span>
              <span className="bg-gradient-to-r from-[#D9D0FF] via-[#56a6ec] to-[#65CFFF] bg-clip-text text-transparent">
                reimagined.
              </span>
            </h2>
          </header>

          <div className="learnai-card-stage">
            {featureCards.map((feature) => (
              <article
                key={feature.number}
                className={`learnai-glass-card ${feature.className} flex flex-col`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[9px] font-semibold tracking-[0.16em] text-[#33547D]">
                    {feature.label}
                  </span>
                  <span className="font-mono text-[10px] text-[#5B7390]">
                    /{feature.number}
                  </span>
                </div>

                <div
                  className={`learnai-feature-icon-wrap mt-5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${feature.accent} text-[#09234D]`}
                >
                  <div className="learnai-feature-icon h-6 w-6">
                    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      {feature.icon}
                    </svg>
                  </div>
                </div>

                <div className="learnai-feature-copy mt-5">
                  <h3 className="learnai-feature-title text-lg font-bold leading-snug tracking-tight sm:text-xl">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-xs leading-5 text-[#314D70] sm:text-[13px] sm:leading-6">
                    {feature.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="learnai-frame relative isolate overflow-hidden border-t border-white/20 px-5 pb-7 pt-10 text-white sm:px-10 sm:pt-12 lg:px-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
        >
          <div className="learnai-grid absolute inset-0 opacity-50" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-[linear-gradient(to_bottom,transparent,rgba(225,248,255,.3))]" />
        </div>

        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 md:gap-8">
          <div className="max-w-md">
            <a
              href="#"
              aria-label="LearnAI home"
              className="inline-flex items-center gap-2 text-sm font-semibold tracking-tight text-white"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full border border-white/70 text-xs">
                ✳
              </span>
              Learn<span className="-ml-2 text-blue-300">AI</span>
            </a>
            <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
              Smart learning tools, personalized courses, and AI-powered
              practice to help you learn with confidence.
            </p>
            <div className="mt-5 flex flex-wrap gap-4 text-xs text-white/80">
              <a
                href={contactDetails.github}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white hover:underline"
              >
                GitHub ↗
              </a>
              <a
                href={contactDetails.linkedin}
                target="_blank"
                rel="noreferrer"
                className="transition hover:text-white hover:underline"
              >
                LinkedIn ↗
              </a>
            </div>
            <a
              href={`tel:${contactDetails.phone.replace(/[^+\d]/g, "")}`}
              className="mt-3 inline-flex text-xs text-white/80 transition hover:text-white"
            >
              Call: {contactDetails.phone}
            </a>
          </div>

          <div className="flex items-start md:ml-auto md:w-full md:max-w-md md:justify-end">
            <a
              href={`https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(contactDetails.email)}&su=${encodeURIComponent("Hello from your LearnAI website")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 rounded-full border border-white/40 bg-[#62AAEF] px-6 py-3 text-sm font-semibold text-[#06377D] shadow-lg transition hover:bg-[#000000] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Email me <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col gap-3 border-t border-white/20 pt-4 text-[11px] text-white/65 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LearnAI. All rights reserved.</p>
          <p>Learn with intention. Grow with confidence.</p>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none mt-2 select-none overflow-hidden text-center text-[clamp(4rem,18.5vw,17rem)] font-semibold leading-[0.78] tracking-[-0.075em] text-white/[0.96]"
        >
          <span className="text-white">LEARN</span>
          <span className="text-blue-300">AI</span>
        </div>
      </footer>
    </main>
  );
}
