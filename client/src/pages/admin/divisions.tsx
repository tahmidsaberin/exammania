import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PencilSquareIcon, PlusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useTranslation } from "react-i18next";
import useSWR, { mutate } from "swr";
import clsx from "clsx";
import Layout from "@/components/Layout";
import { adminApi, divisionsApi, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { Button, Modal, Skeleton } from "@/components/ui";
import { COLOR_OPTIONS, COLOR_DISPLAY } from "@/lib/colors";
import type { Division } from "@/types";

interface DivisionFormData {
  slug: string;
  name: string;
  namebn?: string;
  level: "SSC" | "HSC";
  color?: "emerald" | "violet" | "blue" | "rose" | "amber" | "teal" | "slate" | "indigo" | "fuchsia" | "lime";
}

const AdminDivisionsPage: NextPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Division | null>(null);

  const { data: divisions, isLoading, error } = useSWR<Division[]>(
    user?.role === "ADMIN" ? "admin/divisions" : null,
    adminApi.listDivisions
  );

  const { register, handleSubmit, reset, formState: { isSubmitting } } =
    useForm<DivisionFormData>({ defaultValues: { level: "SSC", color: "emerald" } });

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
    reset({ slug: "", name: "", namebn: "", level: "SSC", color: "emerald" });
    setShowModal(true);
  };

  const openEdit = (division: Division) => {
    setEditing(division);
    reset({ slug: division.slug, name: division.name, namebn: division.namebn, level: division.level, color: division.color ?? "emerald" });
    setShowModal(true);
  };

  const submitDivision = async (data: DivisionFormData) => {
    try {
      if (editing) {
        await adminApi.updateDivision(editing.id, data);
        toast.success(t("common.save") + "! ");
      } else {
        await adminApi.createDivision(data);
        toast.success(t("common.create") + "! ");
      }
      setShowModal(false);
      mutate("admin/divisions");
    } catch (err) {
      if (err instanceof ApiError) {
        toast.error(err.message);
      } else {
        toast.error(t("common.error"));
      }
    }
  };

  const handleDelete = async (division: Division) => {
    if (!window.confirm(`Delete division ${division.name}?`)) return;
    try {
      await adminApi.deleteDivision(division.id);
      toast.success(t("common.delete") + "! ");
      mutate("admin/divisions");
    } catch {
      toast.error(t("common.error"));
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t("admin.divisions")} — {t("common.appName")}</title>
      </Head>

      <div className="container-page">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/admin" className="text-sm text-primary-600 hover:underline dark:text-primary-400">
              ← {t("admin.dashboard")}
            </Link>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
              {t("admin.divisions")}
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
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Level</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Color</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Subjects</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Exams</th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      <Skeleton className="h-6" />
                    </td>
                  </tr>
                )}
                {!isLoading && divisions?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                      {t("common.noResults")}
                    </td>
                  </tr>
                )}
                {divisions?.map((division) => (
                  <tr key={division.id} className="border-b border-gray-100 dark:border-gray-700 last:border-none">
                    <td className="px-6 py-4 font-mono text-xs text-gray-600 dark:text-gray-300">{division.slug}</td>
                    <td className="px-6 py-4 text-gray-900 dark:text-white">{division.name}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{division.level}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <span className={clsx(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold text-white",
                        division.color === "violet" && "bg-violet-500",
                        division.color === "blue" && "bg-sky-500",
                        division.color === "rose" && "bg-rose-500",
                        division.color === "amber" && "bg-amber-500",
                        division.color === "emerald" && "bg-emerald-500",
                        division.color === "teal" && "bg-teal-500",
                        division.color === "slate" && "bg-slate-500",
                        division.color === "indigo" && "bg-indigo-500",
                        division.color === "fuchsia" && "bg-fuchsia-500",
                        division.color === "lime" && "bg-lime-500",
                        !division.color && "bg-slate-500"
                      )}>
                        {division.color ?? "default"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{division._count?.subjects ?? 0}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{division._count?.exams ?? 0}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(division)}
                          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-primary-600 dark:hover:bg-gray-700"
                          aria-label="Edit division"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(division)}
                          className="rounded-lg p-2 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/30"
                          aria-label="Delete division"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
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
            <Button form="division-form" type="submit" loading={isSubmitting}>
              {editing ? t("common.save") : t("common.create")}
            </Button>
          </>
        }
      >
        <form id="division-form" onSubmit={handleSubmit(submitDivision)} className="space-y-4">
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
          <div>
            <p className="mb-2 text-xs font-medium text-gray-700 dark:text-gray-300">
              Card color *
            </p>
            <fieldset className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {COLOR_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={clsx(
                    "cursor-pointer rounded-2xl border p-3 text-center shadow-sm transition-all",
                    "border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900",
                    "peer-checked:border-primary-600 peer-checked:ring-2 peer-checked:ring-primary-500",
                    option.value === "emerald" && "text-white",
                    option.value === "violet" && "text-white",
                    option.value === "blue" && "text-white",
                    option.value === "rose" && "text-white",
                    option.value === "amber" && "text-white",
                    option.value === "teal" && "text-white",
                    option.value === "slate" && "text-white",
                    option.value === "indigo" && "text-white",
                    option.value === "fuchsia" && "text-white",
                    option.value === "lime" && "text-white"
                  )}
                >
                  <input
                    type="radio"
                    value={option.value}
                    {...register("color", { required: true })}
                    className="sr-only peer"
                  />
                  <div className={clsx(
                    "mb-2 h-16 rounded-xl bg-gradient-to-br px-2 py-2 text-xs font-semibold uppercase tracking-wide",
                    option.gradient
                  )}>
                    {option.label}
                  </div>
                  <div className="text-xs">{COLOR_DISPLAY[option.value]}</div>
                </label>
              ))}
            </fieldset>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default AdminDivisionsPage;
