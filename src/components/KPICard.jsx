import React from 'react';

const KPICard = ({ title, value, change, changeType, icon }) => {
  return (
    <div className="card kpi-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div className="kpi-title">{title}</div>
        {icon && <div style={{ color: 'var(--accent-primary)' }}>{icon}</div>}
      </div>
      <div className="kpi-value">{value}</div>
      {change && (
        <div className={`kpi-change ${changeType || 'neutral'}`}>
          {changeType === 'positive' ? '↑' : changeType === 'negative' ? '↓' : '•'} {change}
        </div>
      )}
    </div>
  );
};

export default KPICard;
