"use client";

import React from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import { useTranslation } from "react-i18next";
import { CheckCircleIcon, XCircleIcon, MinusCircleIcon } from "@heroicons/react/24/solid";
import clsx from "clsx";
import type { AttemptResult, Attempt } from "@/types";
import { ProgressBar } from "./ui";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

type ResultFilter = "all" | "correct" | "incorrect" | "unanswered";

interface ResultSummaryProps {
  result: AttemptResult;
  history?: Attempt[];
  ownerName?: string;
  selectedFilter?: ResultFilter;
  onFilterChange?: (filter: ResultFilter) => void;
}

export default function ResultSummary({
  result,
  history,
  ownerName,
  selectedFilter = "all",
  onFilterChange,
}: ResultSummaryProps) {
  const { t } = useTranslation();

  const pct = result.totalScore > 0
    ? Math.round((result.score / result.totalScore) * 100)
    : 0;

  const correct = result.answers.filter((a) => a.isCorrect).length;
  const wrong = result.answers.filter((a) => !a.isCorrect && a.answer).length;
  const unanswered = result.answers.filter((a) => !a.answer).length;

  const timeTakenMs = result.completedAt && result.startedAt
    ? new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()
    : 0;
  const timeTakenMin = Math.floor(timeTakenMs / 60000);
  const timeTakenSec = Math.floor((timeTakenMs % 60000) / 1000);

  const scoreColor = pct >= 75 ? "green" : pct >= 50 ? "yellow" : "red";

  // ─── Chart ───────────────────────────────────────────────
  const chartData = history
    ? {
        labels: history
          .slice()
          .reverse()
          .map((a) =>
            new Date(a.completedAt ?? a.startedAt).toLocaleDateString("en-BD", {
              month: "short",
              day: "numeric",
            })
          ),
        datasets: [
          {
            label: "Score %",
            data: history
              .slice()
              .reverse()
              .map((a) =>
                a.totalScore > 0 ? Math.round((a.score / a.totalScore) * 100) : 0
              ),
            borderColor: "rgb(59, 130, 246)",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            fill: true,
            tension: 0.4,
            pointRadius: 5,
            pointBackgroundColor: "rgb(59, 130, 246)",
          },
        ],
      }
    : null;

  return (
    <div className="space-y-8">
      {/* Score summary */}
      <section
        className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-700 dark:bg-gray-800"
        aria-labelledby="result-heading"
      >
        <h2
          id="result-heading"
          className="mb-6 text-2xl font-bold text-gray-900 dark:text-white"
        >
          {ownerName ? t("result.ownerTitle", { name: ownerName }) : t("result.title")}
        </h2>

        {/* Big score */}
        <div className="mb-6 flex items-center gap-6">
          <div
            className={clsx(
              "result-percentage-badge",
              pct >= 75 ? "green" : pct >= 50 ? "yellow" : "red"
            )}
            aria-label={`Score: ${pct}%`}
          >
            {pct}%
          </div>
          <div>
            <p className="text-4xl font-bold text-gray-900 dark:text-white">
              {result.score}{" "}
              <span className="text-xl font-normal text-gray-500 dark:text-gray-400">
                / {result.totalScore}
              </span>
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {t("result.timeTaken")}: {timeTakenMin}m {timeTakenSec}s
            </p>
          </div>
        </div>

        <ProgressBar value={pct} label="Overall score" color={scoreColor} />

        {/* Stats row */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          {[
            {
              key: "correct" as const,
              title: t("result.correct"),
              count: correct,
              icon: <CheckCircleIcon className="h-8 w-8 text-green-500" aria-hidden="true" />,
              selectedClass: "ring-2 ring-green-500/40",
            },
            {
              key: "incorrect" as const,
              title: t("result.incorrect"),
              count: wrong,
              icon: <XCircleIcon className="h-8 w-8 text-red-500" aria-hidden="true" />,
              selectedClass: "ring-2 ring-red-500/40",
            },
            {
              key: "unanswered" as const,
              title: t("result.unanswered"),
              count: unanswered,
              icon: <MinusCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />,
              selectedClass: "ring-2 ring-slate-400/40",
            },
          ].map((item) => {
            const isActive = selectedFilter === item.key;
            const Card = onFilterChange ? (
              <button
                type="button"
                key={item.key}
                onClick={() => onFilterChange(item.key === selectedFilter ? "all" : item.key)}
                className={clsx(
                  "button-30 flex flex-col items-center rounded-xl p-4 transition-all",
                  isActive && item.selectedClass,
                  onFilterChange != null && "hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-primary-400"
                )}
              >
                {item.icon}
                <span className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{item.count}</span>
                <span className="text-xs text-gray-500 dark:text-gray-300">{item.title}</span>
              </button>
            ) : (
              <div
                key={item.key}
                className={clsx(
                  "button-30 flex flex-col items-center rounded-xl p-4 cursor-default",
                  isActive && item.selectedClass
                )}
              >
                {item.icon}
                <span className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{item.count}</span>
                <span className="text-xs text-gray-500 dark:text-gray-300">{item.title}</span>
              </div>
            );
            return Card;
          })}
        </div>
      </section>

      {/* Score history chart */}
      {chartData && history && history.length > 1 && (
        <section
          className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
          aria-labelledby="history-heading"
        >
          <h3
            id="history-heading"
            className="mb-4 text-lg font-bold text-gray-900 dark:text-white"
          >
            {t("result.scoreHistory")}
          </h3>
          <Line
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: { display: false },
                tooltip: { mode: "index" },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  max: 100,
                  ticks: { callback: (v) => `${v}%` },
                },
              },
            }}
            aria-label="Score history line chart"
          />
        </section>
      )}
    </div>
  );
}
