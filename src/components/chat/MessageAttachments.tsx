import React from 'react';
import { FileMetadata } from '../../hooks/useFileAttachment';
import FilePreview from '../FilePreview';

interface MessageAttachmentsProps {
  attachments: FileMetadata[];
  onDownload?: (attachment: FileMetadata) => void;
  className?: string;
}

export const MessageAttachments: React.FC<MessageAttachmentsProps> = ({
  attachments,
  onDownload,
  className = '',
}) => {
  if (!attachments.length) return null;

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="cursor-pointer"
          onClick={() => onDownload?.(attachment)}
        >
          <FilePreview
            metadata={attachment}
            className="w-24 h-24 hover:ring-2 hover:ring-blue-500 transition-all"
          />
        </div>
      ))}
    </div>
  );
};

export default MessageAttachments;