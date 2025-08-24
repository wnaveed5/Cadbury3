# Complete Codebase Documentation - Purchase Order Form Application

## Table of Contents
1. [Project Overview](#project-overview)
2. [File Structure](#file-structure)
3. [Core Application Files](#core-application-files)
4. [Component Architecture](#component-architecture)
5. [Hooks and Utilities](#hooks-and-utilities)
6. [Template System](#template-system)
7. [Styling and CSS](#styling-and-css)
8. [Configuration Files](#configuration-files)
9. [Build and Public Files](#build-and-public-files)

## Project Overview

This is a React-based Purchase Order Form application with advanced drag-and-drop functionality, built specifically for NetSuite integration. The application allows users to create, customize, and export purchase orders with a flexible field system and XML generation capabilities.

**Key Features:**
- Drag-and-drop field management using @dnd-kit
- Dynamic field ordering and customization
- XML template generation for NetSuite
- AI-powered field suggestions via OpenAI
- Responsive design with mobile support
- Real-time field tracking and validation

**Technology Stack:**
- React 18.2.0
- @dnd-kit for drag-and-drop
- CSS3 with CSS variables for theming
- OpenAI API integration for AI features

## File Structure

```
Cadbury3/
├── build/                          # Production build output
├── node_modules/                   # Dependencies
├── public/                         # Static assets
├── src/                           # Source code
│   ├── components/                # React components
│   │   ├── AvailableFields/      # Field palette system
│   │   ├── DroppableZone/        # Drop zone utilities
│   │   └── [Section Components]  # Individual form sections
│   ├── hooks/                     # Custom React hooks
│   ├── templates/                 # XML generation system
│   ├── data/                      # Data utilities (empty)
│   ├── [Main Components]         # Core application files
│   └── [CSS Files]               # Styling
├── package.json                   # Project configuration
├── package-lock.json             # Dependency lock file
└── [Documentation Files]         # Project documentation
```

## Core Application Files

### 1. `src/index.js` (12 lines)
**Purpose:** Application entry point
**Key Features:**
- React 18 root creation
- Strict mode enabled
- App component mounting

**Code Structure:**
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 2. `src/App.js` (16 lines)
**Purpose:** Main application wrapper
**Key Features:**
- Renders PurchaseOrderForm component
- Imports global CSS files
- Minimal wrapper for the main form

**Code Structure:**
```javascript
import React from 'react';
import PurchaseOrderForm from './PurchaseOrderForm';
import './App.css';
import './section-styles.css';
import './section-title-colors.css';

function App() {
  return (
    <div className="App">
      <PurchaseOrderForm />
    </div>
  );
}
```

### 3. `src/PurchaseOrderForm.jsx` (2,865 lines)
**Purpose:** Main application component - the heart of the system
**Key Features:**
- Complete form state management
- Drag-and-drop functionality for sections and fields
- Field management (add, remove, reorder)
- XML generation integration
- AI field suggestions
- Responsive layout management

**Major Sections:**
1. **State Management** (lines ~250-400)
   - Company fields, PO fields, vendor fields, ship-to fields
   - Line items, totals, comments, contact info
   - Section ordering and field ordering

2. **Drag and Drop Handlers** (lines ~400-600)
   - Section reordering
   - Field reordering within sections
   - Palette field dropping

3. **Field Management Functions** (lines ~600-800)
   - Add/remove fields
   - Label and content editing
   - Field validation and sanitization

4. **AI Integration** (lines ~800-900)
   - OpenAI API integration
   - Field suggestion generation
   - Data population from AI

5. **XML Generation** (lines ~900-1000)
   - Template data preparation
   - XML export functionality
   - Form data collection

6. **UI Rendering** (lines ~1000-2850)
   - Section components
   - Field components
   - Responsive layout
   - Mobile sidebar

**Key State Variables:**
```javascript
// Company fields with drag-and-drop support
const [companyFields, setCompanyFields] = useState([...]);

// Purchase order fields
const [purchaseOrderFields, setPurchaseOrderFields] = useState([...]);

// Vendor and ship-to fields
const [vendorFields, setVendorFields] = useState([...]);
const [shipToFields, setShipToFields] = useState([...]);

// Line items and totals
const [lineItems, setLineItems] = useState([...]);
const [totalsFields, setTotalsFields] = useState([...]);

// Section ordering
const [sectionOrder, setSectionOrder] = useState({
  sections1And2: ['section1', 'section2'],
  sections3And4: ['section3', 'section4'],
  sections8And9: ['section8', 'section9'],
  shippingColumns: ['requisitioner', 'shipVia', 'fob', 'shippingTerms']
});
```

### 4. `src/PurchaseOrderSync.jsx` (616 lines)
**Purpose:** Alternative form implementation with different state management
**Key Features:**
- Simplified form structure
- Direct field updates
- Alternative data flow pattern
- Testing and development purposes

**Key Differences from Main Form:**
- Uses direct state updates instead of field arrays
- Simpler field management
- Different component structure
- Alternative approach to form data handling

## Component Architecture

### Available Fields System

#### 1. `src/components/AvailableFields/AvailableFields.jsx` (136 lines)
**Purpose:** Field palette sidebar for adding new fields to sections
**Key Features:**
- Draggable field items
- Category-based organization
- Click-to-add functionality
- Visual feedback during drag operations

**Component Structure:**
```javascript
// Main component with toggle functionality
const AvailableFields = ({ isVisible, onToggleVisibility, onAddField, showNotification }) => {
  // Renders field categories with draggable items
  // Each field can be dragged or clicked to add
};

// Individual draggable field
const PaletteDraggable = ({ label, category, onAddField, showNotification }) => {
  // Uses @dnd-kit for drag functionality
  // Provides visual feedback during drag
};
```

#### 2. `src/components/AvailableFields/fieldData.js` (84 lines)
**Purpose:** Data structure for available fields
**Key Features:**
- Categorized field definitions
- 6 main categories with 10 fields each
- Structured for easy expansion

**Field Categories:**
1. **Company Information** - Tax ID, DUNS, Business License, etc.
2. **Purchase Order Details** - Delivery Date, Payment Terms, etc.
3. **Vendor Information** - Vendor Tax ID, Rating, Contract Terms, etc.
4. **Shipping & Delivery** - Expected Delivery, Carrier Info, etc.
5. **Financial Details** - Discounts, Payment Terms, etc.
6. **Compliance & Legal** - Regulatory Compliance, Safety Requirements, etc.

#### 3. `src/components/AvailableFields/index.js` (6 lines)
**Purpose:** Clean export interface for AvailableFields components
**Exports:**
- Default AvailableFields component
- availableFieldsData for external use

### Droppable Zone System

#### 1. `src/components/DroppableZone/DroppableZone.jsx` (31 lines)
**Purpose:** Drop zone wrapper for sections
**Key Features:**
- Accepts palette fields
- Visual feedback when dragging over
- Integrates with @dnd-kit

**Usage:**
```javascript
const DroppableZone = ({ id, children, zoneLabel }) => {
  // Wraps sections to make them droppable
  // Provides visual feedback during drag operations
};
```

#### 2. `src/components/DroppableZone/index.js` (3 lines)
**Purpose:** Export interface for DroppableZone

### Section Components

#### 1. `src/components/Section1CompanyInfo.jsx` (130 lines)
**Purpose:** Company information section with drag-and-drop fields
**Key Features:**
- Droppable for palette fields
- Sortable company fields
- Add new field functionality
- Drag handle for section reordering

**State Management:**
- Receives companyFields array
- Handles field drag-and-drop
- Manages field addition/removal

#### 2. `src/components/Section2PurchaseOrder.jsx` (130 lines)
**Purpose:** Purchase order details section
**Key Features:**
- Similar structure to CompanyInfo
- Handles PO-specific fields
- Maintains field ordering

#### 3. `src/components/Section3Vendor.jsx` (124 lines)
**Purpose:** Vendor information section
**Key Features:**
- Vendor field management
- Drag-and-drop functionality
- Field customization

#### 4. `src/components/Section4ShipTo.jsx` (124 lines)
**Purpose:** Ship-to address section
**Key Features:**
- Ship-to field management
- Similar structure to other sections
- Field ordering preservation

#### 5. `src/components/Section5Shipping.jsx` (279 lines)
**Purpose:** Shipping details with dynamic columns
**Key Features:**
- Dynamic column ordering
- Custom column addition
- Horizontal drag-and-drop for columns
- Responsive grid layout

**Advanced Features:**
```javascript
// Dynamic column configuration
const columnConfig = {
  requisitioner: { label: 'REQUISITIONER', placeholder: 'Requisitioner name' },
  shipVia: { label: 'SHIP VIA', placeholder: 'Shipping method' },
  fob: { label: 'F.O.B.', placeholder: 'FOB terms' },
  shippingTerms: { label: 'SHIPPING TERMS', placeholder: 'Shipping terms' }
};

// Custom column support
const generateCustomColumnConfig = (columnId) => {
  if (columnId.startsWith('custom-')) {
    return {
      label: columnId.toUpperCase().replace('custom-', 'CUSTOM '),
      placeholder: 'Enter custom value'
    };
  }
  return null;
};
```

### Field Components

#### 1. `src/components/SortableCompanyField.jsx` (108 lines)
**Purpose:** Individual company field with drag-and-drop
**Key Features:**
- Editable label and content
- Drag handle for reordering
- Remove button functionality
- Title field special handling

**Special Features:**
```javascript
// Title field handling
{field.isTitle && (
  <span className="field-label editable-label title-field">
    {field.label}
  </span>
)}

// Drag handle only for non-title fields
{!field.isTitle && (
  <div className="drag-handle" {...attributes} {...listeners}>
    ::
  </div>
)}
```

#### 2. `src/components/SortablePurchaseOrderField.jsx` (118 lines)
**Purpose:** Purchase order field component
**Key Features:**
- Similar to CompanyField
- PO-specific styling
- Title field support
- Debug logging for development

#### 3. `src/components/SortableVendorField.jsx` (98 lines)
**Purpose:** Vendor field component
**Key Features:**
- Vendor-specific styling
- Field removal with red button
- Drag handle functionality

#### 4. `src/components/SortableShipToField.jsx` (98 lines)
**Purpose:** Ship-to field component
**Key Features:**
- Ship-to specific styling
- Similar structure to VendorField
- Field management capabilities

#### 5. `src/components/SortableTotalsField.jsx` (113 lines)
**Purpose:** Totals field with calculated values
**Key Features:**
- Calculated vs. editable fields
- Special handling for total field
- Drag-and-drop reordering
- Value change handling

**Calculated Field Support:**
```javascript
{field.isCalculated ? (
  <span className="calculated-field">
    {field.value}
  </span>
) : (
  <span className="editable-field" contentEditable="true">
    {field.value}
  </span>
)}
```

#### 6. `src/components/SortableCommentsField.jsx` (107 lines)
**Purpose:** Comments field management
**Key Features:**
- Main comment field protection
- Additional comment fields
- Field removal for non-main fields
- Drag-and-drop support

#### 7. `src/components/SortableContactField.jsx` (107 lines)
**Purpose:** Contact information field
**Key Features:**
- Main contact field protection
- Additional contact fields
- Similar structure to CommentsField

### Utility Components

#### 1. `src/components/SectionTitleColorPicker.jsx` (270 lines)
**Purpose:** Dynamic section title color customization
**Key Features:**
- Color picker interface
- CSS variable management
- Preset color options
- Real-time preview

**CSS Variable Management:**
```javascript
// Update CSS variables when color changes
useEffect(() => {
  document.documentElement.style.setProperty('--section-title-background', titleBlockColor);
  
  // Calculate text color based on background brightness
  const brightness = getBrightness(titleBlockColor);
  const textColor = brightness > 128 ? '#000000' : '#ffffff';
  document.documentElement.style.setProperty('--section-title-text', textColor);
}, [titleBlockColor]);
```

#### 2. `src/components/FieldTrackingDisplay.jsx` (65 lines)
**Purpose:** Field change tracking and debugging
**Key Features:**
- Field count display
- Last modified timestamp
- JSON export functionality
- Raw data preview

## Hooks and Utilities

### 1. `src/hooks/useDragAndDrop.js` (101 lines)
**Purpose:** Custom hooks for drag-and-drop functionality
**Key Features:**
- Sensor configuration for different input types
- Field-specific drag end handlers
- Array reordering utilities

**Hook Functions:**
```javascript
// Main sensor configuration
export function useDragAndDropSensors() {
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  return useSensors(mouseSensor, touchSensor, keyboardSensor);
}

// Field-specific drag end handlers
export function useCompanyFieldsDragEnd(setCompanyFields) {
  return (event) => {
    // Handles company field reordering
  };
}
```

### 2. `src/hooks/useAIProvider.js` (255 lines)
**Purpose:** OpenAI integration for field suggestions
**Key Features:**
- API key management
- Field suggestion generation
- Data validation and sanitization
- Error handling and fallbacks

**AI Integration:**
```javascript
// Generate field suggestions
async function getFieldSuggestions(payload) {
  // Build schema from existing fields
  const schemaLines = []
    .concat(safeMap(payload?.companyFields, f => `"${f.id}": "string"`))
    .concat(safeMap(payload?.purchaseOrderFields, f => `"${f.id}": "string"`))
    // ... more field types

  // OpenAI API call with JSON mode
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      response_format: { type: 'json_object' },
      max_tokens: 1500
    })
  });
}
```

## Template System

### 1. `src/templates/PurchaseOrderTemplate.js` (1,311 lines)
**Purpose:** Core XML generation engine
**Key Features:**
- Dynamic field value retrieval
- NetSuite-compatible XML output
- Field ordering preservation
- Comprehensive data attributes

**Key Functions:**
```javascript
// Main XML generation function
export function generatePurchaseOrderXML(formData, options = {}) {
  // Process and validate form data
  let processedData = processFormData(formData, {
    calculateTotals: options.calculateTotals !== false,
    validate: options.validate !== false,
    formatForXML: true,
    throwOnValidationError: options.throwOnValidationError || false
  });

  // Generate XML with dynamic field ordering
  const xml = buildCompleteXML(processedData);
  return xml;
}

// Section-specific XML builders
const buildCompanyXML = (position = 'left') => {
  // Build company section with dynamic field ordering
  // Preserves drag-and-drop field order
};

const buildPurchaseOrderXML = (position = 'right') => {
  // Build PO section with field ordering
  // Handles title, date, number fields specially
};
```

**Dynamic Field System:**
- Supports both static and dynamic field IDs
- Multiple fallback strategies for value retrieval
- Preserves field ordering from drag-and-drop operations
- Generates comprehensive data attributes for XML

### 2. `src/templates/FormDataMapper.js` (728 lines)
**Purpose:** Form data processing and validation
**Key Features:**
- Data structure normalization
- Field mapping between React state and XML
- Validation and error handling
- Data transformation utilities

**Class Structure:**
```javascript
export class FormDataMapper {
  constructor() {
    this.formData = this.getEmptyFormData();
    this.mappingConfig = this.getDefaultMappingConfig();
  }

  // Get empty form data structure
  getEmptyFormData() {
    return {
      companyInfo: { name: '', address: '', cityStateZip: '', phone: '', fax: '', website: '' },
      headerInfo: { title: 'PURCHASE ORDER', date: '', poNumber: '' },
      vendor: { company: '', contact: '', address: '', cityStateZip: '', phone: '', fax: '' },
      shipTo: { name: '', company: '', address: '', cityStateZip: '', phone: '', fax: '' },
      shippingDetails: { requisitioner: '', shipVia: '', fob: '', shippingTerms: '' },
      lineItems: [],
      totals: { subtotal: 0, tax: 0, shipping: 0, other: 0, total: 0 },
      comments: '',
      contactInfo: ''
    };
  }
}
```

### 3. `src/templates/USAGE_EXAMPLES.md` (661 lines)
**Purpose:** Comprehensive usage documentation
**Key Features:**
- Basic usage examples
- React Hook Form integration
- Manual form data collection
- Advanced features and error handling

**Example Categories:**
1. **Basic Usage** - Simple XML generation
2. **React Hook Form Integration** - Form library integration
3. **Manual Form Data Collection** - Direct data handling
4. **Advanced Features** - Complex scenarios
5. **Error Handling** - Validation and error management
6. **Real-World Example** - Complete workflow

### 4. `src/templates/DYNAMIC_ID_DOCUMENTATION.md` (142 lines)
**Purpose:** Dynamic ID system documentation
**Key Features:**
- Dynamic field value retrieval
- Data attributes for XML structure
- Field categories and ID patterns
- Integration notes

**Dynamic ID System:**
- Supports static IDs (e.g., `company-name`)
- Supports dynamic IDs (e.g., `company-field-1703876543210-abc123def`)
- Multiple fallback strategies
- Comprehensive data attributes in XML output

## Styling and CSS

### 1. `src/App.css` (5 lines)
**Purpose:** Global application styles
**Key Features:**
- Left-aligned text
- Minimum viewport height
- Basic app container styling

### 2. `src/index.css` (14 lines)
**Purpose:** Global CSS reset and base styles
**Key Features:**
- Body margin reset
- Font family configuration
- Smooth text rendering
- Code font configuration

### 3. `src/PurchaseOrderForm.css` (1,220 lines)
**Purpose:** Main form styling
**Key Features:**
- Form layout and structure
- Field styling and interactions
- Drag-and-drop visual feedback
- Responsive design elements

**Key CSS Classes:**
```css
/* Form layout */
.purchase-order-form {
  display: flex;
  min-height: 100vh;
  background-color: #f8fafc;
}

/* Field styling */
.field-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 8px 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Drag and drop feedback */
.dragging {
  opacity: 0.6;
  transform: rotate(5deg);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}
```

### 4. `src/section-styles.css` (1,759 lines)
**Purpose:** Section-specific styling
**Key Features:**
- Individual section layouts
- Field container styling
- Drag handle appearance
- Responsive breakpoints

**Section-Specific Styles:**
```css
/* Company Info Section */
.section-1-company-info {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}

/* Purchase Order Section */
.section-2-purchase-order {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
}
```

### 5. `src/section-title-colors.css` (46 lines)
**Purpose:** Section title color management
**Key Features:**
- CSS variable definitions
- Default color schemes
- Dynamic color application

**CSS Variables:**
```css
:root {
  --section-title-background: #f8fafc;
  --section-title-text: #374151;
  --header-background: #000000;
  --header-text: #ffffff;
  --header-border: rgba(255, 255, 255, 0.3);
}
```

### 6. `src/header-colors.css` (122 lines)
**Purpose:** Header color management
**Key Features:**
- Header background and text colors
- Border color definitions
- Color scheme variations

### 7. `src/header-color-picker.css` (310 lines)
**Purpose:** Header color picker styling
**Key Features:**
- Color picker interface styling
- Button and input styling
- Panel layout and positioning

### 8. `src/components/AvailableFields/AvailableFields.css` (373 lines)
**Purpose:** Available fields sidebar styling
**Key Features:**
- Sidebar layout and positioning
- Field item styling
- Drag feedback effects
- Mobile responsiveness

### 9. `src/components/DroppableZone/DroppableZone.css` (121 lines)
**Purpose:** Drop zone styling
**Key Features:**
- Drop zone visual feedback
- Hover and active states
- Border and background styling

## Configuration Files

### 1. `package.json` (33 lines)
**Purpose:** Project configuration and dependencies
**Key Dependencies:**
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1",
    "@dnd-kit/core": "^6.0.8",
    "@dnd-kit/sortable": "^7.0.2",
    "@dnd-kit/utilities": "^3.2.1"
  }
}
```

**Scripts:**
- `start`: Development server
- `build`: Production build
- `test`: Run tests
- `eject`: Eject from Create React App

### 2. `.gitignore` (2 lines)
**Purpose:** Git ignore configuration
**Contents:**
- `node_modules/`
- `build/`

## Build and Public Files

### 1. `build/` directory
**Purpose:** Production build output
**Contents:**
- `asset-manifest.json`: Asset mapping
- `index.html`: Production HTML
- `static/`: Compiled CSS and JavaScript
  - `css/main.d660ac9b.css`: Main stylesheet
  - `js/main.49a9391e.js`: Main JavaScript bundle

### 2. `public/index.html` (19 lines)
**Purpose:** HTML template
**Key Features:**
- Meta tags for responsive design
- Root div for React mounting
- SEO-friendly title and description

## Additional Files

### 1. `src/XMLTestComponent.jsx` (176 lines)
**Purpose:** Testing component for XML generation
**Key Features:**
- Test data management
- XML generation testing
- Validation results display
- Development and debugging tool

### 2. `src/data/` directory
**Purpose:** Data utilities (currently empty)
**Future Use:** Additional data management utilities

## Key Architectural Patterns

### 1. **Component Composition**
- Modular section components
- Reusable field components
- Consistent prop interfaces
- Clear separation of concerns

### 2. **State Management**
- Local state for field arrays
- Field ordering preservation
- Section ordering management
- Real-time updates and validation

### 3. **Drag and Drop System**
- @dnd-kit integration
- Multiple drag contexts
- Visual feedback during operations
- Order preservation across operations

### 4. **Template System**
- Dynamic XML generation
- Field value retrieval strategies
- Fallback mechanisms
- NetSuite compatibility

### 5. **Responsive Design**
- Mobile-first approach
- Sidebar toggle functionality
- Flexible grid layouts
- Touch-friendly interactions

## Development Workflow

### 1. **Field Management**
1. Fields are added from AvailableFields palette
2. Fields can be reordered within sections
3. Fields can be removed (except protected ones)
4. Field content is editable in real-time

### 2. **Section Management**
1. Sections can be reordered as groups
2. Individual sections maintain field order
3. Sections can be swapped (e.g., Company/PO)
4. Visual feedback during reordering

### 3. **Data Flow**
1. User interactions update React state
2. State changes trigger re-renders
3. Field order is preserved in state
4. XML generation uses current state

### 4. **Export Process**
1. Form data is collected from state
2. Data is processed through FormDataMapper
3. XML is generated using PurchaseOrderTemplate
4. Output includes all field data and ordering

## Future Enhancement Opportunities

### 1. **NetSuite Integration**
- Replace hardcoded values with NetSuite variables
- Implement field mapping to NetSuite records
- Add validation against NetSuite schemas

### 2. **Advanced Field Types**
- Date pickers with validation
- Number fields with formatting
- Dropdown fields with options
- File attachment fields

### 3. **Template Management**
- Multiple template support
- Template versioning
- Template sharing and collaboration
- Custom field definitions

### 4. **Data Persistence**
- Local storage for form data
- Cloud synchronization
- Form templates saving
- User preferences storage

This codebase represents a sophisticated, production-ready purchase order management system with extensive customization capabilities and a solid foundation for future enhancements.
