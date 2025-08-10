"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function StudentDashboardPage() {
  const { classId } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [classData, setClassData] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);

  const exerciseIcons = {
    MultipleChoice: "✓",
    FillBlank: "___",
    ArrangeWords: "⤴",
    Matching: "↔",
    FlashCards: "🃏",
    Translation: "🌐",
  };

  useEffect(() => {
    // Check if student is in session
    const studentSession = localStorage.getItem("student_session");
    if (!studentSession) {
      router.push("/student/join");
      return;
    }

    const studentData = JSON.parse(studentSession);
    if (studentData.class_id !== classId) {
      router.push("/student/join");
      return;
    }

    setStudent(studentData);
    loadDashboardData(studentData);
  }, [classId, router]);

  const loadDashboardData = async (studentData) => {
    try {
      // Load class data
      const { data: classInfo, error: classError } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .eq("is_active", true)
        .single();

      if (classError) throw classError;
      setClassData(classInfo);

      // Load exercises for this class - VERSÃO SIMPLIFICADA
      const { data: exercisesData, error: exercisesError } = await supabase
        .from("exercise_classes")
        .select(`
          exercises (
            id,
            title,
            description,
            type,
            content,
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq("class_id", classId);

      // Transform the data to get just the exercises and filter active ones
      const allExercises = exercisesData?.map(item => item.exercises).filter(Boolean) || [];
      const exercises = allExercises.filter(exercise => exercise && exercise.is_active === true);

      if (exercisesError) throw exercisesError;
      setExercises(exercises);

      // Load student results
      const { data: resultsData, error: resultsError } = await supabase
        .from("exercise_results")
        .select("exercise_id, score, completed_at")
        .eq("student_id", studentData.id);

      if (resultsError) throw resultsError;

      // Convert to object for easy lookup
      const resultsMap = {};
      resultsData?.forEach((result) => {
        resultsMap[result.exercise_id] = result;
      });
      setResults(resultsMap);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("student_session");
    router.push("/student/join");
  };

  const getExerciseStatus = (exerciseId) => {
    const result = results[exerciseId];
    if (!result)
      return {
        status: "not_started",
        score: null,
        color: "bg-gray-100 text-gray-600",
      };

    const score = result.score;
    if (score >= 80)
      return {
        status: "excellent",
        score,
        color: "bg-green-100 text-green-700",
      };
    if (score >= 60)
      return { status: "good", score, color: "bg-blue-100 text-blue-700" };
    if (score >= 40)
      return {
        status: "needs_practice",
        score,
        color: "bg-yellow-100 text-yellow-700",
      };
    return {
      status: "needs_improvement",
      score,
      color: "bg-red-100 text-red-700",
    };
  };

  const calculateOverallProgress = () => {
    if (exercises.length === 0) return { completed: 0, average: 0 };

    const completed = Object.keys(results).length;
    const totalScore = Object.values(results).reduce(
      (sum, result) => sum + result.score,
      0
    );
    const average = completed > 0 ? Math.round(totalScore / completed) : 0;

    return { completed, total: exercises.length, average };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-light via-pastel-blue/20 to-pastel-mint/20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!student || !classData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-light via-pastel-blue/20 to-pastel-mint/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Session Expired
          </h2>
          <p className="text-gray-600 mb-6">Please join your class again.</p>
          <Link
            href="/student/join"
            className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
          >
            Join Class
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateOverallProgress();

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-light via-pastel-blue/20 to-pastel-mint/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-brand-blue-dark mb-2">
                Welcome back, {student.name}! 👋
              </h1>
              <p className="text-gray-600">
                <span className="font-medium">{classData.name}</span>
                {classData.description && (
                  <span className="text-gray-500">
                    {" "}
                    • {classData.description}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                href="/student/join"
                className="px-4 py-2 text-brand-blue border border-brand-blue rounded-lg hover:bg-brand-blue/10 transition-colors"
              >
                Join Another Class
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Exercises Completed
                </p>
                <p className="text-3xl font-bold text-brand-blue">
                  {progress.completed}
                </p>
                <p className="text-sm text-gray-500">
                  of {progress.total} available
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Average Score
                </p>
                <p className="text-3xl font-bold text-brand-green">
                  {progress.average}%
                </p>
                <p className="text-sm text-gray-500">
                  across completed exercises
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
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-soft border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Progress</p>
                <p className="text-3xl font-bold text-orange-600">
                  {progress.total > 0
                    ? Math.round((progress.completed / progress.total) * 100)
                    : 0}
                  %
                </p>
                <p className="text-sm text-gray-500">exercises completed</p>
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Exercises List */}
        <div className="bg-white rounded-xl shadow-soft border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              Available Exercises
            </h2>
            <p className="text-gray-600 mt-1">
              Click on any exercise to start practicing
            </p>
          </div>

          <div className="p-6">
            {exercises.length === 0 ? (
              <div className="text-center py-12">
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No exercises yet
                </h3>
                <p className="text-gray-600">
                  Your teacher hasn't added any exercises to this class yet.
                  Check back later!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {exercises.map((exercise) => {
                  const status = getExerciseStatus(exercise.id);

                  return (
                    <Link
                      key={exercise.id}
                      href={`/student/exercise/${exercise.id}?studentId=${student.id}`}
                      className="block p-6 border border-gray-200 rounded-lg hover:border-brand-blue hover:shadow-md transition-all card-hover"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-brand-blue/20 rounded-lg flex items-center justify-center">
                            <span className="text-brand-blue text-lg">
                              {exerciseIcons[exercise.type] || "📝"}
                            </span>
                          </div>

                          <div>
                            <h3 className="font-semibold text-gray-900 mb-1">
                              {exercise.title}
                            </h3>
                            <div className="flex items-center space-x-3 text-sm text-gray-500">
                              <span className="px-2 py-1 bg-brand-blue/10 text-brand-blue rounded-full">
                                {exercise.type}
                              </span>
                              {exercise.description && (
                                <span>{exercise.description}</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`px-3 py-1 rounded-full text-sm font-medium ${status.color}`}
                          >
                            {status.status === "not_started" && "Not Started"}
                            {status.status === "excellent" &&
                              `${status.score}% Excellent!`}
                            {status.status === "good" &&
                              `${status.score}% Good`}
                            {status.status === "needs_practice" &&
                              `${status.score}% Needs Practice`}
                            {status.status === "needs_improvement" &&
                              `${status.score}% Try Again`}
                          </div>
                          {results[exercise.id] && (
                            <p className="text-xs text-gray-500 mt-1">
                              Completed{" "}
                              {new Date(
                                results[exercise.id].completed_at
                              ).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
