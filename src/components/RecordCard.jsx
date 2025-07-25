import { Trash2, ExternalLink, Mail, Building, MapPin, DollarSign, Clock } from 'lucide-react';
import { useState } from 'react';
import { useRecordStore } from '../lib/store';

export default function RecordCard({ record, onDelete, onSelect, isSelected, isProcessing = false }) {
  const availableFields = useRecordStore(state => state.availableFields);
  
  const formatRevenue = (revenue) => {
    if (typeof revenue === 'number') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(revenue);
    }
    return revenue;
  };

  const getIndustryColor = (industry) => {
    const colors = {
      'Technology': 'bg-blue-50 border-blue-200 text-blue-700',
      'Software': 'bg-purple-50 border-purple-200 text-purple-700',
      'Consulting': 'bg-green-50 border-green-200 text-green-700',
      'Research': 'bg-orange-50 border-orange-200 text-orange-700',
      'Manufacturing': 'bg-gray-50 border-gray-200 text-gray-700',
      'Fintech': 'bg-indigo-50 border-indigo-200 text-indigo-700',
      'Analytics': 'bg-pink-50 border-pink-200 text-pink-700',
      'Energy': 'bg-yellow-50 border-yellow-200 text-yellow-700',
      'Cloud Services': 'bg-cyan-50 border-cyan-200 text-cyan-700',
      'Retail': 'bg-red-50 border-red-200 text-red-700',
    };
    return colors[industry] || 'bg-gray-50 border-gray-200 text-gray-700';
  };

  const getSizeColor = (size) => {
    const colors = {
      'Small': 'bg-green-100 text-green-800',
      'Medium': 'bg-yellow-100 text-yellow-800',
      'Large': 'bg-red-100 text-red-800',
    };
    return colors[size] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString();
  };

  // Helper function to get icon for field type
  const getFieldIcon = (fieldName) => {
    const iconMap = {
      'name': Building,
      'industry': Building,
      'size': Building,
      'location': MapPin,
      'annual_revenue': DollarSign,
      'revenue': DollarSign,
      'website': ExternalLink,
      'contact_email': Mail,
      'email': Mail,
      'phone': Mail,
      'address': MapPin,
      'city': MapPin,
      'state': MapPin,
      'country': MapPin,
      'employees': Building,
      'founded': Clock,
      'description': Building,
    };
    
    // Try exact match first, then partial match
    return iconMap[fieldName] || iconMap[fieldName.toLowerCase()] || Building;
  };

  // Helper function to format field value
  const formatFieldValue = (fieldName, value) => {
    if (!value) return null;
    
    // Special formatting for specific field types
    if (fieldName.toLowerCase().includes('revenue') || fieldName.toLowerCase().includes('annual_revenue')) {
      return formatRevenue(value);
    }
    
    if (fieldName.toLowerCase().includes('website') || fieldName.toLowerCase().includes('url')) {
      return (
        <a 
          href={value.startsWith('http') ? value : `https://${value}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {value.replace(/^https?:\/\//, '')}
        </a>
      );
    }
    
    return value;
  };

  // Get primary fields (name, industry, size, location)
  const getPrimaryFields = () => {
    return ['name', 'industry', 'size', 'location'].filter(field => 
      availableFields.includes(field) && record[field]
    );
  };

  // Get secondary fields (everything else except custom properties)
  const getSecondaryFields = () => {
    return availableFields.filter(field => 
      !['name', 'industry', 'size', 'location'].includes(field) && 
      record[field] && 
      !field.startsWith('custom_')
    );
  };

  return (
    <div 
      className={`bg-white rounded-xl border-2 transition-all duration-200 cursor-pointer hover:shadow-lg ${
        isSelected 
          ? 'border-blue-500 shadow-lg' 
          : 'border-gray-200 hover:border-gray-300'
      } ${isProcessing ? 'opacity-75' : ''}`}
      onClick={() => onSelect(record)}
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">
              {record.name || 'Unnamed Record'}
            </h3>
            
            {/* Primary Fields */}
            <div className="mt-3 space-y-2">
              {getPrimaryFields().map(field => {
                const value = record[field];
                if (!value) return null;
                
                const IconComponent = getFieldIcon(field);
                const formattedValue = formatFieldValue(field, value);
                
                if (!formattedValue) return null;
                
                // Special styling for industry and size
                if (field === 'industry') {
                  const colorClass = getIndustryColor(value);
                  return (
                    <div key={field} className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${colorClass}`}>
                        {value}
                      </span>
                    </div>
                  );
                }
                
                if (field === 'size') {
                  const colorClass = getSizeColor(value);
                  return (
                    <div key={field} className="flex items-center gap-2">
                      <IconComponent className="w-4 h-4 text-gray-500 flex-shrink-0" />
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass}`}>
                        {value}
                      </span>
                    </div>
                  );
                }
                
                return (
                  <div key={field} className="flex items-center gap-2 text-sm text-gray-600">
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span>{formattedValue}</span>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Delete Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
            className="ml-3 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete record"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Secondary Fields */}
        <div className="space-y-2">
          {getSecondaryFields().map(field => {
            const value = record[field];
            if (!value) return null;
            
            const IconComponent = getFieldIcon(field);
            const formattedValue = formatFieldValue(field, value);
            
            if (!formattedValue) return null;
            
            return (
              <div key={field} className="flex items-center gap-2 text-sm text-gray-600">
                <IconComponent className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium capitalize">{field.replace(/_/g, ' ')}:</span>
                <span>{formattedValue}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 