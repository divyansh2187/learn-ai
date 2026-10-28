
"use client";

export default function WorkspaceBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 isolate overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Black upper area, transitioning into navy and icy blue */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              #030405 0%,
              #030405 31%,
              #05080F 43%,
              #0A1528 53%,
              #102B50 65%,
              #20558C 77%,
              #69B9E9 88%,
              #B9E8F8 96%,
              #D8F5FD 100%
            )
          `,
        }}
      />

      {/* Blue glow behind the hero */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 56% 43% at 50% 75%,
              rgba(43, 125, 232, 0.78) 0%,
              rgba(36, 105, 205, 0.58) 30%,
              rgba(27, 77, 145, 0.30) 58%,
              rgba(16, 43, 80, 0.06) 78%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Soft horizontal blue light */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(
              ellipse 100% 35% at 50% 83%,
              rgba(76, 158, 235, 0.35) 0%,
              rgba(73, 151, 221, 0.18) 48%,
              rgba(91, 172, 230, 0.06) 75%,
              transparent 100%
            )
          `,
        }}
      />

      {/* Icy-white fog at the bottom */}
      <div
        className="absolute inset-x-0 bottom-0 h-[26%]"
        style={{
          background: `
            linear-gradient(
              180deg,
              rgba(180, 228, 249, 0) 0%,
              rgba(183, 229, 248, 0.10) 24%,
              rgba(201, 238, 251, 0.30) 55%,
              rgba(221, 246, 253, 0.58) 82%,
              rgba(232, 249, 255, 0.72) 100%
            )
          `,
        }}
      />

      {/* Fine grid across the entire background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(
              rgba(151, 184, 215, 0.075) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(151, 184, 215, 0.075) 1px,
              transparent 1px
            )
          `,
          backgroundSize: "52px 52px",
        }}
      />

      {/* Subtle dark tint to reduce brightness changes */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            linear-gradient(
              180deg,
              rgba(0, 0, 0, 0.02) 0%,
              rgba(0, 0, 0, 0.05) 55%,
              rgba(5, 15, 30, 0.16) 100%
            )
          `,
        }}
      />
    </div>
  );
}
