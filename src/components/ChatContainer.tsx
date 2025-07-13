import { useState } from 'react';
import { ClaudeChat } from './ClaudeChat';

const CLAUDE_MODELS = [
  {
    id: 'claude-3-opus-20240229',
    name: 'Claude 3 Opus',
    description: 'Most capable model, ideal for complex tasks',
  },
  {
    id: 'claude-3-sonnet-20240229',
    name: 'Claude 3 Sonnet',
    description: 'Balanced performance and speed',
  },
  {
    id: 'claude-3-haiku-20240229',
    name: 'Claude 3 Haiku',
    description: 'Fastest responses, good for simpler tasks',
  },
];

interface ApiKeyConfig {
  key: string;
  saved: boolean;
}

export function ChatContainer() {
  const [apiKey, setApiKey] = useState<ApiKeyConfig>(() => {
    const savedKey = localStorage.getItem('claude_api_key');
    return savedKey ? { key: savedKey, saved: true } : { key: '', saved: false };
  });

  const [selectedModel, setSelectedModel] = useState(CLAUDE_MODELS[0].id);
  const [showConfig, setShowConfig] = useState(!apiKey.saved);

  const handleSaveApiKey = () => {
    if (apiKey.key) {
      localStorage.setItem('claude_api_key', apiKey.key);
      setApiKey(prev => ({ ...prev, saved: true }));
      setShowConfig(false);
    }
  };

  const handleResetApiKey = () => {
    localStorage.removeItem('claude_api_key');
    setApiKey({ key: '', saved: false });
    setShowConfig(true);
  };

  if (showConfig) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Configure Claude AI</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                API Key
              </label>
              <input
                type="password"
                value={apiKey.key}
                onChange={(e) => setApiKey({ key: e.target.value, saved: false })}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your Claude API key"
              />
              <p className="text-sm text-gray-500 mt-1">
                Your API key is stored locally and never sent to any server except Claude AI.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Model
              </label>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {CLAUDE_MODELS.map(model => (
                  <option key={model.id} value={model.id}>
                    {model.name} - {model.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={handleSaveApiKey}
                disabled={!apiKey.key}
                className={`px-4 py-2 rounded-lg text-white ${
                  apiKey.key
                    ? 'bg-blue-500 hover:bg-blue-600'
                    : 'bg-gray-400 cursor-not-allowed'
                }`}
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-2 flex justify-between items-center bg-gray-50">
        <div className="flex items-center space-x-4">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value)}
            className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {CLAUDE_MODELS.map(model => (
              <option key={model.id} value={model.id}>
                {model.name}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowConfig(true)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Settings
          </button>
        </div>
        <button
          onClick={handleResetApiKey}
          className="text-sm text-red-600 hover:text-red-700"
        >
          Reset API Key
        </button>
      </div>

      <div className="flex-1">
        <ClaudeChat apiKey={apiKey.key} model={selectedModel} />
      </div>
    </div>
  );
}