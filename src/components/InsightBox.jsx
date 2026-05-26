import React from 'react';
import { Lightbulb } from 'lucide-react';

const InsightBox = ({ text }) => {
  return (
    <div className="insight-box">
      <Lightbulb className="insight-icon" size={24} />
      <div className="insight-content">
        <strong>Insight Analítico:</strong> {text}
      </div>
    </div>
  );
};

export default InsightBox;
