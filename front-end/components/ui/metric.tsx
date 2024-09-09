import React from 'react';

interface MetricProps {
  value: number | string;
  label: string;
}

const Metric: React.FC<MetricProps> = ({ value, label }) => {
  return (
    <div>
      <div className="text-4xl font-bold">{value}</div>
      <div className="text-gray-500 text-sm">{label}</div>
    </div>
  );
};

export default Metric;