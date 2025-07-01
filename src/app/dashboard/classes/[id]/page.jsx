"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";

function ClassManageContent() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [newStudentName, setNewStudentName] = useState("");
  const [addingStudent, setAddingStudent] = useState(false);

  useEffect(() => {
    loadClassData();
  }, [id, user]);

  const loadClassData = async () => {
    if (!user || !id) return;

    try {
      // Load class info
      const { data: classInfo, error: classError } = await supabase
        .from("classes")
        .select("*")
        .eq("id", id)
        .eq("teacher_id", user.id)
        .single();

      if (classError) throw classError;
      setClassData(classInfo);

      // Load students
      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("*")
        .eq("class_id", id)
        .order("name");

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);

      // Load exercises
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercises")
        .select("*")
        .eq("class_id", id)
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (exercisesError) throw exercisesError;
      setExercises(exercisesData || []);
    } catch (err) {
      console.error("Error loading class data:", err);
      if (err.code === "PGRST116") {
        router.push("/dashboard/classes");
      }
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (e) => {
    e.preventDefault();
    if (!newStudentName.trim()) return;

    setAddingStudent(true);
    try {
      const { data, error } = await supabase
        .from("students")
        .insert([
          {
            name: newStudentName.trim(),
            class_id: id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setStudents((prev) =>
        [...prev, data].sort((a, b) => a.name.localeCompare(b.name))
      );
      setNewStudentName("");
    } catch (err) {
      console.error("Error adding student:", err);
      alert("Error adding student");
    } finally {
      setAddingStudent(false);
    }
  };

  const removeStudent = async (studentId, studentName) => {
    if (!confirm(`Remove ${studentName} from this class?`)) return;

    try {
      const { error } = await supabase
        .from("students")
        .delete()
        .eq("id", studentId);

      if (error) throw error;

      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (err) {
      console.error("Error removing student:", err);
      alert("Error removing student");
    }
  };

  const copyAccessCode = async () => {
    try {
      await navigator.clipboard.writeText(classData.access_code);
      alert("Access code copied to clipboard!");
    } catch (err) {
      alert("Could not copy access code");
    }
  };

  const copyJoinLink = async () => {
    const joinLink = `${window.location.origin}/student/join`;
    try {
      await navigator.clipboard.writeText(joinLink);
      alert("Join link copied to clipboard!");
    } catch (err) {
      alert("Could not copy join link");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green mx-auto mb-4"></div>
          <p className="text-gray-600">Loading class...</p>
        </div>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Class not found
        </h2>
        <p className="text-gray-600 mb-4">
          The class you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <Link
          href="/dashboard/classes"
          className="text-brand-green hover:underline"
        >
          Back to Classes
        </Link>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "students", label: "Students", icon: "👥" },
    { id: "exercises", label: "Exercises", icon: "📝" },
    { id: "settings", label: "Settings", icon: "⚙️" },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-pastel-mint/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <Link
                href="/dashboard/classes"
                className="text-gray-400 hover:text-brand-green transition-colors"
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
              <h1 className="text-3xl font-bold text-brand-green-dark">
                {classData.name}
              </h1>
              <span
                className={`px-3 py-1 text-sm rounded-full ${
                  classData.is_active
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {classData.is_active ? "Active" : "Inactive"}
              </span>
            </div>
            {classData.description && (
              <p className="text-gray-600">{classData.description}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <Link
              href={`/dashboard/exercises/create?classId=${id}`}
              className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
            >
              Add Exercise
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? "border-brand-green text-brand-green"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-brand-green/5 rounded-lg p-6 border border-brand-green/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-brand-green-dark">
                        Total Students
                      </p>
                      <p className="text-3xl font-bold text-brand-green">
                        {students.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-brand-green/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-brand-green"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-brand-blue/5 rounded-lg p-6 border border-brand-blue/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-brand-blue-dark">
                        Exercises
                      </p>
                      <p className="text-3xl font-bold text-brand-blue">
                        {exercises.length}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-brand-blue/20 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-brand-blue"
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
                  </div>
                </div>

                <div className="bg-pastel-peach/20 rounded-lg p-6 border border-orange-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-700">
                        Created
                      </p>
                      <p className="text-lg font-bold text-orange-600">
                        {new Date(classData.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V7a2 2 0 012-2h4a2 2 0 012 2v0M8 7v8a2 2 0 002 2h4a2 2 0 002-2V7M8 7H6a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2V9a2 2 0 00-2-2h-2"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Access Code */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Student Access
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Access Code
                    </p>
                    <div className="flex items-center space-x-3">
                      <code className="bg-white px-4 py-3 rounded-lg border text-xl font-mono font-bold text-brand-green flex-1">
                        {classData.access_code}
                      </code>
                      <button
                        onClick={copyAccessCode}
                        className="px-4 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      Join Link
                    </p>
                    <div className="flex items-center space-x-3">
                      <code className="bg-white px-4 py-3 rounded-lg border text-sm text-gray-600 flex-1 truncate">
                        {window.location.origin}/student/dashboard/
                        {classData.access_code}
                      </code>
                      <button
                        onClick={copyJoinLink}
                        className="px-4 py-3 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === "students" && (
            <div className="space-y-6">
              {/* Add Student Form */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Add Student
                </h3>
                <form onSubmit={addStudent} className="flex space-x-3">
                  <input
                    type="text"
                    value={newStudentName}
                    onChange={(e) => setNewStudentName(e.target.value)}
                    placeholder="Student name"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-green focus:border-transparent"
                    disabled={addingStudent}
                  />
                  <button
                    type="submit"
                    disabled={addingStudent || !newStudentName.trim()}
                    className="px-6 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors disabled:opacity-50"
                  >
                    {addingStudent ? "Adding..." : "Add"}
                  </button>
                </form>
              </div>

              {/* Students List */}
              {students.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">
                    No students in this class yet.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-green/20 rounded-full flex items-center justify-center">
                          <span className="text-brand-green font-medium">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {student.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            Joined{" "}
                            {new Date(student.joined_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeStudent(student.id, student.name)}
                        className="text-red-600 hover:text-red-800 transition-colors"
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
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Exercises Tab */}
          {activeTab === "exercises" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Class Exercises
                </h3>
                <Link
                  href={`/dashboard/exercises/create?classId=${id}`}
                  className="px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                >
                  Create Exercise
                </Link>
              </div>

              {exercises.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    No exercises created for this class yet.
                  </p>
                  <Link
                    href={`/dashboard/exercises/create?classId=${id}`}
                    className="inline-flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                  >
                    Create First Exercise
                  </Link>
                </div>
              ) : (
                <div className="grid gap-4">
                  {exercises.map((exercise) => (
                    <div
                      key={exercise.id}
                      className="flex items-center justify-between p-4 bg-white border rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-brand-blue/20 rounded-lg flex items-center justify-center">
                          <span className="text-brand-blue">📝</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {exercise.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {exercise.type}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link
                          href={`/dashboard/exercises/${exercise.id}`}
                          className="px-3 py-1 text-sm bg-brand-blue/10 text-brand-blue rounded hover:bg-brand-blue/20 transition-colors"
                        >
                          Edit
                        </Link>
                        <Link
                          href={`/student/exercise/${exercise.id}`}
                          className="px-3 py-1 text-sm bg-brand-green/10 text-brand-green rounded hover:bg-brand-green/20 transition-colors"
                        >
                          Preview
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  ⚠️ Settings functionality will be implemented in the next
                  phase.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClassManagePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ClassManageContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
