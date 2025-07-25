import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useRecordStore = create(
  persist(
    (set, get) => ({
  records: [],
  selectedRecord: null,
  availableFields: [], // Track available fields from CSV
  
  setSelectedRecord: (record) => set({ selectedRecord: record }),
  
  addRecords: (newRecords) => {
    const currentRecords = get().records;
    const recordsWithIds = newRecords.map(record => ({
      ...record,
      id: record.id || `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    // Extract available fields from the new records
    const newFields = newRecords.length > 0 ? Object.keys(newRecords[0]) : [];
    const currentFields = get().availableFields;
    const allFields = [...new Set([...currentFields, ...newFields])];
    
    set({ 
      records: [...currentRecords, ...recordsWithIds],
      availableFields: allFields
    });
  },
  
  replaceAllRecords: (newRecords) => {
    const recordsWithIds = newRecords.map(record => ({
      ...record,
      id: record.id || `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }));
    
    // Extract available fields from the new records
    const newFields = newRecords.length > 0 ? Object.keys(newRecords[0]) : [];
    
    set({ 
      records: recordsWithIds,
      availableFields: newFields,
      selectedRecord: null
    });
  },
  
  deleteRecord: (recordId) => {
    const currentRecords = get().records;
    set({ records: currentRecords.filter(record => record.id !== recordId) });
  },
  
  deleteAllRecords: () => set({ records: [], selectedRecord: null, availableFields: [] }),
}),
    {
      name: 'record-collector-storage',
      partialize: (state) => ({
        records: state.records,
        availableFields: state.availableFields
      })
    }
  )
); 