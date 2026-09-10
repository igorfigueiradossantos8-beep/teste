"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export function Tabs({
  tabs,
  defaultTab,
}: {
  tabs: { key: string; label: string; content: React.ReactNode; count?: number }[];
  defaultTab?: string;
}) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.key);
  const current = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div>
      <div className="mb-5 flex gap-1 overflow-x-auto border-b border-bege-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={cn(
              "shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors cursor-pointer",
              active === tab.key
                ? "border-dourado-500 text-azul-950"
                : "border-transparent text-preto/50 hover:text-azul-900",
            )}
          >
            {tab.label}
            {typeof tab.count === "number" && (
              <span className="ml-1.5 text-xs text-preto/40">({tab.count})</span>
            )}
          </button>
        ))}
      </div>
      <div>{current?.content}</div>
    </div>
  );
}
