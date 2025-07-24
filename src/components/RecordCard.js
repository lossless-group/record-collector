'use client';

import { Trash2, ExternalLink, Mail, Building, MapPin, DollarSign, Zap, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { useRecordStore } from '../lib/store';

export default function RecordCard({ record, onDelete, onSelect, isSelected, isProcessing = false }) {
  const [showAugmentation, setShowAugmentation] = useState(false);
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

  const hasAugmentation = record.augmentationResults && record.lastAugmented;

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
    
    if (fieldName.toLowerCase().includes('email') || fieldName.toLowerCase().includes('contact_email')) {
      return (
        <a 
          href={`mailto:${value}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
          onClick={(e) => e.stopPropagation()}
        >
          {value}
        </a>
      );
    }
    
    return value;
  };

  // Get the primary fields to display prominently (name, industry, size)
  const getPrimaryFields = () => {
    const primaryFieldNames = ['name', 'industry', 'size'];
    return availableFields.filter(field => primaryFieldNames.includes(field));
  };

  // Get secondary fields to display in details section
  const getSecondaryFields = () => {
    const primaryFieldNames = ['name', 'industry', 'size'];
    return availableFields.filter(field => !primaryFieldNames.includes(field));
  };

  const primaryFields = getPrimaryFields();
  const secondaryFields = getSecondaryFields();

  return (
    <div 
      className={`relative group cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
        isSelected ? 'ring-2 ring-blue-500 shadow-lg' : ''
      }`}
      onClick={() => onSelect(record)}
    >
      {/* Loading Overlay */}
      {isProcessing && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-sm font-medium text-purple-700">Augmenting...</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-300 transition-colors">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              {record.name || record[availableFields[0]] || 'Unnamed Record'}
            </h3>
            {record.industry && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="w-4 h-4" />
                <span>{record.industry}</span>
              </div>
            )}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(record.id);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {record.industry && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getIndustryColor(record.industry)}`}>
              {record.industry}
            </span>
          )}
          {record.size && (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(record.size)}`}>
              {record.size}
            </span>
          )}
        </div>

        {/* Details */}
        <div className="space-y-3">
          {secondaryFields.map(field => {
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

        {/* Custom Properties Section */}
        {record.customProperties && Object.keys(record.customProperties).length > 0 && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-green-600" />
              </div>
              <span className="text-sm font-medium text-green-700">AI Generated Data</span>
            </div>
            <div className="space-y-2">
              {Object.entries(record.customProperties).map(([property, value]) => {
                if (!value) return null;
                
                const IconComponent = getFieldIcon(property);
                const formattedValue = formatFieldValue(property, value);
                
                return (
                  <div key={property} className="flex items-center gap-2 text-sm text-gray-600">
                    <IconComponent className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium capitalize">{property.replace(/_/g, ' ')}:</span>
                    <span className="text-green-700 font-medium">{formattedValue}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Augmentation Section */}
        {hasAugmentation && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAugmentation(!showAugmentation);
              }}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-lg p-2 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                  <Zap className="w-3 h-3 text-purple-600" />
                </div>
                <div>
                  <span className="text-sm font-medium text-purple-700">AI Analysis</span>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Clock className="w-3 h-3" />
                    {formatTimestamp(record.lastAugmented)}
                  </div>
                </div>
              </div>
              {showAugmentation ? (
                <ChevronUp className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              )}
            </button>
            
            {showAugmentation && (
              <div className="mt-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div 
                  className="text-sm text-gray-800 leading-relaxed max-h-32 overflow-y-auto"
                  dangerouslySetInnerHTML={{ 
                    __html: record.augmentationResults
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/^## (.*$)/gm, '<h3 class="text-sm font-semibold text-gray-900 mt-2 mb-1">$1</h3>')
                      .replace(/^### (.*$)/gm, '<h4 class="text-xs font-semibold text-gray-800 mt-1 mb-0.5">$1</h4>')
                      .replace(/^- (.*$)/gm, '<li class="ml-3 text-xs">$1</li>')
                      .replace(/^(\d+)\. (.*$)/gm, '<li class="ml-3 text-xs">$1. $2</li>')
                      .replace(/\n\n/g, '<br><br>')
                      .replace(/\n/g, '<br>')
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 