import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import useSWR from "swr";
import {
  UserCircleIcon,
  ChevronRightIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { Badge, Skeleton } from "@/components/ui";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { User } from "@/types";

const AdminUsersPage: NextPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();

  const { data: users, isLoading } = useSWR<(User & { _count?: { attempts: number } })[]>(
    user?.role === "ADMIN" ? "admin/users" : null,
    adminApi.users
  );

  if (user?.role !== "ADMIN") {
    return (
      <Layout>
        <div className="container-page text-center">
          <p className="text-red-500">{t("auth.adminRequired")}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{t("admin.users")} — {t("common.appName")}</title>
      </Head>

      <div className="container-page">
        <div className="mb-8">
          <Link
            href="/admin"
            className="text-sm text-primary-600 hover:underline dark:text-primary-400"
          >
            ← {t("admin.dashboard")}
          </Link>
          <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
            {t("admin.users")}
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Click on any student to view their full exam history.
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    User
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Exams Taken
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">
                    History
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {isLoading
                  ? [1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-3">
                          <Skeleton className="h-8 w-full" />
                        </td>
                      </tr>
                    ))
                  : users?.map((u) => (
                      <tr
                        key={u.id}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                      >
                        {/* User */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {u.avatarUrl ? (
                              <Image
                                src={u.avatarUrl}
                                alt={u.name}
                                width={36}
                                height={36}
                                className="rounded-full flex-shrink-0"
                              />
                            ) : (
                              <UserCircleIcon className="h-9 w-9 flex-shrink-0 text-gray-300 dark:text-gray-600" />
                            )}
                            <span className="font-semibold text-gray-900 dark:text-white">
                              {u.name}
                            </span>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{u.email}</td>

                        {/* Role */}
                        <td className="px-6 py-4">
                          <Badge variant={u.role === "ADMIN" ? "blue" : "gray"}>{u.role}</Badge>
                        </td>

                        {/* Attempts count */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5 text-gray-700 dark:text-gray-300">
                            <ClipboardDocumentListIcon className="h-4 w-4 text-gray-400" />
                            <span className="font-medium">
                              {(u as User & { _count?: { attempts: number } })._count?.attempts ?? 0}
                            </span>
                          </div>
                        </td>

                        {/* Joined */}
                        <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {u.createdAt
                            ? new Date(u.createdAt).toLocaleDateString("en-BD", {
                                dateStyle: "medium",
                              })
                            : "—"}
                        </td>

                        {/* View history link */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/admin/students/${u.id}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors dark:border-primary-800 dark:bg-primary-900/20 dark:text-primary-400 dark:hover:bg-primary-900/40"
                          >
                            View History
                            <ChevronRightIcon className="h-3.5 w-3.5" />
                          </Link>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsersPage;
