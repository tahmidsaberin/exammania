"use client";

import React from "react";
import clsx from "clsx";
import type { Question } from "@/types";

interface QuestionCardProps {
  question: Question;
  answer: string | undefined;
  onChange: (answer: string) => void;
  showResult?: boolean;
  correctAnswer?: string | null;
}

export default function QuestionCard({
  question,
  answer,
  onChange,
  showResult = false,
  correctAnswer,
}: QuestionCardProps) {
  const isCorrect = showResult && answer === correctAnswer;
  const isWrong = showResult && answer !== undefined && answer !== correctAnswer;

  return (
    <div
      className={clsx(
        "rounded-2xl border bg-white p-6 shadow-sm dark:bg-gray-800 transition-colors",
        showResult && isCorrect && "border-green-400 dark:border-green-600",
        showResult && isWrong && "border-red-400 dark:border-red-600",
        !showResult && "border-gray-200 dark:border-gray-700"
      )}
    >
      {/* Question text */}
      <p className="mb-5 text-base font-medium leading-relaxed text-gray-900 dark:text-white">
        <span className="mr-2 font-bold text-primary-600 dark:text-primary-400">
          Q{question.order}.
        </span>
        {question.text}
        <span className="ml-2 text-xs font-normal text-gray-400">
          ({question.marks} {question.marks === 1 ? "mark" : "marks"})
        </span>
      </p>

      {/* Options */}
      {(question.type === "MCQ" || question.type === "TRUE_FALSE") &&
        question.options && (
          <fieldset>
            <legend className="sr-only">Choose your answer</legend>
            <div className="space-y-3">
              {(question.options as string[]).map((opt, idx) => {
                const val = String(idx);
                const isSelected = answer === val;
                const isThisCorrect = showResult && correctAnswer === val;

                return (
                  <label
                    key={idx}
                    className={clsx(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                      isThisCorrect &&
                        "border-green-400 bg-green-50 dark:border-green-600 dark:bg-green-900/20",
                      isSelected && !isThisCorrect && showResult &&
                        "border-red-400 bg-red-50 dark:border-red-600 dark:bg-red-900/20",
                      isSelected && !showResult &&
                        "border-primary-400 bg-primary-50 dark:border-primary-600 dark:bg-primary-900/20",
                      !isSelected && !isThisCorrect &&
                        "border-gray-200 hover:border-primary-300 hover:bg-gray-50 dark:border-gray-700 dark:hover:border-primary-700 dark:hover:bg-gray-700/50"
                    )}
                  >
                    <input
                      type="radio"
                      name={`q-${question.id}`}
                      value={val}
                      checked={isSelected}
                      onChange={() => !showResult && onChange(val)}
                      disabled={showResult}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                      aria-label={opt}
                    />
                    <span className="text-sm text-gray-800 dark:text-gray-200">{opt}</span>
                    {isThisCorrect && (
                      <span className="ml-auto text-xs font-semibold text-green-600 dark:text-green-400">
                        ✓ Correct
                      </span>
                    )}
                    {isSelected && !isThisCorrect && showResult && (
                      <span className="ml-auto text-xs font-semibold text-red-600 dark:text-red-400">
                        ✗ Wrong
                      </span>
                    )}
                  </label>
                );
              })}
            </div>
          </fieldset>
        )}

      {/* Short answer */}
      {question.type === "SHORT_ANSWER" && (
        <div>
          <label htmlFor={`sa-${question.id}`} className="sr-only">
            Your answer
          </label>
          <textarea
            id={`sa-${question.id}`}
            rows={4}
            value={answer ?? ""}
            onChange={(e) => !showResult && onChange(e.target.value)}
            disabled={showResult}
            placeholder="Write your answer here…"
            className={clsx(
              "w-full resize-none rounded-xl border px-4 py-3 text-sm",
              "text-gray-900 dark:text-gray-100 dark:bg-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-primary-500",
              showResult
                ? "cursor-not-allowed bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600"
                : "border-gray-300 dark:border-gray-600"
            )}
          />
          {showResult && correctAnswer && (
            <p className="mt-2 text-sm text-green-700 dark:text-green-400">
              <span className="font-semibold">Expected: </span>
              {correctAnswer}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
