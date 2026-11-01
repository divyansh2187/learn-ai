"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const steps = [
  { number: "01", label: "Topic", id: "course-topic" },
  { number: "02", label: "Your Level", id: "course-level" },
  { number: "03", label: "Learning Style", id: "course-style" },
  { number: "04", label: "Preferences", id: "course-preferences" },
];

const glass =
  "border border-white/[0.18] bg-white/[0.07] backdrop-blur-2xl backdrop-saturate-150 shadow-[0_8px_32px_rgba(0,0,0,0.18)] ring-1 ring-inset ring-white/[0.04]";

const selectedClass =
  "border-[#D0DFF0] bg-[#D0DFF0] text-[#101722] shadow-[0_2px_12px_rgba(208,223,240,0.12)]";

const unselectedClass =
  "border-white/[0.16] bg-white/[0.07] text-[#F1F5F9] hover:border-white/30 hover:bg-white/[0.12]";

export default function CreateCoursePage() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("2 weeks");
  const [style, setStyle] = useState("Balanced");
  const [goal, setGoal] = useState("");
  const [includeVideos, setIncludeVideos] = useState(true);
  const [includeQuizzes, setIncludeQuizzes] = useState(true);

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigateToStep = (index: number, id: string) => {
    setActiveStep(index);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    setError("");

    if (!topic.trim()) {
      setError("Please enter a course topic.");
      return;
    }

    try {
      setLoading(true);

      const result = await apiFetch("/courses/generate", {
        method: "POST",
        body: JSON.stringify({
          topic: topic.trim(),
          goal: goal.trim(),
          level,
          style,
          duration,
          includeVideos,
          includeQuizzes,
        }),
      });

      if (result?.status === 401) {
        router.push("/login");
        return;
      }

      if (result?.status === 403) {
        setError("You don't have permission to create a course.");
        return;
      }

      if (!result?.success || !result?.course?.id) {
        setError(
          result?.message ||
            "Unable to generate your course. Please try again."
        );
        return;
      }

      router.push(`/courses/${result.course.id}`);
    } catch (err) {
      console.error("Course generation error:", err);

      setError(
        "Something went wrong while creating your course. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative isolate h-full min-h-0 w-full overflow-hidden bg-transparent text-white">

      {/* BACKGROUND GRID */}

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

      {/* BACKGROUND GLOW */}

      <div
        aria-hidden="true"
        className="pointer-events-none fixed -bottom-40 left-1/2 -z-10 h-[450px] w-[700px] -translate-x-1/2 rounded-full bg-[#2684FF]/20 blur-[120px]"
      />

      {/* MAIN LAYOUT */}

      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1440px] grid-cols-1 gap-4 overflow-hidden px-[clamp(12px,2vw,30px)] py-[clamp(12px,2vh,24px)] lg:grid-cols-[minmax(0,1fr)_170px] lg:gap-5">

        {/* LEFT SIDE */}

        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

          {/* HEADER */}

          <header className="mb-[clamp(12px,2vh,22px)] shrink-0">
            <span className="text-[clamp(13px,1vw,16px)] font-semibold tracking-[-0.04em] text-white">
              Learn<span className="text-[#BDEAFF]">AI</span>
            </span>

            <h1 className="mt-1 text-[clamp(20px,2.1vw,30px)] font-bold leading-tight tracking-tight text-white">
              Create Your Personalized Course
            </h1>
          </header>

          {/* MAIN FORM */}

          <form
            onSubmit={handleSubmit}
            className={`relative mb-3 min-w-0 shrink-0 space-y-[clamp(10px,1.5vh,18px)] overflow-hidden rounded-[clamp(16px,1.5vw,22px)] ${glass} p-[clamp(13px,1.6vw,24px)]`}
          >

            {/* GLASS REFLECTION */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/[0.04] bg-gradient-to-br from-white/[0.07] via-transparent to-sky-300/[0.04]"
            />

            <div className="relative z-10 space-y-[clamp(10px,1.5vh,18px)]">

              {/* TOPIC */}

              <section id="course-topic" className="scroll-mt-5">
                <label
                  htmlFor="topic"
                  className="mb-2 block text-[clamp(12px,0.95vw,14px)] font-semibold text-white"
                >
                  What do you want to learn?
                </label>

                <textarea
                  id="topic"
                  value={topic}
                  onChange={(event) => setTopic(event.target.value)}
                  onFocus={() => setActiveStep(0)}
                  placeholder="e.g. Web Development, Python, Digital Marketing..."
                  rows={2}
                  required
                  className="min-h-[clamp(58px,8vh,76px)] w-full resize-none rounded-xl border border-white/[0.18] bg-white/[0.07] px-3 py-2.5 text-[clamp(12px,0.95vw,14px)] font-medium text-white outline-none backdrop-blur-xl transition placeholder:text-[#D1DCEB] focus:border-[#D0DFF0]/70 focus:bg-white/[0.10] focus:ring-2 focus:ring-[#D0DFF0]/15"
                />
              </section>

              {/* EXPERIENCE LEVEL */}

              <section id="course-level" className="scroll-mt-5">
                <p className="mb-3 text-[clamp(12px,0.95vw,14px)] font-semibold text-white">
                  What's your current level?
                </p>

                <div className="relative rounded-full border border-white/[0.16] bg-white/[0.07] p-1.5 backdrop-blur-xl">

                  {/* ANIMATED SELECTION */}

                  <div
                    className="absolute bottom-1.5 top-1.5 w-[calc((100%-12px)/3)] rounded-full bg-[#D0DFF0] shadow-[0_2px_15px_rgba(208,223,240,0.18)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      transform: `translateX(${
                        ["Beginner", "Intermediate", "Advanced"].indexOf(level) * 100
                      }%)`,
                    }}
                  />

                  <div className="relative z-10 grid grid-cols-3">
                    {["Beginner", "Intermediate", "Advanced"].map((item) => {
                      const isSelected = level === item;

                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => {
                            setLevel(item);
                            setActiveStep(1);
                          }}
                          aria-pressed={isSelected}
                          className={`relative flex min-h-[42px] items-center justify-center rounded-full px-2 text-[clamp(10px,0.9vw,13px)] font-semibold transition-colors duration-300 ${
                            isSelected
                              ? "text-[#101722]"
                              : "text-[#E2E8F0] hover:text-white"
                          }`}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-2 flex items-center justify-between px-1">
                  <span className="text-[10px] font-medium text-[#E2E8F0]">
                    {level === "Beginner"
                      ? "Starting from basics"
                      : level === "Intermediate"
                        ? "Some experience"
                        : "Advanced knowledge"}
                  </span>

                  <span className="text-[10px] font-semibold text-[#BDEAFF]">
                    {level}
                  </span>
                </div>
              </section>

              {/* COURSE DURATION */}

              <section>
                <label
                  htmlFor="duration"
                  className="mb-2 block text-[clamp(12px,0.95vw,14px)] font-semibold text-white"
                >
                  Course duration
                </label>

                <div className="group relative">
                  <select
                    id="duration"
                    value={duration}
                    onChange={(event) => setDuration(event.target.value)}
                    className="h-[clamp(42px,5vh,50px)] w-full appearance-none rounded-xl border border-white/[0.18] bg-white/[0.07] px-4 pr-11 text-[clamp(12px,0.95vw,14px)] font-semibold text-white shadow-[0_8px_32px_rgba(0,0,0,0.18)] backdrop-blur-xl outline-none transition-all duration-300 hover:border-white/30 hover:bg-white/[0.10] focus:border-[#D0DFF0]/70"
                  >
                    <option className="bg-[#172232] text-white" value="1 week">
                      1 Week
                    </option>

                    <option className="bg-[#172232] text-white" value="2 weeks">
                      2 Weeks
                    </option>

                    <option className="bg-[#172232] text-white" value="4 weeks">
                      4 Weeks
                    </option>

                    <option className="bg-[#172232] text-white" value="8 weeks">
                      8 Weeks
                    </option>
                  </select>

                  <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
                    <svg
                      className="h-4 w-4 text-[#D0DFF0] transition-transform duration-300 group-focus-within:rotate-180"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    >
                      <path
                        d="m6 9 6 6 6-6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </section>

              {/* LEARNING STYLE */}

              <section id="course-style" className="scroll-mt-5">
                <p className="mb-2 text-[clamp(12px,0.95vw,14px)] font-semibold text-white">
                  Choose your learning style
                </p>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {[
                    {
                      name: "Video-first",
                      description: "Learn through videos",
                    },
                    {
                      name: "Balanced",
                      description: "Videos, reading and practice",
                    },
                    {
                      name: "Practice-first",
                      description: "Learn by doing projects",
                    },
                  ].map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setStyle(item.name);
                        setActiveStep(2);
                      }}
                      className={`flex min-h-[clamp(58px,8vh,76px)] flex-col items-start justify-center rounded-xl border px-3 py-2 text-left transition-all duration-200 ${
                        style === item.name
                          ? selectedClass
                          : unselectedClass
                      }`}
                    >
                      <span className="text-[clamp(11px,0.9vw,13px)] font-semibold">
                        {item.name}
                      </span>

                      <span
                        className={`mt-1 text-[clamp(9px,0.75vw,11px)] font-medium ${
                          style === item.name
                            ? "text-[#43556B]"
                            : "text-[#E2E8F0]"
                        }`}
                      >
                        {item.description}
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* LEARNING GOAL */}

              <section>
                <label
                  htmlFor="goal"
                  className="mb-2 block text-[clamp(12px,0.95vw,14px)] font-semibold text-white"
                >
                  What is your learning goal?

                  <span className="ml-2 font-medium text-[#CBD5E1]">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="goal"
                  value={goal}
                  onChange={(event) => setGoal(event.target.value)}
                  placeholder="e.g. I want to build real-world projects and prepare for a job..."
                  rows={2}
                  className="min-h-[clamp(58px,7vh,70px)] w-full resize-none rounded-xl border border-white/[0.18] bg-white/[0.07] px-3 py-2.5 text-[clamp(12px,0.95vw,14px)] font-medium text-white outline-none backdrop-blur-xl transition placeholder:text-[#D1DCEB] focus:border-[#D0DFF0]/70 focus:bg-white/[0.10] focus:ring-2 focus:ring-[#D0DFF0]/15"
                />
              </section>

              {/* PREFERENCES */}

              <section
                id="course-preferences"
                className="scroll-mt-5"
              >
                <p className="mb-2 text-[clamp(12px,0.95vw,14px)] font-semibold text-white">
                  Course preferences
                </p>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">

                  <label className="flex min-h-[clamp(42px,5.5vh,54px)] cursor-pointer items-center gap-3 rounded-xl border border-white/[0.16] bg-white/[0.07] px-3 py-2 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.12]">
                    <input
                      type="checkbox"
                      checked={includeVideos}
                      onChange={(event) =>
                        setIncludeVideos(event.target.checked)
                      }
                      className="h-4 w-4 shrink-0 accent-[#D0DFF0]"
                    />

                    <span className="text-[clamp(11px,0.85vw,13px)] font-medium text-[#F1F5F9]">
                      Include learning videos
                    </span>
                  </label>

                  <label className="flex min-h-[clamp(42px,5.5vh,54px)] cursor-pointer items-center gap-3 rounded-xl border border-white/[0.16] bg-white/[0.07] px-3 py-2 backdrop-blur-xl transition hover:border-white/30 hover:bg-white/[0.12]">
                    <input
                      type="checkbox"
                      checked={includeQuizzes}
                      onChange={(event) =>
                        setIncludeQuizzes(event.target.checked)
                      }
                      className="h-4 w-4 shrink-0 accent-[#D0DFF0]"
                    />

                    <span className="text-[clamp(11px,0.85vw,13px)] font-medium text-[#F1F5F9]">
                      Include quizzes
                    </span>
                  </label>

                </div>
              </section>

              {/* ERROR */}

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2.5 text-[clamp(11px,0.85vw,13px)] font-medium text-red-200 backdrop-blur-xl"
                >
                  {error}
                </div>
              )}

              {/* CREATE COURSE BUTTON */}

              <div className="flex justify-start pt-1">
                <button
                  type="submit"
                  disabled={loading}
                  className="liquid-metal-button w-fit rounded-full text-[9px] font-medium text-white transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4388FF] disabled:cursor-not-allowed disabled:opacity-50 sm:text-[10px]"
                >
                  <span
                    className="liquid-metal-button__shine"
                    aria-hidden="true"
                  />

                  <span className="liquid-metal-button__content gap-1.5 px-5 py-2.5 sm:px-6">
                    {loading ? "Generating..." : "Create Course"}
                    <span aria-hidden="true">↗</span>
                  </span>
                </button>
              </div>

            </div>
          </form>
        </div>

        {/* RIGHT SIDE - GLASS STEP NAVIGATION */}

        <aside className="hidden min-w-0 lg:flex lg:h-full lg:w-[170px] lg:items-center lg:justify-center">

          <div className={`relative h-[min(72vh,680px)] min-h-[420px] w-full overflow-hidden rounded-[24px] ${glass} p-4`}>

            {/* GLASS REFLECTION */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-[inherit] border border-white/[0.04] bg-gradient-to-br from-white/[0.07] via-transparent to-sky-300/[0.04]"
            />

            {/* BLUE GLOW */}

            <div
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-[#2684FF]/20 blur-[65px]"
            />

            {/* STEP NAVIGATION */}

            <div className="relative z-10 flex h-full flex-col justify-between">

              {steps.map((step, index) => {
                const isActive = activeStep === index;
                const isCompleted = activeStep > index;

                return (
                  <button
                    key={step.number}
                    type="button"
                    onClick={() =>
                      navigateToStep(index, step.id)
                    }
                    aria-current={isActive ? "step" : undefined}
                    className="group flex items-center gap-3 rounded-xl p-1.5 text-left transition hover:bg-white/[0.08]"
                  >
                    <span
                      className={`relative z-10 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border text-[12px] font-bold transition-all duration-300 ${
                        isActive || isCompleted
                          ? "border-[#D0DFF0] bg-[#D0DFF0] text-[#101722] shadow-[0_2px_12px_rgba(208,223,240,0.15)]"
                          : "border-white/25 bg-white/[0.07] text-[#F1F5F9] group-hover:border-white/50 group-hover:bg-white/[0.14]"
                      }`}
                    >
                      {isCompleted ? "✓" : step.number}
                    </span>

                    <span
                      className={`whitespace-nowrap text-[clamp(10px,0.8vw,12px)] font-semibold transition-colors ${
                        isActive || isCompleted
                          ? "text-white"
                          : "text-[#E2E8F0] group-hover:text-white"
                      }`}
                    >
                      {step.label}
                    </span>
                  </button>
                );
              })}

            </div>
          </div>
        </aside>

      </div>
    </main>
  );
}