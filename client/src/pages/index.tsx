import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { ClockIcon, ChartBarIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import DivisionCard from "@/components/DivisionCard";
import { SkeletonCard } from "@/components/ui";
import { divisionsApi } from "@/lib/api";
import type { Division } from "@/types";

const Home: NextPage = () => {
  const { t } = useTranslation();
  const { data: divisions, isLoading } = useSWR<Division[]>(
    "divisions",
    divisionsApi.list
  );

  const features = [
    {
      icon: ClockIcon,
      title: t("landing.feature1Title"),
      desc: t("landing.feature1Desc"),
    },
    {
      icon: AcademicCapIcon,
      title: t("landing.feature2Title"),
      desc: t("landing.feature2Desc"),
    },
    {
      icon: ChartBarIcon,
      title: t("landing.feature3Title"),
      desc: t("landing.feature3Desc"),
    },
  ];

  return (
    <Layout>
      <Head>
        <title>{t("common.appName")} — {t("common.tagline")}</title>
        <meta name="description" content={t("landing.subtitle")} />
        <meta property="og:title" content={t("common.appName")} />
        <meta property="og:description" content={t("landing.subtitle")} />
      </Head>

      {/* Hero */}
      <section
        className="relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-indigo-800 px-4 py-24 text-white"
        aria-labelledby="hero-heading"
      >
        <div className="mx-auto max-w-3xl text-center">
          <h1
            id="hero-heading"
            className="text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl"
          >
            {t("landing.hero")}
          </h1>
          <p className="mt-6 text-lg text-primary-100 sm:text-xl">
            {t("landing.subtitle")}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/divisions"
              className="rounded-xl bg-white px-8 py-3 text-base font-bold text-primary-700 shadow-lg hover:bg-primary-50 transition-colors focus:outline-none focus:ring-4 focus:ring-white/40"
            >
              {t("landing.cta")}
            </Link>
            <Link
              href="/auth/signin"
              className="rounded-xl border-2 border-white/40 px-8 py-3 text-base font-bold text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-4 focus:ring-white/40"
            >
              {t("nav.signIn")}
            </Link>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/5" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-48 w-48 rounded-full bg-white/5" aria-hidden="true" />
      </section>

      {/* Features */}
      <section
        className="bg-white py-20 dark:bg-gray-900"
        aria-labelledby="features-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="features-heading"
            className="mb-12 text-center text-3xl font-bold text-gray-900 dark:text-white"
          >
            {t("landing.featuresTitle")}
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex flex-col items-center rounded-2xl bg-gray-50 p-8 text-center dark:bg-gray-800"
              >
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 dark:bg-primary-900/30">
                  <f.icon className="h-8 w-8 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  {f.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Divisions */}
      <section
        className="bg-gray-50 py-20 dark:bg-gray-950"
        aria-labelledby="divisions-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="divisions-heading"
            className="mb-10 text-center text-3xl font-bold text-gray-900 dark:text-white"
          >
            {t("landing.divisionsTitle")}
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {isLoading
              ? [1, 2, 3].map((i) => <SkeletonCard key={i} />)
              : divisions?.map((div) => (
                  <DivisionCard key={div.id} division={div} />
                ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
