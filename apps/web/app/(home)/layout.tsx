import type { ReactNode } from "react";

export default function HomeLayout({ children }: { children: ReactNode }) {
  return (
    <div className="bg-[var(--color-bg)] text-[var(--color-text)] min-h-screen">
      {children}
    </div>
  );
}
