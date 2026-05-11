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
  PencilSquareIcon,
} from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { Button, Modal, Skeleton, Badge } from "@/components/ui";
import { adminApi, divisionsApi, examsApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Exam, Division, Subject } from "@/types";

interface ExamFormData {
  title: string;
  titlebn: string;
  slug: string;
  subjectId: string;
  divisionId?: string;
  timeLimitMin: number;
  randomize: boolean;
  published: boolean;
}

const AdminExamsPage: NextPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [importSlug, setImportSlug] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: divisions } = useSWR<Division[]>("divisions", () => divisionsApi.list());
  const [subjectError, setSubjectError] = useState<string | null>(null);
  const { data: subjects } = useSWR<Subject[]>("admin/subjects", adminApi.subjects, {
    onError: (err) => setSubjectError(err instanceof Error ? err.message : "Failed to load subjects"),
  });
  const { data: exams, isLoading: isExamsLoading, error: examsError } = useSWR<Exam[]>(
    user?.role === "ADMIN" ? "admin/exams" : null,
    adminApi.listExams,
    {
      onError: () => {
        toast.error("Failed to load exams.");
      },
    }
  );

  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<ExamFormData>({ defaultValues: {
      title: "",
      titlebn: "",
      slug: "",
      subjectId: "",
      divisionId: undefined,
      timeLimitMin: 30,
      randomize: false,
      published: false,
    } });

  if (user?.role !== "ADMIN") {
    return (
      <Layout>
        <div className="container-page text-center">
          <p className="text-red-500">{t("auth.adminRequired")}</p>
        </div>
      </Layout>
    );
  }

  const openCreate = () => {
    setEditingExam(null);
    reset({
      title: "",
      titlebn: "",
      slug: "",
      subjectId: "",
      divisionId: undefined,
      timeLimitMin: 30,
      randomize: false,
      published: false,
    });
    setShowCreate(true);
  };

  const openEdit = (exam: Exam) => {
    setEditingExam(exam);
    reset({
      title: exam.title,
      titlebn: exam.titlebn ?? "",
      slug: exam.slug,
      subjectId: exam.subjectId,
      divisionId: exam.divisionId ?? undefined,
      timeLimitMin: exam.timeLimitMin ?? 30,
      randomize: exam.randomize,
      published: exam.published,
    });
    setShowCreate(true);
  };

  const onSaveExam = async (data: ExamFormData) => {
    if (editingExam) {
      try {
        await adminApi.updateExam(editingExam.id, {
          ...data,
          timeLimitMin: Number(data.timeLimitMin),
          divisionId: data.divisionId || undefined,
        });
        toast.success("Exam updated!");
        setShowCreate(false);
        setEditingExam(null);
        mutate("admin/exams");
      } catch (err) {
        if (err instanceof ApiError) {
          toast.error(`Failed to update exam: ${err.message}`);
        } else {
          toast.error("Failed to update exam.");
        }
      }
      return;
    }

    try {
      await adminApi.createExam({
        ...data,
        timeLimitMin: Number(data.timeLimitMin),
        divisionId: data.divisionId || undefined,
      });
      toast.success("Exam created!");
      setShowCreate(false);
      reset();
      mutate("admin/exams");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(`Failed to create exam: ${err.message}`);
      } else {
        toast.error("Failed to create exam.");
      }
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
          <Button onClick={openCreate}>
            <PlusIcon className="h-4 w-4" />
            {t("common.create")}
          </Button>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Title</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Subject</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Slug</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Status</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isExamsLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      <Skeleton className="h-6" />
                    </td>
                  </tr>
                ) : exams?.length ? (
                  exams.map((exam) => (
                    <tr key={exam.id} className="border-b border-gray-100 dark:border-gray-700 last:border-none">
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{exam.title}</td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{exam.subject?.name ?? exam.subjectId}</td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">{exam.slug}</td>
                      <td className="px-6 py-4">
                        <Badge variant={exam.published ? "green" : "gray"}>
                          {exam.published ? "Published" : "Draft"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(exam)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700"
                            aria-label="Edit exam"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!window.confirm(`Delete exam ${exam.title}?`)) return;
                              try {
                                await adminApi.deleteExam(exam.id);
                                toast.success("Exam deleted!");
                                mutate("admin/exams");
                              } catch (err) {
                                if (err instanceof ApiError) {
                                  toast.error(err.message);
                                } else {
                                  toast.error("Failed to delete exam.");
                                }
                              }
                            }}
                            className="rounded-lg p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                            aria-label="Delete exam"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      {examsError ? "Unable to load exams." : "No exams found. Create one above."}
                    </td>
                  </tr>
                )}
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
        onClose={() => {
          setShowCreate(false);
          setEditingExam(null);
        }}
        title={editingExam ? "Edit Exam" : "Create Exam"}
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
              {editingExam ? t("common.save") : t("common.create")}
            </Button>
          </>
        }
      >
        <form
          id="create-exam-form"
          onSubmit={handleSubmit(onSaveExam)}
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
              Subject *
            </label>
            {subjects && subjects.length > 0 ? (
              <select
                id="subjectId"
                {...register("subjectId", { required: true })}
                defaultValue=""
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="" disabled>
                  Select a subject
                </option>
                {subjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}{subject.isCommon ? " (Common)" : ""}
                  </option>
                ))}
              </select>
            ) : (
              <input
                id="subjectId"
                {...register("subjectId", { required: true })}
                placeholder="Subject ID"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            )}
            {subjectError ? (
              <p className="mt-1 text-xs text-rose-500 dark:text-rose-400">
                {subjectError}. Enter the subject ID manually if the dropdown cannot load.
              </p>
            ) : !subjects || !subjects.length ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {subjects ? "No subjects available. Create subjects first." : "Loading subjects..."}
              </p>
            ) : null}
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
