"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { Subject } from "@/types";
import { Badge } from "./ui";

const SUBJECT_GRADIENTS: Record<string, string> = {
  emerald: "from-emerald-500 via-lime-500 to-emerald-600",
  violet: "from-violet-500 via-fuchsia-500 to-purple-500",
  blue: "from-sky-500 via-indigo-500 to-blue-600",
  rose: "from-rose-500 via-fuchsia-500 to-pink-600",
  amber: "from-amber-500 via-orange-500 to-amber-600",
};

interface SubjectCardProps {
  subject: Subject;
}

export default function SubjectCard({ subject }: SubjectCardProps) {
  const { t, i18n } = useTranslation();
  const displayName = i18n.language === "bn" && subject.namebn ? subject.namebn : subject.name;
  const gradient = SUBJECT_GRADIENTS[subject.color ?? "emerald"] ?? SUBJECT_GRADIENTS.emerald;

  return (
    <Link
      href={`/subject/${subject.slug}`}
      className={clsx(
        "group flex items-center gap-4 rounded-xl bg-gradient-to-br p-5 shadow-sm text-white",
        gradient,
        "hover:shadow-md transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary-500"
      )}
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 text-white">
        <DocumentTextIcon
          className="h-6 w-6"
          aria-hidden="true"
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-white truncate">{displayName}</h3>
          {subject.isCommon && (
            <Badge variant="gray">Common</Badge>
          )}
        </div>
        {subject._count !== undefined && (
          <p className="text-sm text-white/80">
            {t("subject.availableExams")}: {subject._count.exams}
          </p>
        )}
      </div>
      <span
        className="text-white/70 transition-colors"
        aria-hidden="true"
      >
        →
      </span>
    </Link>
  );
}
