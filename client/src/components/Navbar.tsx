"use client";

import React, { useCallback, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslation } from "react-i18next";
import {
  SunIcon,
  MoonIcon,
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import clsx from "clsx";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const { user, signOut, loading } = useAuth();
  const { dark, toggle } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleLang = useCallback(() => {
    i18n.changeLanguage(i18n.language === "en" ? "bn" : "en");
  }, [i18n]);

  const handleSignOut = useCallback(async () => {
    await signOut();
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [signOut]);

  return (
    <nav
      className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white/90 backdrop-blur dark:border-gray-700 dark:bg-gray-900/90"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold text-primary-600 dark:text-primary-400"
          aria-label={t("common.appName")}
        >
          <AcademicCapIcon className="h-7 w-7" aria-hidden="true" />
          <span>{t("common.appName")}</span>
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/divisions"
            className="text-sm font-medium text-gray-600 hover:text-primary-600 dark:text-gray-300 dark:hover:text-primary-400 transition-colors"
          >
            {t("nav.divisions")}
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-medium text-primary-600 dark:text-primary-400"
            >
              {t("nav.admin")}
            </Link>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Language toggle */}
          <button
            onClick={toggleLang}
            className="rounded-md px-2 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle language"
          >
            {t("nav.language")}
          </button>

          {/* Dark mode */}
          <button
            onClick={toggle}
            className="rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            aria-label={t("nav.darkMode")}
          >
            {dark ? (
              <SunIcon className="h-5 w-5" aria-hidden="true" />
            ) : (
              <MoonIcon className="h-5 w-5" aria-hidden="true" />
            )}
          </button>

          {/* User menu */}
          {!loading && (
            <>
              {user ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500"
                    aria-haspopup="true"
                    aria-expanded={dropdownOpen}
                    aria-label="User menu"
                  >
                    {user.avatarUrl ? (
                      <Image
                        src={user.avatarUrl}
                        alt={user.name}
                        width={36}
                        height={36}
                        className="rounded-full"
                      />
                    ) : (
                      <UserCircleIcon className="h-9 w-9 text-gray-500 dark:text-gray-400" />
                    )}
                  </button>

                  {dropdownOpen && (
                    <div
                      className={clsx(
                        "absolute right-0 mt-2 w-52 rounded-xl border border-gray-200 bg-white py-2 shadow-lg",
                        "dark:border-gray-700 dark:bg-gray-800"
                      )}
                      role="menu"
                    >
                      <div className="border-b border-gray-100 px-4 py-2 dark:border-gray-700">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={() => setDropdownOpen(false)}
                      >
                        {t("nav.profile")}
                      </Link>
                      <button
                        className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50 dark:text-red-400 dark:hover:bg-gray-700"
                        role="menuitem"
                        onClick={handleSignOut}
                      >
                        {t("nav.signOut")}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  {t("nav.signIn")}
                </Link>
              )}
            </>
          )}

          {/* Mobile menu toggle */}
          <button
            className="rounded-md p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <Link
            href="/"
            className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.home")}
          </Link>
          <Link
            href="/divisions"
            className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
            onClick={() => setMenuOpen(false)}
          >
            {t("nav.divisions")}
          </Link>
          {user && (
            <Link
              href="/profile"
              className="block py-2 text-sm font-medium text-gray-700 dark:text-gray-300"
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.profile")}
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="block py-2 text-sm font-medium text-primary-600 dark:text-primary-400"
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.admin")}
            </Link>
          )}
          {user ? (
            <button
              className="block py-2 text-sm font-medium text-red-600 dark:text-red-400"
              onClick={handleSignOut}
            >
              {t("nav.signOut")}
            </button>
          ) : (
            <Link
              href="/auth/signin"
              className="block py-2 text-sm font-medium text-primary-600 dark:text-primary-400"
              onClick={() => setMenuOpen(false)}
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
