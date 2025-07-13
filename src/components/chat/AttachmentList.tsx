import React from 'react';

interface AttachmentListProps {
  attachments: any[];
}

export const AttachmentList: React.FC<AttachmentListProps> = ({ attachments }) => {
  return (
    <div className="attachment-list">
      {attachments.map((attachment, index) => (
        <div key={index} className="attachment">
          {attachment.name}
        </div>
      ))}
    </div>
  );
};
