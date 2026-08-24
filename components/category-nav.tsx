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
    <div className="flex gap-2 overflow-x-auto border-b border-neutral-200 px-4 py-3">
      {options.map((opt) => {
        const isActive = active === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={
              isActive
                ? "whitespace-nowrap rounded-full bg-red-600 px-3.5 py-1.5 text-sm font-medium text-white"
                : "whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            }
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
