"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function StudentJoinPage() {
  const [accessCode, setAccessCode] = useState("");
  const [studentName, setStudentName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic validation
    if (!accessCode.trim() || !studentName.trim()) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }

    try {
      // Find class by access code
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("id, name, description, is_active")
        .eq("access_code", accessCode.toUpperCase())
        .eq("is_active", true)
        .single();

      if (classError || !classData) {
        setError("Invalid access code. Please check and try again.");
        setLoading(false);
        return;
      }

      // Check if student already exists in this class
      const { data: existingStudent } = await supabase
        .from("students")
        .select("id")
        .eq("class_id", classData.id)
        .eq("name", studentName.trim())
        .single();

      let studentId;

      if (existingStudent) {
        // Student already exists, use existing ID
        studentId = existingStudent.id;
      } else {
        // Create new student
        const { data: newStudent, error: studentError } = await supabase
          .from("students")
          .insert([
            {
              name: studentName.trim(),
              class_id: classData.id,
            },
          ])
          .select()
          .single();

        if (studentError) throw studentError;
        studentId = newStudent.id;
      }

      // Store student info in localStorage for session
      localStorage.setItem(
        "student_session",
        JSON.stringify({
          id: studentId,
          name: studentName.trim(),
          class_id: classData.id,
          class_name: classData.name,
        })
      );

      // Redirect to student dashboard
      router.push(`/student/dashboard/${classData.id}`);
    } catch (err) {
      console.error("Error joining class:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light via-pastel-blue/20 to-pastel-mint/20">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <Link
            href="/"
            className="inline-flex items-center text-brand-blue hover:text-brand-blue-dark transition-colors mb-6"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Home
          </Link>

          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-blue to-brand-green rounded-xl flex items-center justify-center shadow-glow-blue">
              <span className="text-white font-bold text-2xl">E</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-brand-blue-dark mb-4">
            Join Your English Class
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Enter your class access code and name to start practicing English
            exercises.
          </p>
        </div>

        {/* Join Form */}
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-xl p-8 shadow-soft border border-gray-100">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Error Message */}
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Access Code */}
              <div>
                <label
                  htmlFor="accessCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Class Access Code
                </label>
                <input
                  type="text"
                  id="accessCode"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent text-center text-lg font-mono tracking-wider"
                  placeholder="ABC123"
                  maxLength={6}
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  6-character code provided by your teacher
                </p>
              </div>

              {/* Student Name */}
              <div>
                <label
                  htmlFor="studentName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Your Name
                </label>
                <input
                  type="text"
                  id="studentName"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent"
                  placeholder="Enter your full name"
                  disabled={loading}
                />
                <p className="text-sm text-gray-500 mt-1">
                  This will be shown to your teacher
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !accessCode.trim() || !studentName.trim()}
                className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-glow-blue"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Joining Class...
                  </div>
                ) : (
                  "Join Class"
                )}
              </button>
            </form>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help?
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 bg-brand-blue/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-blue text-xs">?</span>
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    Don't have an access code?
                  </p>
                  <p>Ask your English teacher for the 6-character class code</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 bg-brand-green/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-brand-green text-xs">!</span>
                </span>
                <div>
                  <p className="font-medium text-gray-900">Code not working?</p>
                  <p>
                    Make sure you enter the code exactly as provided (all 6
                    characters)
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <span className="w-5 h-5 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-orange-600 text-xs">📝</span>
                </span>
                <div>
                  <p className="font-medium text-gray-900">
                    Already joined before?
                  </p>
                  <p>
                    You can use the same name to continue where you left off
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
