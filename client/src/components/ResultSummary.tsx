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

interface ResultSummaryProps {
  result: AttemptResult;
  history?: Attempt[];
}

export default function ResultSummary({ result, history }: ResultSummaryProps) {
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
          {t("result.title")}
        </h2>

        {/* Big score */}
        <div className="mb-6 flex items-center gap-6">
          <div
            className={clsx(
              "flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-full text-3xl font-black text-white",
              pct >= 75 ? "bg-green-500" : pct >= 50 ? "bg-yellow-400" : "bg-red-500"
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
          <div className="flex flex-col items-center rounded-xl bg-green-50 p-4 dark:bg-green-900/20">
            <CheckCircleIcon className="h-8 w-8 text-green-500" aria-hidden="true" />
            <span className="mt-1 text-2xl font-bold text-green-700 dark:text-green-400">{correct}</span>
            <span className="text-xs text-green-600 dark:text-green-500">{t("result.correct")}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-red-50 p-4 dark:bg-red-900/20">
            <XCircleIcon className="h-8 w-8 text-red-500" aria-hidden="true" />
            <span className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400">{wrong}</span>
            <span className="text-xs text-red-600 dark:text-red-500">{t("result.incorrect")}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl bg-gray-50 p-4 dark:bg-gray-700/50">
            <MinusCircleIcon className="h-8 w-8 text-gray-400" aria-hidden="true" />
            <span className="mt-1 text-2xl font-bold text-gray-600 dark:text-gray-300">{unanswered}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">{t("result.unanswered")}</span>
          </div>
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
