'use client';

import { useState } from 'react';
import { X, Download, Copy, CheckCircle, Clock, FileText } from 'lucide-react';

export default function AugmentationResults({ results, onClose }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownloadAll = () => {
    const content = results.map(result => 
      `# Analysis for ${result.recordName}\n\n${result.result}\n\n---\n\n`
    ).join('');
    
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `augmentation-results-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Augmentation Results
            </h2>
            <p className="text-sm text-gray-600">
              {results.length} record{results.length !== 1 ? 's' : ''} analyzed
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={handleDownloadAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download All
          </button>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="max-h-[70vh] overflow-y-auto">
        {results.map((result, index) => (
          <div key={result.recordId} className="border-b border-gray-200 last:border-b-0">
            <div className="p-6">
              {/* Result Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {result.recordName}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(result.timestamp)}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleCopy(result.result, index)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {copiedIndex === index ? (
                    <>
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              {/* Result Content */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="prose prose-sm max-w-none">
                  <div 
                    className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                    dangerouslySetInnerHTML={{ 
                      __html: result.result
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                        .replace(/^## (.*$)/gm, '<h2 class="text-lg font-semibold text-gray-900 mt-4 mb-2">$1</h2>')
                        .replace(/^### (.*$)/gm, '<h3 class="text-base font-semibold text-gray-800 mt-3 mb-1">$1</h3>')
                        .replace(/^- (.*$)/gm, '<li class="ml-4">$1</li>')
                        .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-4">$1. $2</li>')
                        .replace(/\n\n/g, '<br><br>')
                        .replace(/\n/g, '<br>')
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Analysis completed using Perplexity AI
          </span>
          <span>
            {results.length} result{results.length !== 1 ? 's' : ''} generated
          </span>
        </div>
      </div>
    </div>
  );
} 