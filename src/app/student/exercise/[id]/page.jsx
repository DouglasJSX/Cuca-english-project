"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import MultipleChoice from "@/components/exercises/ExerciseTypes/MultipleChoice";
import FillBlank from "@/components/exercises/ExerciseTypes/FillBlank";
import ArrangeWords from "@/components/exercises/ExerciseTypes/ArrangeWords";
import FlashCards from "@/components/exercises/ExerciseTypes/FlashCards";
import Matching from "@/components/exercises/ExerciseTypes/Matching";
import Translation from "@/components/exercises/ExerciseTypes/Translation";

export default function ExercisePreviewPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const studentId = searchParams.get("studentId");
  const [exercise, setExercise] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isStudentMode, setIsStudentMode] = useState(false);

  console.log("Student ID from URL:", studentId);
  console.log("Is Student Mode:", isStudentMode);

  useEffect(() => {
    setIsStudentMode(!!studentId);
    loadExercise();
  }, [id, studentId]);

  /*************  ✨ Windsurf Command ⭐  *************/
  /**
   * Loads an exercise by ID from the database
   * @function
   * @async
   * @return {void}
   */
  /*******  c7094a02-9116-4379-bbb9-08124cc8000c  *******/
  const loadExercise = async () => {
    if (!id) return;

    try {
      // For preview, we don't need teacher authentication
      // But we only show active exercises
      const { data, error } = await supabase
        .from("exercises")
        .select(
          `
    id,
    title,
    description,
    type,
    content,
    is_active,
    class_id,
    classes (name, id)
  `
        )
        .eq("id", id)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      setExercise(data);
    } catch (err) {
      console.error("Error loading exercise:", err);
      setError("Exercise not found or not available");
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async (score, timeSpent = null) => {
    if (!studentId || !exercise) return;

    try {
      const resultData = {
        exercise_id: exercise.id,
        student_id: studentId,
        score: Math.round(score),
        time_taken: timeSpent,
        completed_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("exercise_results")
        .upsert(resultData, {
          onConflict: "exercise_id,student_id",
        });

      if (error) throw error;
    } catch (err) {
      console.error("Error saving result:", err);
    }
  };

  const renderExerciseComponent = () => {
    if (!exercise) return null;

    switch (exercise.type) {
      case "MultipleChoice":
        return (
          <MultipleChoice
            content={exercise.content}
            mode="player"
            onComplete={isStudentMode ? saveResult : undefined}
          />
        );
      case "FillBlank":
        return (
          <FillBlank
            content={exercise.content}
            mode="player"
            onComplete={isStudentMode ? saveResult : undefined}
          />
        );
      case "ArrangeWords":
        return (
          <ArrangeWords
            content={exercise.content}
            mode="player"
            onComplete={isStudentMode ? saveResult : undefined}
          />
        );
      case "FlashCards":
        return (
          <FlashCards
            content={exercise.content}
            mode="player"
            onComplete={isStudentMode ? saveResult : undefined}
          />
        );
      case "Matching":
        return (
          <Matching
            content={exercise.content}
            mode="player"
            onComplete={isStudentMode ? saveResult : undefined}
          />
        );
      case "Translation":
        return (
          <Translation
            content={exercise.content}
            mode="player"
            onComplete={isStudentMode ? saveResult : undefined}
          />
        );
      default:
        return (
          <div className="max-w-2xl mx-auto bg-white rounded-xl p-8 shadow-soft border border-gray-100 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🚧</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Coming Soon
            </h3>
            <p className="text-gray-600">
              The {exercise.type} exercise type is not yet available for
              preview.
            </p>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-light via-pastel-blue/20 to-pastel-mint/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-light via-pastel-blue/20 to-pastel-mint/20 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Exercise Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              {error ||
                "The exercise you're looking for doesn't exist or is not available."}
            </p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light via-pastel-blue/20 to-pastel-mint/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
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
                      {exercise.classes?.name && (
                        <span>• {exercise.classes.name}</span>
                      )}
                    </div>
                  </div>
                </div>

                {exercise.description && (
                  <p className="text-gray-600 mt-3">{exercise.description}</p>
                )}
              </div>

              {/* Preview Badge */}
              <div className="text-center">
                <div
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                    isStudentMode
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
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
                  {isStudentMode ? "Student Mode" : "Preview Mode"}
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
            {isStudentMode ? (
              <div>
                <p className="text-gray-600 mb-4">
                  Complete the exercise to save your progress automatically.
                </p>
                <Link
                  href={`/student/dashboard/${
                    exercise.class_id || exercise.classes?.id
                  }`}
                  className="px-4 py-2 text-brand-blue hover:text-brand-blue-dark transition-colors"
                >
                  ← Back to Dashboard
                </Link>
              </div>
            ) : (
              <div>
                <p className="text-gray-600 mb-4">
                  This is a preview of the exercise. In the actual student
                  experience, results would be saved and tracked.
                </p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href="/"
                    className="px-4 py-2 text-brand-blue hover:text-brand-blue-dark transition-colors"
                  >
                    ← Back to Home
                  </Link>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 text-sm">
                    English Exercises Manager
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
