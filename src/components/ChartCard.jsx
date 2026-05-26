import React from 'react';

const ChartCard = ({ title, children, action }) => {
  return (
    <div className="card chart-card">
      <div className="chart-header">
        <div className="chart-title">{title}</div>
        {action && <div>{action}</div>}
      </div>
      <div className="chart-wrapper">
        {children}
      </div>
    </div>
  );
};

export default ChartCard;
