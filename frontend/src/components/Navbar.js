import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMenus = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  };

  // ✅ Show only headings on the login page
  if (location.pathname === "/login") {
    return (
      <div className="flex items-center justify-between mx-auto max-w-screen-xl p-4">
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 dark:text-white">
          Marque Impex
        </h1>
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
          <span className="text-lg sm:text-3xl font-semibold text-gray-800 dark:text-white">
            Template Management System
          </span>
        </div>
      </div>
    );
  }

  return (
    <nav className="bg-white border-gray-200 dark:bg-gray-900 relative z-50">
      <div className="flex items-center justify-between mx-auto max-w-screen-xl p-4">
        {/* Left Heading */}
        <h1 className="text-2xl sm:text-4xl font-bold text-gray-800 dark:text-white">
          Marque Impex
        </h1>

        {/* Centered Title */}
        <div className="hidden lg:block absolute left-1/2 transform -translate-x-1/2">
          <span className="text-lg sm:text-3xl font-semibold text-gray-800 dark:text-white">
            Template Management System
          </span>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={toggleMobileMenu}
          className="lg:hidden text-gray-900 dark:text-white focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            />
          </svg>
        </button>

        {/* Navigation Links */}
        {user && (
          <div
            className={`${
              isMobileMenuOpen ? "block" : "hidden"
            } lg:flex items-center space-x-6`}
          >
            {/* Home (For Admin & Manager) */}
            {(user.role === "admin" || user.role === "manager") && (
              <Link
                to="/home"
                className="text-gray-900 dark:text-white hover:underline"
                onClick={closeMenus}
              >
                Home
              </Link>
            )}

            {/* Templates Dropdown */}
            <div className="relative">
              <button
                onClick={toggleDropdown}
                className="flex items-center text-gray-900 dark:text-white hover:underline space-x-1"
              >
                <span>Templates</span>
                <svg
                  className={`w-4 h-4 transform transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute z-50 mt-2 w-48 bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-600 rounded-lg shadow-lg">
                  {/* Template Form (Only for Users & Admins) */}
                  {(user.role === "admin" || user.role === "user") && (
                    <Link
                      to="/templateform"
                      className="block px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      onClick={closeMenus}
                    >
                      Template Form
                    </Link>
                  )}

                  {/* Template List */}
                  <Link
                    to="/templatelist"
                    className="block px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={closeMenus}
                  >
                    Template List
                  </Link>

                  {/* ✅ Form Status (Now inside dropdown) */}
                  <Link
                    to="/formstatus"
                    className="block px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                    onClick={closeMenus}
                  >
                    Template Status
                  </Link>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <button
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-gray-600 transition duration-300 shadow-md"
              onClick={logout}
            >
              <LogOut size={20} /> {/* Logout Icon */}
              Logout
            </button>
          </div>
        )}

        {/* Show Login Button if Not Logged In */}
        {!user && (
          <Link
            to="/login"
            className="text-sm text-blue-600 dark:text-blue-500 hover:underline"
            onClick={closeMenus}
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
