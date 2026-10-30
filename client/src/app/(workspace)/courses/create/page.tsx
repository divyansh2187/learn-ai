
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const levels = ["Beginner", "Intermediate", "Advanced"];
const durations = ["1 week", "2 weeks", "4 weeks", "8 weeks"];
const styles = ["Video-first", "Balanced", "Practice-first"];

const steps = [
  { number: "01", label: "Topic", id: "course-topic" },
  { number: "02", label: "Your Level", id: "course-level" },
  { number: "03", label: "Learning Style", id: "course-style" },
  { number: "04", label: "Preferences", id: "course-preferences" },
];

export default function CreateCoursePage() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("2 weeks");
  const [style, setStyle] = useState("Balanced");
  const [goals, setGoals] = useState("");
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [includeVideos, setIncludeVideos] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeStep, setActiveStep] = useState(0);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setError("");

    if (!topic.trim()) {
      setError("Enter a topic to start building your course.");
      setActiveStep(0);
      document.getElementById("course-topic")?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    setLoading(true);

    const durationInDays: Record<string, number> = {
      "1 week": 7,
      "2 weeks": 14,
      "4 weeks": 28,
      "8 weeks": 56,
    };

    const learningStyle: Record<string, string> = {
      "Video-first": "videos",
      Balanced: "mixed",
      "Practice-first": "hands_on",
    };

    try {
      const response = await apiFetch("/courses/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: topic.trim(),
          goal: goals.trim() || "personal knowledge",
          level: level.toLowerCase(),
          style: learningStyle[style],
          duration: durationInDays[duration],
          includeVideos,
          includeQuizzes,
        }),
      });

      if (response.status === 401) {
        router.replace("/login");
        return;
      }

      if (response.status === 403) {
        throw new Error(
          "You don't have permission to generate a course. Please sign in again.",
        );
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Course generation failed.",
        );
      }

      const course = result.data;

      if (!course?.id) {
        throw new Error(
          "The course was generated, but no course ID was returned.",
        );
      }

      router.push(`/courses/${course.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while generating your course.",
      );
    } finally {
      setLoading(false);
    }
  }

  function navigateToStep(index: number, id: string) {
    setActiveStep(index);

    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }

  const inputClass =
    "w-full min-w-0 rounded-xl border border-white/[0.13] bg-white/[0.045] px-3.5 py-2 text-sm leading-5 text-white outline-none backdrop-blur-xl transition placeholder:text-[#8294AD] focus:border-[#61C5FA]/60 focus:bg-white/[0.07] focus:ring-2 focus:ring-[#2684FF]/20";

  const labelClass =
    "mb-1.5 block text-xs font-medium text-[#E3ECF7] sm:text-sm";

  return (
    <main className="relative isolate min-h-full w-full overflow-x-hidden bg-transparent px-3 py-4 text-white sm:px-5 lg:px-6 lg:py-3">

      {/* Background Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -left-40 top-10 h-[350px] w-[350px] rounded-full bg-[#155EAB]/20 blur-[120px]" />

        <div className="absolute -right-40 top-[20%] h-[400px] w-[400px] rounded-full bg-[#2684FF]/15 blur-[130px]" />

        <div className="absolute bottom-[-150px] left-[35%] h-[300px] w-[300px] rounded-full bg-[#61C5FA]/10 blur-[120px]" />
      </div>

      {/* Main Layout */}
      <section className="relative z-10 mx-auto grid w-full max-w-[1200px] grid-cols-1 items-start gap-5 py-2 lg:grid-cols-[minmax(0,1fr)_230px] lg:gap-6 xl:grid-cols-[minmax(0,1fr)_260px]">

        {/* LEFT SIDE - COURSE FORM */}
        <div className="min-w-0">

          {/* Heading */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
                Create your course
              </h1>

              <p className="mt-1 text-xs text-[#8294AD] sm:text-sm">
                Customize your learning experience.
              </p>
            </div>

            <span className="shrink-0 rounded-full border border-[#61C5FA]/25 bg-[#2684FF]/10 px-3 py-1.5 text-[10px] font-semibold tracking-wider text-[#8EDAFF] backdrop-blur-xl">
              AI POWERED
            </span>
          </div>

          {/* Glass Form */}
          <form
            onSubmit={handleSubmit}
            className="min-w-0 space-y-3 rounded-[22px] border border-white/[0.16] bg-[#101722]/45 p-3.5 shadow-[0_8px_40px_rgba(0,0,0,0.20)] backdrop-blur-2xl backdrop-saturate-150 sm:p-5 lg:space-y-3 lg:p-5"
          >

            {/* Topic */}
            <div
              id="course-topic"
              className="min-w-0 scroll-mt-4"
            >
              <label htmlFor="topic" className={labelClass}>
                What do you want to learn?
              </label>

              <textarea
                id="topic"
                required
                maxLength={300}
                rows={2}
                value={topic}
                onFocus={() => setActiveStep(0)}
                onChange={(event) => {
                  setTopic(event.target.value);
                  setError("");
                }}
                placeholder="e.g. Full-stack development with React and Node.js"
                className={`${inputClass} h-[58px] min-h-[58px] resize-none`}
              />

              <p className="mt-0.5 text-right text-[10px] text-[#71839B]">
                {topic.length}/300
              </p>
            </div>

            {/* Level and Duration */}
            <div
              id="course-level"
              className="grid min-w-0 scroll-mt-4 grid-cols-1 gap-3 sm:grid-cols-2"
            >
              <div className="min-w-0">
                <p className={labelClass}>
                  Your current level
                </p>

                <div className="grid grid-cols-3 gap-1.5">
                  {levels.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => {
                        setLevel(item);
                        setActiveStep(1);
                      }}
                      aria-pressed={level === item}
                      className={`flex h-[42px] min-w-0 items-center justify-center whitespace-nowrap rounded-lg border px-1 text-[10px] font-medium transition sm:text-xs ${
                        level === item
                          ? "border-[#61C5FA]/50 bg-[#2684FF]/[0.16] text-white"
                          : "border-white/[0.12] bg-white/[0.04] text-[#A9BAD3] hover:border-[#61C5FA]/35 hover:bg-white/[0.07]"
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-w-0">
                <label htmlFor="duration" className={labelClass}>
                  Learning timeline
                </label>

                <select
                  id="duration"
                  value={duration}
                  onFocus={() => setActiveStep(1)}
                  onChange={(event) => {
                    setDuration(event.target.value);
                    setActiveStep(1);
                  }}
                  className={`${inputClass} h-[42px] py-1.5`}
                >
                  {durations.map((item) => (
                    <option
                      key={item}
                      value={item}
                      className="bg-[#101722]"
                    >
                      {item}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Learning Style */}
            <div
              id="course-style"
              className="min-w-0 scroll-mt-4"
            >
              <p className={labelClass}>
                How do you learn best?
              </p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                {styles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      setStyle(item);
                      setActiveStep(2);
                    }}
                    aria-pressed={style === item}
                    className={`flex h-[62px] min-w-0 items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left backdrop-blur-xl transition ${
                      style === item
                        ? "border-[#61C5FA]/50 bg-[#2684FF]/[0.16]"
                        : "border-white/[0.12] bg-white/[0.04] hover:border-[#61C5FA]/35 hover:bg-white/[0.07]"
                    }`}
                  >
                    <span className="min-w-0">
                      <span className="block text-xs font-medium text-white">
                        {item}
                      </span>

                      <span className="mt-0.5 block text-[10px] leading-4 text-[#8294AD]">
                        {item === "Video-first"
                          ? "Video lessons"
                          : item === "Balanced"
                            ? "Mixed learning"
                            : "Hands-on practice"}
                      </span>
                    </span>

                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] ${
                        style === item
                          ? "border-[#61C5FA] bg-[#2684FF] text-white"
                          : "border-white/20 text-transparent"
                      }`}
                    >
                      ✓
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div
              id="course-preferences"
              className="min-w-0 scroll-mt-4"
            >
              <label htmlFor="goals" className={labelClass}>
                Specific goals{" "}
                <span className="font-normal text-[#8294AD]">
                  (optional)
                </span>
              </label>

              <textarea
                id="goals"
                rows={2}
                maxLength={500}
                value={goals}
                onFocus={() => setActiveStep(3)}
                onChange={(event) => setGoals(event.target.value)}
                placeholder="e.g. Build projects and prepare for job interviews"
                className={`${inputClass} h-[55px] min-h-[55px] resize-none`}
              />

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">

                <label className="flex h-[48px] min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.12] bg-white/[0.045] px-3 py-2 backdrop-blur-xl transition hover:border-[#61C5FA]/30 hover:bg-white/[0.07]">
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-white">
                      Video resources
                    </span>
                    <span className="block text-[10px] text-[#8294AD]">
                      Include video lessons
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={includeVideos}
                    onChange={(event) =>
                      setIncludeVideos(event.target.checked)
                    }
                    className="h-4 w-4 shrink-0 accent-[#2684FF]"
                  />
                </label>

                <label className="flex h-[48px] min-w-0 cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/[0.12] bg-white/[0.045] px-3 py-2 backdrop-blur-xl transition hover:border-[#61C5FA]/30 hover:bg-white/[0.07]">
                  <span className="min-w-0">
                    <span className="block text-xs font-medium text-white">
                      Quizzes
                    </span>
                    <span className="block text-[10px] text-[#8294AD]">
                      Include knowledge checks
                    </span>
                  </span>

                  <input
                    type="checkbox"
                    checked={includeQuizzes}
                    onChange={(event) =>
                      setIncludeQuizzes(event.target.checked)
                    }
                    className="h-4 w-4 shrink-0 accent-[#2684FF]"
                  />
                </label>

              </div>
            </div>

            {/* Error */}
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-400/25 bg-red-400/[0.08] p-2.5 text-xs leading-4 text-red-300"
              >
                {error}
              </p>
            )}

            {/* Generate Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl border border-[#61C5FA]/40 bg-gradient-to-r from-[#155EAB] to-[#2684FF] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(38,132,255,0.22)] transition hover:brightness-110 hover:shadow-[0_8px_30px_rgba(38,132,255,0.32)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Generating your course..."
                : "Generate my course ↗"}
            </button>

          </form>
        </div>

        {/* RIGHT SIDE - VERTICAL PROGRESS */}
        <aside className="min-w-0 lg:sticky lg:top-6">

          <div className="rounded-[22px] border border-white/[0.14] bg-[#101722]/50 p-4 shadow-[0_8px_35px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-5">

            {/* Progress Heading */}
            <div className="mb-5">
              <p className="text-[10px] font-semibold tracking-[0.2em] text-[#61C5FA]">
                YOUR PROGRESS
              </p>

              <h2 className="mt-1.5 text-lg font-semibold text-white">
                Course setup
              </h2>

              <p className="mt-1 text-xs text-[#8294AD]">
                Complete each step to build your course.
              </p>
            </div>

            {/* Progress Percentage */}
            <div className="mb-5">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-[#A9BAD3]">
                  Completion
                </span>

                <span className="text-sm font-semibold text-[#61C5FA]">
                  {Math.round(((activeStep + 1) / steps.length) * 100)}%
                </span>
              </div>

              <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.09]">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#2684FF] to-[#61C5FA] transition-all duration-500"
                  style={{
                    width: `${((activeStep + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>

            {/* Vertical Stepper */}
            <div className="relative">

              {/* Connecting Line */}
              <div className="absolute left-[17px] top-5 bottom-5 w-px bg-white/[0.12]" />

              <div
                className="absolute left-[17px] top-5 w-px bg-gradient-to-b from-[#2684FF] to-[#61C5FA] transition-all duration-500"
                style={{
                  height: `${(activeStep / (steps.length - 1)) * 100}%`,
                  maxHeight: "calc(100% - 40px)",
                }}
              />

              <div className="relative space-y-5">
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
                      className="group flex w-full items-center gap-3 text-left"
                    >

                      {/* Number Circle */}
                      <span
                        className={`relative z-10 flex h-[35px] w-[35px] shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold transition-all duration-300 ${
                          isCompleted
                            ? "border-[#2684FF] bg-[#2684FF] text-white shadow-[0_0_15px_rgba(38,132,255,0.25)]"
                            : isActive
                              ? "border-[#61C5FA] bg-[#2684FF]/20 text-[#61C5FA] shadow-[0_0_18px_rgba(38,132,255,0.20)]"
                              : "border-white/20 bg-[#101722] text-[#8294AD] group-hover:border-[#61C5FA]/50"
                        }`}
                      >
                        {isCompleted ? "✓" : step.number}
                      </span>

                      {/* Step Text */}
                      <span className="min-w-0">
                        <span
                          className={`block text-xs font-semibold transition ${
                            isActive || isCompleted
                              ? "text-white"
                              : "text-[#8294AD] group-hover:text-[#C6D5E8]"
                          }`}
                        >
                          {step.label}
                        </span>

                        <span
                          className={`mt-1 block text-[10px] ${
                            isActive
                              ? "text-[#61C5FA]"
                              : isCompleted
                                ? "text-[#8294AD]"
                                : "text-[#64758D]"
                          }`}
                        >
                          {isCompleted
                            ? "Completed"
                            : isActive
                              ? "Currently editing"
                              : "Upcoming step"}
                        </span>
                      </span>

                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Info */}
            <div className="mt-6 rounded-xl border border-[#61C5FA]/15 bg-[#2684FF]/[0.07] p-3">
              <p className="text-xs font-medium text-[#C8E9FF]">
                ✦ AI Personalized Learning
              </p>

              <p className="mt-1 text-[10px] leading-4 text-[#8294AD]">
                Your choices help LearnAI create a learning experience around your goals.
              </p>
            </div>

          </div>
        </aside>

      </section>
    </main>
  );
}
