import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import {
  PlusIcon,
  TrashIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { Button, Modal, Skeleton, Badge } from "@/components/ui";
import { adminApi, divisionsApi, examsApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Exam, Division, Subject } from "@/types";

interface ExamFormData {
  title: string;
  titlebn: string;
  slug: string;
  subjectId: string;
  divisionId: string;
  timeLimitMin: number;
  randomize: boolean;
  published: boolean;
}

const AdminExamsPage: NextPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [importSlug, setImportSlug] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: divisions } = useSWR<Division[]>("divisions", divisionsApi.list);
  const { data: subjectData } = useSWR("all-subjects", () =>
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/users`, {
      credentials: "include",
    }).then(() => [] as Subject[])
  );

  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<ExamFormData>();

  if (user?.role !== "ADMIN") {
    return (
      <Layout>
        <div className="container-page text-center">
          <p className="text-red-500">{t("auth.adminRequired")}</p>
        </div>
      </Layout>
    );
  }

  const onCreateExam = async (data: ExamFormData) => {
    try {
      await adminApi.createExam({
        ...data,
        timeLimitMin: Number(data.timeLimitMin),
        divisionId: data.divisionId || undefined,
      });
      toast.success("Exam created!");
      reset();
      setShowCreate(false);
      mutate("admin/exams");
    } catch {
      toast.error("Failed to create exam.");
    }
  };

  const handleImport = async (slug: string) => {
    const file = fileRef.current?.files?.[0];
    if (!file) return toast.error("Select a CSV file first.");
    try {
      const result = await adminApi.importCsv(slug, file);
      toast.success(`Imported ${result.data?.imported ?? 0} questions!`);
      setImportSlug(null);
    } catch {
      toast.error("Import failed.");
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t("admin.exams")} — {t("common.appName")}</title>
      </Head>

      <div className="container-page">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/admin" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
              ← {t("admin.dashboard")}
            </Link>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
              {t("admin.exams")}
            </h1>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4" />
            {t("common.create")}
          </Button>
        </div>

        {/* Placeholder table */}
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Title</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Subject</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-400">
                    Use the API or create exams using the form above.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* CSV import modal */}
        <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-2 font-bold text-gray-900 dark:text-white">
            {t("admin.import")}
          </h2>
          <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
            {t("admin.importHint")}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="text"
              placeholder="Exam slug"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              onChange={(e) => setImportSlug(e.target.value)}
            />
            <input
              ref={fileRef}
              type="file"
              accept=".csv"
              className="text-sm text-gray-600 dark:text-gray-400"
              aria-label="CSV file to import"
            />
            <Button
              variant="secondary"
              onClick={() => importSlug && handleImport(importSlug)}
              disabled={!importSlug}
            >
              <ArrowUpTrayIcon className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </div>

      {/* Create exam modal */}
      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Create Exam"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              {t("common.cancel")}
            </Button>
            <Button
              form="create-exam-form"
              type="submit"
              loading={isSubmitting}
            >
              {t("common.create")}
            </Button>
          </>
        }
      >
        <form
          id="create-exam-form"
          onSubmit={handleSubmit(onCreateExam)}
          className="space-y-4"
        >
          <div>
            <label htmlFor="title" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title (English) *
            </label>
            <input
              id="title"
              {...register("title", { required: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="titlebn" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title (Bangla)
            </label>
            <input
              id="titlebn"
              {...register("titlebn")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug (e.g. physics-ch1-mcq) *
            </label>
            <input
              id="slug"
              {...register("slug", { required: true, pattern: /^[a-z0-9-]+$/ })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="subjectId" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subject ID *
            </label>
            <input
              id="subjectId"
              {...register("subjectId", { required: true })}
              placeholder="CUID of subject"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="timeLimitMin" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time Limit (min)
              </label>
              <input
                id="timeLimitMin"
                type="number"
                defaultValue={30}
                {...register("timeLimitMin")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="flex flex-col gap-2 justify-center">
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register("randomize")} className="rounded" />
                Randomize
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" {...register("published")} className="rounded" />
                Published
              </label>
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default AdminExamsPage;
