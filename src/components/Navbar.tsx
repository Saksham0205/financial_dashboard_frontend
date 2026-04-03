"use client";

import { getUserName, getRole, logout } from "@/lib/auth";

const roleBadgeColors: Record<string, string> = {
  admin: "bg-purple-100 text-purple-700",
  analyst: "bg-blue-100 text-blue-700",
  viewer: "bg-slate-100 text-slate-700",
};

export default function Navbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const name = getUserName();
  const role = getRole();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="flex-1 lg:flex-none" />

        <div className="flex items-center gap-3 sm:gap-4">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-slate-800">{name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${roleBadgeColors[role] || roleBadgeColors.viewer}`}>
              {role}
            </span>
          </div>

          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-balance to-indigo-600 flex items-center justify-center text-white text-sm font-bold">
            {name.charAt(0).toUpperCase()}
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-2 px-3 py-2 text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
