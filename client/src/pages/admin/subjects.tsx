import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import Layout from "@/components/Layout";
import { adminApi, divisionsApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button, Modal, Skeleton, Badge } from "@/components/ui";
import type { Division, Subject } from "@/types";

interface SubjectFormData {
  slug: string;
  name: string;
  namebn?: string;
  isCommon: boolean;
  divisionId?: string;
  level?: "SSC" | "HSC";
}

const AdminSubjectsPage: NextPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);

  const { data: divisions } = useSWR<Division[]>("divisions", () => divisionsApi.list());
  const { data: subjects, isLoading, error } = useSWR<Subject[]>(
    user?.role === "ADMIN" ? "admin/subjects" : null,
    adminApi.subjects
  );

  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } =
    useForm<SubjectFormData>({ defaultValues: { isCommon: true, level: "SSC" } });

  const isCommon = watch("isCommon");

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
    setEditing(null);
    reset({ slug: "", name: "", namebn: "", isCommon: true, divisionId: undefined, level: "SSC" });
    setShowModal(true);
  };

  const openEdit = (subject: Subject) => {
    setEditing(subject);
    reset({
      slug: subject.slug,
      name: subject.name,
      namebn: subject.namebn,
      isCommon: subject.isCommon,
      divisionId: subject.divisionId ?? undefined,
      level: subject.level ?? "SSC",
    });
    setShowModal(true);
  };

  const submitSubject = async (data: SubjectFormData) => {
    try {
      if (!data.isCommon && !data.divisionId) {
        toast.error("Please choose a division for this subject.");
        return;
      }

      const payload: Record<string, unknown> = {
        slug: data.slug,
        name: data.name,
        namebn: data.namebn,
        isCommon: data.isCommon,
      };
      if (data.isCommon) {
        payload.level = data.level;
        payload.divisionId = undefined;
      } else if (data.divisionId) {
        payload.divisionId = data.divisionId;
      }

      if (editing) {
        await adminApi.updateSubject(editing.id, payload);
        toast.success(t("common.save") + "! ");
      } else {
        await adminApi.createSubject(payload);
        toast.success(t("common.create") + "! ");
      }
      setShowModal(false);
      mutate("admin/subjects");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error(t("common.error"));
      }
    }
  };

  const handleDelete = async (subject: Subject) => {
    if (!window.confirm(`Delete subject ${subject.name}?`)) return;
    try {
      await adminApi.deleteSubject(subject.id);
      toast.success(t("common.delete") + "! ");
      mutate("admin/subjects");
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t("admin.subjects")} — {t("common.appName")}</title>
      </Head>

      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/admin" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
              ← {t("admin.dashboard")}
            </Link>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
              {t("admin.subjects")}
            </h1>
          </div>
          <Button onClick={openCreate}>
            <PlusIcon className="h-4 w-4" />
            {t("common.create")}
          </Button>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Slug</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Name</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Type</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Division / Level</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      <Skeleton className="h-6" />
                    </td>
                  </tr>
                )}
                {!isLoading && subjects?.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                      {t("common.noResults")}
                    </td>
                  </tr>
                )}
                {subjects?.map((subject) => {
                  const division = divisions?.find((div) => div.id === subject.divisionId);
                  return (
                    <tr key={subject.id} className="border-b border-gray-100 dark:border-gray-700 last:border-none">
                      <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">{subject.slug}</td>
                      <td className="px-6 py-4 text-gray-900 dark:text-white">{subject.name}</td>
                      <td className="px-6 py-4">
                        {subject.isCommon ? <Badge variant="gray">Common</Badge> : <Badge variant="blue">Division</Badge>}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {subject.isCommon ? subject.level : division?.name ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEdit(subject)}
                            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700"
                            aria-label="Edit subject"
                          >
                            <PencilSquareIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(subject)}
                            className="rounded-lg p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                            aria-label="Delete subject"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? t("common.edit") : t("common.create")}
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t("common.cancel")}
            </Button>
            <Button form="subject-form" type="submit" loading={isSubmitting}>
              {editing ? t("common.save") : t("common.create")}
            </Button>
          </>
        }
      >
        <form id="subject-form" onSubmit={handleSubmit(submitSubject)} className="space-y-4">
          <div>
            <label htmlFor="slug" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Slug *
            </label>
            <input
              id="slug"
              {...register("slug", { required: true, pattern: /^[a-z0-9-]+$/ })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="name" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name *
            </label>
            <input
              id="name"
              {...register("name", { required: true })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="namebn" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name (Bangla)
            </label>
            <input
              id="namebn"
              {...register("namebn")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" {...register("isCommon")} className="rounded" />
              Common subject
            </label>
          </div>
          {isCommon ? (
            <div>
              <label htmlFor="level" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Level *
              </label>
              <select
                id="level"
                {...register("level", { required: true })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="SSC">SSC</option>
                <option value="HSC">HSC</option>
              </select>
            </div>
          ) : (
            <div>
              <label htmlFor="divisionId" className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Division *
              </label>
              <select
                id="divisionId"
                {...register("divisionId", { required: !isCommon })}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Division</option>
                {divisions?.map((division) => (
                  <option key={division.id} value={division.id}>
                    {division.name} ({division.level})
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Modal>
    </Layout>
  );
};

export default AdminSubjectsPage;
