import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import dynamic from "next/dynamic";
import useSWR from "swr";
import Link from "next/link";
import Layout from "@/components/Layout";
import QuestionCard from "@/components/QuestionCard";
import { Button, Skeleton } from "@/components/ui";
import { adminApi, attemptsApi, usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AttemptResult, Attempt, User } from "@/types";

const ResultSummary = dynamic(() => import("@/components/ResultSummary"), { ssr: false });

const ResultPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const attemptId = Array.isArray(router.query.attemptId) ? router.query.attemptId[0] : router.query.attemptId;
  const { user } = useAuth();

  const { data: result, isLoading, error } = useSWR<AttemptResult>(
    attemptId ? `result/${attemptId}` : null,
    () => attemptsApi.result(attemptId)
  );

  const { data: history } = useSWR<Attempt[]>(
    result?.userId ? `history/${result.userId}` : null,
    () => usersApi.history(result!.userId)
  );

  const { data: adminUsers } = useSWR<User[]>(
    user?.role === "ADMIN" ? "admin/users-list" : null,
    () => adminApi.users()
  );

  if (isLoading) {
    return (
      <Layout>
        <div className="container-page space-y-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </Layout>
    );
  }

  if (error || !result) {
    return (
      <Layout>
        <div className="container-page text-center">
          <p className="text-red-500">{t("common.error")}</p>
          <Link href="/" className="mt-4 inline-block text-primary-600 underline">
            {t("nav.home")}
          </Link>
        </div>
      </Layout>
    );
  }

  const examSlug = result.exam?.slug;
  const subjectSlug = result.exam?.subject?.slug;

  const isOwnResult = user?.id === result.userId;
  const ownerName = !isOwnResult && user?.role === "ADMIN"
    ? adminUsers?.find((u) => u.id === result.userId)?.name
    : undefined;

  const [selectedFilter, setSelectedFilter] = useState<"all" | "correct" | "incorrect" | "unanswered">("all");

  const filteredQuestions = result.exam.questions.filter((question) => {
    const answer = result.answers.find((a) => a.questionId === question.id);
    if (selectedFilter === "correct") return answer?.isCorrect;
    if (selectedFilter === "incorrect") return answer && !answer.isCorrect && !!answer.answer;
    if (selectedFilter === "unanswered") return !answer?.answer;
    return true;
  });

  return (
    <Layout>
      <Head>
        <title>
          {ownerName ? t("result.ownerTitle", { name: ownerName }) : t("result.title")} — {result.exam?.title} — {t("common.appName")}
        </title>
        <meta name="description" content={`Exam result for ${result.exam?.title}`} />
      </Head>

      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {ownerName ? t("result.ownerTitle", { name: ownerName }) : t("result.title")}
          </h1>
          <div className="flex gap-3">
            {subjectSlug && (
              <Link href={`/subject/${subjectSlug}`}>
                <Button variant="secondary">{t("result.backToSubject")}</Button>
              </Link>
            )}
            {examSlug && isOwnResult && (
              <Link href={`/exam/${examSlug}`}>
                <Button>{t("result.retake")}</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Score summary + chart */}
        <ResultSummary
          result={result}
          history={history}
          ownerName={ownerName}
          selectedFilter={selectedFilter}
          onFilterChange={setSelectedFilter}
        />

        {/* Per-question review */}
        <section className="mt-10" aria-labelledby="review-heading">
          <h2
            id="review-heading"
            className="mb-6 text-2xl font-bold text-gray-900 dark:text-white"
          >
            Question Review
          </h2>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
            {selectedFilter === "all"
              ? t("result.showingAll")
              : t(`result.showing${selectedFilter.charAt(0).toUpperCase() + selectedFilter.slice(1)}`)}
          </p>
          <div className="space-y-6">
            {filteredQuestions.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center text-gray-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {t("result.noMatchingQuestions")}
              </p>
            ) : (
              filteredQuestions.map((question) => {
                const aa = result.answers.find((a) => a.questionId === question.id);
                return (
                  <QuestionCard
                    key={question.id}
                    question={question}
                    answer={aa?.answer ?? undefined}
                    onChange={() => {}}
                    showResult
                    correctAnswer={question.correct ?? undefined}
                  />
                );
              })
            )}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ResultPage;
