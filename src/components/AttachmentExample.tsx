import React, { useState } from 'react';
import { FileAttachment } from './FileAttachment';
import { FilePreview } from './FilePreview';
import { FileMetadata } from '../hooks/useFileAttachment';

interface AttachmentExampleProps {
  projectId: string;
  chatId?: string;
}

export const AttachmentExample: React.FC<AttachmentExampleProps> = ({
  projectId,
  chatId,
}) => {
  const [attachments, setAttachments] = useState<FileMetadata[]>([]);

  const handleAttach = (metadata: FileMetadata) => {
    setAttachments(prev => [...prev, metadata]);
  };

  const handleDelete = (fileId: string) => {
    setAttachments(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="space-y-4">
      <FileAttachment
        projectId={projectId}
        chatId={chatId}
        onAttach={handleAttach}
        className="w-full"
      />

      {attachments.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">
            Attachments ({attachments.length})
          </h3>
          
          <div className="space-y-2">
            {attachments.map(file => (
              <FilePreview
                key={file.id}
                file={file}
                onDelete={handleDelete}
                className="w-full"
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentExample;