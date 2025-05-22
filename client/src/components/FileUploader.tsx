import React, { useRef, useState } from 'react';
import { useTheme } from '../ThemeContext';

interface FileUploaderProps {
  onFileRead: (file: { content: string; filename: string }) => void;
}

const ACCEPTED = '.js,.ts,.java,.py,.c,.cpp';

const FileUploader: React.FC<FileUploaderProps> = ({ onFileRead }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const { theme } = useTheme();

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      onFileRead({ content: e.target?.result as string, filename: file.name });
      setFilename(file.name);
    };
    reader.readAsText(file);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`border-2 border-dashed rounded p-4 text-center cursor-pointer transition-colors ${dragActive
        ? (theme === 'dark' ? 'border-blue-400 bg-gray-700' : 'border-blue-400 bg-blue-50')
        : (theme === 'dark' ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-gray-50')}`}
      onClick={() => inputRef.current?.click()}
      onDragOver={e => { e.preventDefault(); setDragActive(true); }}
      onDragLeave={() => setDragActive(false)}
      onDrop={handleDrop}
      tabIndex={0}
      role="button"
      aria-label="Upload code file"
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED}
        className="hidden"
        onChange={handleChange}
      />
      <div className="flex flex-col items-center justify-center gap-2">
        <span className={theme === 'dark' ? 'text-gray-200 font-medium' : 'text-gray-700 font-medium'}>Drag & drop or <span className={theme === 'dark' ? 'underline text-blue-400' : 'underline text-blue-600'}>Browse</span></span>
        <span className="text-xs text-gray-500">Accepted: .js, .ts, .java, .py, .c, .cpp</span>
        {filename && <span className={theme === 'dark' ? 'mt-2 text-sm text-green-400' : 'mt-2 text-sm text-green-600'}>{filename}</span>}
      </div>
    </div>
  );
};

export default FileUploader; 