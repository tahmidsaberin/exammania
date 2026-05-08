import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import Layout from "@/components/Layout";
import SubjectCard from "@/components/SubjectCard";
import { SkeletonCard } from "@/components/ui";
import { divisionsApi } from "@/lib/api";

const DivisionPage: NextPage = () => {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const { data, isLoading, error } = useSWR(
    slug ? `divisions/${slug}/subjects` : null,
    () => divisionsApi.subjects(slug)
  );

  const divName = i18n.language === "bn" && data?.division.namebn
    ? data.division.namebn
    : data?.division.name;

  return (
    <Layout>
      <Head>
        <title>
          {divName ?? t("common.loading")} — {t("common.appName")}
        </title>
        <meta name="description" content={`Subjects and exams for the ${divName} division`} />
      </Head>

      <div className="container-page">
        <Link
          href="/divisions"
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
              {t("division.title", { name: divName })}
            </h1>
            <p className="mb-10 text-gray-500 dark:text-gray-400">
              {t("division.subjects")}
            </p>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.subjects.map((sub) => (
                <SubjectCard key={sub.id} subject={sub} />
              ))}
            </div>
          </>
        )}

        {isLoading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <SkeletonCard key={i} />)}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DivisionPage;
