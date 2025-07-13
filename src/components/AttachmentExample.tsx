import { useState } from 'react';
import FileAttachment from './FileAttachment';
import { FileMetadata } from '../hooks/useFileAttachment';

export function AttachmentExample() {
  const [attachments, setAttachments] = useState<FileMetadata[]>([]);

  const handleDelete = (fileId: string) => {
    setAttachments(prev => prev.filter(att => att.id !== fileId));
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">File Attachments</h2>
      
      <FileAttachment
        projectId="dummy-project"
        chatId="dummy-chat"
        className="mb-4"
      />

      <div className="space-y-2">
        <h3 className="font-medium">Attached Files:</h3>
        {attachments.map((attachment) => (
          <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
            <span>{attachment.name}</span>
            <button
              onClick={() => handleDelete(attachment.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}