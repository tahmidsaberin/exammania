import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Layout from "@/components/Layout";
import ExamCard from "@/components/ExamCard";
import { SkeletonCard } from "@/components/ui";
import { examsApi } from "@/lib/api";

const SubjectPage: NextPage = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const { data, isLoading, error } = useSWR(
    slug ? `subjects/${slug}/exams` : null,
    () => examsApi.bySubject(slug)
  );

  const subjectName =
    i18n.language === "bn" && data?.subject.namebn
      ? data.subject.namebn
      : data?.subject.name;

  return (
    <Layout>
      <Head>
        <title>
          {subjectName ?? t("common.loading")} — {t("common.appName")}
        </title>
        <meta name="description" content={`Practice exams for ${subjectName}`} />
      </Head>

      <div className="container-page">
        <Link
          href={data?.subject.divisionId ? `/division/${slug}` : "/divisions"}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          {t("common.back")}
        </Link>

        {error && (
          <p className="text-center text-red-500">{t("common.error")}</p>
        )}

        {!isLoading && data && (
          <>
            <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
              {subjectName}
            </h1>
            <p className="mb-10 text-gray-500 dark:text-gray-400">
              {t("subject.availableExams")}
            </p>

            {data.exams.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800">
                <p className="text-gray-500 dark:text-gray-400">
                  {t("common.noResults")}
                </p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {data.exams.map((exam) => (
                  <ExamCard key={exam.id} exam={exam} />
                ))}
              </div>
            )}
          </>
        )}

        {isLoading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SubjectPage;
