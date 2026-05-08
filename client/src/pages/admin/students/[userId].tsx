import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import { UserCircleIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { Badge } from "@/components/ui";
import { adminHistoryApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Attempt, Division, User } from "@/types";
import ExamHistory from "@/components/ExamHistory";

// ─── Main page ──────────────────────────────────────────────────────────────


const AdminStudentHistoryPage: NextPage = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { userId } = router.query as { userId: string };
  const { user: adminUser } = useAuth();

  // Fetch the student's history via admin endpoint
  const { data: history, isLoading: histLoading } = useSWR<Attempt[]>(
    userId && adminUser?.role === "ADMIN" ? `admin/students/${userId}/history` : null,
    () => adminHistoryApi.studentHistory(userId)
  );

  // Fetch divisions for grouping
  const { data: divisions, isLoading: divLoading } = useSWR<Division[]>(
    "divisions",
    () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/divisions`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((j) => (j.data as Division[]) ?? [])
  );

  // Fetch student profile from history (extract from first attempt)
  const studentName = history?.[0]
    ? "Student"
    : "Student";

  const isLoading = histLoading || divLoading;
  const totalAttempts = history?.length ?? 0;

  if (adminUser?.role !== "ADMIN") {
    return (
      <Layout>
        <div className="container-page text-center">
          <p className="text-red-500">{t("auth.adminRequired")}</p>
        </div>
      </Layout>
    );
  }

  // Also fetch the user info from the users list
  const { data: allUsers } = useSWR<User[]>(
    adminUser?.role === "ADMIN" ? "admin/users-list" : null,
    () =>
      fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/admin/users`, {
        credentials: "include",
      })
        .then((r) => r.json())
        .then((j) => (j.data as User[]) ?? [])
  );

  const student = allUsers?.find((u) => u.id === userId);

  return (
    <Layout>
      <Head>
        <title>
          {student?.name ?? "Student"} History — {t("common.appName")}
        </title>
      </Head>

      <div className="container-page">
        {/* Breadcrumb */}
        <div className="mb-8 flex items-center gap-2 text-sm">
          <Link
            href="/admin"
            className="text-primary-600 hover:underline dark:text-primary-400"
          >
            Dashboard
          </Link>
          <span className="text-gray-400">/</span>
          <Link
            href="/admin/users"
            className="text-primary-600 hover:underline dark:text-primary-400"
          >
            Users
          </Link>
          <span className="text-gray-400">/</span>
          <span className="text-gray-600 dark:text-gray-400">
            {student?.name ?? "Student"} History
          </span>
        </div>

        {/* Student profile card */}
        <section
          className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 p-6 shadow-sm"
          aria-label="Student profile"
        >
          <div className="flex items-center gap-5">
            {student?.avatarUrl ? (
              <Image
                src={student.avatarUrl}
                alt={student.name}
                width={72}
                height={72}
                className="rounded-full ring-4 ring-primary-100 dark:ring-primary-900 flex-shrink-0"
              />
            ) : (
              <UserCircleIcon className="h-18 w-18 flex-shrink-0 text-gray-300 dark:text-gray-600 h-16 w-16" />
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                  {student?.name ?? "Loading…"}
                </h1>
                <Badge variant="yellow">Viewing as Admin</Badge>
              </div>
              <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                {student?.email ?? ""}
              </p>
              <div className="mt-2 flex items-center gap-2">
                <Badge variant="gray">STUDENT</Badge>
                {student?.createdAt && (
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    Joined{" "}
                    {new Date(student.createdAt).toLocaleDateString("en-BD", {
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-8">
            <div className="text-center sm:text-right">
              <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400">
                {totalAttempts}
              </p>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Exams Taken</p>
            </div>
          </div>
        </section>

        {/* History */}
        <section aria-labelledby="student-history-heading">
          <h2
            id="student-history-heading"
            className="mb-6 text-xl font-bold text-gray-900 dark:text-white"
          >
            Exam History
          </h2>

          <ExamHistory history={history} divisions={divisions} loading={isLoading} emptyMessage="This student hasn't taken any exams yet." />
        </section>

        {/* Back button */}
        <div className="mt-10">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Back to Users
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default AdminStudentHistoryPage;
