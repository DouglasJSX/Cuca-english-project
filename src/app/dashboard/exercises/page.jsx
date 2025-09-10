"use client";

import React, { useState, useEffect } from "react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");

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

  // Filter, search and sort exercises based on current state
  const filteredAndSortedExercises = React.useMemo(() => {
    let filtered = exercises;

    // Apply type filter
    if (filter !== "all") {
      filtered = filtered.filter((exercise) => exercise.type === filter);
    }

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((exercise) =>
        exercise.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (exercise.description && exercise.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      // Handle null/undefined values
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // For string comparison (title, type)
      if (sortBy === "title" || sortBy === "type") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      // For date comparison
      if (sortBy === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    return filtered;
  }, [exercises, filter, searchTerm, sortBy, sortOrder]);

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

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <div className="space-y-4">
          {/* Search and Sort Row */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search exercises by title or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand-blue focus:border-brand-blue"
                />
              </div>
            </div>

            {/* Sort Options */}
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-brand-blue focus:border-brand-blue bg-white"
              >
                <option value="title">Sort by Title</option>
                <option value="type">Sort by Type</option>
                <option value="created_at">Sort by Date Created</option>
              </select>

              <button
                onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
                className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-brand-blue focus:border-brand-blue transition-colors"
                title={`Sort ${sortOrder === "asc" ? "Descending" : "Ascending"}`}
              >
                <svg
                  className={`w-5 h-5 text-gray-600 transition-transform ${
                    sortOrder === "desc" ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Type Filter Pills */}
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
      </div>

      {/* Exercises Grid */}
      {exercises.length === 0 ? (
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
            No exercises yet
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
      ) : filteredAndSortedExercises.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-soft border border-gray-100 text-center">
          <div className="w-16 h-16 bg-pastel-blue/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No exercises found
          </h3>
          <p className="text-gray-600 mb-6">
            No exercises match your search and filter criteria. Try adjusting your search or create a new exercise.
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedExercises.map((exercise) => (
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
