"use client";

import { useEffect, useRef, useState } from "react";
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
  const welcomePanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const panel = welcomePanelRef.current;
    if (!panel) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    let frame = 0;
    let targetX = 50;
    let targetY = 38;
    let currentX = targetX;
    let currentY = targetY;
    let pointerIsActive = false;
    let phase = 0;
    let previousTime = 0;

    const handlePointerMove = (event: PointerEvent) => {
      const bounds = panel.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      pointerIsActive = true;
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;

      targetX = Math.max(0, Math.min(100, 50 + (x - 0.5) * 34));
      targetY = Math.max(0, Math.min(100, 38 + (y - 0.5) * 30));
    };

    const handlePointerLeave = () => {
      pointerIsActive = false;
    };

    const animateGradient = (time: number) => {
      const delta = previousTime ? Math.min(time - previousTime, 40) : 16;
      previousTime = time;

      // Keep the gradient gently drifting when the pointer is away.
      if (!pointerIsActive) {
        phase += delta * 0.00022;
        targetX = 50 + Math.sin(phase) * 13;
        targetY = 38 + Math.cos(phase * 0.82) * 10;
      }

      currentX += (targetX - currentX) * (pointerIsActive ? 0.075 : 0.018);
      currentY += (targetY - currentY) * (pointerIsActive ? 0.075 : 0.018);

      panel.style.setProperty("--gradient-x", `${currentX}%`);
      panel.style.setProperty("--gradient-y", `${currentY}%`);

      frame = window.requestAnimationFrame(animateGradient);
    };

    panel.addEventListener("pointermove", handlePointerMove, { passive: true });
    panel.addEventListener("pointerleave", handlePointerLeave);
    frame = window.requestAnimationFrame(animateGradient);

    return () => {
      panel.removeEventListener("pointermove", handlePointerMove);
      panel.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to log in. Check your details.");
      }

      if (courseId) {
        const enrollResponse = await fetch(
          `${API_URL}/courses/${encodeURIComponent(courseId)}/enroll`,
          { method: "POST", credentials: "include" },
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
        err instanceof Error ? err.message : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="learnai-login-page relative flex min-h-screen w-full items-stretch justify-center overflow-hidden p-0">
      <section className="relative z-10 grid min-h-screen w-full grid-cols-1 overflow-hidden bg-black lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left welcome panel */}
        <div ref={welcomePanelRef} className="learnai-login-welcome relative isolate flex min-h-[520px] flex-col overflow-hidden p-7 text-white sm:p-10 lg:min-h-screen lg:p-12 xl:p-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="learnai-login-grid absolute inset-0 opacity-40" />
            <div className="absolute -left-20 top-24 h-72 w-72 rounded-full bg-[#3B82F6]/30 blur-[90px]" />
            <div className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-black/70 blur-[80px]" />
          </div>

          <Link href="/" aria-label="LearnAI home" className="inline-flex w-fit items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/65 text-white">
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
                <circle cx="12" cy="12" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
              </svg>
            </span>
            <span className="text-lg font-semibold tracking-[-0.04em]">
              Learn<span className="text-[#87baf1]">AI</span>
            </span>
          </Link>

          <div className="mt-auto max-w-xl pt-16 lg:pt-24">
            <h1 className="mt-6 max-w-lg text-4xl font-medium leading-[1.06] tracking-[-0.055em] sm:text-5xl lg:text-[clamp(3rem,4.3vw,4.5rem)]">
              Your learning journey continues.
            </h1>
          </div>
        </div>

        {/* Right login form */}
        <div className="flex min-h-[600px] items-center justify-center bg-[#05070D] px-6 py-12 text-white sm:px-10 lg:min-h-screen lg:px-12 xl:px-16">
          <div className="w-full max-w-[390px]">
            <div className="mb-8 text-center">
              <h2 className="text-3xl font-semibold tracking-[-0.045em] text-white sm:text-4xl">
                Welcome back
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#c3d0e7]">
                Sign in to continue learning with LearnAI.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="mb-2 block text-xs font-semibold text-[#E4ECF7]">
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
                  className="w-full rounded-xl border border-white/10 bg-[#111722] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#7F8DA2] focus:border-[#3B82F6] focus:bg-[#141C2A] focus:ring-4 focus:ring-[#3B82F6]/20"
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between gap-3">
                  <label htmlFor="password" className="block text-xs font-semibold text-[#E4ECF7]">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword((current) => !current)}
                    className="text-xs font-medium text-[#70B7FF] transition hover:text-white"
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
                  className="w-full rounded-xl border border-white/10 bg-[#111722] px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-[#7F8DA2] focus:border-[#3B82F6] focus:bg-[#141C2A] focus:ring-4 focus:ring-[#3B82F6]/20"
                />
              </div>

              {error && (
                <p role="alert" className="rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm leading-5 text-red-300">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-[#3B82F6] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.24)] transition hover:bg-[#2563EB] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3B82F6]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Signing you in..." : "Sign in"}
                {!loading && <span aria-hidden="true"> ↗</span>}
              </button>
            </form>

            <div className="my-7 flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-[#8290A5]">OR</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <p className="text-center text-sm text-[#AEBBD0]">
              New to LearnAI?{" "}
              <Link
                href={
                  courseId
                    ? `/register?courseId=${encodeURIComponent(courseId)}`
                    : "/register"
                }
                className="font-semibold text-[#70B7FF] transition hover:text-white"
              >
                Create an account
              </Link>
            </p>

            <p className="mt-8 text-center text-xs leading-5 text-[#718096]">
              Learn with intention. Grow with confidence.
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .learnai-login-page {
          background: #05070D;
        }
        .learnai-login-welcome {
          --gradient-x: 50%;
          --gradient-y: 38%;
          background:
            radial-gradient(ellipse at var(--gradient-x) var(--gradient-y), rgba(59, 130, 246, 0.9), transparent 44%),
            radial-gradient(ellipse at calc(100% - var(--gradient-x) * 0.45) calc(100% - var(--gradient-y) * 0.45), rgba(96, 165, 250, 0.72), transparent 48%),
            linear-gradient(135deg, #020305 0%, #07152C 35%, #2563EB 72%, #020817 100%);
          background-size: 125% 125%, 120% 120%, 100% 100%;
          transition: background-position 180ms ease-out;
        }
        .learnai-login-grid {
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.10) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.10) 1px, transparent 1px);
          background-size: 36px 36px;
          mask-image: linear-gradient(to bottom, transparent, black 18%, black 78%, transparent);
        }
      `}</style>
    </main>
  );
}
