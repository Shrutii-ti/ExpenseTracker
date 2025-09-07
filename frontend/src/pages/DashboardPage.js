import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import MetricCard from '../components/dashboard/MetricCard';
import Charts from '../components/dashboard/Charts';
import ExpenseList from '../components/dashboard/ExpenseList';
import ExpenseForm from '../components/dashboard/ExpenseForm';
import ReceiptScanner from '../components/dashboard/ReceiptScanner';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { checkAuth } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({ totalExpenses: 0, totalAmount: 0 });
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [searchParams, setSearchParams] = useSearchParams();
  const isFormOpen = searchParams.get('modal') === 'add-expense' || searchParams.get('modal') === 'edit-expense';
  const isScannerOpen = searchParams.get('modal') === 'scan-receipt';

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [expensesRes, totalsRes, summaryRes] = await Promise.all([
        axiosInstance.get('/expenses'),
        axiosInstance.get('/expenses/totals'),
        axiosInstance.get('/expenses/monthly-summary'),
      ]);
      setExpenses(expensesRes.data);
      setTotals(totalsRes.data);
      setMonthlySummary(summaryRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      checkAuth();
    } finally {
      setLoading(false);
    }
  }, [checkAuth]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const handleOpenForm = (expenseToEdit = null) => {
    setEditingExpense(expenseToEdit);
    setSearchParams({ modal: 'edit-expense' });
  };
  
  const handleCloseModal = () => {
    setEditingExpense(null);
    setSearchParams({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-12 h-12 border-4 border-gray-300 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Total Expenses" value={totals.totalAmount} unit="₹" />
                <MetricCard title="Number of Records" value={totals.totalExpenses} />
                <MetricCard title="Highest Category" value="Food" />
              </div>
              <Charts monthlySummary={monthlySummary} />
              <ExpenseList expenses={expenses} onOpenForm={handleOpenForm} fetchAllData={fetchAllData} />
            </div>
          </div>
          <div className="md:col-span-1">
            <div className="space-y-6">
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">AI Insights</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Get a personalized summary of your spending habits and tips for saving money.
                </p>
                <button className="w-full px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition">
                  Generate AI Summary
                </button>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Receipt Scanner</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a receipt to automatically log your expenses.
                </p>
                <button
                  onClick={() => setSearchParams({ modal: 'scan-receipt' })}
                  className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition"
                >
                  Scan Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ExpenseForm
        isOpen={isFormOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
        onSuccess={fetchAllData}
      />
      <ReceiptScanner
        isOpen={isScannerOpen}
        onClose={handleCloseModal}
        onSuccess={fetchAllData}
      />
    </div>
  );
};

export default DashboardPage;