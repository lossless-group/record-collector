import { useState, useRef } from 'react';
import { X, Upload, FileText, AlertCircle, CheckCircle, Database } from 'lucide-react';
import { parseCSV } from '../lib/csvParser';
import { useRecordStore } from '../lib/store';

export default function ImportModal({ isOpen, onClose }) {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSource, setImportSource] = useState('csv'); // 'csv' or 'database'
  const fileInputRef = useRef(null);
  const replaceAllRecords = useRecordStore(state => state.replaceAllRecords);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
      setError('Please select a valid CSV file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target.result;
        const records = parseCSV(csvText);
        setPreview(records.slice(0, 3)); // Show first 3 records as preview
      } catch (err) {
        setError(err.message);
        setPreview(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (importSource === 'csv' && !file) return;

    setIsImporting(true);
    try {
      if (importSource === 'csv') {
        const reader = new FileReader();
        reader.onload = (e) => {
          const csvText = e.target.result;
          const records = parseCSV(csvText);
          replaceAllRecords(records);
          onClose();
          setFile(null);
          setPreview(null);
          setError(null);
        };
        reader.readAsText(file);
      } else if (importSource === 'database') {
        // Dummy implementation for remote database import
        // This will be implemented later
        setError('Remote database import functionality coming soon!');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsImporting(false);
    }
  };

  const resetModal = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    setDragActive(false);
    setImportSource('csv');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Import Records</h2>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* Import Source Selection */}
          <div className="flex gap-4">
            <button
              onClick={() => setImportSource('csv')}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                importSource === 'csv'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <Upload className="w-5 h-5" />
              <span className="font-medium">CSV File</span>
            </button>
            <button
              onClick={() => setImportSource('database')}
              className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-lg border-2 transition-colors ${
                importSource === 'database'
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 hover:border-gray-400 text-gray-700'
              }`}
            >
              <Database className="w-5 h-5" />
              <span className="font-medium">Remote Database</span>
            </button>
          </div>

          {/* Instructions */}
          {importSource === 'csv' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-900 mb-2">CSV Requirements</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Must include a "name" column</li>
                <li>• First row should contain column headers</li>
                <li>• Supports quoted fields with commas</li>
                <li>• Numbers will be automatically converted</li>
              </ul>
            </div>
          )}

          {importSource === 'database' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-medium text-purple-900 mb-2">Remote Database Import</h3>
              <p className="text-sm text-purple-800">
                Connect to your remote database to import records directly. This feature is coming soon!
              </p>
            </div>
          )}

          {/* Import Area */}
          {importSource === 'csv' && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              
              {!file ? (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      Drop your CSV file here
                    </p>
                    <p className="text-gray-500 mb-4">
                      or click to browse files
                    </p>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Choose File
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <FileText className="w-12 h-12 text-green-500 mx-auto" />
                  <div>
                    <p className="text-lg font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-800 text-sm"
                  >
                    Choose different file
                  </button>
                </div>
              )}
            </div>
          )}

          {importSource === 'database' && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <div className="space-y-4">
                <Database className="w-12 h-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    Connect to Remote Database
                  </p>
                  <p className="text-gray-500 mb-4">
                    Import records directly from your database
                  </p>
                  <button
                    onClick={() => setError('Remote database import functionality coming soon!')}
                    className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Connect Database
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Preview */}
          {preview && !error && (
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Preview (first 3 records)</h3>
              <div className="space-y-2">
                {preview.map((record, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{record.name}</p>
                      <p className="text-sm text-gray-600">
                        {record.industry} • {record.size} • {record.location}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 flex-shrink-0">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={(importSource === 'csv' && !file) || error || isImporting}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isImporting ? 'Importing...' : 'Import Records'}
          </button>
        </div>
      </div>
    </div>
  );
} 