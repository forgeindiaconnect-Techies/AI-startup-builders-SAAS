"use client";

import React from "react";

interface PasswordStrengthProps {
  password: string;
}

function getStrength(password: string): {
  score: number;
  label: string;
  color: string;
} {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "#ef4444" };
  if (score <= 2) return { score: 2, label: "Fair", color: "#f59e0b" };
  if (score <= 3) return { score: 3, label: "Good", color: "#3b82f6" };
  if (score <= 4) return { score: 4, label: "Strong", color: "#22C55E" };
  return { score: 5, label: "Very Strong", color: "#22C55E" };
}

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  if (!password) return null;

  const strength = getStrength(password);

  return (
    <div className="mt-2">
      <div className="flex gap-1.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1 rounded-full transition-colors duration-300"
            style={{
              backgroundColor: i < strength.score ? strength.color : "#e5e7eb",
            }}
          />
        ))}
      </div>
      <p className="text-xs mt-1.5 font-medium" style={{ color: strength.color }}>
        {strength.label}
      </p>
    </div>
  );
}
