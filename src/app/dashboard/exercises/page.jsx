"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { dbHelpers, supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

function ExercisesListContent() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const exerciseIcons = {
    MultipleChoice: "✓",
    FillBlank: "___",
    ArrangeWords: "⤴",
    Matching: "↔",
    FlashCards: "🃏",
    Translation: "🌐",
  };

  useEffect(() => {
    loadExercises();
  }, [user]);

  const loadExercises = async () => {
    if (!user) return;

    try {
      const { data, error } = await dbHelpers.getExercises(user.id);
      if (error) throw new Error(error);
      setExercises(data || []);
    } catch (err) {
      console.error("Error loading exercises:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (exerciseId) => {
    const confirmed = await confirm({
      title: "Delete Exercise",
      message: "Are you sure you want to delete this exercise?",
      confirmText: "Yes",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("exercises")
        .delete()
        .eq("id", exerciseId)
        .eq("teacher_id", user.id);

      if (error) throw error;

      // Remove from local state
      setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    } catch (err) {
      console.error("Error deleting exercise:", err);
      toast.error("Error deleting exercise");
    }
  };

  const filteredExercises = exercises.filter((exercise) => {
    if (filter === "all") return true;
    return exercise.type === filter;
  });

  const exerciseTypes = [
    "all",
    "MultipleChoice",
    "FillBlank",
    "ArrangeWords",
    "Matching",
    "FlashCards",
    "Translation",
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading exercises...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-blue-dark">
            My Exercises
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and organize your English exercises
          </p>
        </div>

        <Link
          href="/dashboard/exercises/create"
          className="inline-flex items-center px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors shadow-glow-blue"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
          Create Exercise
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="flex flex-wrap gap-2">
          {exerciseTypes.map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === type
                  ? "bg-brand-blue text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-pastel-blue/20"
              }`}
            >
              {type === "all" ? "All Types" : type}
            </button>
          ))}
        </div>
      </div>

      {/* Exercises Grid */}
      {filteredExercises.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-soft border border-gray-100 text-center">
          <div className="w-16 h-16 bg-pastel-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-brand-blue"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {filter === "all" ? "No exercises yet" : `No ${filter} exercises`}
          </h3>
          <p className="text-gray-600 mb-6">
            Start creating engaging exercises for your students!
          </p>
          <Link
            href="/dashboard/exercises/create"
            className="inline-flex items-center px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Create Your First Exercise
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 card-hover"
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-pastel-blue/20 rounded-lg flex items-center justify-center">
                    <span className="text-brand-blue text-lg">
                      {exerciseIcons[exercise.type] || "📝"}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {exercise.title}
                    </h3>
                    <p className="text-sm text-brand-blue">{exercise.type}</p>
                  </div>
                </div>

                {/* Actions Dropdown */}
                <div className="relative group">
                  <button className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                      />
                    </svg>
                  </button>

                  <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <Link
                      href={`/dashboard/exercises/${exercise.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Edit Exercise
                    </Link>
                    <button
                      onClick={() => handleDelete(exercise.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete Exercise
                    </button>
                  </div>
                </div>
              </div>

              {/* Exercise Details */}
              <div className="space-y-3">
                {exercise.description && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {exercise.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-sm">
                  <div className="flex flex-wrap gap-1">
                    {exercise.classes && exercise.classes.length > 0 ? (
                      exercise.classes.map((cls, index) => (
                        <span
                          key={cls.id}
                          className="inline-block px-2 py-1 bg-pastel-blue/20 text-brand-blue text-xs rounded-full"
                        >
                          {cls.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-500">No class assigned</span>
                    )}
                  </div>
                  <span className="text-gray-500">
                    {new Date(exercise.created_at).toLocaleDateString()}
                  </span>
                </div>

                {/* Quick Actions */}
                <div className="flex space-x-2 pt-2 border-t border-gray-100">
                  <Link
                    href={`/dashboard/exercises/${exercise.id}`}
                    className="flex-1 px-3 py-2 text-center text-sm bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue/20 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/student/exercise/${exercise.id}`}
                    className="flex-1 px-3 py-2 text-center text-sm bg-brand-green/10 text-brand-green rounded-lg hover:bg-brand-green/20 transition-colors"
                  >
                    Preview
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExercisesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ExercisesListContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
