
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";

const levels = ["Beginner", "Intermediate", "Advanced"];
const durations = ["1 week", "2 weeks", "4 weeks", "8 weeks"];
const styles = ["Video-first", "Balanced", "Practice-first"];

export default function CreateCoursePage() {
  const router = useRouter();

  const [topic, setTopic] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [duration, setDuration] = useState("2 weeks");
  const [style, setStyle] = useState("Balanced");
  const [goals, setGoals] = useState("");
  const [includeQuizzes, setIncludeQuizzes] = useState(true);
  const [includeVideos, setIncludeVideos] = useState(true);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (!topic.trim()) {
      setError("Enter a topic to start building your course.");
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

  return (
    <main className="min-h-screen bg-[#09030E] text-white">
      <header className="flex items-center justify-between border-b border-white/[0.08] px-5 py-5 sm:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D934F7] text-xl font-bold text-black">
            L
          </span>
          <span className="text-xl font-semibold">
            Learn<span className="text-[#D934F7]">AI</span>
          </span>
        </Link>

        <Link
          href="/dashboard"
          className="rounded-full border border-white/10 px-4 py-2.5 text-sm text-[#A69BAC] transition hover:bg-white/[0.05] hover:text-white"
        >
          ← Dashboard
        </Link>
      </header>

      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[1fr_0.7fr] lg:gap-20 lg:px-10">
        <section>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D934F7]/20 bg-[#D934F7]/[0.07] px-3 py-2 text-xs text-[#E4A1F4]">
            <span>✳</span> AI COURSE STUDIO
          </div>

          <h1 className="mt-6 max-w-2xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            Turn your curiosity into a{" "}
            <span className="text-[#D934F7]">learning plan.</span>
          </h1>

          <p className="mt-5 max-w-xl text-sm leading-7 text-[#A69BAC] sm:text-base">
            Tell LearnAI what you want to learn. Choose your level,
            timeline, and learning style to shape a course around your
            goals.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mt-10 space-y-8 rounded-3xl border border-white/10 bg-white/[0.025] p-5 sm:p-8"
          >
            <div>
              <label
                htmlFor="topic"
                className="mb-3 block text-sm font-medium"
              >
                What do you want to learn?
              </label>

              <textarea
                id="topic"
                required
                maxLength={300}
                rows={3}
                value={topic}
                onChange={(event) => {
                  setTopic(event.target.value);
                  setMessage("");
                  setError("");
                }}
                placeholder="e.g. Full-stack development with React and Node.js"
                className="w-full resize-y rounded-2xl border border-white/10 bg-[#0D0612] px-4 py-4 text-sm leading-6 outline-none transition placeholder:text-[#75667C] focus:border-[#D934F7]/60 focus:ring-2 focus:ring-[#D934F7]/10"
              />

              <p className="mt-2 text-right text-xs text-[#75667C]">
                {topic.length}/300
              </p>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">
                Your current level
              </p>

              <div className="grid grid-cols-3 gap-2">
                {levels.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setLevel(item)}
                    aria-pressed={level === item}
                    className={`rounded-xl border px-2 py-3 text-xs transition sm:text-sm ${
                      level === item
                        ? "border-[#D934F7]/50 bg-[#D934F7]/10 text-white"
                        : "border-white/10 bg-white/[0.02] text-[#A69BAC] hover:border-white/20"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="duration"
                className="mb-3 block text-sm font-medium"
              >
                Learning timeline
              </label>

              <select
                id="duration"
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#0D0612] px-4 py-3.5 text-sm outline-none focus:border-[#D934F7]/60"
              >
                {durations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <p className="mb-3 text-sm font-medium">
                How do you learn best?
              </p>

              <div className="space-y-3">
                {styles.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setStyle(item)}
                    aria-pressed={style === item}
                    className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${
                      style === item
                        ? "border-[#D934F7]/50 bg-[#D934F7]/[0.07]"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    }`}
                  >
                    <span>
                      <span className="block text-sm font-medium">
                        {item}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-[#897A91]">
                        {item === "Video-first"
                          ? "Prioritize curated video lessons."
                          : item === "Balanced"
                            ? "Combine explanations, videos, and practice."
                            : "Focus on exercises and knowledge checks."}
                      </span>
                    </span>

                    <span
                      className={`ml-3 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        style === item
                          ? "border-[#D934F7] bg-[#D934F7] text-black"
                          : "border-white/20"
                      }`}
                    >
                      {style === item ? "✓" : ""}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="goals"
                className="mb-3 block text-sm font-medium"
              >
                Specific goals{" "}
                <span className="text-[#897A91]">(optional)</span>
              </label>

              <textarea
                id="goals"
                rows={2}
                maxLength={500}
                value={goals}
                onChange={(event) => setGoals(event.target.value)}
                placeholder="e.g. Build projects and prepare for job interviews"
                className="w-full resize-y rounded-xl border border-white/10 bg-[#0D0612] px-4 py-3.5 text-sm leading-6 outline-none transition placeholder:text-[#75667C] focus:border-[#D934F7]/60"
              />
            </div>

            <div className="space-y-4 border-t border-white/[0.08] pt-6">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">
                    Include video resources
                  </span>
                  <span className="mt-1 block text-xs text-[#897A91]">
                    Add relevant YouTube lessons where available.
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={includeVideos}
                  onChange={(event) =>
                    setIncludeVideos(event.target.checked)
                  }
                  className="h-4 w-4 accent-[#D934F7]"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between gap-4">
                <span>
                  <span className="block text-sm font-medium">
                    Include quizzes
                  </span>
                  <span className="mt-1 block text-xs text-[#897A91]">
                    Add knowledge checks to reinforce learning.
                  </span>
                </span>

                <input
                  type="checkbox"
                  checked={includeQuizzes}
                  onChange={(event) =>
                    setIncludeQuizzes(event.target.checked)
                  }
                  className="h-4 w-4 accent-[#D934F7]"
                />
              </label>
            </div>

            {error && (
              <p
                role="alert"
                className="rounded-xl border border-red-400/20 bg-red-400/[0.08] p-4 text-sm text-red-300"
              >
                {error}
              </p>
            )}

            {message && (
              <p
                role="status"
                className="rounded-xl border border-[#D934F7]/20 bg-[#D934F7]/[0.07] p-4 text-sm leading-6 text-[#E4A1F4]"
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#D934F7] px-5 py-4 text-sm font-semibold text-black transition hover:bg-[#E66AFF] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Generating your course..." : "Generate my course ↗"}
            </button>

            <p className="text-center text-xs leading-5 text-[#75667C]">
              Your selected preferences will guide your personalized course.
            </p>
          </form>
        </section>

        <aside className="lg:pt-16">
          <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1C0B25] to-[#0F0714] p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[#D934F7]/15 blur-[80px]" />

            <div className="relative">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold tracking-[0.18em] text-[#BCF429]">
                  YOUR COURSE BLUEPRINT
                </span>
                <span className="text-xl text-[#D934F7]">✳</span>
              </div>

              <h2 className="mt-7 text-2xl font-medium">
                A path with purpose.
              </h2>

              <p className="mt-3 text-sm leading-7 text-[#A69BAC]">
                Your choices will help shape the course structure and
                learning experience.
              </p>

              <div className="mt-8 space-y-4">
                {[
                  {
                    number: "01",
                    title: "Foundations",
                    text: "Understand the essentials",
                  },
                  {
                    number: "02",
                    title: "Core concepts",
                    text: "Build knowledge step by step",
                  },
                  {
                    number: "03",
                    title: "Hands-on practice",
                    text: "Apply what you learn",
                  },
                  {
                    number: "04",
                    title: "Knowledge check",
                    text: "Test your understanding",
                  },
                ].map((item, index) => (
                  <div key={item.number} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border text-xs ${
                          index === 0
                            ? "border-[#D934F7]/30 bg-[#D934F7]/10 text-[#E4A1F4]"
                            : "border-white/10 bg-white/[0.03] text-[#897A91]"
                        }`}
                      >
                        {item.number}
                      </span>

                      {index !== 3 && (
                        <div className="my-1 h-5 w-px bg-white/10" />
                      )}
                    </div>

                    <div className="pb-3">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="mt-1 text-xs leading-5 text-[#897A91]">
                        {item.text}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-[#BCF429]/15 bg-[#BCF429]/[0.05] p-4">
                <p className="text-sm font-medium text-[#BCF429]">
                  Designed around your goals
                </p>
                <p className="mt-2 text-xs leading-6 text-[#A69BAC]">
                  Choose your preferences on the left to prepare your
                  learning plan.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/dashboard"
            className="mt-5 inline-flex text-sm text-[#897A91] transition hover:text-white"
          >
            ← Back to your dashboard
          </Link>
        </aside>
      </div>
    </main>
  );
}
