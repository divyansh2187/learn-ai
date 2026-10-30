
import Sidebar from "@/components/Sidebar";
import WorkspaceBackground from "@/components/WorkspaceBackground";

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative isolate h-dvh w-full overflow-hidden bg-[#02050B] p-2 text-white">
      <WorkspaceBackground />

      <div className="relative z-10 flex h-full min-h-0 w-full gap-0">
        <Sidebar />

        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
