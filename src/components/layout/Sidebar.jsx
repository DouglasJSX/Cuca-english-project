import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  const navigationItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: (
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
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6a2 2 0 01-2 2H10a2 2 0 01-2-2V5z"
          />
        </svg>
      ),
    },
    {
      name: "Exercises",
      href: "/dashboard/exercises",
      icon: (
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      subItems: [
        { name: "All Exercises", href: "/dashboard/exercises" },
        { name: "Create Exercise", href: "/dashboard/exercises/create" },
      ],
    },
    {
      name: "Classes",
      href: "/dashboard/classes",
      icon: (
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
          />
        </svg>
      ),
      subItems: [
        { name: "All Classes", href: "/dashboard/classes" },
        { name: "Create Class", href: "/dashboard/classes/create" },
      ],
    },
  ];

  const isActiveLink = (href) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const NavLink = ({ item, isSubItem = false }) => {
    const isActive = isActiveLink(item.href);

    return (
      <Link
        href={item.href}
        onClick={onClose}
        className={`
          flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200
          ${isSubItem ? "ml-6 pl-6" : ""}
          ${
            isActive
              ? "bg-brand-blue text-white shadow-glow-blue"
              : "text-gray-700 hover:bg-pastel-blue/20 hover:text-brand-blue-dark"
          }
        `}
      >
        {!isSubItem && (
          <span className={`mr-3 ${isActive ? "text-white" : "text-gray-500"}`}>
            {item.icon}
          </span>
        )}
        {isSubItem && (
          <span className="w-2 h-2 bg-current rounded-full mr-3 opacity-60"></span>
        )}
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-full w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static lg:z-auto
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-6 border-b border-pastel-blue/20">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-blue to-brand-green rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold">E</span>
            </div>
            <span className="text-lg font-bold text-brand-blue-dark">Menu</span>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-lg hover:bg-pastel-blue/10 transition-colors"
          >
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => (
            <div key={item.name} className="space-y-1">
              <NavLink item={item} />

              {/* Sub-items */}
              {item.subItems && (
                <div className="space-y-1">
                  {item.subItems.map((subItem) => (
                    <NavLink
                      key={subItem.name}
                      item={subItem}
                      isSubItem={true}
                    />
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
