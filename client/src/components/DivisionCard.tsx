"use client";

import React from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import {
  BeakerIcon,
  BriefcaseIcon,
  BookOpenIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import type { Division } from "@/types";

const DIVISION_ICONS: Record<string, React.ElementType> = {
  science: BeakerIcon,
  commerce: BriefcaseIcon,
  arts: BookOpenIcon,
};

const DIVISION_COLORS: Record<string, string> = {
  science:
    "from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600",
  commerce:
    "from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600",
  arts:
    "from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600",
};

interface DivisionCardProps {
  division: Division;
}

export default function DivisionCard({ division }: DivisionCardProps) {
  const { i18n } = useTranslation();
  const Icon = DIVISION_ICONS[division.slug] ?? BookOpenIcon;
  const gradient = DIVISION_COLORS[division.slug] ?? "from-gray-500 to-gray-600";
  const displayName = i18n.language === "bn" && division.namebn ? division.namebn : division.name;

  return (
    <Link
      href={`/division/${division.slug}`}
      className={clsx(
        "group relative flex flex-col items-center justify-center rounded-2xl bg-gradient-to-br p-8 text-white shadow-lg transition-all duration-200",
        "hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-primary-500",
        gradient
      )}
      aria-label={`${displayName} division`}
    >
      <Icon className="mb-4 h-14 w-14 opacity-90" aria-hidden="true" />
      <h3 className="text-2xl font-bold">{displayName}</h3>
      {division._count && (
        <p className="mt-1 text-sm font-medium opacity-80">
          {division._count.subjects} subjects · {division._count.exams} exams
        </p>
      )}
      <div className="absolute bottom-4 right-4 text-white/60 text-xs font-medium group-hover:text-white/90 transition-colors">
        Explore →
      </div>
    </Link>
  );
}
