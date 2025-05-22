import React from 'react';
import FeedbackCategory from './FeedbackCategory';

export interface Feedback {
  style: string[];
  performance: string[];
  security: string[];
}

interface FeedbackPanelProps {
  feedback: Feedback | null;
  loading: boolean;
  error?: string | null;
}

const FeedbackPanel: React.FC<FeedbackPanelProps> = ({ feedback, loading, error }) => {
  if (loading) return <div className="text-blue-500">Analyzing code...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!feedback) return null;

  return (
    <div className="space-y-4 mt-4">
      <FeedbackCategory title="Style & Readability" items={feedback.style} />
      <FeedbackCategory title="Performance" items={feedback.performance} />
      <FeedbackCategory title="Security" items={feedback.security} />
    </div>
  );
};

export default FeedbackPanel; 