import type { NextPage } from "next";
import Head from "next/head";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import Layout from "@/components/Layout";
import DivisionCard from "@/components/DivisionCard";
import { SkeletonCard } from "@/components/ui";
import { divisionsApi } from "@/lib/api";
import type { Division } from "@/types";

const DivisionsPage: NextPage = () => {
  const { t } = useTranslation();
  const { data: divisions, isLoading, error } = useSWR<Division[]>(
    "divisions",
    divisionsApi.list
  );

  return (
    <Layout>
      <Head>
        <title>{t("nav.divisions")} — {t("common.appName")}</title>
        <meta name="description" content="Choose your academic division: Science, Commerce, or Arts" />
      </Head>

      <div className="container-page">
        <h1 className="mb-2 text-3xl font-extrabold text-gray-900 dark:text-white">
          {t("nav.divisions")}
        </h1>
        <p className="mb-10 text-gray-500 dark:text-gray-400">
          {t("landing.divisionsTitle")}
        </p>

        {error && (
          <p className="text-center text-red-500">{t("common.error")}</p>
        )}

        <div className="grid gap-6 md:grid-cols-3">
          {isLoading
            ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            : divisions?.map((div) => (
                <DivisionCard key={div.id} division={div} />
              ))}
        </div>
      </div>
    </Layout>
  );
};

export default DivisionsPage;
