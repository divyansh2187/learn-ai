"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Atom,
  Code2,
  Brain,
  LogOut,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create Course", href: "/courses/create", icon: GraduationCap },
  { label: "My Courses", href: "/courses", icon: BookOpen },
];

const recentLessons = [
  { label: "Introduction to React", icon: Atom, color: "#38BDF8" },
  { label: "JavaScript Async/Await", icon: Code2, color: "#FBBF24" },
  { label: "Prompt Engineering Basics", icon: Brain, color: "#A78BFA" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === href;
    if (href === "/courses") return pathname === href;

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      router.replace("/login");
      router.refresh();
    }
  };

  const labelClass = [
    "min-w-0 overflow-hidden whitespace-nowrap",
    "transition-all duration-300 ease-in-out",
    expanded
      ? "max-w-[170px] translate-x-0 opacity-100"
      : "pointer-events-none max-w-0 -translate-x-1 opacity-0",
  ].join(" ");

  const navItemClass = (active: boolean) =>
    [
      "relative flex h-11 items-center border px-2",
      "transition-[background-color,border-color,color,box-shadow] duration-200",
      expanded
        ? "w-full justify-start gap-3 rounded-[14px]"
        : "mx-auto w-11 justify-center rounded-full",
      active
        ? "border-white/40 bg-[#F2F5FC] text-[#102A43] shadow-[0_2px_12px_rgba(255,255,255,0.08)]"
        : "border-transparent text-white hover:border-white/[0.12] hover:bg-white/[0.09] hover:text-white",
    ].join(" ");

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null
          )
        ) {
          setExpanded(false);
        }
      }}
      className={[
        "sticky top-3 z-40 my-3 ml-2 flex h-[calc(100vh-24px)]",
        "shrink-0 flex-col overflow-hidden",
        "border border-white/[0.18]",
        "bg-white/[0.07] text-white",
        "backdrop-blur-2xl backdrop-saturate-150",
        "shadow-[0_8px_32px_rgba(0,0,0,0.18)]",
        "ring-1 ring-inset ring-white/[0.04]",
        "transition-[width,border-radius] duration-500",
        "ease-[cubic-bezier(0.22,1,0.36,1)]",
        expanded
          ? "w-[260px] rounded-[22px]"
          : "w-[68px] rounded-[34px]",
      ].join(" ")}
    >
      {/* Glass reflection layer */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] border border-white/[0.04] bg-gradient-to-br from-white/[0.07] via-transparent to-sky-300/[0.04]"
      />

      {/* Profile */}
      <div
        className={[
          "relative z-10 flex h-[92px] w-full shrink-0 items-center",
          "border-b border-white/[0.12]",
          expanded ? "justify-start px-4" : "justify-center px-0",
        ].join(" ")}
      >
        <div
          className={[
            "flex min-w-0 items-center",
            expanded ? "gap-3" : "justify-center",
          ].join(" ")}
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/60 bg-[#F2F5FC] text-xl font-bold text-[#2457A6] shadow-[0_2px_12px_rgba(255,255,255,0.08)]">
            D
          </div>

          <div className={labelClass}>
            <p className="whitespace-nowrap text-sm font-semibold text-white">
              Divyansh
            </p>
            <p className="mt-1 whitespace-nowrap text-xs text-white">
              Learner workspace
            </p>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="relative z-10 px-2 pt-4">
        <p
          className={[
            "overflow-hidden px-3 pb-2 text-[10px] font-semibold",
            "uppercase tracking-[0.16em] text-white text-bold",
            "transition-all duration-300",
            expanded ? "max-h-8 opacity-100" : "max-h-0 opacity-0",
          ].join(" ")}
        >
          Workspace
        </p>

        <nav aria-label="Workspace navigation" className="space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={!expanded ? item.label : undefined}
                aria-label={item.label}
                aria-current={active ? "page" : undefined}
                className={navItemClass(active)}
              >
                <Icon
                  size={21}
                  strokeWidth={1.9}
                  className={[
                    "shrink-0",
                    active ? "text-[#2457A6]" : "text-white",
                  ].join(" ")}
                />

                <span
                  className={[
                    labelClass,
                    "text-[13px] font-medium",
                    active ? "text-[#102A43]" : "text-white",
                  ].join(" ")}
                >
                  {item.label}
                </span>

                {active && expanded && (
                  <ChevronRight
                    size={15}
                    className="ml-auto shrink-0 text-[#2457A6]"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Recent lessons */}
      <div className="relative z-10 mx-2 mt-5 border-t border-white/[0.12] pt-3">
        <div
          className={[
            "flex h-7 items-center gap-2 overflow-hidden px-2",
            "transition-opacity duration-300",
            expanded ? "opacity-100" : "opacity-0",
          ].join(" ")}
        >
          <Sparkles size={14} className="shrink-0 text-white" />
          <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            Recent lessons
          </span>
        </div>

        <div className="mt-2 space-y-2">
          {recentLessons.map((lesson) => {
            const Icon = lesson.icon;

            return (
              <Link
                key={lesson.label}
                href="/courses"
                title={!expanded ? lesson.label : undefined}
                aria-label={lesson.label}
                className={[
                  "flex h-11 w-full items-center rounded-[13px]",
                  "border border-transparent px-1.5",
                  "transition-colors duration-200",
                  expanded
                    ? "justify-start gap-3"
                    : "justify-center gap-0",
                  "hover:border-white/[0.12] hover:bg-white/[0.08]",
                ].join(" ")}
              >
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-white/[0.06]"
                  style={{
                    color: lesson.color,
                    backgroundColor: `${lesson.color}20`,
                  }}
                >
                  <Icon size={20} strokeWidth={1.9} />
                </span>

                <span
                  className={[
                    labelClass,
                    "text-xs font-medium text-white",
                  ].join(" ")}
                >
                  {lesson.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Flexible space */}
      <div className="relative z-10 flex-1" />

      {/* Logout */}
      <div className="relative z-10 border-t border-white/[0.12] p-2">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title={!expanded ? "Log out" : undefined}
          aria-label="Log out"
          className={[
            "flex h-11 w-full items-center border border-transparent px-2",
            "text-red-400 transition-colors duration-200",
            expanded
              ? "justify-start gap-3 rounded-[13px]"
              : "mx-auto w-11 justify-center rounded-full",
            "hover:border-red-300/20 hover:bg-red-400/[0.10] hover:text-white",
            "disabled:opacity-50",
          ].join(" ")}
        >
          <LogOut size={20} className="shrink-0 text-white" />

          <span
            className={[
              labelClass,
              "text-[13px] font-medium text-red-400",
            ].join(" ")}
          >
            {loggingOut ? "Logging out..." : "Log out"}
          </span>
        </button>
      </div>
    </aside>
  );
}
