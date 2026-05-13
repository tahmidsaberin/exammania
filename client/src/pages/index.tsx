import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { ClockIcon, ChartBarIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";

const Home: NextPage = () => {
  const { t } = useTranslation();
  const levels = [
    { slug: "ssc", title: t("landing.ssc"), description: t("landing.sscDesc"), color: "from-sky-500 to-cyan-500" },
    { slug: "hsc", title: t("landing.hsc"), description: t("landing.hscDesc"), color: "from-violet-500 to-purple-500" },
  ];

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
              href="/levels"
              className="button-29 w-full sm:w-auto"
            >
              {t("landing.cta")}
            </Link>
            <Link
              href="/auth/signin"
              className="button-29 w-full sm:w-auto"
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

      {/* Academic levels */}
      <section
        className="bg-gray-50 py-20 dark:bg-gray-950"
        aria-labelledby="levels-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2
            id="levels-heading"
            className="mb-10 text-center text-3xl font-bold text-gray-900 dark:text-white"
          >
            {t("landing.levelsTitle")}
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {levels.map((level) => (
              <Link
                key={level.slug}
                href={`/levels/${level.slug}`}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br px-8 py-12 text-white shadow-xl shadow-black/10 transition-all duration-200 ${level.color} hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-white/40`}
                aria-label={`Choose ${level.title}`}
              >
                <span className="mb-5 block text-xs font-semibold uppercase tracking-[0.3em] text-white/80">
                  {t("landing.level")}
                </span>
                <h3 className="text-4xl font-extrabold tracking-tight">{level.title}</h3>
                <p className="mt-4 max-w-xl text-lg text-white/90">{level.description}</p>
                <div className="mt-8 inline-flex rounded-full bg-white/20 px-4 py-2 text-sm font-semibold text-white/90">
                  {t("landing.start")}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
