import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import Layout from "@/components/Layout";

const LevelsPage: NextPage = () => {
  const { t } = useTranslation();
  const levels = [
    {
      slug: "ssc",
      title: t("landing.ssc"),
      description: t("landing.sscDesc"),
      color: "from-sky-500 to-cyan-500",
    },
    {
      slug: "hsc",
      title: t("landing.hsc"),
      description: t("landing.hscDesc"),
      color: "from-violet-500 to-purple-500",
    },
  ];

  return (
    <Layout>
      <Head>
        <title>{t("landing.levelsTitle")} — {t("common.appName")}</title>
        <meta name="description" content={t("landing.subtitle")} />
      </Head>

      <div className="container-page">
        <h1 className="mb-4 text-3xl font-extrabold text-gray-900 dark:text-white">
          {t("landing.levelsTitle")}
        </h1>
        <p className="mb-10 text-gray-500 dark:text-gray-400">
          {t("landing.subtitle")}
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {levels.map((level) => (
            <Link
              key={level.slug}
              href={`/levels/${level.slug}`}
              className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br px-8 py-12 text-white shadow-xl shadow-black/10 transition-all duration-200 ${level.color} hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/40`}
            >
              <span className="mb-5 block text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                {t("landing.level")}
              </span>
              <h2 className="text-4xl font-extrabold tracking-tight">{level.title}</h2>
              <p className="mt-4 text-lg text-white/90">{level.description}</p>
              <div className="mt-8 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white/90">
                {t("landing.start")}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default LevelsPage;
