// Category filter bars

"use client";

import { CATEGORIES, type Category } from "@/lib/mock-data";

interface CategoryNavProps {
  active: Category | "ALL";
  onChange: (category: Category | "ALL") => void;
}

export function CategoryNav({ active, onChange }: CategoryNavProps) {
  const options: { value: Category | "ALL"; label: string }[] = [
    { value: "ALL", label: "Alle" },
    ...CATEGORIES,
  ];

  return (
    <div className="border-b border-border">
      <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
        {options.map((opt) => {
          const isActive = active === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={
                isActive
                  ? "whitespace-nowrap rounded-full bg-accent px-3.5 py-1.5 text-sm font-medium text-white"
                  : "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium text-foreground/60 hover:bg-foreground/5"
              }
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
