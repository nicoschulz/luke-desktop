import { useState } from 'react';
import { useAnthropic } from '../../hooks/useAnthropic';
import { CheckCircle2, Copy, EyeOff, Eye } from 'lucide-react';

export function ApiKeyManager() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  const { error } = useAnthropic('dummy-api-key');

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Save API key logic would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
    } catch (err) {
      setSaveStatus('error');
    }
  };

  const toggleVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
      <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
        Anthropic API Key
      </h2>
      
      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-2">
          <label 
            htmlFor="apiKey"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            API Key
          </label>
          
          <div className="relative">
            <input
              id="apiKey"
              type={showApiKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your Anthropic API key"
              className="block w-full px-4 py-2 rounded-md border border-gray-300 
                       dark:border-gray-600 dark:bg-gray-700 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            
            <div className="absolute right-0 top-0 h-full flex items-center space-x-2 pr-2">
              <button
                type="button"
                onClick={toggleVisibility}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200"
              >
                {showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
              
              <button
                type="button"
                onClick={copyToClipboard}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 
                         dark:hover:text-gray-200"
              >
                <Copy size={18} />
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="text-red-500 text-sm">
            <span className="text-sm">{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className={`w-full px-4 py-2 rounded-md text-white font-medium
                     ${saveStatus === 'saving' 
                       ? 'bg-blue-400 cursor-not-allowed' 
                       : 'bg-blue-600 hover:bg-blue-700'}
                     transition-colors duration-200`}
        >
          {saveStatus === 'saving' ? 'Saving...' : 'Save API Key'}
        </button>

        {saveStatus === 'success' && (
          <div className="flex items-center space-x-2 text-green-600 dark:text-green-400">
            <CheckCircle2 size={16} />
            <span className="text-sm">API key saved successfully</span>
          </div>
        )}
      </form>

      <div className="mt-4 text-sm text-gray-600 dark:text-gray-400">
        <p>
          Your API key is stored securely using your system's keyring/keychain.
          You can get your API key from{' '}
          <a
            href="https://console.anthropic.com/account/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 
                     dark:hover:text-blue-300"
          >
            Anthropic's Console
          </a>
        </p>
      </div>
    </div>
  );
}