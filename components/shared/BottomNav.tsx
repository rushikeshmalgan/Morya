"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/map", icon: "🗺️", label: "MAP", id: "nav-map" },
  { href: "/lens", icon: "📸", label: "LENS", id: "nav-lens" },
  { href: "/rank", icon: "🏆", label: "RANK", id: "nav-rank" },
  { href: "/journey", icon: "🐘", label: "JOURNEY", id: "nav-journey" },
];

export default function BottomNav({ active }: { active: string }) {
  const pathname = usePathname();
  const current = active || pathname?.split("/")[1];

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around max-w-md mx-auto px-2">
        {NAV_ITEMS.map((item) => {
          const isActive = current === item.href.slice(1);
          return (
            <Link
              key={item.href}
              href={item.href}
              id={item.id}
              className={`bottom-nav-item ${isActive ? "active" : ""}`}
              style={isActive ? { background: "rgba(255, 107, 0, 0.1)", borderRadius: "12px" } : {}}
            >
              <span className="bottom-nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
