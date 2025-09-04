import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

const Charts = ({ monthlySummary }) => {
  const monthlyChartRef = useRef(null);
  const chartInstance = useRef(null);
  const [activeMonth, setActiveMonth] = useState(8);

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy();  
    }

    const labels = monthlySummary.map(item => `Month ${item._id}`);
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Monthly Spending Summary</h3>
        <div className="h-64">
          <canvas ref={monthlyChartRef}></canvas>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Daily Trends (Coming Soon)</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">
          Bar chart functionality will be implemented here.
        </div>
      </div>
    </div>
  );
};

export default Charts;
