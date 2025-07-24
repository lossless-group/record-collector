'use client';

import { useState } from 'react';
import { Settings, Key, FileText, Zap, Eye, EyeOff } from 'lucide-react';

export default function PerplexityConfig({ config, onConfigChange }) {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleConfigChange = (key, value) => {
    onConfigChange({
      ...config,
      [key]: value
    });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">Perplexity AI</h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* API Key */}
      <div className="space-y-3 mb-6">
        <label className="block text-sm font-medium text-gray-700">
          API Key
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Key className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type={showApiKey ? 'text' : 'password'}
            value={config.apiKey}
            onChange={(e) => handleConfigChange('apiKey', e.target.value)}
            placeholder="Enter your Perplexity API key"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
          />
          <button
            type="button"
            onClick={() => setShowApiKey(!showApiKey)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            {showApiKey ? (
              <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            ) : (
              <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500">
          Get your API key from{' '}
          <a 
            href="https://www.perplexity.ai/settings/api" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 underline"
          >
            Perplexity AI settings
          </a>
        </p>
      </div>

      {/* Feature Toggles */}
      <div className="space-y-4 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Deep Research</h3>
            <p className="text-xs text-gray-500">Enable comprehensive research mode</p>
          </div>
          <button
            onClick={() => handleConfigChange('useDeepResearch', !config.useDeepResearch)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.useDeepResearch ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.useDeepResearch ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-900">Sonar Pro</h3>
            <p className="text-xs text-gray-500">Use advanced Sonar Pro model</p>
          </div>
          <button
            onClick={() => handleConfigChange('useSonarPro', !config.useSonarPro)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              config.useSonarPro ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                config.useSonarPro ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Prompt Editor */}
      {isExpanded && (
        <div className="space-y-3 border-t border-gray-200 pt-6">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Custom Prompt
            </label>
          </div>
          
          <div className="space-y-2">
            <textarea
              value={config.prompt}
              onChange={(e) => handleConfigChange('prompt', e.target.value)}
              rows={8}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors font-mono text-sm"
              placeholder="Enter your custom prompt with placeholders like {name}, {industry}, etc."
            />
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Available Placeholders:</h4>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                <code className="bg-white px-1 py-0.5 rounded">&#123;name&#125;</code>
                <code className="bg-white px-1 py-0.5 rounded">&#123;industry&#125;</code>
                <code className="bg-white px-1 py-0.5 rounded">&#123;size&#125;</code>
                <code className="bg-white px-1 py-0.5 rounded">&#123;location&#125;</code>
                <code className="bg-white px-1 py-0.5 rounded">&#123;annual_revenue&#125;</code>
                <code className="bg-white px-1 py-0.5 rounded">&#123;website&#125;</code>
                <code className="bg-white px-1 py-0.5 rounded">&#123;contact_email&#125;</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            config.apiKey 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {config.apiKey ? 'Ready' : 'API Key Required'}
          </span>
        </div>
      </div>
    </div>
  );
} 