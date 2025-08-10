"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase, dbHelpers } from "@/lib/supabase";
import MultipleChoice from "@/components/exercises/ExerciseTypes/MultipleChoice";
import FillBlank from "@/components/exercises/ExerciseTypes/FillBlank";
import ArrangeWords from "@/components/exercises/ExerciseTypes/ArrangeWords";
import FlashCards from "@/components/exercises/ExerciseTypes/FlashCards";
import Matching from "@/components/exercises/ExerciseTypes/Matching";
import Translation from "@/components/exercises/ExerciseTypes/Translation";
import ExternalLink from "@/components/exercises/ExerciseTypes/ExternalLink";
import { useToast } from "@/components/ui/Toast";

function ExerciseEditContent() {
  const { toast } = useToast();
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [exercise, setExercise] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [mode, setMode] = useState("editor"); // 'editor', 'preview', or 'student-preview'

  useEffect(() => {
    loadExercise();
    loadClasses();
  }, [id, user]);

  const loadExercise = async () => {
    if (!user || !id) return;

    try {
      // Load exercise with classes
      const { data, error } = await dbHelpers.getExerciseWithClasses(
        id,
        user.id
      );
      if (error) throw new Error(error);

      setExercise(data);
      setError(""); // Clear any previous errors
    } catch (err) {
      console.error("Error loading exercise:", err);
      if (err.message.includes("not found")) {
        router.push("/dashboard/exercises");
      } else {
        setError("Exercise not found or not available");
      }
    } finally {
      setLoading(false);
    }
  };

  const loadClasses = async () => {
    if (!user) return;

    try {
      const { data, error } = await dbHelpers.getClasses(user.id);
      if (error) throw new Error(error);
      setClasses(data || []);
    } catch (err) {
      console.error("Error loading classes:", err);
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

  const handleClassToggle = (classId) => {
    setExercise((prev) => {
      const currentClassIds = prev.classes?.map((c) => c.id) || [];
      const newClassIds = currentClassIds.includes(classId)
        ? currentClassIds.filter((id) => id !== classId)
        : [...currentClassIds, classId];

      // Update classes array with full class objects
      const newClasses = classes.filter((c) => newClassIds.includes(c.id));

      return {
        ...prev,
        classes: newClasses,
      };
    });
    setHasChanges(true);
  };

  const saveExercise = async () => {
    if (!exercise || !hasChanges) return;

    setSaving(true);
    setError("");

    try {
      // Update exercise basic info
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

      // Update exercise-class associations
      const classIds = exercise.classes?.map((c) => c.id) || [];
      const { error: classError } = await dbHelpers.updateExerciseClasses(
        id,
        classIds
      );
      if (classError) throw new Error(classError);

      setHasChanges(false);
      toast.success("Exercise saved successfully!");
    } catch (err) {
      setError(err.message || "Error saving exercise");
    } finally {
      setSaving(false);
    }
  };

  const renderExerciseComponent = () => {
    // Use "player" mode for student-preview to match /student/exercise/[id] behavior
    const componentMode = mode === "student-preview" ? "player" : mode;

    switch (exercise?.type) {
      case "ExternalLink":
        return (
          <ExternalLink
            content={exercise.content}
            onChange={handleContentChange}
            mode={componentMode}
            showOverview={mode === "student-preview"}
          />
        );
      case "MultipleChoice":
        return (
          <MultipleChoice
            content={exercise.content}
            onChange={handleContentChange}
            mode={componentMode}
            showOverview={mode === "student-preview"}
          />
        );
      case "FillBlank":
        return (
          <FillBlank
            content={exercise.content}
            onChange={handleContentChange}
            mode={componentMode}
            showOverview={mode === "student-preview"}
          />
        );
      case "ArrangeWords":
        return (
          <ArrangeWords
            content={exercise.content}
            onChange={handleContentChange}
            mode={componentMode}
            showOverview={mode === "student-preview"}
          />
        );
      case "FlashCards":
        return (
          <FlashCards
            content={exercise.content}
            onChange={handleContentChange}
            mode={componentMode}
            showOverview={mode === "student-preview"}
          />
        );
      case "Matching":
        return (
          <Matching
            content={exercise.content}
            onChange={handleContentChange}
            mode={componentMode}
            showOverview={mode === "student-preview"}
          />
        );
      case "Translation":
        return (
          <Translation
            content={exercise.content}
            onChange={handleContentChange}
            mode={componentMode}
            showOverview={mode === "student-preview"}
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

  // Student Preview Layout
  if (mode === "student-preview") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-light via-pastel-blue/20 to-pastel-mint/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <button
                      onClick={() => setMode("editor")}
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
                    </button>
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-green rounded-lg flex items-center justify-center">
                      <span className="text-white font-bold text-lg">E</span>
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-brand-blue-dark">
                        {exercise.title}
                      </h1>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue rounded-full">
                          {exercise.type}
                        </span>
                        {exercise.classes?.length > 0 && (
                          <span>
                            • {exercise.classes.length} class
                            {exercise.classes.length > 1 ? "es" : ""} assigned
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {exercise.description && (
                    <p className="text-gray-600 mt-3">{exercise.description}</p>
                  )}
                </div>

                {/* Student Preview Badge */}
                <div className="text-center">
                  <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                    👁️ Student Preview
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Content */}
          <div className="max-w-4xl mx-auto">{renderExerciseComponent()}</div>

          {/* Footer */}
          <div className="max-w-4xl mx-auto mt-12 text-center">
            <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
              <div>
                <p className="text-gray-600 mb-4">
                  This shows exactly how students will see and interact with the
                  exercise. You can navigate between cards using the buttons or
                  by clicking directly on the cards.
                </p>
                <button
                  onClick={() => setMode("editor")}
                  className="text-brand-blue hover:text-brand-blue-dark transition-colors"
                >
                  ← Back to Editor
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Normal Editor/Preview Layout
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
                {exercise.classes?.length > 0
                  ? `${exercise.classes.length} class${
                      exercise.classes.length > 1 ? "es" : ""
                    } assigned`
                  : "No class assigned"}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setMode("editor")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "editor"
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Editor
              </button>
              <button
                onClick={() => setMode("student-preview")}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  mode === "student-preview"
                    ? "bg-white text-brand-blue shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                👁️ Student View
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

          <div className="grid md:grid-cols-2 gap-6 mt-6">
            <div>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Classes
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {classes.length === 0 ? (
                  <p className="text-gray-500 text-sm">No classes available</p>
                ) : (
                  classes.map((cls) => {
                    const isSelected =
                      exercise.classes?.some((c) => c.id === cls.id) || false;
                    return (
                      <label
                        key={cls.id}
                        className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleClassToggle(cls.id)}
                          className="w-4 h-4 text-brand-blue bg-gray-100 border-gray-300 rounded focus:ring-brand-blue focus:ring-2"
                        />
                        <span className="text-sm text-gray-700">
                          {cls.name}
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              {exercise.classes?.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {exercise.classes.length} class
                  {exercise.classes.length > 1 ? "es" : ""} selected
                </p>
              )}
            </div>
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
