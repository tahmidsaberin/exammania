import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { PlusIcon } from "@heroicons/react/24/outline";
import Layout from "@/components/Layout";
import { Button, Modal } from "@/components/ui";
import { adminApi } from "@/lib/api";
import { useAuth } from "@/lib/auth";

interface QuestionFormData {
  examSlug: string;
  order: number;
  type: "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";
  text: string;
  option0: string;
  option1: string;
  option2: string;
  option3: string;
  correct: string;
  marks: number;
}

const AdminQuestionsPage: NextPage = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const { register, handleSubmit, watch, reset, formState: { isSubmitting } } =
    useForm<QuestionFormData>({ defaultValues: { type: "MCQ", marks: 1, order: 1, correct: "" } });

  const questionType = watch("type");

  if (user?.role !== "ADMIN") {
    return (
      <Layout>
        <div className="container-page text-center">
          <p className="text-red-500">{t("auth.adminRequired")}</p>
        </div>
      </Layout>
    );
  }

  const onSubmit = async (data: QuestionFormData) => {
    try {
      const options =
        data.type === "SHORT_ANSWER"
          ? undefined
          : data.type === "TRUE_FALSE"
          ? ["True", "False"]
          : [data.option0, data.option1, data.option2, data.option3].filter(Boolean);

      await adminApi.addQuestion(data.examSlug, {
        order: Number(data.order),
        type: data.type,
        text: data.text,
        options,
        correct: data.correct || undefined,
        marks: Number(data.marks),
      });

      toast.success("Question added!");
      reset();
      setShowCreate(false);
    } catch {
      toast.error("Failed to add question.");
    }
  };

  return (
    <Layout>
      <Head>
        <title>{t("admin.questions")} — {t("common.appName")}</title>
      </Head>

      <div className="container-page">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link
              href="/admin"
              className="text-sm text-primary-600 hover:underline dark:text-primary-400"
            >
              ← {t("admin.dashboard")}
            </Link>
            <h1 className="mt-1 text-2xl font-extrabold text-gray-900 dark:text-white">
              {t("admin.questions")}
            </h1>
          </div>
          <Button onClick={() => setShowCreate(true)}>
            <PlusIcon className="h-4 w-4" />
            Add Question
          </Button>
        </div>

        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-600 dark:bg-gray-800">
          <p className="text-gray-500 dark:text-gray-400">
            Use the form to add questions to any exam, or use{" "}
            <Link href="/admin/exams" className="text-primary-600 underline dark:text-primary-400">
              Bulk CSV Import
            </Link>{" "}
            on the Exams page to add many at once.
          </p>
        </div>
      </div>

      <Modal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        title="Add Question"
        footer={
          <>
            <Button variant="secondary" onClick={() => setShowCreate(false)}>
              {t("common.cancel")}
            </Button>
            <Button form="add-question-form" type="submit" loading={isSubmitting}>
              Add
            </Button>
          </>
        }
      >
        <form id="add-question-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Exam Slug *
            </label>
            <input
              {...register("examSlug", { required: true })}
              placeholder="e.g. physics-chapter-1-mcq"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Order *
              </label>
              <input
                type="number"
                {...register("order")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type *
              </label>
              <select
                {...register("type")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              >
                <option value="MCQ">MCQ</option>
                <option value="TRUE_FALSE">True / False</option>
                <option value="SHORT_ANSWER">Short Answer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
              Question Text *
            </label>
            <textarea
              {...register("text", { required: true })}
              rows={3}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            />
          </div>

          {(questionType === "MCQ" || questionType === "TRUE_FALSE") && (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                Options
              </label>
              {questionType === "TRUE_FALSE" ? (
                <>
                  <input value="True" disabled className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white" />
                  <input value="False" disabled className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 dark:text-white" />
                </>
              ) : (
                ["option0", "option1", "option2", "option3"].map((opt, i) => (
                  <input
                    key={opt}
                    {...register(opt as keyof QuestionFormData)}
                    placeholder={`Option ${i + 1}`}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  />
                ))
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Correct Answer
              </label>
              <input
                {...register("correct")}
                placeholder={questionType === "SHORT_ANSWER" ? "Keyword" : "0, 1, 2 or 3"}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Marks
              </label>
              <input
                type="number"
                {...register("marks")}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};

export default AdminQuestionsPage;
