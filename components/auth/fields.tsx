"use client";

import { useState } from "react";
import type { InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import {
  getPasswordStrength,
  STRENGTH_COLORS,
  STRENGTH_LABELS,
} from "@/lib/password-strength";

// Shared style for all auth form inputs
export const inputClass =
  "w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm transition-colors focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20";

// Standard labeled input (name, email, ...)
interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: ReactNode;
}

export function TextField({ id, label, ...inputProps }: TextFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm text-foreground/60">
        {label}
      </label>
      <input id={id} {...inputProps} className={inputClass} />
    </div>
  );
}

// Password input with visibility toggle + optional strength meter
interface PasswordFieldProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
  placeholder?: string;
  // Renders the strength meter below the field (register only)
  showStrengthMeter?: boolean;
  // Optional content next to the label, e.g. a "Forgot?" link (login)
  labelExtra?: ReactNode;
}

export function PasswordField({
  id = "password",
  value,
  onChange,
  autoComplete = "current-password",
  placeholder = "••••••••",
  showStrengthMeter = false,
  labelExtra,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  const tooShort = value.length > 0 && value.length < 8;
  const strength = getPasswordStrength(value);

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label htmlFor={id} className="block text-sm text-foreground/60">
          Passwort
        </label>
        {labelExtra}
      </div>

      <div className="relative">
        <input
          id={id}
          type={show ? "text" : "password"}
          required
          autoComplete={autoComplete}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground/70"
          aria-label={show ? "Passwort verbergen" : "Passwort anzeigen"}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>

      {showStrengthMeter && value.length > 0 && (
        <div className="mt-2">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <span
                key={i}
                className={`h-1 flex-1 rounded-full transition-colors ${
                  i < Math.max(strength, 1)
                    ? tooShort
                      ? "bg-accent"
                      : STRENGTH_COLORS[strength]
                    : "bg-foreground/10"
                }`}
              />
            ))}
          </div>
          <p
            className={`mt-1 text-xs ${tooShort ? "text-accent" : "text-foreground/50"}`}
          >
            {tooShort
              ? `Noch ${8 - value.length} Zeichen`
              : STRENGTH_LABELS[strength]}
          </p>
        </div>
      )}
    </div>
  );
}
