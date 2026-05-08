import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import {
  UsersIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { Skeleton } from "@/components/ui";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { AnalyticsDashboard } from "@/types";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const AdminPage: NextPage = () => {
  const { t } = useTranslation();
  const { user, loading } = useAuth();

  const { data, isLoading } = useSWR<AnalyticsDashboard>(
    user?.role === "ADMIN" ? "admin/analytics" : null,
    adminApi.analytics
  );

  if (!loading && user?.role !== "ADMIN") {
    return (
      <Layout>
        <div className="container-page text-center">
          <p className="text-red-500">{t("auth.adminRequired")}</p>
          <Link href="/" className="mt-4 inline-block text-primary-600 underline">
            {t("nav.home")}
          </Link>
        </div>
      </Layout>
    );
  }

  const statCards = data
    ? [
        { label: t("admin.totalStudents"), value: data.totalStudents, icon: UsersIcon, color: "text-blue-500" },
        { label: t("admin.totalExams"), value: data.totalExams, icon: AcademicCapIcon, color: "text-green-500" },
        { label: t("admin.attemptsToday"), value: data.attemptsToday, icon: ClipboardDocumentListIcon, color: "text-yellow-500" },
        { label: t("admin.avgScore"), value: `${data.averageScore}%`, icon: ChartBarIcon, color: "text-purple-500" },
      ]
    : [];

  const barData = data
    ? {
        labels: data.attemptsByDay.map((d) => d.date),
        datasets: [
          {
            label: "Attempts",
            data: data.attemptsByDay.map((d) => d.count),
            backgroundColor: "rgba(59, 130, 246, 0.7)",
            borderRadius: 6,
          },
        ],
      }
    : null;

  const pieData = data
    ? {
        labels: data.scoreDistribution.map((d) => d.range + "%"),
        datasets: [
          {
            data: data.scoreDistribution.map((d) => d.count),
            backgroundColor: [
              "rgba(239, 68, 68, 0.8)",
              "rgba(251, 146, 60, 0.8)",
              "rgba(250, 204, 21, 0.8)",
              "rgba(34, 197, 94, 0.8)",
            ],
            borderWidth: 0,
          },
        ],
      }
    : null;

  return (
    <Layout>
      <Head>
        <title>{t("admin.dashboard")} — {t("common.appName")}</title>
      </Head>

      <div className="container-page">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            {t("admin.dashboard")}
          </h1>
          <div className="flex gap-3">
            <Link
              href="/admin/exams"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t("admin.exams")}
            </Link>
            <Link
              href="/admin/questions"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t("admin.questions")}
            </Link>
            <Link
              href="/admin/users"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              {t("admin.users")}
            </Link>
          </div>
        </div>

        {/* Stat cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isLoading
            ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
            : statCards.map((card) => (
                <div
                  key={card.label}
                  className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gray-50 dark:bg-gray-700">
                    <card.icon className={`h-7 w-7 ${card.color}`} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white">
                      {card.value}
                    </p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {card.label}
                    </p>
                  </div>
                </div>
              ))}
        </div>

        {/* Charts */}
        <div className="grid gap-6 lg:grid-cols-2">
          {barData && (
            <section
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              aria-labelledby="bar-chart-heading"
            >
              <h2 id="bar-chart-heading" className="mb-4 font-bold text-gray-900 dark:text-white">
                Daily Attempts (Last 7 Days)
              </h2>
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  plugins: { legend: { display: false } },
                  scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                }}
                aria-label="Bar chart of daily attempts"
              />
            </section>
          )}

          {pieData && (
            <section
              className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800"
              aria-labelledby="pie-chart-heading"
            >
              <h2 id="pie-chart-heading" className="mb-4 font-bold text-gray-900 dark:text-white">
                Score Distribution
              </h2>
              <div className="mx-auto max-w-xs">
                <Pie
                  data={pieData}
                  options={{ responsive: true }}
                  aria-label="Pie chart of score distribution"
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AdminPage;
