"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

function CreateClassContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!formData.name.trim()) {
      setError("Class name is required");
      setLoading(false);
      return;
    }

    try {
      const classData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        teacher_id: user.id,
      };

      const { data, error } = await supabase
        .from("classes")
        .insert([classData])
        .select()
        .single();

      if (error) throw error;

      // Redirect to class management page
      router.push(`/dashboard/classes/${data.id}`);
    } catch (err) {
      setError(err.message || "Error creating class");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-pastel-mint/20">
        <h1 className="text-3xl font-bold text-brand-green-dark mb-2">
          Create New Class
        </h1>
        <p className="text-gray-600">
          Set up a new class to organize your students and exercises.
        </p>
      </div>

      {/* Main Form */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100">
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Class Name */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Class Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
              placeholder="e.g., Beginner English A1"
              required
              maxLength={255}
            />
            <p className="text-sm text-gray-500 mt-1">
              Choose a clear name that helps you identify this class
            </p>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
              placeholder="Describe the class level, goals, or any other relevant information..."
            />
            <p className="text-sm text-gray-500 mt-1">
              Help students understand what this class is about
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-brand-green/5 border border-brand-green/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-brand-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-4 h-4 text-brand-green"
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
                <h4 className="text-sm font-medium text-brand-green-dark mb-1">
                  Access Code Generated Automatically
                </h4>
                <p className="text-sm text-gray-600">
                  After creating the class, you'll receive a unique 6-character
                  access code that students can use to join your class.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading || !formData.name.trim()}
              className="px-8 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-green"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating Class...
                </div>
              ) : (
                "Create Class"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Tips Section */}
      <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          💡 Tips for Creating Great Classes
        </h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="text-brand-green font-medium">•</span>
            <p>
              Use descriptive names like "Elementary English - Morning Group" or
              "Advanced Conversation Club"
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-brand-green font-medium">•</span>
            <p>
              Include the learning level (A1, A2, B1, B2, C1, C2) in the class
              name if applicable
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-brand-green font-medium">•</span>
            <p>
              Add class schedules or meeting times in the description to help
              students remember
            </p>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-brand-green font-medium">•</span>
            <p>
              You can always edit the class information later from the class
              management page
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateClassPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CreateClassContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
