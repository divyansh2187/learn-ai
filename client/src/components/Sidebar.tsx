"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  GraduationCap,
  BookOpen,
  Clock3,
  ChevronRight,
  LogOut,
  Atom,
  Code2,
  Brain,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Create Course", href: "/courses/create", icon: GraduationCap },
  { label: "My Courses", href: "/courses", icon: BookOpen },
];

const lessons = [
  { label: "Introduction to React", icon: Atom, color: "#25A9E8" },
  { label: "JavaScript Async/Await", icon: Code2, color: "#E9AD16" },
  { label: "Prompt Engineering Basics", icon: Brain, color: "#8055ED" },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const pathname = usePathname();
  const router = useRouter();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;

    if (href === "/courses") {
      return pathname === href || pathname.startsWith("/courses/");
    }

    return pathname === href;
  }

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

      await fetch(`${apiUrl}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Logout request failed:", error);
    } finally {
      router.replace("/login");
      router.refresh();
      setLoggingOut(false);
    }
  }

  return (
    <aside
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      className={[
        "sticky top-0 isolate z-40 flex h-screen shrink-0 flex-col",
        "overflow-hidden border-r border-white/10",
        "bg-[#02050b] text-[#D0E0F1]",
        "transition-[width] duration-300 ease-in-out",
        "motion-reduce:transition-none",
        expanded ? "w-[264px]" : "w-[76px]",
      ].join(" ")}
    >
      {/* Animated background layers */}
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(150,190,230,0.075) 1px, transparent 1px), linear-gradient(to bottom, rgba(150,190,230,0.075) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage:
              "linear-gradient(to bottom, black 0%, black 50%, transparent 100%)",
          }}
        />

        {/* Blue fog */}
        <div
          className="absolute -bottom-[20%] -left-[65%] h-3/4 w-[230%] rounded-full blur-[35px]"
          style={{
            background:
              "radial-gradient(ellipse at 50% 75%, rgba(65,153,255,0.7) 0%, rgba(27,105,213,0.42) 28%, rgba(10,52,115,0.2) 53%, transparent 75%)",
            animation: "blueFog 12s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Profile */}
      <div className="relative z-10 shrink-0 px-3 pt-5">
        <div
          className={[
            "flex h-[76px] items-center overflow-hidden rounded-2xl",
            expanded ? "gap-3 px-2" : "justify-center",
          ].join(" ")}
        >
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center
              rounded-full border-2 border-white/80
              bg-gradient-to-br from-[#BCEBFA] to-[#D9E8FF]
              text-sm font-semibold text-[#2878E8] shadow-sm"
          >
            D
          </div>

          {expanded && (
            <div className="min-w-0">
              <p className="whitespace-nowrap text-xs text-[#D0E0F1]/70">
                Good Day 👋
              </p>
              <p className="truncate text-base font-semibold text-white">
                Divyansh
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="relative z-10 mx-5 my-4 h-px shrink-0 bg-white/15" />

      {/* Main navigation */}
      <nav
        aria-label="Main navigation"
        className="relative z-10 shrink-0 px-2.5"
      >
        {expanded && (
          <p className="mb-3 px-3 text-[11px] font-medium text-[#9AB7D5]">
            Menu: 3
          </p>
        )}

        <div className="space-y-1.5">
          {navigation.map(({ label, href, icon: Icon }) => {
            const selected = isActive(href);

            return (
              <Link
                key={href}
                href={href}
                title={!expanded ? label : undefined}
                aria-current={selected ? "page" : undefined}
                className={[
                  "flex h-[42px] items-center overflow-hidden rounded-xl",
                  "transition-colors duration-200",
                  expanded ? "gap-3 px-3" : "justify-center",
                  selected
                    ? "bg-[#61a1fa] text-[#02050B] shadow-md shadow-[#61C5FA]/25"
                    : "text-[#D0E0F1]/80 hover:bg-white/10 hover:text-white",
                ].join(" ")}
              >
                <Icon 
                size={18} strokeWidth={1.8} className="shrink-0" />

                {expanded && (
                  <span className="whitespace-nowrap text-[13px] font-medium">
                    {label}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="relative z-10 mx-5 my-5 h-px shrink-0 bg-white/15" />

      {/* Recent lessons */}
      <section className="relative z-10 min-h-0 flex-1 overflow-hidden px-2.5">
        {expanded && (
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-[11px] font-medium text-[#9AB7D5]">
              Recent Lessons
            </span>
            <Clock3 size={14} className="text-[#9AB7D5]" />
          </div>
        )}

        <div
          className={[
            "space-y-1.5 overflow-hidden rounded-2xl",
            expanded ? "border border-white/10 bg-white/[0.08] p-2" : "",
          ].join(" ")}
        >
          {lessons.map(({ label, icon: Icon, color }) => (
            <Link
              key={label}
              href="/courses"
              title={!expanded ? label : undefined}
              className={[
                "flex h-[42px] items-center overflow-hidden rounded-xl",
                "text-[#D0E0F1]/90 transition-colors",
                "hover:bg-white/10 hover:text-white",
                expanded ? "gap-2.5 px-1.5" : "justify-center",
              ].join(" ")}
            >
              <span
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}22`, color }}
              >
                <Icon size={17} strokeWidth={1.8} />
              </span>

              {expanded && (
                <>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                    {label}
                  </span>
                  <ChevronRight
                    size={13}
                    className="shrink-0 text-[#D0E0F1]/60"
                  />
                </>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Logout */}
      <div className="relative z-10 shrink-0 border-t border-white/10 p-2.5">
        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title={!expanded ? "Log out" : undefined}
          className={[
            "flex h-[42px] w-full items-center overflow-hidden rounded-xl",
            "text-[#D0E0F1]/80 transition-colors",
            "hover:bg-white/10 hover:text-white",
            "disabled:cursor-wait disabled:opacity-50",
            expanded ? "gap-3 px-3" : "justify-center",
          ].join(" ")}
        >
          <LogOut size={18} strokeWidth={1.8} className="shrink-0" />

          {expanded && (
            <span className="whitespace-nowrap text-[13px] font-medium">
              {loggingOut ? "Logging out..." : "Log out"}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
