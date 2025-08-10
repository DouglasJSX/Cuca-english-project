"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { dbHelpers, supabase } from "@/lib/supabase";

function CreateExerciseContent() {
  const { user } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    classIds: [],
  });

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Exercise types with descriptions
  const exerciseTypes = [
    {
      value: "ExternalLink",
      label: "External Link",
      description: "Link to external tools (Quizlet, Kahoot, etc.)",
      icon: "🔗",
    },
    {
      value: "MultipleChoice",
      label: "Multiple Choice",
      description: "Questions with multiple answer options",
      icon: "✓",
    },
    {
      value: "FillBlank",
      label: "Fill in the Blanks",
      description: "Complete sentences with missing words",
      icon: "___",
    },
    {
      value: "ArrangeWords",
      label: "Arrange Words",
      description: "Drag words to form correct sentences",
      icon: "⤴",
    },
    {
      value: "Matching",
      label: "Matching",
      description: "Match words with their definitions",
      icon: "↔",
    },
    {
      value: "FlashCards",
      label: "Flash Cards",
      description: "Memory cards for vocabulary practice",
      icon: "🃏",
    },
    {
      value: "Translation",
      label: "Translation",
      description: "Translate words or sentences",
      icon: "🌐",
    },
  ];

  useEffect(() => {
    loadClasses();
  }, [user]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClassToggle = (classId) => {
    setFormData((prev) => ({
      ...prev,
      classIds: prev.classIds.includes(classId)
        ? prev.classIds.filter(id => id !== classId)
        : [...prev.classIds, classId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!formData.title || !formData.type) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      // Create basic exercise structure
      const exerciseData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        teacher_id: user.id,
        content: getInitialContent(formData.type),
      };

      const { data: exercise, error } = await supabase
        .from("exercises")
        .insert([exerciseData])
        .select()
        .single();

      if (error) throw error;

      // Associate exercise with selected classes
      if (formData.classIds.length > 0) {
        const { error: classError } = await dbHelpers.updateExerciseClasses(
          exercise.id, 
          formData.classIds
        );
        if (classError) throw new Error(classError);
      }

      // Redirect to exercise editor
      router.push(`/dashboard/exercises/${exercise.id}`);
    } catch (err) {
      setError(err.message || "Error creating exercise");
    } finally {
      setLoading(false);
    }
  };

  const getInitialContent = (type) => {
    const templates = {
      ExternalLink: {
        url: "",
      },
      MultipleChoice: {
        questions: [
          {
            question: "",
            options: ["", "", "", ""],
            correct: 0,
          },
        ],
      },
      FillBlank: {
        sentences: [
          {
            text: "",
            blanks: [],
          },
        ],
      },
      ArrangeWords: {
        sentences: [
          {
            words: [],
            correct: "",
          },
        ],
      },
      Matching: {
        pairs: [{ left: "", right: "" }],
      },
      FlashCards: {
        cards: [{ front: "", back: "" }],
      },
      Translation: {
        items: [{ source: "", target: "", language: "Portuguese" }],
      },
    };

    return templates[type] || {};
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-pastel-blue/20">
        <h1 className="text-3xl font-bold text-brand-blue-dark mb-2">
          Create New Exercise
        </h1>
        <p className="text-gray-600">
          Choose an exercise type and start building engaging activities for
          your students.
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

          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Exercise Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                placeholder="e.g., Basic English Greetings"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign to Classes (Optional)
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-lg p-3">
                {classes.length === 0 ? (
                  <p className="text-gray-500 text-sm">No classes available</p>
                ) : (
                  classes.map((cls) => (
                    <label
                      key={cls.id}
                      className="flex items-center space-x-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                    >
                      <input
                        type="checkbox"
                        checked={formData.classIds.includes(cls.id)}
                        onChange={() => handleClassToggle(cls.id)}
                        className="w-4 h-4 text-brand-blue bg-gray-100 border-gray-300 rounded focus:ring-brand-blue focus:ring-2"
                      />
                      <span className="text-sm text-gray-700">{cls.name}</span>
                    </label>
                  ))
                )}
              </div>
              {formData.classIds.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  {formData.classIds.length} class{formData.classIds.length > 1 ? 'es' : ''} selected
                </p>
              )}
            </div>
          </div>

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
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
              placeholder="Brief description of what students will learn..."
            />
          </div>

          {/* Exercise Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Exercise Type *
            </label>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exerciseTypes.map((type) => (
                <label
                  key={type.value}
                  className={`cursor-pointer p-4 border-2 rounded-lg transition-all ${
                    formData.type === type.value
                      ? "border-brand-blue bg-brand-blue/5"
                      : "border-gray-200 hover:border-pastel-blue"
                  }`}
                >
                  <input
                    type="radio"
                    name="type"
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={handleInputChange}
                    className="sr-only"
                  />
                  <div className="text-center">
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {type.label}
                    </h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </label>
              ))}
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
              disabled={loading || !formData.title || !formData.type}
              className="px-8 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Creating...
                </div>
              ) : (
                "Create Exercise"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateExercisePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <CreateExerciseContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
