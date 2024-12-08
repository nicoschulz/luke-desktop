import React, { useState, useEffect } from 'react';
import { FileMetadata } from '../../hooks/useFileAttachment';
import FileAttachment from '../FileAttachment';
import FilePreview from '../FilePreview';

interface ConversationAttachmentsProps {
  projectId: string;
  chatId: string;
  onAttachmentsChange?: (attachments: FileMetadata[]) => void;
  className?: string;
}

export const ConversationAttachments: React.FC<ConversationAttachmentsProps> = ({
  projectId,
  chatId,
  onAttachmentsChange,
  className = '',
}) => {
  const [attachments, setAttachments] = useState<FileMetadata[]>([]);

  const handleAttach = (metadata: FileMetadata) => {
    const newAttachments = [...attachments, metadata];
    setAttachments(newAttachments);
    onAttachmentsChange?.(newAttachments);
  };

  const handleDelete = (fileId: string) => {
    const newAttachments = attachments.filter(att => att.id !== fileId);
    setAttachments(newAttachments);
    onAttachmentsChange?.(newAttachments);
  };

  return (
    <div className={`flex flex-col gap-4 ${className}`}>
      <div className="flex flex-wrap gap-2">
        {attachments.map((attachment) => (
          <div key={attachment.id} className="relative">
            <FilePreview
              metadata={attachment}
              onDelete={() => handleDelete(attachment.id)}
              className="w-32 h-32"
            />
          </div>
        ))}
      </div>
      <FileAttachment
        projectId={projectId}
        chatId={chatId}
        onAttach={handleAttach}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default ConversationAttachments;