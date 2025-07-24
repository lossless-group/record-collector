'use client';

import { useState } from 'react';
import { Upload, CheckCircle, Circle, Send, Database, Users, Zap, ExternalLink, Download } from 'lucide-react';
import { useRecordStore } from '../lib/store';
import RecordCard from './RecordCard';

export default function ExportPage() {
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isPushing, setIsPushing] = useState(false);
  const [pushStatus, setPushStatus] = useState(null);

  const { records, availableFields } = useRecordStore();

  const handleSelectRecord = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleSelectAll = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map(record => record.id));
    }
  };

  const handlePushToRemote = async () => {
    if (selectedRecords.length === 0) return;

    setIsPushing(true);
    setPushStatus('pushing');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setPushStatus('success');
    setIsPushing(false);

    // Reset status after 3 seconds
    setTimeout(() => setPushStatus(null), 3000);
  };

  const handleDownloadLocal = () => {
    if (selectedRecords.length === 0) return;

    const selectedRecordData = records.filter(record => 
      selectedRecords.includes(record.id)
    );

    // Get all unique custom property names from all selected records
    const allCustomProperties = selectedRecordData
      .flatMap(record => Object.keys(record.customProperties || {}))
      .filter((value, index, self) => self.indexOf(value) === index); // Remove duplicates

    // Create CSV header with all available fields plus custom properties plus augmentation fields
    const csvHeaders = [
      ...availableFields.map(field => field.toLowerCase().replace(/_/g, ' ')),
      ...allCustomProperties.map(prop => `ai ${prop.toLowerCase().replace(/_/g, ' ')}`),
      'has ai analysis',
      'last augmented', 
      'ai analysis'
    ];

    // Create CSV data rows
    const csvData = selectedRecordData.map(record => {
      // Get all available field values
      const fieldValues = availableFields.map(field => record[field] || '');
      
      // Get custom property values in the same order as headers
      const customPropertyValues = allCustomProperties.map(prop => 
        record.customProperties?.[prop] || ''
      );
      
      // Get augmentation data
      const augmentationValues = [
        record.augmentationResults ? 'Yes' : 'No',
        record.lastAugmented ? new Date(record.lastAugmented).toLocaleString() : '',
        record.augmentationResults || 'Not analyzed'
      ];

      return [...fieldValues, ...customPropertyValues, ...augmentationValues];
    });

    // Create CSV content with proper escaping
    const csvContent = [
      csvHeaders,
      ...csvData
    ].map(row => 
      row.map(field => {
        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        const escapedField = String(field).replace(/"/g, '""');
        if (escapedField.includes(',') || escapedField.includes('"') || escapedField.includes('\n')) {
          return `"${escapedField}"`;
        }
        return escapedField;
      }).join(',')
    ).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `records-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const augmentedRecords = records.filter(record => record.augmentationResults);
  const nonAugmentedRecords = records.filter(record => !record.augmentationResults);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Upload className="w-8 h-8 text-green-600" />
              <h2 className="ml-3 text-xl font-semibold text-gray-900">Export & Push to Remote</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handleSelectAll}
                className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
              >
                {selectedRecords.length === records.length ? (
                  <>
                    <Circle className="w-4 h-4" />
                    Deselect All
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Select All ({records.length})
                  </>
                )}
              </button>
              
              <button
                onClick={handleDownloadLocal}
                disabled={selectedRecords.length === 0}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedRecords.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Download className="w-4 h-4" />
                Download Local ({selectedRecords.length})
              </button>
              
              <button
                onClick={handlePushToRemote}
                disabled={selectedRecords.length === 0 || isPushing}
                className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg font-medium transition-colors ${
                  selectedRecords.length === 0 || isPushing
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {isPushing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Pushing...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Push to Remote ({selectedRecords.length})
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Status Message */}
      {pushStatus && (
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className={`flex items-center gap-2 text-sm ${
              pushStatus === 'success' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {pushStatus === 'success' ? (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Successfully pushed {selectedRecords.length} record{selectedRecords.length !== 1 ? 's' : ''} to remote!
                </>
              ) : (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Pushing {selectedRecords.length} record{selectedRecords.length !== 1 ? 's' : ''} to remote...
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Database className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Records</p>
                <p className="text-2xl font-bold text-gray-900">{records.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">AI Augmented</p>
                <p className="text-2xl font-bold text-gray-900">
                  {augmentedRecords.length} of {records.length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Selected for Export</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedRecords.length} of {records.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Records Display */}
        <div className="space-y-8">
          {/* AI Augmented Records */}
          {augmentedRecords.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-6 h-6 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Augmented Records ({augmentedRecords.length})
                </h3>
                <div className="ml-auto text-sm text-gray-500">
                  Ready for export with enhanced data
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {augmentedRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      selectedRecords.includes(record.id) 
                        ? 'ring-2 ring-green-500' 
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                    onClick={() => handleSelectRecord(record.id)}
                  >
                    <RecordCard
                      record={record}
                      onDelete={() => {}} // Disable delete in export mode
                      onSelect={() => handleSelectRecord(record.id)}
                      isSelected={selectedRecords.includes(record.id)}
                    />
                    <div className="absolute top-2 right-2">
                      {selectedRecords.includes(record.id) ? (
                        <CheckCircle className="w-6 h-6 text-green-600 bg-white rounded-full" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 bg-white rounded-full" />
                      )}
                    </div>
                    <div className="absolute top-2 left-2">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center border-2 border-white">
                        <Zap className="w-3 h-3 text-purple-600" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Non-Augmented Records */}
          {nonAugmentedRecords.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Database className="w-6 h-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">
                  Imported Records ({nonAugmentedRecords.length})
                </h3>
                <div className="ml-auto text-sm text-gray-500">
                  Basic data only - consider augmenting first
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {nonAugmentedRecords.map((record) => (
                  <div
                    key={record.id}
                    className={`relative cursor-pointer transition-all duration-200 ${
                      selectedRecords.includes(record.id) 
                        ? 'ring-2 ring-green-500' 
                        : 'hover:ring-2 hover:ring-gray-300'
                    }`}
                    onClick={() => handleSelectRecord(record.id)}
                  >
                    <RecordCard
                      record={record}
                      onDelete={() => {}} // Disable delete in export mode
                      onSelect={() => handleSelectRecord(record.id)}
                      isSelected={selectedRecords.includes(record.id)}
                    />
                    <div className="absolute top-2 right-2">
                      {selectedRecords.includes(record.id) ? (
                        <CheckCircle className="w-6 h-6 text-green-600 bg-white rounded-full" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 bg-white rounded-full" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {records.length === 0 && (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records available</h3>
              <p className="text-gray-600 mb-4">Import some records first to get started</p>
              <a
                href="/"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                Go to Record Collector
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 