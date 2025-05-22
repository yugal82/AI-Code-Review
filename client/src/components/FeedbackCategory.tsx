import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/solid';
import { useTheme } from '../ThemeContext';

interface FeedbackCategoryProps {
  title: string;
  items: string[];
}

const FeedbackCategory: React.FC<FeedbackCategoryProps> = ({ title, items }) => {
  const [open, setOpen] = useState(true);
  const { theme } = useTheme();

  return (
    <div className={`rounded shadow border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-100 border-gray-200'}`}>
      <button
        className={`w-full flex items-center justify-between px-4 py-2 text-left font-semibold focus:outline-none ${theme === 'dark' ? 'text-gray-100' : 'text-gray-800'}`}
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{title}</span>
        {open ? <ChevronUpIcon className="h-5 w-5" /> : <ChevronDownIcon className="h-5 w-5" />}
      </button>
      <div
        className={`transition-all duration-300 px-4 pb-2 ${open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}
      >
        <ul className="list-disc ml-6 space-y-1">
          {items.length === 0 ? (
            <li className="text-gray-400">No feedback</li>
          ) : (
            items.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: item }} className={theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} />
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default FeedbackCategory; 