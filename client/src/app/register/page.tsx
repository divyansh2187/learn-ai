"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseId = searchParams.get("courseId");
  const welcomePanelRef = useRef<HTMLDivElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to create your account.");
      }

      if (courseId) {
        const enrollResponse = await fetch(
          `${API_URL}/courses/${encodeURIComponent(courseId)}/enroll`,
          { method: "POST", credentials: "include" },
        );

        const enrollResult = await enrollResponse.json();

        if (!enrollResponse.ok || !enrollResult.success) {
          throw new Error(
            enrollResult.message || "Account created, but course enrollment failed.",
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
    <main className="learnai-register-page relative flex min-h-screen w-full items-stretch justify-center overflow-x-hidden p-0 lg:h-screen lg:min-h-0 lg:overflow-hidden">
      <section className="relative z-10 grid min-h-screen w-full grid-cols-1 overflow-hidden bg-black lg:h-screen lg:min-h-0 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Left welcome panel */}
        <div
          ref={welcomePanelRef}
          className="learnai-register-welcome relative isolate m-2 flex min-h-[300px] flex-col overflow-hidden rounded-2xl border-[5px] border-black p-6 text-white shadow-[0_0_0_3px_rgba(0,0,0,0.95),0_12px_35px_rgba(0,0,0,0.35)] sm:m-3 sm:min-h-[340px] sm:p-8 lg:m-3 lg:min-h-0 lg:p-8 xl:p-10"
        >
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
            <div className="learnai-register-grid absolute inset-0 opacity-40" />
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

          <div className="mt-auto max-w-xl pt-8 lg:pt-10">
            <h2 className="mt-4 max-w-lg text-3xl font-medium leading-[1.06] tracking-[-0.055em] sm:text-4xl lg:text-[clamp(2.5rem,3.7vw,4rem)]">
              Your learning journey starts here.
            </h2>
            
          </div>
        </div>

        {/* Right registration form */}
        <div className="flex items-center justify-center bg-[#05070D] px-5 py-8 text-white sm:px-8 sm:py-8 lg:h-screen lg:min-h-0 lg:overflow-y-auto lg:px-8 lg:py-5 xl:px-10">
          <div className="w-full max-w-[390px]">
            <div className="mb-5 text-center">
              <h1 className="text-2xl font-semibold tracking-[-0.045em] text-white sm:text-3xl">
                Create your account
              </h1>
              <p className="mt-2 text-sm leading-5 text-[#c3d0e7]">
                Build your learning path, one lesson at a time.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-xs font-semibold text-[#E4ECF7]">
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
                  className="w-full rounded-xl border border-white/10 bg-[#111722] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-[#7F8DA2] focus:border-[#3B82F6] focus:bg-[#141C2A] focus:ring-4 focus:ring-[#3B82F6]/20"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-xs font-semibold text-[#E4ECF7]">
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
                  className="w-full rounded-xl border border-white/10 bg-[#111722] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-[#7F8DA2] focus:border-[#3B82F6] focus:bg-[#141C2A] focus:ring-4 focus:ring-[#3B82F6]/20"
                />
              </div>

              <div>
                <div className="mb-1.5 flex items-center justify-between gap-3">
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
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full rounded-xl border border-white/10 bg-[#111722] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-[#7F8DA2] focus:border-[#3B82F6] focus:bg-[#141C2A] focus:ring-4 focus:ring-[#3B82F6]/20"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-semibold text-[#E4ECF7]">
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
                  className="w-full rounded-xl border border-white/10 bg-[#111722] px-4 py-2.5 text-sm text-white outline-none transition placeholder:text-[#7F8DA2] focus:border-[#3B82F6] focus:bg-[#141C2A] focus:ring-4 focus:ring-[#3B82F6]/20"
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
                className="w-full rounded-xl bg-[#3B82F6] px-5 py-3 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(59,130,246,0.24)] transition hover:bg-[#2563EB] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#3B82F6]/25 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Creating your account..." : "Create account"}
                {!loading && <span aria-hidden="true"> ↗</span>}
              </button>
            </form>

            <p className="my-4 text-center text-sm text-[#AEBBD0]">
              Already have an account?{" "}
              <Link
                href={courseId ? `/login?courseId=${encodeURIComponent(courseId)}` : "/login"}
                className="!text-blue-500 font-semibold transition hover:!text-blue-300"
                style={{ color: "#3B82F6" }}
              >
                Sign in
              </Link>
            </p>
            <p className="text-center text-xs leading-4 text-[#718096]">
              Learn with intention. Grow with confidence.
            </p>
          </div>
        </div>
      </section>

      <style jsx global>{`
        .learnai-register-page {
          background: #05070D;
        }
        .learnai-register-welcome {
          --gradient-x: 50%;
          --gradient-y: 38%;
          background:
            radial-gradient(ellipse at var(--gradient-x) var(--gradient-y), rgba(96, 165, 250, 0.96), transparent 43%),
            radial-gradient(ellipse at calc(100% - var(--gradient-x) * 0.45) calc(100% - var(--gradient-y) * 0.45), rgba(59, 130, 246, 0.82), transparent 48%),
            radial-gradient(ellipse at 82% 78%, rgba(37, 99, 235, 0.78), transparent 52%),
            linear-gradient(135deg, #020305 0%, #07152C 28%, #1D4ED8 62%, #3B82F6 82%, #020817 100%);
          background-size: 125% 125%, 120% 120%, 100% 100%;
        }
        .learnai-register-grid {
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
