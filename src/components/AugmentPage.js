'use client';

import { useState, useEffect } from 'react';
import { Database, Users, Zap, Settings, ArrowRight, CheckCircle, Circle } from 'lucide-react';
import { useRecordStore } from '../lib/store';
import RecordCard from './RecordCard';
import PerplexityConfig from './PerplexityConfig';
import AugmentationResults from './AugmentationResults';

export default function AugmentPage() {
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [isAugmenting, setIsAugmenting] = useState(false);
  const [processingRecords, setProcessingRecords] = useState(new Set());
  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const availableFields = useRecordStore(state => state.availableFields);
  
  // Generate dynamic prompt template based on available fields
  const generateDefaultPrompt = (customProperties = []) => {
    const fieldPlaceholders = availableFields.map(field => `- ${field}: {${field}}`).join('\n');
    
    let prompt = `Analyze the following company information and provide insights:

**Company Details:**
${fieldPlaceholders}

Please provide:
1. Market analysis and competitive landscape
2. Growth opportunities and potential challenges
3. Industry trends that may affect this company
4. Recommendations for business development
5. Key insights about their market position`;

    // Add custom properties section if any are defined
    if (customProperties && customProperties.length > 0) {
      const customPropertiesSection = `

**Additional Research Required:**
Please research and provide the following specific data points for this company. Format your response as a structured JSON object at the end of your analysis:

${customProperties.map(prop => `- ${prop}: Research and provide the ${prop.replace(/_/g, ' ')} for this company`).join('\n')}

**IMPORTANT:** End your response with a JSON object containing the researched data in this exact format:
\`\`\`json
{
  "custom_properties": {
${customProperties.map(prop => `    "${prop}": "researched_value_here"`).join(',\n')}
  }
}
\`\`\``;
      
      prompt += customPropertiesSection;
    }

    return prompt;
  };

  const [useRealAPI, setUseRealAPI] = useState(false);

  const { 
    records, 
    updateRecordAugmentation, 
    perplexityConfig, 
    updatePerplexityConfig 
  } = useRecordStore();

  // Update prompt when available fields or custom properties change
  useEffect(() => {
    if (availableFields.length > 0) {
      const newPrompt = generateDefaultPrompt(perplexityConfig.customProperties);
      if (newPrompt !== perplexityConfig.prompt) {
        updatePerplexityConfig({ prompt: newPrompt });
      }
    }
  }, [availableFields, perplexityConfig.customProperties]);

  // Initialize prompt if empty
  useEffect(() => {
    if (!perplexityConfig.prompt && availableFields.length > 0) {
      const newPrompt = generateDefaultPrompt(perplexityConfig.customProperties);
      updatePerplexityConfig({ prompt: newPrompt });
    }
  }, [availableFields, perplexityConfig.prompt]);

  const handleSelectAll = () => {
    if (selectedRecords.length === records.length) {
      setSelectedRecords([]);
    } else {
      setSelectedRecords(records.map(record => record.id));
    }
  };

  const handleSelectRecord = (recordId) => {
    setSelectedRecords(prev => 
      prev.includes(recordId) 
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  const handleAugment = async () => {
    if (selectedRecords.length === 0) return;

    setIsAugmenting(true);
    setShowResults(false);
    setResults([]);
    setProcessingRecords(new Set());

    try {
      const selectedRecordData = records.filter(record => 
        selectedRecords.includes(record.id)
      );

      const augmentationResults = [];
      
      for (const record of selectedRecordData) {
        // Add record to processing set
        setProcessingRecords(prev => new Set([...prev, record.id]));
        
        // Call Perplexity API or simulate based on toggle
        const result = useRealAPI 
          ? await callPerplexityAPI(record, perplexityConfig)
          : await simulatePerplexityCall(record, perplexityConfig);
        
        const augmentationData = {
          recordId: record.id,
          recordName: record.name,
          result: result.analysis,
          customProperties: result.customProperties,
          timestamp: new Date().toISOString()
        };
        
        // Update the record in the store with augmentation results
        updateRecordAugmentation(record.id, augmentationData);
        
        // Remove record from processing set
        setProcessingRecords(prev => {
          const newSet = new Set(prev);
          newSet.delete(record.id);
          return newSet;
        });
        
        augmentationResults.push(augmentationData);
      }

      setResults(augmentationResults);
      setShowResults(true);
    } catch (error) {
      console.error('Augmentation failed:', error);
      // Handle error appropriately
    } finally {
      setIsAugmenting(false);
      setProcessingRecords(new Set());
    }
  };

  const callPerplexityAPI = async (record, config) => {
    if (!config.apiKey) {
      throw new Error('API key is required for real Perplexity API calls');
    }

    // Replace placeholders in prompt with actual record data
    let processedPrompt = config.prompt;
    Object.keys(record).forEach(key => {
      const placeholder = `{${key}}`;
      processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), record[key] || 'N/A');
    });

    try {
      // Build request body
      const requestBody = {
        model: config.selectedModel || 'sonar',
        messages: [
          {
            role: 'user',
            content: processedPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        top_p: 0.9
      };

      // If the first request fails, try with a simpler model
      const tryWithFallbackModel = async (requestBody) => {
        try {
          const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${config.apiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Response:', errorText);
            
            // If it's a model-related error, try with a fallback model
            if (response.status === 400 && (errorText.includes('model') || errorText.includes('invalid'))) {
              console.log('Trying with fallback model...');
              const fallbackRequestBody = {
                ...requestBody,
                model: 'sonar' // Use the most basic model
              };
              
              const fallbackResponse = await fetch('https://api.perplexity.ai/chat/completions', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${config.apiKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(fallbackRequestBody)
              });
              
              if (!fallbackResponse.ok) {
                const fallbackErrorText = await fallbackResponse.text();
                throw new Error(`Fallback API request failed: ${fallbackResponse.status} ${fallbackResponse.statusText} - ${fallbackErrorText}`);
              }
              
              return fallbackResponse;
            }
            
            throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
          }
          
          return response;
        } catch (error) {
          throw error;
        }
      };

      // Add search parameters only if deep research is enabled
      if (config.useDeepResearch) {
        requestBody.search_recency_filter = 'month';
      }

      console.log('Perplexity API Request:', {
        model: requestBody.model,
        messageLength: processedPrompt.length,
        useDeepResearch: config.useDeepResearch,
        selectedModel: config.selectedModel
      });

      const response = await tryWithFallbackModel(requestBody);

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content || 'No response from API';
      
      // Parse custom properties from the response
      const customProperties = parseCustomProperties(aiResponse);
      
      return {
        analysis: aiResponse,
        customProperties
      };
    } catch (error) {
      console.error('Perplexity API call failed:', error);
      throw new Error(`API call failed: ${error.message}`);
    }
  };

  const simulatePerplexityCall = async (record, config) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000));

    // Replace placeholders in prompt with actual record data
    let processedPrompt = config.prompt;
    Object.keys(record).forEach(key => {
      const placeholder = `{${key}}`;
      processedPrompt = processedPrompt.replace(new RegExp(placeholder, 'g'), record[key] || 'N/A');
    });

    // Simulate different responses based on company characteristics
    const responses = {
      'Technology': `## Market Analysis for ${record.name}

**Competitive Landscape:**
${record.name} operates in the highly competitive technology sector, competing with established players and innovative startups. The company's focus on technology solutions positions it well in the digital transformation wave.

**Growth Opportunities:**
- Expansion into emerging markets
- Development of AI/ML capabilities
- Strategic partnerships with enterprise clients
- Cloud service offerings

**Industry Trends:**
- Increased demand for digital solutions
- AI and automation adoption
- Remote work technology needs
- Cybersecurity focus

**Recommendations:**
1. Invest in R&D for innovative solutions
2. Strengthen cybersecurity offerings
3. Develop strategic partnerships
4. Focus on customer success and retention`,

      'Software': `## Strategic Analysis for ${record.name}

**Market Position:**
As a software company, ${record.name} has significant growth potential in the expanding SaaS market. The company's size (${record.size}) suggests it's well-positioned for scaling.

**Key Opportunities:**
- Product feature expansion
- International market entry
- Enterprise customer acquisition
- API and integration development

**Challenges:**
- Intense competition from larger players
- Customer acquisition costs
- Talent retention in competitive market

**Strategic Recommendations:**
1. Focus on product differentiation
2. Build strong customer relationships
3. Develop recurring revenue models
4. Invest in customer success`,

      'default': `## Business Analysis for ${record.name}

**Company Overview:**
${record.name} is a ${record.size.toLowerCase()} company in the ${record.industry} industry, headquartered in ${record.location}. With annual revenue of ${record.annual_revenue ? `$${(record.annual_revenue / 1000000).toFixed(1)}M` : 'N/A'}, the company shows solid market presence.

**Market Analysis:**
The ${record.industry} industry is experiencing steady growth with increasing demand for specialized services and solutions.

**Growth Opportunities:**
- Market expansion in adjacent industries
- Digital transformation initiatives
- Strategic partnerships
- Product/service diversification

**Recommendations:**
1. Leverage technology for operational efficiency
2. Develop strong customer relationships
3. Explore new market segments
4. Invest in employee development`
    };

    const baseResponse = responses[record.industry] || responses.default;
    
    // Add custom properties if configured
    let fullResponse = baseResponse;
    let customProperties = {};
    
    if (config.customProperties && config.customProperties.length > 0) {
      // Generate simulated custom properties
      customProperties = config.customProperties.reduce((acc, prop) => {
        acc[prop] = generateSimulatedValue(prop, record);
        return acc;
      }, {});
      
      fullResponse += `

\`\`\`json
{
  "custom_properties": {
${Object.entries(customProperties).map(([key, value]) => `    "${key}": "${value}"`).join(',\n')}
  }
}
\`\`\``;
    }
    
    return {
      analysis: fullResponse,
      customProperties
    };
  };

  // Helper function to parse custom properties from AI response
  const parseCustomProperties = (response) => {
    try {
      // Look for JSON block in the response
      const jsonMatch = response.match(/```json\s*(\{[\s\S]*?\})\s*```/);
      if (jsonMatch) {
        const jsonData = JSON.parse(jsonMatch[1]);
        return jsonData.custom_properties || {};
      }
      
      // Fallback: try to find JSON anywhere in the response
      const jsonRegex = /\{[\s\S]*"custom_properties"[\s\S]*\}/;
      const match = response.match(jsonRegex);
      if (match) {
        const jsonData = JSON.parse(match[0]);
        return jsonData.custom_properties || {};
      }
      
      return {};
    } catch (error) {
      console.warn('Failed to parse custom properties from AI response:', error);
      return {};
    }
  };

  // Helper function to generate simulated values for custom properties
  const generateSimulatedValue = (property, record) => {
    const propertyLower = property.toLowerCase();
    
    if (propertyLower.includes('profit') || propertyLower.includes('revenue')) {
      const baseRevenue = record.annual_revenue || 10000000;
      const profitMargin = 0.15 + Math.random() * 0.25; // 15-40% profit margin
      return `$${(baseRevenue * profitMargin / 1000000).toFixed(1)}M`;
    }
    
    if (propertyLower.includes('market_share') || propertyLower.includes('market')) {
      return `${(Math.random() * 15 + 1).toFixed(1)}%`;
    }
    
    if (propertyLower.includes('employee') || propertyLower.includes('staff')) {
      const sizeMultiplier = record.size === 'Small' ? 50 : record.size === 'Medium' ? 200 : 1000;
      return Math.floor(sizeMultiplier * (0.8 + Math.random() * 0.4)).toString();
    }
    
    if (propertyLower.includes('growth') || propertyLower.includes('expansion')) {
      return `${(Math.random() * 30 + 5).toFixed(1)}%`;
    }
    
    if (propertyLower.includes('valuation') || propertyLower.includes('worth')) {
      const baseRevenue = record.annual_revenue || 10000000;
      const multiplier = 2 + Math.random() * 8; // 2-10x revenue multiple
      return `$${(baseRevenue * multiplier / 1000000).toFixed(1)}M`;
    }
    
    // Default fallback
    return `Simulated ${property.replace(/_/g, ' ')}`;
  };

  const selectedRecordsData = records.filter(record => 
    selectedRecords.includes(record.id)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Action Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h2 className="text-xl font-semibold text-gray-900">AI Augmentation</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedRecords.length} of {records.length} selected
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Record Selection */}
          <div className="lg:col-span-2 space-y-6">
            {/* Selection Controls */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Select Records</h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  {selectedRecords.length === records.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>
              
              <div className="text-sm text-gray-600 mb-4">
                {selectedRecords.length === 0 ? (
                  'No records selected'
                ) : selectedRecords.length === 1 ? (
                  '1 record selected'
                ) : (
                  `${selectedRecords.length} records selected`
                )}
              </div>

              {/* Records Grid */}
              {records.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {records.map((record) => (
                    <div
                      key={record.id}
                      className={`relative cursor-pointer transition-all duration-200 ${
                        selectedRecords.includes(record.id) 
                          ? 'ring-2 ring-purple-500' 
                          : 'hover:ring-2 hover:ring-gray-300'
                      }`}
                      onClick={() => handleSelectRecord(record.id)}
                    >
                      <RecordCard
                        record={record}
                        onDelete={() => {}} // Disable delete in augment mode
                        onSelect={() => handleSelectRecord(record.id)}
                        isSelected={selectedRecords.includes(record.id)}
                        isProcessing={processingRecords.has(record.id)}
                      />
                                             <div className="absolute top-2 right-2">
                         {selectedRecords.includes(record.id) ? (
                           <CheckCircle className="w-6 h-6 text-purple-600 bg-white rounded-full" />
                         ) : (
                           <Circle className="w-6 h-6 text-gray-400 bg-white rounded-full" />
                         )}
                       </div>
                       {/* Augmentation Status Indicator */}
                       {record.augmentationResults && (
                         <div className="absolute top-2 left-2">
                           <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center border-2 border-white">
                             <Zap className="w-3 h-3 text-purple-600" />
                           </div>
                         </div>
                       )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Database className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No records available</h3>
                  <p className="text-gray-600">Import some records first to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Configuration */}
          <div className="space-y-6">
            {/* Perplexity Configuration */}
            <PerplexityConfig />

            {/* API Mode Toggle */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">API Mode</h3>
                  <p className="text-xs text-gray-500">
                    {useRealAPI ? 'Using real Perplexity API' : 'Using simulated responses'}
                  </p>
                </div>
                <button
                  onClick={() => setUseRealAPI(!useRealAPI)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    useRealAPI ? 'bg-purple-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      useRealAPI ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              
              {useRealAPI && !perplexityConfig.apiKey && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                  <p className="text-xs text-yellow-800">
                    ⚠️ API key required for real API calls. Please enter your Perplexity API key above.
                  </p>
                </div>
              )}
            </div>

            {/* Augment Button */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <button
                onClick={handleAugment}
                disabled={selectedRecords.length === 0 || isAugmenting || (useRealAPI && !perplexityConfig.apiKey)}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {isAugmenting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Augmenting...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Augment {selectedRecords.length} Record{selectedRecords.length !== 1 ? 's' : ''}
                  </>
                )}
              </button>
              
              {selectedRecords.length > 0 && (
                <p className="text-sm text-gray-600 mt-2 text-center">
                  This will analyze {selectedRecords.length} record{selectedRecords.length !== 1 ? 's' : ''} using {useRealAPI ? 'real Perplexity API' : 'simulated responses'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="mt-8">
            <AugmentationResults 
              results={results} 
              onClose={() => setShowResults(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
} 