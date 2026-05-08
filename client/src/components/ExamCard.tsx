"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ClockIcon, QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { Exam } from "@/types";
import { Badge } from "./ui";

interface ExamCardProps {
  exam: Exam;
}

export default function ExamCard({ exam }: ExamCardProps) {
  const { t, i18n } = useTranslation();
  const displayTitle = i18n.language === "bn" && exam.titlebn ? exam.titlebn : exam.title;
  const qCount = exam._count?.questions ?? exam.questions?.length ?? 0;

  return (
    <article
      className={clsx(
        "flex flex-col rounded-2xl border border-gray-200 bg-white p-6 shadow-sm",
        "dark:border-gray-700 dark:bg-gray-800 hover:shadow-md transition-shadow duration-150"
      )}
    >
      <div className="flex-1">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
          {displayTitle}
        </h3>
        <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <ClockIcon className="h-4 w-4" aria-hidden="true" />
            {t("subject.minutes", { count: exam.timeLimitMin })}
          </span>
          <span className="flex items-center gap-1">
            <QuestionMarkCircleIcon className="h-4 w-4" aria-hidden="true" />
            {t("subject.questions", { count: qCount })}
          </span>
          {exam.randomize && (
            <Badge variant="yellow">Randomised</Badge>
          )}
        </div>
      </div>

      <Link
        href={`/exam/${exam.slug}`}
        className={clsx(
          "mt-5 inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-2.5",
          "text-sm font-semibold text-white hover:bg-primary-700 transition-colors",
          "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        )}
      >
        {t("subject.startExam")}
      </Link>
    </article>
  );
}
