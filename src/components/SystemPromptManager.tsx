import React, { useState } from 'react';
import { useConversationContext } from '../hooks/useConversationContext';

interface SystemPromptManagerProps {
  onClose?: () => void;
}

export function SystemPromptManager({ onClose }: SystemPromptManagerProps) {
  const {
    currentContext,
    updateContext,
    createContext,
    contexts,
    deleteContext,
    switchContext,
  } = useConversationContext();

  const [newContextName, setNewContextName] = useState('');
  const [newSystemPrompt, setNewSystemPrompt] = useState('');
  const [editingPrompt, setEditingPrompt] = useState(
    currentContext?.systemPrompt || ''
  );

  const handleCreateContext = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContextName.trim()) return;

    const context = createContext(newContextName, newSystemPrompt);
    switchContext(context.id);
    setNewContextName('');
    setNewSystemPrompt('');
  };

  const handleUpdatePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentContext) return;

    updateContext({ systemPrompt: editingPrompt });
  };

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Create New Context</h2>
        <form onSubmit={handleCreateContext} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Context Name
            </label>
            <input
              type="text"
              value={newContextName}
              onChange={(e) => setNewContextName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter context name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              System Prompt
            </label>
            <textarea
              value={newSystemPrompt}
              onChange={(e) => setNewSystemPrompt(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
              placeholder="Enter system prompt"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Create Context
          </button>
        </form>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Manage Contexts</h2>
        <div className="space-y-4">
          {contexts.map((context) => (
            <div
              key={context.id}
              className={`p-4 border rounded-lg ${
                currentContext?.id === context.id
                  ? 'border-blue-500 bg-blue-50'
                  : ''
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium">{context.name}</h3>
                <div className="space-x-2">
                  <button
                    onClick={() => switchContext(context.id)}
                    className="px-3 py-1 text-sm bg-gray-100 rounded hover:bg-gray-200"
                  >
                    Switch
                  </button>
                  <button
                    onClick={() => deleteContext(context.id)}
                    className="px-3 py-1 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {currentContext?.id === context.id ? (
                <form onSubmit={handleUpdatePrompt} className="space-y-2">
                  <textarea
                    value={editingPrompt}
                    onChange={(e) => setEditingPrompt(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                    placeholder="Enter system prompt"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Update Prompt
                    </button>
                  </div>
                </form>
              ) : (
                <p className="text-gray-600 text-sm mt-2 whitespace-pre-wrap">
                  {context.systemPrompt || 'No system prompt set'}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {onClose && (
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}