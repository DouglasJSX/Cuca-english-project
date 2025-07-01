import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Header({ onMenuClick }) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getUserInitials = () => {
    if (!user?.email) return "T";
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <header className="bg-white shadow-soft border-b border-pastel-blue/20 sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side - Menu button and Logo */}
        <div className="flex items-center space-x-4">
          {/* Mobile menu button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-pastel-blue/10 transition-colors"
          >
            <svg
              className="w-6 h-6 text-brand-blue-dark"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <div className="flex items-center">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-blue to-brand-green rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-brand-blue-dark">
                English Exercises
              </h1>
              <p className="text-xs text-gray-500">Teacher Dashboard</p>
            </div>
          </div>
        </div>

        {/* Right side - User menu */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center space-x-3 p-2 rounded-lg hover:bg-pastel-blue/10 transition-colors"
          >
            <div className="w-8 h-8 bg-brand-blue rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {getUserInitials()}
              </span>
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-sm font-medium text-brand-blue-dark">
                {user?.email?.split("@")[0] || "Teacher"}
              </p>
              <p className="text-xs text-gray-500">Educator</p>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${
                isProfileOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          {/* Profile dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">
                  {user?.email || "Teacher"}
                </p>
                <p className="text-xs text-gray-500">English Educator</p>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close dropdown when clicking outside */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </header>
  );
}
