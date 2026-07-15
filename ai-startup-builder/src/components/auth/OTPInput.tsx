"use client";

import React, { useRef, useState } from "react";

interface OTPInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
}

export default function OTPInput({
  length = 6,
  value,
  onChange,
}: OTPInputProps) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, "").slice(0, length);
    onChange(val);
  };

  const handleFocus = () => setFocused(true);
  const handleBlur = () => setFocused(false);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div className="flex justify-center">
      <div
        className="relative cursor-pointer"
        onClick={handleContainerClick}
      >
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="absolute inset-0 opacity-0 cursor-pointer"
          style={{ width: length * 48 + (length - 1) * 8 }}
          maxLength={length}
        />
        <div className="flex gap-2">
          {Array.from({ length }).map((_, i) => (
            <div
              key={i}
              className={`w-12 h-14 rounded-xl border-2 flex items-center justify-center text-xl font-bold transition-all duration-200 ${
                focused && value.length === i
                  ? "border-purple-500 shadow-lg shadow-purple-500/10"
                  : value[i]
                  ? "border-purple-500 bg-purple-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {value[i] ? (
                <span className="text-gray-900">{value[i]}</span>
              ) : (
                focused &&
                value.length === i && (
                  <div className="w-0.5 h-6 bg-purple-500 animate-pulse" />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
