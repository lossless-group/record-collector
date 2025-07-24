---
tags: [Specifications]
date_created: 2025-02-24
date_modified: 2025-04-10
---

# Record Collector - Implementation Blueprint

## Project Overview

The Record Collector is a comprehensive React/Next.js application designed to import, manage, augment, and export customer data with AI-powered insights. The application follows a three-phase workflow: **Import**, **Augment**, and **Export**.

## Technology Stack

### Core Technologies
- **Next.js 15.4.3** with App Router
- **React 19.1.0** with modern hooks
- **Tailwind CSS 4** for styling
- **Zustand 5.0.6** for state management with persistence
- **Lucide React 0.525.0** for icons
- **PapaParse 5.5.3** for CSV parsing

### Development Tools
- **ESLint 9** with Next.js configuration
- **Turbopack** for development builds
- **PostCSS** with Tailwind CSS

## Application Architecture

### Three-Phase Workflow

#### Phase 1: Import & Record Management
- **Purpose**: Data ingestion and management
- **Route**: `/` (Home page)
- **Components**: RecordCollector, ImportModal, RecordCard, SearchBar, DeleteConfirmModal
- **Features**: 
  - CSV file upload with drag-and-drop
  - Robust CSV parsing with quoted fields support
  - Data validation (requires 'name' column)
  - Record management with search/filter
  - Individual and bulk record deletion
  - Dynamic statistics dashboard

#### Phase 2: AI Augmentation
- **Purpose**: AI-powered data enhancement
- **Route**: `/augment`
- **Components**: AugmentPage, PerplexityConfig, AugmentationResults
- **Features**:
  - Multi-record selection interface
  - Perplexity AI integration with API key management
  - Dynamic prompt generation based on available fields
  - Custom properties system with @ field references
  - Real API vs. simulation mode
  - Batch processing with progress tracking
  - Result storage and display

#### Phase 3: Export
- **Purpose**: Data export and remote integration
- **Route**: `/export`
- **Components**: ExportPage
- **Features**:
  - Selective record export
  - CSV export with augmentation data
  - Custom properties inclusion
  - Simulated remote push functionality
  - Comprehensive data formatting

## Core Components

### State Management (`src/lib/store.js`)
```javascript
// Zustand store with persistence
- records: Array of customer records
- selectedRecord: Currently selected record
- availableFields: Dynamic field tracking from CSV
- perplexityConfig: AI configuration state
  - apiKey: Perplexity API key
  - prompt: Dynamic prompt template
  - useDeepResearch: Research mode toggle
  - selectedModel: AI model selection
  - customProperties: Array of custom fields to generate
```

### Data Processing (`src/lib/csvParser.js`)
- **Robust CSV parsing** with quoted field support
- **Multiline field handling** for complex data
- **Data type conversion** (string to number)
- **Validation** requiring 'name' column
- **Error handling** for malformed CSV files

### Navigation System (`src/components/Navigation.js`)
- **Global navigation bar** with three main sections
- **Active state indicators** and smooth transitions
- **Responsive design** with mobile support

## Component Details

### RecordCollector (`src/components/RecordCollector.js`)
**Primary Features:**
- CSV import modal with drag-and-drop
- Record display with card-based layout
- Real-time search and filtering
- Dynamic statistics dashboard
- Individual and bulk record management
- Responsive design with mobile optimization

**Statistics Dashboard:**
- Total records count
- AI augmented records tracking
- Location-based analytics (dynamic field detection)
- Real-time updates

### ImportModal (`src/components/ImportModal.js`)
**Features:**
- Drag-and-drop file upload
- CSV validation and error handling
- Progress indicators
- Data preview before import
- Replace vs. append import modes

### AugmentPage (`src/components/AugmentPage.js`)
**Core Functionality:**
- Multi-select record interface
- Dynamic prompt generation based on available fields
- Perplexity AI integration with fallback models
- Custom properties system with @ field references
- Batch processing with progress tracking
- Result storage and display

**AI Integration:**
- Real Perplexity API calls with error handling
- Simulation mode for testing
- Model fallback (Sonar Pro → Sonar → Sonar Small)
- Custom properties extraction from JSON responses

### PerplexityConfig (`src/components/PerplexityConfig.js`)
**Configuration Options:**
- API key management with show/hide toggle
- Dynamic prompt editor with field placeholders
- Custom properties management
- Deep Research and Sonar Pro toggles
- Real API vs. simulation mode

### ExportPage (`src/components/ExportPage.js`)
**Export Features:**
- Selective record export
- CSV generation with all data fields
- Custom properties inclusion
- Augmentation data export
- Simulated remote push functionality

### RecordCard (`src/components/RecordCard.js`)
**Display Features:**
- Responsive card layout
- Field value display with formatting
- Augmentation status indicators
- Selection state management
- Action buttons (delete, view details)

### SplashScreen (`src/components/SplashScreen.js`)
**Features:**
- Animated welcome screen
- Developer toggle for quick access
- Staggered animations
- Branded experience

## Data Flow

### Import Process
1. **File Upload**: Drag-and-drop CSV file
2. **Validation**: Check for required 'name' column
3. **Parsing**: Parse CSV with quoted field support
4. **Processing**: Convert data types and generate IDs
5. **Storage**: Store in Zustand with persistence

### Augmentation Process
1. **Selection**: Multi-select records for processing
2. **Configuration**: Set up Perplexity AI parameters
3. **Prompt Generation**: Dynamic prompt with field placeholders
4. **API Calls**: Batch processing with progress tracking
5. **Result Processing**: Extract custom properties from JSON
6. **Storage**: Update records with augmentation data

### Export Process
1. **Selection**: Choose records for export
2. **Data Compilation**: Combine original and augmented data
3. **CSV Generation**: Create comprehensive CSV file
4. **Download**: Trigger file download
5. **Remote Push**: Simulated API integration

## Custom Properties System

### Dynamic Field References
- **@ Field Syntax**: Reference CSV fields in prompts (e.g., "Search for @address")
- **Automatic Detection**: Dynamic field tracking from imported data
- **Custom Generation**: AI-generated properties stored separately
- **Export Integration**: Custom properties included in CSV exports

### Implementation Details
```javascript
// Dynamic prompt generation
const fieldPlaceholders = availableFields.map(field => `- ${field}: {${field}}`).join('\n');

// Custom properties extraction
const customPropertiesMatch = response.match(/```json\s*({[\s\S]*?})\s*```/);
```

## Error Handling

### CSV Import Errors
- Empty file validation
- Missing 'name' column requirement
- Malformed CSV handling
- Data type conversion errors

### AI Integration Errors
- API key validation
- Network request failures
- Model fallback mechanisms
- JSON parsing errors

### User Experience
- Loading states and progress indicators
- Error messages with actionable feedback
- Graceful degradation for failed operations

## Performance Optimizations

### State Management
- **Zustand persistence** for data retention
- **Selective updates** to minimize re-renders
- **Batch operations** for bulk actions

### Data Processing
- **Efficient CSV parsing** with streaming support
- **Lazy loading** for large datasets
- **Debounced search** for real-time filtering

### UI Performance
- **Virtual scrolling** for large record lists
- **Optimized animations** with CSS transitions
- **Responsive design** with mobile-first approach

## Future Enhancements

### Planned Features
1. **Additional LLM Providers**
   - OpenAI GPT-4 integration
   - Anthropic Claude integration
   - Local model support

2. **Advanced Prompt Management**
   - Prompt templates library
   - Prompt versioning
   - A/B testing for prompts

3. **Real Remote Integration**
   - CRM system connectors (Salesforce, HubSpot)
   - Database connectors (PostgreSQL, MySQL)
   - API endpoint configuration

4. **Enhanced Analytics**
   - Sentiment analysis
   - Key insights extraction
   - Comparative analysis between records

5. **Data Source Connector System**
   - API configuration interface
   - Query builders (SQL, GraphQL)
   - Data transformation pipelines

## Deployment

### Development
- **Local Development**: `npm run dev` with Turbopack
- **Build System**: Next.js optimization
- **Static Assets**: Optimized images and fonts

### Production Ready
- **Vercel Deployment**: Ready for production deployment
- **Docker Support**: Containerized deployment capability
- **Environment Configuration**: API key management
- **Performance Monitoring**: Built-in Next.js analytics

---

## File Structure

```
record-collector/
├── src/
│   ├── app/
│   │   ├── page.js                 # Home page (Record Collector)
│   │   ├── augment/page.js         # Augmentation page
│   │   ├── export/page.js          # Export page
│   │   ├── layout.js               # Root layout
│   │   └── globals.css             # Global styles
│   ├── components/
│   │   ├── RecordCollector.js      # Main record management
│   │   ├── ImportModal.js          # CSV import interface
│   │   ├── AugmentPage.js          # AI augmentation interface
│   │   ├── ExportPage.js           # Export interface
│   │   ├── PerplexityConfig.js     # AI configuration
│   │   ├── RecordCard.js           # Individual record display
│   │   ├── Navigation.js           # Global navigation
│   │   ├── SearchBar.js            # Search functionality
│   │   ├── SplashScreen.js         # Welcome screen
│   │   ├── AugmentationResults.js  # AI results display
│   │   └── DeleteConfirmModal.js   # Confirmation dialogs
│   └── lib/
│       ├── store.js                # Zustand state management
│       └── csvParser.js            # CSV parsing utilities
├── public/                         # Static assets
├── resources/                      # Documentation
└── sample-customers.csv            # Sample data
```
