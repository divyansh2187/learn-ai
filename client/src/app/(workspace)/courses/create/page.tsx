
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

const selectedClass =
  "border-[#D0DFF0] bg-[#D0DFF0] text-[#101722] shadow-[0_2px_12px_rgba(208,223,240,0.12)]";

const unselectedClass =
  "border-white/[0.12] bg-white/[0.04] text-[#A9BAD3] hover:border-[#D0DFF0]/40 hover:bg-white/[0.08]";

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

      {/* RESPONSIVE MAIN LAYOUT */}

      <div className="mx-auto grid h-full min-h-0 w-full max-w-[1440px] grid-cols-1 gap-4 overflow-hidden px-[clamp(12px,2vw,30px)] py-[clamp(12px,2vh,24px)] lg:grid-cols-[minmax(0,1fr)_170px] lg:gap-5">

        {/* LEFT SIDE - SCROLLABLE COURSE FORM */}

        <div className="flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden overflow-y-auto overscroll-contain pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

          {/* Header */}

          <header className="mb-[clamp(12px,2vh,22px)] shrink-0">
            <span className="text-[clamp(13px,1vw,16px)] font-medium tracking-[-0.04em]">
              Learn<span className="text-[#8BD6FF]">AI</span>
            </span>

            <h1 className="mt-1 text-[clamp(20px,2.1vw,30px)] font-semibold leading-tight tracking-tight text-white">
              Create Your Personalized Course
            </h1>
          </header>

          <form
            onSubmit={handleSubmit}
            className="mb-3 min-w-0 shrink-0 space-y-[clamp(10px,1.5vh,18px)] rounded-[clamp(16px,1.5vw,22px)] border border-white/[0.16] bg-[#101722]/45 p-[clamp(13px,1.6vw,24px)] shadow-[0_8px_35px_rgba(0,0,0,0.20)] backdrop-blur-2xl backdrop-saturate-150"
          >

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
                className="min-h-[clamp(58px,8vh,76px)] w-full resize-none rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2.5 text-[clamp(12px,0.95vw,14px)] text-white outline-none transition placeholder:text-[#8294AD] focus:border-[#D0DFF0]/60 focus:ring-2 focus:ring-[#D0DFF0]/10"
              />
            </section>

           
{/* ANIMATED EXPERIENCE LEVEL SELECTOR */}

<section id="course-level" className="scroll-mt-5">
  <p className="mb-3 text-[clamp(12px,0.95vw,14px)] font-semibold text-white">
    What's your current level?
  </p>

  <div className="relative rounded-full border border-white/[0.12] bg-[#101722]/80 p-1.5">

    {/* Animated selection background */}
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
                : "text-[#8294AD] hover:text-white"
            }`}
          >
            {item}
          </button>
        );
      })}
    </div>
  </div>

  <div className="mt-2 flex items-center justify-between px-1">
    <span className="text-[10px] text-[#8294AD]">
      {level === "Beginner"
        ? "Starting from basics"
        : level === "Intermediate"
          ? "Some experience"
          : "Advanced knowledge"}
    </span>

    <span className="text-[10px] font-medium text-[#D0DFF0]">
      {level}
    </span>
  </div>
</section>


        {/* GLASSMORPHISM COURSE DURATION */}

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
      className="
        h-[clamp(42px,5vh,50px)] w-full
        appearance-none rounded-xl
        border border-white/15
        bg-white/[0.06]
        px-4 pr-11
        text-[clamp(12px,0.95vw,14px)]
        font-medium text-white
        shadow-[0_8px_32px_rgba(0,0,0,0.18)]
        backdrop-blur-xl
        outline-none
        transition-all duration-300
        hover:border-[#D0DFF0]/40
        hover:bg-white/[0.09]
        focus:border-[#D0DFF0]/60
        focus:bg-white/[0.10]
        focus:shadow-[0_0_20px_rgba(208,223,240,0.10)]
      "
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

    {/* Animated dropdown arrow */}
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
                      className={`mt-1 text-[clamp(9px,0.75vw,11px)] ${
                        style === item.name
                          ? "text-[#43556B]"
                          : "text-[#8294AD]"
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

                <span className="ml-2 font-normal text-[#8294AD]">
                  (Optional)
                </span>
              </label>

              <textarea
                id="goal"
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                placeholder="e.g. I want to build real-world projects and prepare for a job..."
                rows={2}
                className="min-h-[clamp(58px,7vh,70px)] w-full resize-none rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2.5 text-[clamp(12px,0.95vw,14px)] text-white outline-none transition placeholder:text-[#8294AD] focus:border-[#D0DFF0]/60 focus:ring-2 focus:ring-[#D0DFF0]/10"
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

                <label className="flex min-h-[clamp(42px,5.5vh,54px)] cursor-pointer items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2 transition hover:bg-white/[0.07]">
                  <input
                    type="checkbox"
                    checked={includeVideos}
                    onChange={(event) =>
                      setIncludeVideos(event.target.checked)
                    }
                    className="h-4 w-4 shrink-0 accent-[#D0DFF0]"
                  />

                  <span className="text-[clamp(11px,0.85vw,13px)] text-[#A9BAD3]">
                    Include learning videos
                  </span>
                </label>

                <label className="flex min-h-[clamp(42px,5.5vh,54px)] cursor-pointer items-center gap-3 rounded-xl border border-white/[0.12] bg-white/[0.04] px-3 py-2 transition hover:bg-white/[0.07]">
                  <input
                    type="checkbox"
                    checked={includeQuizzes}
                    onChange={(event) =>
                      setIncludeQuizzes(event.target.checked)
                    }
                    className="h-4 w-4 shrink-0 accent-[#D0DFF0]"
                  />

                  <span className="text-[clamp(11px,0.85vw,13px)] text-[#A9BAD3]">
                    Include quizzes
                  </span>
                </label>

              </div>
            </section>

            {/* ERROR */}

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2.5 text-[clamp(11px,0.85vw,13px)] text-red-300"
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

          </form>
        </div>

        {/* RIGHT SIDE - NARROW STATIONARY PROGRESS */}

        <aside className="hidden min-w-0 lg:flex lg:h-full lg:w-[170px] lg:items-center lg:justify-center">

          <div className="relative h-[min(72vh,680px)] min-h-[420px] w-full">

            {/* BACKGROUND LINE */}

            <div className="absolute bottom-4 left-[15px] top-4 w-[2px] rounded-full bg-white/15" />

            {/* ACTIVE PROGRESS LINE */}

            <div className="absolute bottom-4 left-[15px] top-4 w-[2px] overflow-hidden rounded-full">
              <div
                className="w-full rounded-full bg-[#D0DFF0] transition-all duration-500"
                style={{
                  height: `${(activeStep / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* PROGRESS STEPS */}

            <div className="relative flex h-full flex-col justify-between">

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
                    className="group flex items-center gap-3 text-left"
                  >
                    <span
                      className={`relative z-10 flex h-[32px] w-[32px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-all duration-300 ${
                        isActive || isCompleted
                          ? "border-[#D0DFF0] bg-[#D0DFF0] text-[#101722]"
                          : "border-white/20 bg-[#101722] text-[#8294AD] group-hover:border-[#D0DFF0]/60"
                      }`}
                    >
                      {isCompleted ? "✓" : step.number}
                    </span>

                    <span
                      className={`whitespace-nowrap text-[clamp(10px,0.8vw,12px)] font-medium transition-colors ${
                        isActive || isCompleted
                          ? "text-[#D0DFF0]"
                          : "text-[#8294AD] group-hover:text-white"
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
