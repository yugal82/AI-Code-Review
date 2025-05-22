import React from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import SubmissionForm from './components/SubmissionForm';
import SubmissionDetailPage from './components/SubmissionDetailPage';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { ThemeProvider, useTheme } from './ThemeContext';

const AppContent: React.FC = () => {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className={`w-[100%] min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} overflow-hidden`}>
      <header className={`w-full flex items-center justify-between px-6 py-4 shadow ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
        <Link to="/" className={`text-2xl font-bold tracking-tight text-[#646cff]`}>
          AI Code Review
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex gap-4">
            <Link
              to="/"
              className={`font-medium ${location.pathname === '/' ? (theme === 'dark' ? 'text-blue-400' : 'text-blue-600') : (theme === 'dark' ? 'text-gray-300' : 'text-gray-700')}`}
            >
              Home
            </Link>
          </nav>
          <button
            aria-label="Toggle theme"
            className={`rounded p-2 cursor-pointer border transition outline-none ${theme === 'dark' ? ' border-gray-600' : 'border-gray-300'}`}
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <SunIcon className="h-4 w-4 text-white" />
            ) : (
              <MoonIcon className="h-4 w-4 text-gray-600" />
            )}
          </button>
        </div>
      </header>
      <main className="w-full mx-auto p-4">
        <Routes>
          <Route path="/" element={<SubmissionForm />} />
          <Route path="/submission/:id" element={<SubmissionDetailPage />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <ThemeProvider>
    <AppContent />
  </ThemeProvider>
);

export default App;
