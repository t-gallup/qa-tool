import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { FileUp } from 'lucide-react';

interface DropzoneProps {
  onFileUpload: (files: File[]) => void;
}

export const Dropzone: React.FC<DropzoneProps> = ({ onFileUpload }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    onFileUpload(acceptedFiles);
  }, [onFileUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    }
  });

  return (
    <div 
      {...getRootProps()} 
      className={`
        p-8 border-2 border-dashed rounded-lg text-center cursor-pointer 
        ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-500'}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center">
        <FileUp className="w-12 h-12 text-gray-500 mb-4" />
        <p className="text-gray-600">
          {isDragActive 
            ? 'Drop the research paper here' 
            : 'Drag and drop a research paper, or click to select'}
        </p>
        <p className="text-sm text-gray-500 mt-2">
          Supports PDF, TXT, DOC, DOCX
        </p>
      </div>
    </div>
  );
};