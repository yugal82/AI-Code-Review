import React from 'react';
import { Diff, Hunk, parseDiff } from 'react-diff-view';
import 'react-diff-view/style/index.css';
import { createTwoFilesPatch } from 'diff';
import { useTheme } from '../ThemeContext';

interface DiffViewerProps {
  original: string;
  refactored: string;
}

const DiffViewer: React.FC<DiffViewerProps> = ({ original, refactored }) => {
  const { theme } = useTheme();
  if (original === refactored) {
    return <div className="text-gray-500">No changes in refactored code.</div>;
  }

  const diffText = createTwoFilesPatch('Original', 'Refactored', original, refactored);
  const files = parseDiff(diffText);

  return (
    <div className={`overflow-x-auto border rounded my-4 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      {files.map(file => (
        <Diff key={file.newPath} viewType="split" diffType="modify" hunks={file.hunks}>
          {hunks => hunks.map(hunk => <Hunk key={hunk.content} hunk={hunk} />)}
        </Diff>
      ))}
    </div>
  );
};

export default DiffViewer;