import React from 'react';

const MetricCard = ({ title, value, unit }) => {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h3 className="text-base font-medium text-gray-500">{title}</h3>
      <p className="mt-2 text-3xl font-bold text-gray-900">
        {unit}
        {value}
      </p>
    </div>
  );
};

export default MetricCard;
