"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { dbHelpers, supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/Toast";
import { useConfirm } from "@/components/ui/ConfirmDialog";

function ClassesListContent() {
  const { toast } = useToast();
  const { confirm } = useConfirm();
  const { user } = useAuth();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, [user]);

  const loadClasses = async () => {
    if (!user) return;

    try {
      // Get classes with student count
      const { data, error } = await supabase
        .from("classes_with_stats")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw new Error(error.message);
      setClasses(data || []);
    } catch (err) {
      console.error("Error loading classes:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId, className) => {
    const confirmed = await confirm({
      title: "Delete Exercise",
      message: `Are you sure you want to delete "${className}"? This will also delete all students and exercises in this class.`,
      confirmText: "Delete",
      cancelText: "Cancel",
      type: "danger",
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("classes")
        .delete()
        .eq("id", classId)
        .eq("teacher_id", user.id);

      if (error) throw error;

      // Remove from local state
      setClasses((prev) => prev.filter((cls) => cls.id !== classId));
    } catch (err) {
      console.error("Error deleting class:", err);
      toast.error("Error deleting class");
    }
  };

  const toggleClassStatus = async (classId, currentStatus) => {
    try {
      const { error } = await supabase
        .from("classes")
        .update({ is_active: !currentStatus })
        .eq("id", classId)
        .eq("teacher_id", user.id);

      if (error) throw error;

      // Update local state
      setClasses((prev) =>
        prev.map((cls) =>
          cls.id === classId ? { ...cls, is_active: !currentStatus } : cls
        )
      );
    } catch (err) {
      console.error("Error updating class status:", err);
      toast.error("Error updating class status");
    }
  };

  const copyAccessCode = async (accessCode) => {
    try {
      await navigator.clipboard.writeText(accessCode);
      // Could add a toast notification here
      toast.success("Access code copied to clipboard!");
    } catch (err) {
      console.error("Error copying to clipboard:", err);
      toast.error("Could not copy access code");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-brand-green-dark">
            My Classes
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your student groups and class settings
          </p>
        </div>

        <Link
          href="/dashboard/classes/create"
          className="inline-flex items-center px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors shadow-glow-green"
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
          Create Class
        </Link>
      </div>

      {/* Classes Grid */}
      {classes.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-soft border border-gray-100 text-center">
          <div className="w-16 h-16 bg-pastel-mint/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-brand-green"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No classes yet
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first class to start organizing students and exercises!
          </p>
          <Link
            href="/dashboard/classes/create"
            className="inline-flex items-center px-6 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
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
            Create Your First Class
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((classItem) => (
            <div
              key={classItem.id}
              className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 card-hover"
            >
              {/* Class Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      classItem.is_active ? "bg-brand-green/20" : "bg-gray-200"
                    }`}
                  >
                    <svg
                      className={`w-6 h-6 ${
                        classItem.is_active
                          ? "text-brand-green"
                          : "text-gray-500"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">
                      {classItem.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          classItem.is_active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {classItem.is_active ? "Active" : "Inactive"}
                      </span>
                    </div>
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
                      href={`/dashboard/classes/${classItem.id}`}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      Manage Class
                    </Link>
                    <button
                      onClick={() =>
                        toggleClassStatus(classItem.id, classItem.is_active)
                      }
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      {classItem.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => handleDelete(classItem.id, classItem.name)}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      Delete Class
                    </button>
                  </div>
                </div>
              </div>

              {/* Description */}
              {classItem.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {classItem.description}
                </p>
              )}

              {/* Access Code */}
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Access Code
                    </p>
                    <p className="text-lg font-mono font-bold text-brand-green">
                      {classItem.access_code}
                    </p>
                  </div>
                  <button
                    onClick={() => copyAccessCode(classItem.access_code)}
                    className="p-2 text-gray-400 hover:text-brand-green hover:bg-brand-green/10 rounded-lg transition-colors"
                    title="Copy access code"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-green">
                    {classItem.student_count || 0}
                  </p>
                  <p className="text-sm text-gray-600">Students</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-brand-blue">
                    {classItem.exercise_count || 0}
                  </p>
                  <p className="text-sm text-gray-600">Exercises</p>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 pt-4 border-t border-gray-100">
                <Link
                  href={`/dashboard/classes/${classItem.id}`}
                  className="flex-1 px-3 py-2 text-center text-sm bg-brand-green/10 text-brand-green rounded-lg hover:bg-brand-green/20 transition-colors"
                >
                  Manage
                </Link>
                <Link
                  href={`/dashboard/exercises/create?classId=${classItem.id}`}
                  className="flex-1 px-3 py-2 text-center text-sm bg-brand-blue/10 text-brand-blue rounded-lg hover:bg-brand-blue/20 transition-colors"
                >
                  Add Exercise
                </Link>
              </div>

              {/* Created Date */}
              <div className="text-center mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created {new Date(classItem.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ClassesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ClassesListContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
