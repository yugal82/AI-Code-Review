import React, { useRef, useEffect, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from '../ThemeContext';

interface EditorContainerProps {
  value: string;
  onChange: (code: string) => void;
}

const EditorContainer: React.FC<EditorContainerProps> = ({ value, onChange }) => {
  const debounceRef = useRef<number | undefined>(undefined);
  const lastValue = useRef(value);
  const { theme } = useTheme();

  // Debounced onChange
  const handleChange = useCallback((newValue: string | undefined) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (typeof newValue === 'string' && newValue !== lastValue.current) {
        lastValue.current = newValue;
        onChange(newValue);
      }
    }, 300);
  }, [onChange]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  return (
    <div className={`rounded border overflow-hidden ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <MonacoEditor
        height="400px"
        value={value}
        onChange={handleChange}
        theme={theme === 'dark' ? 'vs-dark' : 'light'}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        }}
        defaultLanguage="javascript"
      />
    </div>
  );
};

export default EditorContainer; 