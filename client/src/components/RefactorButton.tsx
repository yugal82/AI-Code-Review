import React from 'react';
import { useTheme } from '../ThemeContext';

interface RefactorButtonProps {
  onRefactor: () => Promise<void>;
  loading: boolean;
  disabled?: boolean;
}

const RefactorButton: React.FC<RefactorButtonProps> = ({ onRefactor, loading, disabled }) => {
  const { theme } = useTheme();
  return (
    <button
      style={{backgroundColor: theme === 'dark' ? '#1e2939' : 'white', borderColor: '#1447e6'}}
      className={`w-[25%] font-semibold px-6 py-2 rounded border transition text-blue-700 cursor-pointer`}
      onClick={onRefactor}
      disabled={loading || disabled}
    >
      {loading && (
        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
        </svg>
      )}
      Refactor Code
    </button>
  );
};

export default RefactorButton; 