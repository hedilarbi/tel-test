"use client";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { MdDashboard } from "react-icons/md";

import { FaUsers } from "react-icons/fa6";

// Main navigation items
const navItems = [
  {
    label: "Tableau de bord",
    href: "/admin-dashboard",
    icon: <MdDashboard />,
    ariaLabel: "Navigate to tableau de bord",
  },

  {
    label: "Utilisateurs",
    href: "/users",
    icon: <FaUsers />,
    ariaLabel: "Navigate to invitations",
    matchPattern: /^\/utlisateurs(\/.*)?$/, // Matches /patients and /patients/[id]
  },
];

// SideBar Component
const SideBar = () => {
  const pathname = usePathname();

  // Check if a nav item is active based on current path
  const isNavItemActive = (item) => {
    if (item.matchPattern) {
      return item.matchPattern.test(pathname);
    }
    return pathname === item.href;
  };

  return (
    <aside
      id="sidebar"
      className="h-full bg-white shadow-lg w-64"
      aria-label="Sidebar navigation"
    >
      <div className="flex flex-col h-full p-5">
        {/* Logo */}
        <div className="flex justify-center py-4">
          <h1>LOGO</h1>
        </div>

        {/* Navigation Links */}
        <nav
          className="flex flex-col gap-2 mt-6 flex-grow"
          aria-label="Main navigation"
        >
          {navItems.map((item) => {
            const isActive = isNavItemActive(item);

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.ariaLabel}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                             ${
                               isActive
                                 ? "bg-emerald-50 text-emerald-900 font-semibold"
                                 : "text-gray-600 hover:bg-gray-100"
                             }`}
              >
                {item.icon}
                <span className="text-base">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout Section */}
      </div>
    </aside>
  );
};

export default SideBar;
