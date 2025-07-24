import { create } from 'zustand';

export const useRecordStore = create((set, get) => ({
  records: [],
  selectedRecord: null,
  
  setSelectedRecord: (record) => set({ selectedRecord: record }),
  
  addRecords: (newRecords) => {
    const currentRecords = get().records;
    const recordsWithIds = newRecords.map(record => ({
      ...record,
      id: record.id || `record_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      augmentationResults: null,
      lastAugmented: null
    }));
    set({ records: [...currentRecords, ...recordsWithIds] });
  },
  
  deleteRecord: (recordId) => {
    const currentRecords = get().records;
    set({ records: currentRecords.filter(record => record.id !== recordId) });
  },
  
  deleteAllRecords: () => set({ records: [], selectedRecord: null }),
  
  updateRecordAugmentation: (recordId, augmentationData) => {
    const currentRecords = get().records;
    const updatedRecords = currentRecords.map(record => 
      record.id === recordId 
        ? { 
            ...record, 
            augmentationResults: augmentationData.result,
            lastAugmented: augmentationData.timestamp
          }
        : record
    );
    set({ records: updatedRecords });
  },
  
  clearRecordAugmentation: (recordId) => {
    const currentRecords = get().records;
    const updatedRecords = currentRecords.map(record => 
      record.id === recordId 
        ? { 
            ...record, 
            augmentationResults: null,
            lastAugmented: null
          }
        : record
    );
    set({ records: updatedRecords });
  },
})); 