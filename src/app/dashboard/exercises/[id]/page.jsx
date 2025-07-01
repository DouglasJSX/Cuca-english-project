"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import MultipleChoice from "@/components/exercises/ExerciseTypes/MultipleChoice";
import FillBlank from "@/components/exercises/ExerciseTypes/FillBlank";
import ArrangeWords from "@/components/exercises/ExerciseTypes/ArrangeWords";
import FlashCards from "@/components/exercises/ExerciseTypes/FlashCards";
import Matching from "@/components/exercises/ExerciseTypes/Matching";
import Translation from "@/components/exercises/ExerciseTypes/Translation";

function ExerciseEditContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [mode, setMode] = useState("editor"); // 'editor' or 'preview'

  useEffect(() => {
    loadExercise();
  }, [id, user]);

  const loadExercise = async () => {
    if (!user || !id) return;

    try {
      const { data, error } = await supabase
        .from("exercises")
        .select(
          `
          *,
          classes (name)
        `
        )
        .eq("id", id)
        .eq("teacher_id", user.id)
        .single();

      if (error) throw error;
      setExercise(data);
    } catch (err) {
      console.error("Error loading exercise:", err);
      if (err.code === "PGRST116") {
        router.push("/dashboard/exercises");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent) => {
    setExercise((prev) => ({
      ...prev,
      content: newContent,
    }));
    setHasChanges(true);
  };

  const handleBasicInfoChange = (field, value) => {
    setExercise((prev) => ({
      ...prev,
      [field]: value,
    }));
    setHasChanges(true);
  };

  const saveExercise = async () => {
    if (!exercise || !hasChanges) return;

    setSaving(true);
    setError("");

    try {
      const { error } = await supabase
        .from("exercises")
        .update({
          title: exercise.title,
          description: exercise.description,
          content: exercise.content,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("teacher_id", user.id);

      if (error) throw error;

      setHasChanges(false);
      // Show success message (could be a toast)
      alert("Exercise saved successfully!");
    } catch (err) {
      setError(err.message || "Error saving exercise");
    } finally {
      setSaving(false);
    }
  };

  const renderExerciseComponent = () => {
    switch (exercise?.type) {
      case "MultipleChoice":
        return (
          <MultipleChoice
            content={exercise.content}
            onChange={handleContentChange}
            mode={mode}
          />
        );
      case "FillBlank":
        return (
          <FillBlank
            content={exercise.content}
            onChange={handleContentChange}
            mode={mode}
          />
        );
      case "ArrangeWords":
        return (
          <ArrangeWords
            content={exercise.content}
            onChange={handleContentChange}
            mode={mode}
          />
        );
      case "FlashCards":
        return (
          <FlashCards
            content={exercise.content}
            onChange={handleContentChange}
            mode={mode}
          />
        );
      case "Matching":
        return (
          <Matching
            content={exercise.content}
            onChange={handleContentChange}
            mode={mode}
          />
        );
      case "Translation":
        return (
          <Translation
            content={exercise.content}
            onChange={handleContentChange}
            mode={mode}
          />
        );
      default:
        return (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">
              Editor for {exercise?.type} exercises is coming soon!
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Exercise not found
        </h2>
        <p className="text-gray-600 mb-4">
          The exercise you're looking for doesn't exist or you don't have access
          to it.
        </p>
        <Link
          href="/dashboard/exercises"
          className="text-brand-blue hover:underline"
        >
          Back to Exercises
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-pastel-blue/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Link
              href="/dashboard/exercises"
              className="text-gray-400 hover:text-brand-blue transition-colors"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-brand-blue-dark">
                Edit Exercise
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {exercise.type} •{" "}
                {exercise.classes?.name || "No class assigned"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode("editor")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "editor"
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setMode("preview")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "preview"
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Preview
              </button>
            </div>

            {/* Save Button */}
            <button
              onClick={saveExercise}
              disabled={saving || !hasChanges}
              className="px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-blue"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>

        {/* Changes Indicator */}
        {hasChanges && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800 text-sm">
              ⚠️ You have unsaved changes. Don't forget to save your work!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {/* Basic Info (only in editor mode) */}
      {mode === "editor" && (
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Exercise Title
              </label>
              <input
                type="text"
                id="title"
                value={exercise.title}
                onChange={(e) => handleBasicInfoChange("title", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              />
            </div>

            <div>
              <label
                htmlFor="type"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Exercise Type
              </label>
              <input
                type="text"
                id="type"
                value={exercise.type}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
              />
            </div>
          </div>

          <div className="mt-6">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              value={exercise.description || ""}
              onChange={(e) =>
                handleBasicInfoChange("description", e.target.value)
              }
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              placeholder="Brief description of the exercise..."
            />
          </div>
        </div>
      )}

      {/* Exercise Content */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        {mode === "editor" && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Exercise Content
            </h2>
            <p className="text-gray-600 text-sm">
              Configure your {exercise.type} exercise below. Changes are saved
              automatically to your browser.
            </p>
          </div>
        )}

        {renderExerciseComponent()}
      </div>

      {/* Preview Info */}
      {mode === "preview" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-4 h-4 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                Student Preview Mode
              </h4>
              <p className="text-sm text-blue-700">
                This is how students will see and interact with your exercise.
                Switch back to Editor mode to make changes.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ExerciseEditPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ExerciseEditContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
