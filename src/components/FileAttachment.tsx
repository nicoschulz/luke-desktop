import React from 'react';
import { useFileAttachment, FileMetadata } from '../hooks/useFileAttachment';

interface FileAttachmentProps {
  projectId: string;
  chatId?: string;
  onAttach?: (metadata: FileMetadata) => void;
  onDelete?: (fileId: string) => void;
  className?: string;
}

export const FileAttachment: React.FC<FileAttachmentProps> = ({
  projectId,
  chatId,
  onAttach,
  onDelete,
  className = '',
}) => {
  const { uploadFile, deleteFile, isUploading, error } = useFileAttachment(projectId, chatId);

  const handleUpload = async () => {
    const metadata = await uploadFile();
    if (metadata && onAttach) {
      onAttach(metadata);
    }
  };

  const handleDelete = async (fileId: string) => {
    const success = await deleteFile(fileId);
    if (success && onDelete) {
      onDelete(fileId);
    }
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isUploading ? (
          <>
            <svg
              className="w-4 h-4 mr-2 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Uploading...
          </>
        ) : (
          <>
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Attach File
          </>
        )}
      </button>
      
      {error && (
        <div className="p-4 text-sm text-red-700 bg-red-100 rounded-md">
          {error}
        </div>
      )}
    </div>
  );
};

export default FileAttachment;
