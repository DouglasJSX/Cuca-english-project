import { useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function MainLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-neutral-light">
      {/* Header */}
      <Header onMenuClick={toggleSidebar} />

      <div className="flex">
        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

        {/* Main Content */}
        <main className="flex-1 lg:ml-0">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}

// Layout wrapper for pages that need authentication
export function DashboardLayout({ children }) {
  return <MainLayout>{children}</MainLayout>;
}
