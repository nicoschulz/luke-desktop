import { useConversationAttachments } from '../../hooks/useConversationAttachments';
import FileAttachment from '../FileAttachment';

interface ConversationAttachmentsProps {
  projectId: string;
  chatId: string;
}

export function ConversationAttachments({ projectId, chatId }: ConversationAttachmentsProps) {
  const { attachments, loading, error } = useConversationAttachments(chatId);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading attachments: {error}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Attachments</h3>
        <FileAttachment
          projectId={projectId}
          chatId={chatId}
          className="w-full"
        />
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          {attachments.map((attachment) => (
            <div key={attachment.id} className="flex items-center justify-between p-2 border rounded">
              <span>{attachment.name}</span>
              <span className="text-sm text-gray-500">
                {attachment.size} bytes
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ConversationAttachments;