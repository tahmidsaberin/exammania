import Link from "next/link";
import { useState } from "react";
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import clsx from "clsx";
import { Attempt, Division } from "@/types";
import { Skeleton } from "@/components/ui";

interface SubjectGroup {
  subjectSlug: string;
  subjectName: string;
  isCommon: boolean;
  attempts: Attempt[];
}

interface DivisionGroup {
  divisionId: string | null;
  divisionName: string;
  divisionSlug: string | null;
  subjects: SubjectGroup[];
}

interface ExamHistoryProps {
  history: Attempt[] | undefined;
  divisions: Division[] | undefined;
  loading: boolean;
  emptyMessage?: string;
}

function groupHistory(history: Attempt[], divisions: Division[]): DivisionGroup[] {
  const divisionMap = new Map<string, Division>();
  divisions.forEach((division) => divisionMap.set(division.id, division));

  const cycle = new Map<string, Map<string, SubjectGroup>>();

  for (const attempt of history) {
    const exam = attempt.exam;
    if (!exam?.subject) continue;
    const subject = exam.subject;
    const divisionKey = exam.divisionId ?? (subject.isCommon ? "__common__" : "__unknown__");

    if (!cycle.has(divisionKey)) cycle.set(divisionKey, new Map());
    const subjectMap = cycle.get(divisionKey)!;

    if (!subjectMap.has(subject.slug)) {
      subjectMap.set(subject.slug, {
        subjectSlug: subject.slug,
        subjectName: subject.name,
        isCommon: subject.isCommon,
        attempts: [],
      });
    }

    subjectMap.get(subject.slug)!.attempts.push(attempt);
  }

  const result: DivisionGroup[] = [];

  for (const [divisionKey, subjectMap] of cycle.entries()) {
    let divisionName = "Other";
    let divisionSlug: string | null = null;
    let divisionId: string | null = null;

    if (divisionKey === "__common__") {
      divisionName = "Common Subjects";
    } else {
      const division = divisionMap.get(divisionKey);
      if (division) {
        divisionName = division.name;
        divisionSlug = division.slug;
        divisionId = division.id;
      }
    }

    result.push({
      divisionId,
      divisionName,
      divisionSlug,
      subjects: Array.from(subjectMap.values()),
    });
  }

  result.sort((a, b) => {
    if (!a.divisionSlug && b.divisionSlug) return 1;
    if (a.divisionSlug && !b.divisionSlug) return -1;
    return a.divisionName.localeCompare(b.divisionName);
  });

  return result;
}

function pctOf(attempt: Attempt) {
  return attempt.totalScore > 0 ? Math.round((attempt.score / attempt.totalScore) * 100) : 0;
}

function scoreText(pct: number) {
  if (pct >= 75) return "text-green-600 dark:text-green-400";
  if (pct >= 50) return "text-yellow-600 dark:text-yellow-400";
  return "text-red-600 dark:text-red-400";
}

function scoreDot(pct: number) {
  if (pct >= 75) return "bg-green-500";
  if (pct >= 50) return "bg-yellow-400";
  return "bg-red-500";
}

function scoreBadge(pct: number) {
  if (pct >= 75) return "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300";
  if (pct >= 50) return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300";
  return "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
}

function AttemptRow({ attempt }: { attempt: Attempt }) {
  const pct = pctOf(attempt);
  return (
    <Link
      href={`/result/${attempt.id}`}
      className="flex items-center justify-between rounded-xl border border-gray-100 bg-white px-5 py-3 hover:border-primary-300 hover:shadow-sm transition-all dark:border-gray-700/50 dark:bg-gray-800/60 dark:hover:border-primary-700 group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className={clsx("h-2.5 w-2.5 flex-shrink-0 rounded-full", scoreDot(pct))} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
            {(attempt.exam as { title?: string })?.title ?? "Exam"}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1 mt-0.5">
            <ClockIcon className="h-3 w-3 flex-shrink-0" />
            {attempt.completedAt
              ? new Date(attempt.completedAt).toLocaleDateString("en-BD", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "In progress"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-shrink-0 ml-4">
        <div className="text-right">
          <p className="text-sm font-bold text-gray-900 dark:text-white">
            {attempt.score}/{attempt.totalScore}
          </p>
          <p className={clsx("text-xs font-semibold", scoreText(pct))}>{pct}%</p>
        </div>
        <ChevronRightIcon className="h-4 w-4 text-gray-300 group-hover:text-primary-500 transition-colors" />
      </div>
    </Link>
  );
}

function SubjectAccordion({ subject }: { subject: SubjectGroup }) {
  const [open, setOpen] = useState(false);
  const total = subject.attempts.length;
  const avgPct = total > 0 ? subject.attempts.reduce((sum, attempt) => sum + pctOf(attempt), 0) / total : 0;

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary-50 dark:bg-primary-900/30">
            <BookOpenIcon className="h-5 w-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-gray-900 dark:text-white">{subject.subjectName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="font-medium text-gray-700 dark:text-gray-300">{total}</span>
              {total === 1 ? " exam" : " exams"} taken
              {total > 0 && (
                <>
                  {" · avg "}
                  <span className={clsx("font-semibold", scoreText(Math.round(avgPct)))}>
                    {Math.round(avgPct)}%
                  </span>
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5">
            {subject.attempts.slice(0, 3).map((attempt) => {
              const pct = pctOf(attempt);
              return (
                <span key={attempt.id} className={clsx("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", scoreBadge(pct))}>
                  {pct}%
                </span>
              );
            })}
            {total > 3 && <span className="text-xs text-gray-400 dark:text-gray-500">+{total - 3}</span>}
          </div>
          <ChevronDownIcon className={clsx("h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200", open && "rotate-180")} />
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 bg-gray-50/60 dark:bg-gray-900/20 px-4 py-3 space-y-2">
          {subject.attempts.map((attempt) => (
            <AttemptRow key={attempt.id} attempt={attempt} />
          ))}
        </div>
      )}
    </div>
  );
}

function DivisionAccordion({ group }: { group: DivisionGroup }) {
  const [open, setOpen] = useState(true);
  const totalAttempts = group.subjects.reduce((sum, subject) => sum + subject.attempts.length, 0);

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between bg-white dark:bg-gray-800 px-6 py-5 hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
        aria-expanded={open}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-primary-600">
            <AcademicCapIcon className="h-6 w-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-lg font-bold text-gray-900 dark:text-white">{group.divisionName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="font-medium text-gray-700 dark:text-gray-300">{group.subjects.length}</span>
              {group.subjects.length === 1 ? " subject" : " subjects"}
              {" · "}
              <span className="font-medium text-gray-700 dark:text-gray-300">{totalAttempts}</span>
              {totalAttempts === 1 ? " attempt" : " attempts"} total
            </p>
          </div>
        </div>
        <ChevronDownIcon className={clsx("h-5 w-5 flex-shrink-0 text-gray-400 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 p-4 space-y-3">
          {group.subjects.map((subject) => (
            <SubjectAccordion key={subject.subjectSlug} subject={subject} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExamHistory({ history, divisions, loading, emptyMessage }: ExamHistoryProps) {
  const groups = !loading && history && divisions ? groupHistory(history, divisions) : [];

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((index) => (
          <Skeleton key={index} className="h-24 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!history || history.length === 0 || groups.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-16 text-center dark:border-gray-600 dark:bg-gray-800">
        <CheckCircleIcon className="mx-auto mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
        <p className="text-gray-500 dark:text-gray-400">{emptyMessage ?? "No exam history is available yet."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <DivisionAccordion key={group.divisionId ?? group.divisionName} group={group} />
      ))}
    </div>
  );
}
