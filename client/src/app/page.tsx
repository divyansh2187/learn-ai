"use client";

import { useState } from "react";

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

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [courseTopic, setCourseTopic] = useState("");

  return (
    <main className="min-h-screen overflow-hidden">
      <header className="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <a href="#" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D934F7] text-xl font-bold text-black">
            L
          </span>
          <span className="text-xl font-semibold tracking-tight">
            Learn<span className="text-[#D934F7]">AI</span>
          </span>
        </a>

        <nav className="hidden items-center gap-8 text-sm text-[#A69BAC] md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#how-it-works" className="transition hover:text-white">
            How it works
          </a>
          <a href="#preview" className="transition hover:text-white">
            Preview
          </a>
        </nav>

        <div className="hidden items-center gap-5 md:flex">
          <a
            href="/login"
            className="text-sm text-[#E7DDEA] transition hover:text-white"
          >
            Log in
          </a>
          <a
            href="/register"
            className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#BCF429]"
          >
            Get started <span aria-hidden="true">↗</span>
          </a>
        </div>

        <button
          type="button"
          aria-label="Toggle navigation"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
          className="rounded-lg border border-white/10 px-3 py-2 text-sm md:hidden"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>

        {menuOpen && (
          <nav className="absolute left-6 right-6 top-20 flex flex-col gap-5 rounded-2xl border border-white/10 bg-[#140B1B] p-6 shadow-2xl md:hidden">
            <a href="#features" onClick={() => setMenuOpen(false)}>
              Features
            </a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>
              How it works
            </a>
            <a href="#preview" onClick={() => setMenuOpen(false)}>
              Preview
            </a>
            <a href="/login">Log in</a>
            <a href="/register" className="font-semibold text-[#D934F7]">
              Get started ↗
            </a>
          </nav>
        )}
      </header>

      <section className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 pb-24 pt-16 lg:grid-cols-[1.05fr_0.95fr] lg:px-10 lg:pb-32 lg:pt-24">
        <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-[#7E078E]/20 blur-[120px]" />

        <div className="relative z-10">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs text-[#D9C8E0]">
            <span className="h-2 w-2 rounded-full bg-[#BCF429]" />
            YOUR PERSONAL AI LEARNING SPACE
          </div>

          <h1 className="max-w-2xl text-5xl font-medium leading-[1.06] tracking-[-0.055em] sm:text-6xl lg:text-7xl">
            Your curiosity.
            <br />
            Your curriculum.
            <br />
            <span className="bg-gradient-to-r from-[#D934F7] via-[#C56BF5] to-[#BCF429] bg-clip-text text-transparent">
              Your next level.
            </span>
          </h1>

          <p className="mt-7 max-w-xl text-base leading-8 text-[#A69BAC] sm:text-lg">
            Turn what you want to learn into a personalized course with AI,
            curated video lessons, smart quizzes, and progress tracking.
          </p>

          <form
            className="mt-9 flex max-w-xl flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 shadow-2xl shadow-purple-950/20 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              if (courseTopic.trim()) {
                window.location.href = `/register?topic=${encodeURIComponent(courseTopic.trim())}`;
              } else {
                window.location.href = "/register";
              }
            }}
          >
            <input
              value={courseTopic}
              onChange={(event) => setCourseTopic(event.target.value)}
              placeholder="What do you want to learn?"
              aria-label="What do you want to learn?"
              className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-[#817487]"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#D934F7] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#E66AFF]"
            >
              Create my course ↗
            </button>
          </form>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-[#897A91]">
            <span>✳ Personalized learning</span>
            <span>↗ Video resources</span>
            <span>✓ Track your progress</span>
          </div>
        </div>

        <div id="preview" className="relative mx-auto w-full max-w-xl">
          <div className="pointer-events-none absolute -right-8 top-12 h-56 w-56 rounded-full bg-[#D934F7]/15 blur-[100px]" />

          <div className="relative rotate-[1deg] rounded-[28px] border border-white/10 bg-[#120A18]/95 p-4 shadow-2xl shadow-black/50 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#D934F7]/15 text-[#D934F7]">
                  ✳
                </div>
                <div>
                  <p className="text-sm font-semibold">Your learning space</p>
                  <p className="mt-1 text-xs text-[#897A91]">
                    A little progress every day.
                  </p>
                </div>
              </div>
              <span className="rounded-full border border-[#BCF429]/20 bg-[#BCF429]/10 px-3 py-1.5 text-xs text-[#BCF429]">
                In progress
              </span>
            </div>

            <div className="mt-6 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.15em] text-[#A69BAC]">
                    CURRENT COURSE
                  </p>
                  <h3 className="mt-3 text-xl font-medium tracking-tight sm:text-2xl">
                    Introduction to AI
                  </h3>
                  <p className="mt-2 text-sm text-[#897A91]">
                    8 lessons · Beginner friendly
                  </p>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#D934F7] to-[#7E078E] text-xl">
                  ◈
                </div>
              </div>

              <div className="mt-6 flex items-center justify-between text-xs">
                <span className="text-[#A69BAC]">Course progress</span>
                <span className="font-medium text-[#BCF429]">65%</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-[#D934F7] to-[#BCF429]" />
              </div>

              <div className="mt-6 space-y-3">
                {lessons.map((lesson) => (
                  <div
                    key={lesson.title}
                    className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3"
                  >
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm ${
                        lesson.done
                          ? "bg-[#BCF429]/10 text-[#BCF429]"
                          : "bg-[#D934F7]/10 text-[#D934F7]"
                      }`}
                    >
                      {lesson.done ? "✓" : "▷"}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium sm:text-sm">
                        {lesson.title}
                      </p>
                      <p className="mt-1 text-xs text-[#897A91]">
                        {lesson.time}
                      </p>
                    </div>
                    <span className="text-xs text-[#897A91]">
                      {lesson.done ? "Done" : "Next"}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <p className="text-xs text-[#A69BAC]">Learning streak</p>
                <p className="mt-2 text-2xl font-semibold">
                  7 <span className="text-base text-[#BCF429]">days</span>
                </p>
              </div>
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
                <p className="text-xs text-[#A69BAC]">Knowledge gained</p>
                <p className="mt-2 text-2xl font-semibold">
                  +24<span className="text-base text-[#D934F7]">%</span>
                </p>
              </div>
            </div>
            <p className="mt-5 text-center text-[10px] tracking-wide text-[#897A91]">
              ILLUSTRATIVE COURSE PREVIEW
            </p>
          </div>
        </div>
      </section>

      <section
        id="features"
        className="border-t border-white/[0.07] bg-white/[0.015] px-6 py-24 lg:px-10 lg:py-28"
      >
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.22em] text-[#D934F7]">
              BUILT FOR THE WAY YOU LEARN
            </p>
            <h2 className="mt-5 text-3xl font-medium tracking-tight sm:text-5xl">
              More than a course.
              <br />
              <span className="text-[#A69BAC]">A better way to grow.</span>
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {features.map((feature) => (
              <article
                key={feature.number}
                className="group rounded-3xl border border-white/[0.09] bg-white/[0.025] p-7 transition duration-300 hover:-translate-y-1 hover:border-[#D934F7]/40 hover:bg-white/[0.045] sm:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#D934F7]/10 text-2xl text-[#D934F7]">
                    {feature.icon}
                  </span>
                  <span className="text-xs text-[#897A91]">
                    {feature.number}
                  </span>
                </div>
                <h3 className="mt-9 text-xl font-medium">{feature.title}</h3>
                <p className="mt-4 text-sm leading-7 text-[#A69BAC]">
                  {feature.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-6 py-24 lg:px-10 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-semibold tracking-[0.22em] text-[#BCF429]">
              YOUR IDEAS, ORGANIZED
            </p>
            <h2 className="mt-5 text-3xl font-medium leading-tight tracking-tight sm:text-5xl">
              From “I want to learn”
              <br />
              to “I know how.”
            </h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-[#A69BAC]">
              Start with a topic. Let AI help organize your journey into
              lessons, resources, and quizzes you can work through at your own
              pace.
            </p>
            <a
              href="/register"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#BCF429] px-6 py-3.5 text-sm font-semibold text-black transition hover:bg-[#D4FF61]"
            >
              Start learning <span>↗</span>
            </a>
          </div>

          <div className="space-y-4">
            {[
              {
                n: "01",
                title: "Choose your subject",
                body: "Describe the skill, topic, or goal you want to explore.",
              },
              {
                n: "02",
                title: "Generate your course",
                body: "Organize learning into structured lessons and useful resources.",
              },
              {
                n: "03",
                title: "Practice and progress",
                body: "Review what you learn with quizzes and progress tracking.",
              },
            ].map((step) => (
              <div
                key={step.n}
                className="flex gap-5 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5 sm:p-6"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#7E078E]/30 text-sm text-[#E4A1F4]">
                  {step.n}
                </span>
                <div>
                  <h3 className="font-medium">{step.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#A69BAC]">
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 lg:px-10 lg:pb-28">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[32px] border border-white/10 bg-[#170B20] px-6 py-16 text-center sm:px-12">
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-96 -translate-x-1/2 rounded-full bg-[#D934F7]/20 blur-[100px]" />
          <div className="relative">
            <p className="text-xs font-semibold tracking-[0.2em] text-[#BCF429]">
              YOUR NEXT CHAPTER STARTS HERE
            </p>
            <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-medium tracking-tight sm:text-5xl">
              Make your next big idea your next new skill.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#A69BAC] sm:text-base">
              Build a learning routine that fits your goals and your life.
            </p>
            <a
              href="/register"
              className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-7 py-4 text-sm font-semibold text-black transition hover:bg-[#BCF429]"
            >
              Create your free account <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/[0.08] px-6 py-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
          <a href="#" className="text-lg font-semibold">
            Learn<span className="text-[#D934F7]">AI</span>
          </a>
          <p className="text-xs text-[#897A91]">
            Learn with intention. Grow with confidence.
          </p>
          <div className="flex gap-5 text-xs text-[#A69BAC]">
            <a href="/login" className="hover:text-white">
              Log in
            </a>
            <a href="/register" className="hover:text-white">
              Sign up
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}