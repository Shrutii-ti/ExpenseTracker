import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const [expenses, setExpenses] = useState([]);
  const [totals, setTotals] = useState({ totalExpenses: 0, totalAmount: 0 });
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [dailyTrends, setDailyTrends] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });
  const [searchParams, setSearchParams] = useSearchParams();
  const [aiSummary, setAiSummary] = useState(null);
  const [isAiSummaryLoading, setIsAiSummaryLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [loginMessage, setLoginMessage] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (location.state && location.state.message) {
      setLoginMessage(location.state.message);
      const timer = setTimeout(() => {
        setLoginMessage(null);
        window.history.replaceState({}, document.title);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const [expensesRes, totalsRes, summaryRes, trendsRes] = await Promise.all([
        axiosInstance.get('/expenses'),
        axiosInstance.get('/expenses/totals'),
        axiosInstance.get('/expenses/monthly-summary'),
        axiosInstance.get(`/expenses/daily-trends/${activeMonth.year}/${activeMonth.month}`),
      ]);
      setExpenses(expensesRes.data);
      setTotals(totalsRes.data);
      setMonthlySummary(summaryRes.data);
      setDailyTrends(trendsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      checkAuth();
    } finally {
      setLoading(false);
    }
  }, [checkAuth, activeMonth, refreshKey]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    if (searchParams.get('modal') === 'add-expense') {
      setIsFormOpen(true);
    } else {
      setIsFormOpen(false);
    }

    if (searchParams.get('modal') === 'scan-receipt') {
      setIsScannerOpen(true);
    } else {
      setIsScannerOpen(false);
    }
  }, [searchParams]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage(null);
      }, 5000); 
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const handleOpenForm = (expenseToEdit = null) => {
    setEditingExpense(expenseToEdit);
    setSearchParams({ modal: 'add-expense' });
  };

  const handleOpenScanner = () => {
    setSearchParams({ modal: 'scan-receipt' });
  };

  const handleMonthChange = (e) => {
    const [year, month] = e.target.value.split('-');
    setActiveMonth({ year: parseInt(year), month: parseInt(month) });
  };

  const handleCloseModal = () => {
    setSearchParams({});
    setEditingExpense(null);
  };
  
  const handleGenerateAISummary = async () => {
    setIsAiSummaryLoading(true);
    setAiSummary(null);
    try {
      const response = await axiosInstance.get('/expenses/ai-summary');
      setAiSummary(response.data.summary);
    } catch (error) {
      console.error("Failed to generate AI summary:", error);
      setAiSummary("Sorry, an error occurred while generating the summary. Please check your backend logs.");
    } finally {
      setIsAiSummaryLoading(false);
    }
  };

  const handleCloseAiSummary = () => {
    setAiSummary(null);
  };

  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setRefreshKey(prevKey => prevKey + 1);
  };

  // FIX: This new function correctly handles the success flow for the ExpenseForm
  const handleFormSuccess = () => {
    showSuccessMessage('Expense saved successfully!');
    handleCloseModal();
  };
  
  const handleScanSuccess = () => {
    showSuccessMessage('Expense scanned and added successfully!');
    handleCloseModal();
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
        {loginMessage && (
          <div className="fixed top-4 right-4 z-50">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-md" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline ml-2">{loginMessage}</span>
            </div>
          </div>
        )}
        {successMessage && (
          <div className="fixed top-20 right-4 z-50">
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-md" role="alert">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline ml-2">{successMessage}</span>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard title="Total Expenses" value={totals.totalAmount} unit="₹" />
                <MetricCard title="Number of Records" value={totals.totalExpenses} />
                <MetricCard title="Highest Category" value="Food" />
              </div>
              <Charts monthlySummary={monthlySummary} dailyTrends={dailyTrends} activeMonth={activeMonth} handleMonthChange={handleMonthChange} />
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
                {aiSummary && (
                  <div className="bg-gray-100 p-4 rounded-lg text-gray-700 mb-4 relative">
                    <p>{aiSummary}</p>
                    <button
                      onClick={handleCloseAiSummary}
                      className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                    >
                      &times;
                    </button>
                  </div>
                )}
                <button
                  onClick={handleGenerateAISummary}
                  className="w-full px-4 py-2 bg-teal-600 text-white font-medium rounded-lg hover:bg-teal-700 transition"
                  disabled={isAiSummaryLoading}
                >
                  {isAiSummaryLoading ? 'Generating...' : 'Generate AI Summary'}
                </button>
              </div>
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="text-xl font-semibold mb-4 text-gray-800">Receipt Scanner</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Upload a receipt to automatically log your expenses.
                </p>
                <button
                  onClick={handleOpenScanner}
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
        onSuccess={handleFormSuccess}
      />
      <ReceiptScanner
        isOpen={isScannerOpen}
        onClose={handleCloseModal}
        onSuccess={handleScanSuccess}
      />
    </div>
  );
};

export default DashboardPage;