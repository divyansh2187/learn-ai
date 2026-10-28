
import Sidebar from "@/components/Sidebar";
import WorkspaceBackground from "@/components/WorkspaceBackground";

export default function WorkspaceLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative isolate min-h-screen overflow-clip bg-[#02050B] text-white p-2">
      <WorkspaceBackground />

      <div className="relative z-10 flex min-h-screen">
        <Sidebar />

        <main className="min-w-0 flex-1 bg-transparent">
          {children}
        </main>
      </div>
    </div>
  );
}
