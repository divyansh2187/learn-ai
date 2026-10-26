
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
  Plus,
  CalendarDays,
  Mail,
  Bell,
  BriefcaseBusiness,
  FileText,
  ArrowDownUp,
  PieChart,
  Settings,
  Lightbulb,
  PanelLeftClose,
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
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
        "sticky top-0 z-40 flex h-screen shrink-0 flex-col overflow-hidden",
        "border-r border-white/40 bg-[#E6F4FB]/95 text-[#52677B]",
        "shadow-[5px_0_24px_rgba(37,99,150,0.08)] backdrop-blur-xl",
        "transition-[width] duration-300 ease-in-out motion-reduce:transition-none",
        expanded ? "w-[264px]" : "w-[76px]",
      ].join(" ")}
    >
      {/* Profile */}
      <div className="shrink-0 px-3 pt-5">
        <div
          className={[
            "flex h-[76px] items-center overflow-hidden rounded-2xl",
            expanded ? "gap-3 px-2" : "justify-center",
          ].join(" ")}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center
            rounded-full border-[3px] border-white bg-gradient-to-br
            from-[#BCEBFA] to-[#D9E8FF] text-base font-semibold text-[#2878E8]
            shadow-sm">
            D
          </div>

          {expanded && (
            <div className="min-w-0">
              <p className="whitespace-nowrap text-xs text-[#627B91]">
                Good Day 👋
              </p>
              <p className="truncate text-lg font-semibold tracking-tight text-[#263E55]">
                Divyansh
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mx-5 my-4 h-px shrink-0 bg-[#9BBBD0]/50" />

      {/* Menu */}
      <nav className="shrink-0 px-2.5">
        {expanded && (
          <p className="mb-3 px-3 text-[11px] font-medium text-[#71899C]">
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
                  "flex h-[46px] items-center overflow-hidden rounded-xl",
                  "transition-colors duration-200",
                  expanded ? "gap-3 px-3" : "justify-center",
                  selected
                    ? "bg-[#347FF0] text-white shadow-md shadow-blue-400/25"
                    : "text-[#586F83] hover:bg-white/60 hover:text-[#2878E8]",
                ].join(" ")}
              >
                <Icon size={20} strokeWidth={1.9} className="shrink-0" />

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

      <div className="mx-5 my-5 h-px shrink-0 bg-[#9BBBD0]/50" />

      {/* Recent lessons: equivalent of the reference's Services section */}
      <section className="min-h-0 flex-1 overflow-hidden px-2.5">
        {expanded && (
          <div className="mb-3 flex items-center justify-between px-2">
            <span className="text-[11px] font-medium text-[#71899C]">
              Recent Lessons
            </span>
            <Clock3 size={15} className="text-[#71899C]" />
          </div>
        )}

        <div
          className={[
            "space-y-1.5 overflow-hidden rounded-2xl",
            expanded ? "bg-white/80 p-2" : "",
          ].join(" ")}
        >
          {lessons.map(({ label, icon: Icon, color }) => (
            <Link
              key={label}
              href="/courses"
              title={!expanded ? label : undefined}
              className={[
                "flex h-[46px] items-center overflow-hidden rounded-xl",
                "text-[#354B60] transition-colors hover:bg-[#E7F3FC]",
                expanded ? "gap-2.5 px-1.5" : "justify-center",
              ].join(" ")}
            >
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
                style={{ backgroundColor: `${color}20`, color }}
              >
                <Icon size={19} strokeWidth={1.8} />
              </span>

              {expanded && (
                <>
                  <span className="min-w-0 flex-1 truncate text-[11px] font-medium">
                    {label}
                  </span>
                  <ChevronRight
                    size={14}
                    className="shrink-0 text-[#8CA2B4]"
                  />
                </>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Bottom controls — logout only */}
      <div className="shrink-0 p-3">
        {expanded && (
          <p className="mb-2 px-2 text-[11px] text-[#71899C]">
            Account
          </p>
        )}

        <button
          type="button"
          onClick={handleLogout}
          disabled={loggingOut}
          title={!expanded ? "Log out" : undefined}
          className={[
            "flex h-[46px] w-full items-center overflow-hidden rounded-xl",
            "border border-[#B5D1E2]/60 text-[#526B80]",
            "transition-colors hover:bg-white/70 hover:text-[#2878E8]",
            "disabled:opacity-50",
            expanded ? "gap-3 px-3" : "justify-center",
          ].join(" ")}
        >
          <LogOut size={19} strokeWidth={1.8} className="shrink-0" />

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
