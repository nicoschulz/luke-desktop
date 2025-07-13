import React from 'react';

interface MessageListProps {
  messages: any[];
}

export const MessageList: React.FC<MessageListProps> = ({ 
  messages, 
}) => {
  return (
    <div className="message-list">
      {messages.map((message, index) => (
        <div key={index} className="message">
          {message.content}
        </div>
      ))}
    </div>
  );
};
