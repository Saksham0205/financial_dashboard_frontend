"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import Spinner from "@/components/Spinner";
import api from "@/lib/api";
import { getRole } from "@/lib/auth";
import toast from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface Summary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  notes?: string;
}

interface TrendItem {
  month: string;
  income: number;
  expenses: number;
}

interface CategoryItem {
  _id: string;
  total: number;
}

const PIE_COLORS = [
  "#3b82f6", "#22c55e", "#ef4444", "#f59e0b", "#8b5cf6",
  "#ec4899", "#14b8a6", "#f97316", "#06b6d4", "#6366f1",
];

export default function DashboardPage() {
  const role = getRole();
  const canSeeCharts = role === "analyst" || role === "admin";

  const [summary, setSummary] = useState<Summary | null>(null);
  const [recent, setRecent] = useState<Transaction[]>([]);
  const [trends, setTrends] = useState<TrendItem[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const requests: Promise<unknown>[] = [
        api.get("/dashboard/summary"),
        api.get("/dashboard/recent"),
      ];
      if (canSeeCharts) {
        requests.push(api.get("/dashboard/trends"));
        requests.push(api.get("/dashboard/by-category"));
      }
      const results = await Promise.all(requests);
      const summaryRes = results[0] as { data: Summary };
      const recentRes = results[1] as { data: Transaction[] };
      setSummary(summaryRes.data);
      setRecent(recentRes.data);
      if (canSeeCharts) {
        const trendsRes = results[2] as { data: TrendItem[] };
        const catRes = results[3] as { data: CategoryItem[] };
        setTrends(trendsRes.data);
        setCategories(catRes.data);
      }
    } catch {
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, [canSeeCharts]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Overview of your financial data</p>
        </div>

        {loading ? (
          <Spinner size="lg" />
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-income" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Income</p>
                    <p className="text-2xl font-bold text-income">
                      {formatCurrency(summary?.totalIncome || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-expense" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Total Expenses</p>
                    <p className="text-2xl font-bold text-expense">
                      {formatCurrency(summary?.totalExpenses || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <svg className="w-6 h-6 text-balance" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500">Net Balance</p>
                    <p className="text-2xl font-bold text-balance">
                      {formatCurrency(summary?.netBalance || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Charts — analyst & admin only */}
            {canSeeCharts ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Monthly Trends */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Monthly Trends</h2>
                  {trends.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={trends}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          }}
                        />
                        <Legend />
                        <Bar dataKey="income" fill="#22c55e" radius={[6, 6, 0, 0]} />
                        <Bar dataKey="expenses" fill="#ef4444" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-12">No trend data available</p>
                  )}
                </div>

                {/* By Category Donut */}
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                  <h2 className="text-lg font-semibold text-slate-800 mb-4">Spending by Category</h2>
                  {categories.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={categories}
                          dataKey="total"
                          nameKey="_id"
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={110}
                          paddingAngle={3}
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          label={((props: any) =>
                            `${props.name || ""} ${((props.percent as number) * 100).toFixed(0)}%`
                          ) as any}
                        >
                          {categories.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            borderRadius: "12px",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-12">No category data available</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-balance/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-balance" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800">
                      Upgrade to Analyst to see detailed insights
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      Get access to monthly trends, category breakdowns, and more.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="text-lg font-semibold text-slate-800">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Type</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Category</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recent.length > 0 ? (
                      recent.map((tx) => (
                        <tr key={tx._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 text-sm font-semibold text-slate-800">
                            {formatCurrency(tx.amount)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${
                                tx.type === "income"
                                  ? "bg-green-50 text-income"
                                  : "bg-red-50 text-expense"
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-600">{tx.category}</td>
                          <td className="px-6 py-4 text-sm text-slate-500">
                            {new Date(tx.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-sm text-slate-400 max-w-[200px] truncate">
                            {tx.notes || "—"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-sm text-slate-400">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </ProtectedLayout>
  );
}
