import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const Charts = ({ monthlySummary, dailyTrends, activeMonth, handleMonthChange }) => {
  const monthlyChartRef = useRef(null);
  const dailyChartRef = useRef(null);
  const chartInstance = useRef(null);
  const dailyChartInstance = useRef(null);

  const getMonthName = (monthNumber) => {
    const date = new Date();
    date.setMonth(monthNumber - 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Map the monthly summary data to get month names and amounts
    const labels = monthlySummary.map(item => getMonthName(item.month));
    const data = monthlySummary.map(item => item.totalAmount);
    const ctx = monthlyChartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          label: 'Monthly Spending',
          data,
          backgroundColor: ['#008080', '#FFD700', '#FF5722', '#4CAF50'],
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        plugins: {
          legend: {
            position: 'bottom',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed !== null) {
                  label += new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(context.parsed);
                }
                return label;
              }
            }
          }
        }
      },
    });

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [monthlySummary]);

  useEffect(() => {
    if (dailyChartInstance.current) {
      dailyChartInstance.current.destroy();
    }

    if (!dailyTrends || dailyTrends.length === 0) {
      return;
    }
    
    // Map the daily trends data to get day numbers and amounts
    const labels = dailyTrends.map(item => `Day ${item.day}`);
    const data = dailyTrends.map(item => item.totalAmount);
    const ctx = dailyChartRef.current.getContext('2d');

    dailyChartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Daily Spending',
          data,
          backgroundColor: '#4CAF50',
          borderColor: '#ffffff',
          borderWidth: 1,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          x: {
            grid: {
              display: false
            }
          },
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return `₹${value}`;
              }
            }
          }
        }
      },
    });

    return () => {
      if (dailyChartInstance.current) {
        dailyChartInstance.current.destroy();
      }
    };
  }, [dailyTrends]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Monthly Spending Summary</h3>
        <div className="h-64">
          <canvas ref={monthlyChartRef}></canvas>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Daily Trends</h3>
          <div className="relative inline-block text-gray-700">
            <select
              value={`${activeMonth.year}-${activeMonth.month}`}
              onChange={handleMonthChange}
              className="appearance-none block w-full px-4 py-2 pr-8 leading-tight bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 text-sm"
            >
              {monthlySummary.map(item => (
                <option key={item.month} value={`${item.year}-${item.month}`}>
                  {getMonthName(item.month)} {item.year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="h-64">
          {(!dailyTrends || dailyTrends.length === 0) ? (
            <div className="h-full flex items-center justify-center text-gray-400">
              No daily trends data available for this month.
            </div>
          ) : (
            <canvas ref={dailyChartRef}></canvas>
          )}
        </div>
      </div>
    </div>
  );
};

export default Charts;