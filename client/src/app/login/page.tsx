"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.message || "Unable to log in. Check your details.",
        );
      }

      if (courseId) {
        const enrollResponse = await fetch(
          `${API_URL}/courses/${encodeURIComponent(courseId)}/enroll`,
          {
            method: "POST",
            credentials: "include",
          },
        );

        const enrollResult = await enrollResponse.json();

        if (!enrollResponse.ok || !enrollResult.success) {
          throw new Error(
            enrollResult.message ||
              "You signed in, but we couldn't enroll you in this course. Please try again.",
          );
        }
      }

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-12">
      <div className="pointer-events-none absolute -left-40 top-0 h-96 w-96 rounded-full bg-[#7E078E]/20 blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-96 w-96 rounded-full bg-[#D934F7]/10 blur-[120px]" />

      <Link
        href="/"
        className="absolute left-6 top-6 flex items-center gap-3 sm:left-10 sm:top-8"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#D934F7] text-xl font-bold text-black">
          L
        </span>
        <span className="text-xl font-semibold">
          Learn<span className="text-[#D934F7]">AI</span>
        </span>
      </Link>

      <section className="relative w-full max-w-md rounded-3xl border border-white/10 bg-[#120A18]/90 p-7 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-10">
        <div className="mb-8">
          <p className="text-xs font-semibold tracking-[0.2em] text-[#D934F7]">
            WELCOME BACK
          </p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight">
            Continue your journey.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#A69BAC]">
            Sign in to pick up right where you left off.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm text-[#E7DDEA]"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#75667C] focus:border-[#D934F7]/70 focus:ring-2 focus:ring-[#D934F7]/10"
            />
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between gap-3">
              <label htmlFor="password" className="text-sm text-[#E7DDEA]">
                Password
              </label>
              <button
                type="button"
                onClick={() => setShowPassword((current) => !current)}
                className="text-xs text-[#D5A5DF] hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#75667C] focus:border-[#D934F7]/70 focus:ring-2 focus:ring-[#D934F7]/10"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl border border-red-400/20 bg-red-400/[0.08] p-3 text-sm text-red-300"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[#D934F7] px-5 py-3.5 text-sm font-semibold text-black transition hover:bg-[#E66AFF] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Signing you in..." : "Sign in to LearnAI ↗"}
          </button>
        </form>

        <div className="my-7 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-xs text-[#897A91]">YOUR NEXT CHAPTER</span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <p className="text-center text-sm text-[#A69BAC]">
          New to LearnAI?{" "}
          <Link
            href={
              courseId
                ? `/register?courseId=${encodeURIComponent(courseId)}`
                : "/register"
            }
            className="font-medium text-[#D934F7] hover:text-white"
          >
            Create an account
          </Link>
        </p>

        <p className="mt-7 text-center text-xs leading-5 text-[#75667C]">
          By continuing, you agree to use LearnAI responsibly and keep your
          account credentials secure.
        </p>
      </section>
    </main>
  );
}
