"use client";

import React from "react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <React.Fragment key={i}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                i + 1 < currentStep
                  ? "bg-purple-500 text-white"
                  : i + 1 === currentStep
                  ? "bg-purple-500 text-white shadow-lg shadow-purple-500/30"
                  : "bg-gray-100 text-gray-400"
              }`}
            >
              {i + 1 < currentStep ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                i + 1
              )}
            </div>
            {labels[i] && (
              <span
                className={`text-[11px] mt-1.5 font-medium hidden sm:block ${
                  i + 1 <= currentStep ? "text-purple-600" : "text-gray-400"
                }`}
              >
                {labels[i]}
              </span>
            )}
          </div>
          {i < totalSteps - 1 && (
            <div
              className={`w-8 sm:w-12 h-0.5 rounded-full mt-0 sm:-mt-5 transition-colors duration-300 ${
                i + 1 < currentStep ? "bg-purple-500" : "bg-gray-100"
              }`}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
