"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create your account.");
      }

      router.push("/login?registered=true");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
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
            START SOMETHING NEW
          </p>
          <h1 className="mt-4 text-3xl font-medium tracking-tight">
            Create your account.
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#A69BAC]">
            Build your learning path, one lesson at a time.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm text-[#E7DDEA]">
              Full name
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={80}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Your name"
              className="w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#75667C] focus:border-[#D934F7]/70 focus:ring-2 focus:ring-[#D934F7]/10"
            />
          </div>

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-[#E7DDEA]">
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
            <label htmlFor="password" className="mb-2 block text-sm text-[#E7DDEA]">
              Password
            </label>
            <div className="flex items-center rounded-xl border border-white/10 bg-white/[0.035] pr-4 transition focus-within:border-[#D934F7]/70 focus-within:ring-2 focus-within:ring-[#D934F7]/10">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                minLength={8}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="At least 8 characters"
                className="min-w-0 flex-1 bg-transparent px-4 py-3.5 text-sm text-white outline-none placeholder:text-[#75667C]"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-xs text-[#D5A5DF] hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm text-[#E7DDEA]"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Enter your password again"
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
            {loading ? "Creating your account..." : "Create account ↗"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#A69BAC]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-[#D934F7] hover:text-white"
          >
            Sign in
          </Link>
        </p>

        <p className="mt-6 text-center text-xs leading-5 text-[#75667C]">
          Keep your account secure by choosing a unique password.
        </p>
      </section>
    </main>
  );
}