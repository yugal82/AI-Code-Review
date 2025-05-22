import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import EditorContainer from './EditorContainer';
import FeedbackPanel, { type Feedback } from './FeedbackPanel';
import RefactorButton from './RefactorButton';
import DiffViewer from './DiffViewer';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

const API_BASE = 'http://localhost:3000/api';

const POLL_INTERVAL = 2000;

const SubmissionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [code, setCode] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);
  const [refactorLoading, setRefactorLoading] = useState(false);
  const [refactorError, setRefactorError] = useState<string | null>(null);
  const [refactored, setRefactored] = useState<string | null>(null);
  const [improvements, setImprovements] = useState<string[]>([]);
  const { theme } = useTheme();

  // Fetch submission code
  useEffect(() => {
    if (!id) return;
    axios.get(`${API_BASE}/submissions/${id}`)
      .then(res => setCode(res.data.data.code))
      .catch(() => setCode(''));
  }, [id]);

  // Poll for feedback
  useEffect(() => {
    if (!id) return;
    let active = true;
    setFeedbackLoading(true);
    setFeedbackError(null);
    const poll = async () => {
      try {
        const res = await axios.post(`${API_BASE}/review/${id}`);
        if (active && res.data) {
          setFeedback(res.data.categories);
          setFeedbackLoading(false);
        }
      } catch (err: any) {
        if (active) {
          setFeedbackError('Waiting for AI feedback...');
          setTimeout(poll, POLL_INTERVAL);
        }
      }
    };
    poll();
    return () => { active = false; };
  }, [id]);

  // Refactor handler
  const handleRefactor = useCallback(async () => {
    if (!id) return;
    setRefactorLoading(true);
    setRefactorError(null);
    try {
      const res = await axios.post(`${API_BASE}/refactor/${id}`);
      setRefactored(res.data.refactored);
      setImprovements(res.data.improvements || []);
    } catch (err: any) {
      setRefactorError('Refactor failed.');
    } finally {
      setRefactorLoading(false);
    }
  }, [id]);

  return (
    <div className={`mx-auto p-6 mt-8 rounded-lg shadow border flex flex-col gap-8 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div>
        <h2 className={`text-xl font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Submitted Code</h2>
        <EditorContainer value={code} onChange={() => {}} />
      </div>
      <FeedbackPanel feedback={feedback} loading={feedbackLoading} error={feedbackError} />
      <div className="mt-8">
        <RefactorButton onRefactor={handleRefactor} loading={refactorLoading} disabled={!code} />
        {refactorError && <div className="text-red-500 mt-2">{refactorError}</div>}
        {refactored && (
          <>
            <h3 className={`text-lg font-semibold mt-6 mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Refactored Code Diff</h3>
            <DiffViewer original={code} refactored={refactored} />
            {improvements?.length > 0 && (
              <div className="mt-4">
                <h4 className={`font-semibold mb-2 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-800'}`}>Key Improvements</h4>
                <ul className="list-disc ml-6 space-y-1">
                  {improvements?.map((imp, i) => (
                    <li key={i} className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}>{imp}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SubmissionDetailPage; 