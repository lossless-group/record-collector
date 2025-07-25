'use client';

import { useState } from 'react';
import { Settings, Key, FileText, Zap, Eye, EyeOff, Plus, X } from 'lucide-react';
import { useRecordStore } from '../lib/store';

export default function PerplexityConfig() {
  const [showApiKey, setShowApiKey] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [newProperty, setNewProperty] = useState('');
  
  const { 
    perplexityConfig, 
    updatePerplexityConfig, 
    availableFields 
  } = useRecordStore();
  
  const handleConfigChange = (key, value) => {
    updatePerplexityConfig({ [key]: value });
  };

  const addCustomProperty = () => {
    if (newProperty.trim() && !perplexityConfig.customProperties?.includes(newProperty.trim())) {
      const updatedProperties = [...(perplexityConfig.customProperties || []), newProperty.trim()];
      handleConfigChange('customProperties', updatedProperties);
      setNewProperty('');
    }
  };

  const removeCustomProperty = (propertyToRemove) => {
    const updatedProperties = perplexityConfig.customProperties?.filter(prop => prop !== propertyToRemove) || [];
    handleConfigChange('customProperties', updatedProperties);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addCustomProperty();
    }
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
            value={perplexityConfig.apiKey}
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
            onClick={() => handleConfigChange('useDeepResearch', !perplexityConfig.useDeepResearch)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              perplexityConfig.useDeepResearch ? 'bg-purple-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                perplexityConfig.useDeepResearch ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-900">
            Model Selection
          </label>
          <select
            value={perplexityConfig.selectedModel || 'sonar'}
            onChange={(e) => handleConfigChange('selectedModel', e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white text-gray-900"
          >
            <option value="sonar">Sonar (Default)</option>
            <option value="sonar-reasoning">Sonar Reasoning</option>
            <option value="sonar-deep-research">Sonar Deep Research</option>
            <option value="sonar-pro">Sonar Pro</option>
          </select>
          <p className="text-xs text-gray-500">
            Choose the AI model for research and analysis
          </p>
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
              value={perplexityConfig.prompt}
              onChange={(e) => handleConfigChange('prompt', e.target.value)}
              rows={8}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors font-mono text-sm"
              placeholder="Enter your custom prompt with placeholders like {{name}}, {{industry}}, etc."
            />
            
            <div className="bg-gray-50 rounded-lg p-3">
              <h4 className="text-xs font-medium text-gray-700 mb-2">Available Placeholders:</h4>
              {availableFields.length > 0 ? (
                <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                  {availableFields.map(field => (
                    <code key={field} className="bg-white px-1 py-0.5 rounded">&#123;&#123;{field}&#125;&#125;</code>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">Import a CSV file to see available fields</p>
              )}
              
              {/* Custom Properties Placeholders */}
              {perplexityConfig.customProperties && perplexityConfig.customProperties.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <h5 className="text-xs font-medium text-gray-700 mb-2">Custom Properties (will be generated):</h5>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-600">
                    {perplexityConfig.customProperties.map(property => (
                      <code key={property} className="bg-purple-100 px-1 py-0.5 rounded text-purple-700">&#123;&#123;{property}&#125;&#125;</code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Custom Properties Section */}
      <div className="space-y-3 border-t border-gray-200 pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <label className="block text-sm font-medium text-gray-700">
              Custom Properties to Generate
            </label>
          </div>
        </div>
        
        <p className="text-xs text-gray-500">
          Add properties you want the AI to research and generate for each record
        </p>

        {/* Add New Property */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newProperty}
            onChange={(e) => setNewProperty(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="e.g., profit, market_share, employee_count"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-500"
          />
          <button
            onClick={addCustomProperty}
            disabled={!newProperty.trim()}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Custom Properties List */}
        {perplexityConfig.customProperties && perplexityConfig.customProperties.length > 0 && (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700">Properties to generate:</h5>
            <div className="space-y-1">
              {perplexityConfig.customProperties.map((property, index) => (
                <div key={index} className="flex items-center justify-between bg-purple-50 border border-purple-200 rounded-lg px-3 py-2">
                  <code className="text-xs text-purple-700">&#123;&#123;{property}&#125;&#125;</code>
                  <button
                    onClick={() => removeCustomProperty(property)}
                    className="text-purple-500 hover:text-purple-700 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs text-blue-800">
            <strong>How it works:</strong> The AI will research each record and return the custom properties in a structured format. 
            You can reference these properties in your prompt using &#123;&#123;property_name&#125;&#125; placeholders.
          </p>
        </div>
      </div>

      {/* Status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            perplexityConfig.apiKey 
              ? 'bg-green-100 text-green-800' 
              : 'bg-yellow-100 text-yellow-800'
          }`}>
            {perplexityConfig.apiKey ? 'Ready' : 'API Key Required'}
          </span>
        </div>
      </div>
    </div>
  );
} 