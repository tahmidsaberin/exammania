import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import Layout from "@/components/Layout";
import DivisionCard from "@/components/DivisionCard";
import { SkeletonCard } from "@/components/ui";
import { divisionsApi } from "@/lib/api";
import type { Division } from "@/types";

const LEVELS = ["ssc", "hsc"] as const;

type LevelSlug = (typeof LEVELS)[number];

const LevelPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const slug = Array.isArray(router.query.slug) ? router.query.slug[0] : router.query.slug;
  const levelSlug = slug?.toLowerCase() as LevelSlug | undefined;
  const level = levelSlug === "ssc" ? "SSC" : levelSlug === "hsc" ? "HSC" : undefined;

  const { data: divisions, isLoading, error } = useSWR<Division[]>(
    level ? [`divisions`, level] : null,
    () => divisionsApi.byLevel(level!)
  );

  if (!router.isReady) {
    return (
      <Layout>
        <div className="container-page">
          <p className="text-center text-gray-500">Loading…</p>
        </div>
      </Layout>
    );
  }

  if (!level) {
    return (
      <Layout>
        <div className="container-page">
          <p className="text-center text-red-500">{t("common.notFound")}</p>
          <div className="mt-4 text-center">
            <Link href="/levels" className="text-primary-600 underline">
              {t("landing.levelsTitle")}
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{t("landing.levelsTitle")} — {t("common.appName")}</title>
        <meta name="description" content={`Explore ${level} divisions`} />
      </Head>

      <div className="container-page">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/levels" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
              ← {t("landing.levelsTitle")}
            </Link>
            <h1 className="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
              {level} {t("landing.divisionsTitle")}
            </h1>
          </div>
        </div>

        <p className="mb-8 text-gray-500 dark:text-gray-400">
          {t("landing.subtitle")}
        </p>

        {error && (
          <p className="text-center text-red-500">{t("common.error")}</p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {isLoading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : divisions?.map((division) => (
                <DivisionCard key={division.id} division={division} />
              ))}
        </div>
      </div>
    </Layout>
  );
};

export default LevelPage;
