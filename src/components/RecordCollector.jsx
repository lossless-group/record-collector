import { useState, useEffect } from 'react';
import { Upload, Search, Trash2, Database, Users } from 'lucide-react';
import { useRecordStore } from '../lib/store';
import RecordCard from './RecordCard';
import SearchBar from './SearchBar';
import ImportModal from './ImportModal';
import DeleteConfirmModal from './DeleteConfirmModal';

export default function RecordCollector() {
  const [searchTerm, setSearchTerm] = useState('');
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    records,
    selectedRecord,
    setSelectedRecord,
    deleteRecord,
    deleteAllRecords,
    availableFields
  } = useRecordStore();

  // Filter records based on search term
  const filteredRecords = records.filter(record =>
    record.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate statistics dynamically based on available fields
  const getFieldCounts = (fieldName) => {
    return records.reduce((acc, record) => {
      if (record[fieldName]) {
        acc[record[fieldName]] = (acc[record[fieldName]] || 0) + 1;
      }
      return acc;
    }, {});
  };

  // Try to find a location-like field for statistics
  const locationField = availableFields.find(field => 
    field.toLowerCase().includes('location') || 
    field.toLowerCase().includes('city') || 
    field.toLowerCase().includes('state') || 
    field.toLowerCase().includes('country')
  );
  
  const locationCounts = locationField ? getFieldCounts(locationField) : {};
  const topLocation = Object.entries(locationCounts).sort(([,a], [,b]) => b - a)[0];

  const handleDeleteRecord = (recordId) => {
    setDeleteTarget({ type: 'single', id: recordId });
    setShowDeleteModal(true);
  };

  const handleDeleteAll = () => {
    setDeleteTarget({ type: 'all' });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'single') {
        deleteRecord(deleteTarget.id);
        if (selectedRecord?.id === deleteTarget.id) {
          setSelectedRecord(null);
        }
      } else {
        deleteAllRecords();
      }
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">Record Collector</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Import
              </button>
              
              {records.length > 0 && (
                <button
                  onClick={handleDeleteAll}
                  className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete All
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {records.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="w-8 h-8 text-blue-600" />
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
                  <Database className="w-8 h-8 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Top {locationField ? locationField.charAt(0).toUpperCase() + locationField.slice(1).replace(/_/g, ' ') : 'Location'}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {topLocation ? `${topLocation[0]} (${topLocation[1]})` : 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Content */}
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="max-w-md">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Search records by name..."
            />
          </div>

          {/* Records Grid */}
          {filteredRecords.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record) => (
                <RecordCard
                  key={record.id}
                  record={record}
                  onDelete={handleDeleteRecord}
                  onSelect={setSelectedRecord}
                  isSelected={selectedRecord?.id === record.id}
                />
              ))}
            </div>
          ) : records.length > 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records found</h3>
              <p className="text-gray-600">Try adjusting your search terms</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No records yet</h3>
              <p className="text-gray-600 mb-6">Get started by importing your first CSV file</p>
              <button
                onClick={() => setShowImportModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Upload className="w-5 h-5" />
                Import Your First Records
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
      />
      
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        recordCount={deleteTarget?.type === 'single' ? 1 : records.length}
        isDeleting={isDeleting}
      />
    </div>
  );
} 