import React from 'react';
import ReactDiffViewer, { DiffMethod } from 'react-diff-viewer';
import { useTheme } from '../ThemeContext';

interface DiffViewerProps {
  original: string;
  refactored: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ original, refactored }) => {
  const { theme } = useTheme();

  // Normalize line endings and ensure trailing newline for best diff results
  const normalize = (text: string) => {
    if (!text) return '';
    const withLF = text.replace(/\r\n/g, '\n');
    return withLF.endsWith('\n') ? withLF : withLF + '\n';
  };
  const oldValue = normalize(original);
  const newValue = normalize(refactored);

  if (oldValue === newValue) {
    return <div className="text-gray-500">No changes in refactored code.</div>;
  }

  return (
    <div
      className={`overflow-x-auto border rounded my-4 ${
        theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}
    >
      <ReactDiffViewer
        oldValue={oldValue}
        newValue={newValue}
        splitView={true}
        compareMethod={DiffMethod.LINES}
        useDarkTheme={theme === 'dark'}
        showDiffOnly={true}
        leftTitle="Original"
        rightTitle="Refactored"
        styles={{
          diffContainer: {
            background: 'inherit',
            fontFamily: 'monospace',
            fontSize: 14,
          },
        }}
      />
    </div>
  );
};

export default DiffViewer;
