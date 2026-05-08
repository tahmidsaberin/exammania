"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { Subject } from "@/types";
import { Badge } from "./ui";

interface SubjectCardProps {
  subject: Subject;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const { t, i18n } = useTranslation();
  const displayName = i18n.language === "bn" && subject.namebn ? subject.namebn : subject.name;

  return (
    <Link
      href={`/subject/${subject.slug}`}
      className={clsx(
        "group flex items-center gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm",
        "hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-700",
        "transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500"
      )}
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-50 dark:bg-primary-900/30">
        <DocumentTextIcon
          className="h-6 w-6 text-primary-600 dark:text-primary-400"
          aria-hidden="true"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{displayName}</h3>
          {subject.isCommon && (
            <Badge variant="gray">Common</Badge>
          )}
        </div>
        {subject._count !== undefined && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {t("subject.availableExams")}: {subject._count.exams}
          </p>
        )}
      </div>
      <span
        className="text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}
