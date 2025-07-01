"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { DashboardLayout } from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/useAuth";
import { dbHelpers } from "@/lib/supabase";

function DashboardContent() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalExercises: 0,
    totalClasses: 0,
    totalStudents: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;

    try {
      // Get classes
      const { data: classes } = await dbHelpers.getClasses(user.id);

      // Get exercises
      const { data: exercises } = await dbHelpers.getExercises(user.id);

      // Calculate total students (mock for now)
      const totalStudents =
        classes?.reduce((acc, cls) => acc + (cls.student_count || 0), 0) || 0;

      setStats({
        totalExercises: exercises?.length || 0,
        totalClasses: classes?.length || 0,
        totalStudents,
        recentActivity: [
          ...(exercises?.slice(0, 3) || []),
          ...(classes?.slice(0, 2) || []),
        ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
      });
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: "Create Exercise",
      description: "Add a new exercise for your students",
      href: "/dashboard/exercises/create",
      icon: (
        <svg
          className="w-6 h-6"
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
      ),
      color: "bg-brand-blue hover:bg-brand-blue-dark",
    },
    {
      title: "Create Class",
      description: "Set up a new class for students",
      href: "/dashboard/classes/create",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
      ),
      color: "bg-brand-green hover:bg-brand-green-dark",
    },
  ];

  const statCards = [
    {
      title: "Total Exercises",
      value: stats.totalExercises,
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      color: "text-brand-blue",
      bgColor: "bg-pastel-blue/20",
    },
    {
      title: "Active Classes",
      value: stats.totalClasses,
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      color: "text-brand-green",
      bgColor: "bg-pastel-mint/20",
    },
    {
      title: "Students",
      value: stats.totalStudents,
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      color: "text-orange-600",
      bgColor: "bg-pastel-peach/20",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-white rounded-xl p-8 shadow-soft border border-pastel-blue/20">
        <h1 className="text-3xl font-bold text-brand-blue-dark mb-2">
          Welcome back, Teacher! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your English exercises today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-soft border border-gray-100 card-hover"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                <div className={stat.color}>{stat.icon}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 gap-6">
        {quickActions.map((action, index) => (
          <Link
            key={index}
            href={action.href}
            className="block bg-white rounded-xl p-8 shadow-soft border border-gray-100 card-hover group"
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-4 rounded-lg text-white transition-colors ${action.color}`}
              >
                {action.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-brand-blue-dark transition-colors">
                  {action.title}
                </h3>
                <p className="text-gray-600">{action.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">
            Recent Activity
          </h2>
        </div>
        <div className="p-6">
          {stats.recentActivity.length === 0 ? (
            <div className="text-center py-8">
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
                No activity yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start by creating your first exercise or class!
              </p>
              <div className="space-x-4">
                <Link
                  href="/dashboard/exercises/create"
                  className="inline-flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors"
                >
                  Create Exercise
                </Link>
                <Link
                  href="/dashboard/classes/create"
                  className="inline-flex items-center px-4 py-2 bg-brand-green text-white rounded-lg hover:bg-brand-green-dark transition-colors"
                >
                  Create Class
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {stats.recentActivity.slice(0, 5).map((item, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg"
                >
                  <div className="w-10 h-10 bg-brand-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-brand-blue font-medium">
                      {item.title?.[0] || item.name?.[0] || "A"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {item.title || item.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.type ? `${item.type} exercise` : "Class"} •{" "}
                      {new Date(item.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <DashboardContent />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
