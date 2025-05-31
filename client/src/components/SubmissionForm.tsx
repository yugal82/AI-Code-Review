import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EditorContainer from './EditorContainer';
import FileUploader from './FileUploader';
import axios from 'axios';
import { useTheme } from '../ThemeContext';

const API_BASE = 'http://localhost:3000/api';

const MODEL_OPTIONS = [
  { label: 'Llama', value: 'llama' },
  { label: 'OpenAI', value: 'openai' },
];

const SubmissionForm: React.FC = () => {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model, setModel] = useState('llama');
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleFileRead = (file: { content: string; filename: string }) => {
    setCode(file.content);
    setFilename(file.filename);
  };

  const handleModelChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedModel = e.target.value;
    setModel(selectedModel);
    try {
      await axios.post(`${API_BASE}/set-model`, { model: selectedModel });
    } catch (err) {
      console.error('Error setting model:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(`${API_BASE}/submissions`, {
        code,
        filename,
      });
      const id = res.data?.data?.id;
      if (id) {
        navigate(`/submission/${id}`);
      } else {
        setError('Submission failed.');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      className={`w-full py-4 px-6 my-4 rounded-lg flex flex-col gap-6 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}
      onSubmit={handleSubmit}
    >
      <div className="flex items-center gap-1 w-full">
        <label htmlFor="llm-model" className={`text-lg mb-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'}`}>Choose your model</label>
        <select
          id="llm-model"
          value={model}
          onChange={handleModelChange}
          className={`rounded p-1 border outline-none transition ${
            theme === 'dark'
              ? 'bg-gray-900 border-gray-700 text-gray-100 focus:border-blue-500'
              : 'bg-white border-gray-300 text-gray-900 focus:border-blue-600'
          }`}
        >
          {MODEL_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>
      <p className="block text-md text-gray-800">The selected model is: {MODEL_OPTIONS.find(opt => opt.value === model)?.label}</p>
      <FileUploader onFileRead={handleFileRead} />
      <EditorContainer value={code} onChange={setCode} />
      <button
        type="submit"
        style={{backgroundColor: theme === 'dark' ? '#1e2939' : 'white', borderColor: '#1447e6'}}
        className={`w-full md:w-[25%] font-semibold px-6 py-2 rounded border transition text-blue-700 cursor-pointer`}
        disabled={!code.trim() || loading}
      >
        {loading ? 'Submitting...' : 'Submit for Review'}
      </button>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </form>
  );
};

export default SubmissionForm; 