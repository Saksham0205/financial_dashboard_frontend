"use client";

import { useState, useEffect, useCallback } from "react";
import ProtectedLayout from "@/components/ProtectedLayout";
import TransactionModal, { TransactionFormData } from "@/components/TransactionModal";
import Spinner from "@/components/Spinner";
import api from "@/lib/api";
import { getRole, getUserId } from "@/lib/auth";
import toast from "react-hot-toast";

interface Transaction {
  _id: string;
  amount: number;
  type: string;
  category: string;
  date: string;
  notes?: string;
}

export default function TransactionsPage() {
  const role = getRole();
  const isAdmin = role === "admin";

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);

  // Filters
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filterType) params.type = filterType;
      if (filterCategory) params.category = filterCategory;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const res = await api.get("/transactions", { params });
      setTransactions(res.data);
    } catch {
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, [filterType, filterCategory, startDate, endDate]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleAdd = () => {
    setEditingTx(null);
    setModalOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this transaction?")) return;
    try {
      await api.delete(`/transactions/${id}`);
      toast.success("Transaction deleted");
      fetchTransactions();
    } catch {
      toast.error("Failed to delete transaction");
    }
  };

  const handleSubmit = async (data: TransactionFormData) => {
    setModalLoading(true);
    try {
      const uid = getUserId();
      console.log("userId being sent:", uid);
      console.log("token in storage:", localStorage.getItem("token")?.substring(0, 20));
      const payload = {
        amount: parseFloat(data.amount),
        type: data.type,
        category: data.category,
        date: data.date,
        notes: data.notes,
        userId: uid,
      };
      if (editingTx) {
        await api.put(`/transactions/${editingTx._id}`, payload);
        toast.success("Transaction updated");
      } else {
        await api.post("/transactions", payload);
        toast.success("Transaction created");
      }
      setModalOpen(false);
      fetchTransactions();
    } catch {
      toast.error(editingTx ? "Failed to update" : "Failed to create");
    } finally {
      setModalLoading(false);
    }
  };

  const formatCurrency = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
            <p className="text-sm text-slate-500 mt-1">
              {isAdmin ? "Manage all transactions" : "View all transactions"}
            </p>
          </div>
          {isAdmin && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-balance rounded-xl hover:bg-blue-600 transition shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Transaction
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-balance/30 focus:border-balance transition bg-white"
            >
              <option value="">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>

            <input
              type="text"
              placeholder="Filter by category"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-balance/30 focus:border-balance transition"
            />

            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-balance/30 focus:border-balance transition"
            />

            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-balance/30 focus:border-balance transition"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          {loading ? (
            <Spinner />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Amount</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Type</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Category</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Date</th>
                    <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Notes</th>
                    {isAdmin && (
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {transactions.length > 0 ? (
                    transactions.map((tx) => (
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
                        {isAdmin && (
                          <td className="px-6 py-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleEdit(tx)}
                                className="px-3 py-1.5 text-xs font-medium text-balance bg-blue-50 rounded-lg hover:bg-blue-100 transition"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(tx._id)}
                                className="px-3 py-1.5 text-xs font-medium text-expense bg-red-50 rounded-lg hover:bg-red-100 transition"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={isAdmin ? 6 : 5} className="px-6 py-12 text-center text-sm text-slate-400">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
        initialData={
          editingTx
            ? {
                amount: String(editingTx.amount),
                type: editingTx.type,
                category: editingTx.category,
                date: editingTx.date,
                notes: editingTx.notes || "",
              }
            : null
        }
        loading={modalLoading}
      />
    </ProtectedLayout>
  );
}
