import React from 'react';

interface MessageInputProps {
  onSend?: (message: string) => void;
  onSendMessage?: (content: string) => Promise<void>;
}

export const MessageInput: React.FC<MessageInputProps> = ({ onSend, onSendMessage }) => {
  const [input, setInput] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSend?.(input);
      onSendMessage?.(input);
      setInput('');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type a message..."
      />
      <button type="submit">Send</button>
    </form>
  );
};
