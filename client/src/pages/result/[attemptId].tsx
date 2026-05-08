import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import Link from "next/link";
import Layout from "@/components/Layout";
import ResultSummary from "@/components/ResultSummary";
import QuestionCard from "@/components/QuestionCard";
import { Button, Skeleton } from "@/components/ui";
import { attemptsApi, usersApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AttemptResult, Attempt } from "@/types";

const ResultPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { attemptId } = router.query as { attemptId: string };
  const { user } = useAuth();

  const { data: result, isLoading, error } = useSWR<AttemptResult>(
    attemptId ? `result/${attemptId}` : null,
    () => attemptsApi.result(attemptId)
  );

  const { data: history } = useSWR<Attempt[]>(
    user ? `history/${user.id}` : null,
    () => usersApi.history(user!.id)
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

  return (
    <Layout>
      <Head>
        <title>
          {t("result.title")} — {result.exam?.title} — {t("common.appName")}
        </title>
        <meta name="description" content={`Exam result for ${result.exam?.title}`} />
      </Head>

      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {t("result.title")}
          </h1>
          <div className="flex gap-3">
            {subjectSlug && (
              <Link href={`/subject/${subjectSlug}`}>
                <Button variant="secondary">{t("result.backToSubject")}</Button>
              </Link>
            )}
            {examSlug && (
              <Link href={`/exam/${examSlug}`}>
                <Button>{t("result.retake")}</Button>
              </Link>
            )}
          </div>
        </div>

        {/* Score summary + chart */}
        <ResultSummary result={result} history={history} />

        {/* Per-question review */}
        <section className="mt-10" aria-labelledby="review-heading">
          <h2
            id="review-heading"
            className="mb-6 text-2xl font-bold text-gray-900 dark:text-white"
          >
            Question Review
          </h2>
          <div className="space-y-6">
            {result.exam.questions.map((question) => {
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
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default ResultPage;
