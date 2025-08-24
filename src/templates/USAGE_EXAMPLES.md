# Purchase Order Dynamic ID System - Usage Examples

This document provides comprehensive examples of how to use the dynamic ID system with your React form for generating purchase order PDFs.

## Table of Contents
1. [Basic Usage](#basic-usage)
2. [React Hook Form Integration](#react-hook-form-integration)
3. [Manual Form Data Collection](#manual-form-data-collection)
4. [Advanced Features](#advanced-features)
5. [Error Handling](#error-handling)
6. [Real-World Example](#real-world-example)

## Basic Usage

### Simple XML Generation
```javascript
import { generatePurchaseOrderXML } from './templates/PurchaseOrderTemplate';

// Basic form data structure
const formData = {
  companyInfo: {
    name: "Acme Corporation",
    address: "123 Business Ave",
    cityStateZip: "Springfield, IL 62701",
    phone: "(555) 123-4567",
    fax: "(555) 123-4568",
    website: "www.acmecorp.com"
  },
  headerInfo: {
    date: "12/15/2024",
    poNumber: "PO-2024-001"
  },
  vendor: {
    company: "Vendor Solutions LLC",
    contact: "John Smith",
    address: "456 Supplier St",
    cityStateZip: "Chicago, IL 60601",
    phone: "(555) 987-6543"
  },
  lineItems: [
    {
      itemNumber: "ITEM-001",
      description: "Premium Office Supplies",
      quantity: 10,
      unitPrice: 25.50,
      total: 255.00
    }
  ]
};

// Generate XML
const xml = generatePurchaseOrderXML(formData);
console.log(xml);
```

### Using with Existing React Field Arrays
```javascript
import { generatePurchaseOrderXML } from './templates/PurchaseOrderTemplate';

// If you have existing field arrays (like in PurchaseOrderForm.jsx)
const fieldArrayData = {
  companyFields: [
    { id: 'company-name', value: 'Acme Corporation', label: 'Company Name:' },
    { id: 'company-address', value: '123 Business Ave', label: 'Address:' },
    // ... more fields
  ],
  purchaseOrderFields: [
    { id: 'po-date', value: '12/15/2024', label: 'Date:' },
    { id: 'po-number', value: 'PO-2024-001', label: 'PO Number:' }
  ],
  // ... other field arrays
};

// Generate XML (the system will automatically detect and process field arrays)
const xml = generatePurchaseOrderXML(fieldArrayData);
```

## React Hook Form Integration

### Setup with useForm and useFieldArray
```javascript
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { generatePurchaseOrderXML } from './templates/PurchaseOrderTemplate';
import { processFormData, validateFormData } from './templates/FormDataMapper';

function PurchaseOrderForm() {
  const { register, control, handleSubmit, watch } = useForm({
    defaultValues: {
      companyInfo: {
        name: '',
        address: '',
        cityStateZip: '',
        phone: '',
        fax: '',
        website: ''
      },
      headerInfo: {
        date: '',
        poNumber: ''
      },
      vendor: {
        company: '',
        contact: '',
        address: '',
        cityStateZip: '',
        phone: '',
        fax: ''
      },
      shipTo: {
        name: '',
        company: '',
        address: '',
        cityStateZip: '',
        phone: ''
      },
      lineItems: [
        { itemNumber: '', description: '', quantity: 0, unitPrice: 0, total: 0 }
      ],
      totals: {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        other: 0,
        total: 0
      },
      comments: '',
      contactInfo: ''
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'lineItems'
  });

  const onSubmit = async (data) => {
    try {
      // Process and validate the form data
      const processedData = processFormData(data, {
        calculateTotals: true,
        validate: true,
        throwOnValidationError: true
      });

      // Generate XML
      const xml = generatePurchaseOrderXML(processedData);
      
      // Send to backend for PDF generation
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/xml' },
        body: xml
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `purchase-order-${data.headerInfo.poNumber || 'draft'}.pdf`;
        a.click();
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF: ' + error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Company Information */}
      <fieldset>
        <legend>Company Information</legend>
        <input 
          {...register('companyInfo.name')} 
          placeholder="Company Name"
          id="company-name-dynamic"
        />
        <input 
          {...register('companyInfo.address')} 
          placeholder="Address"
          id="company-address-dynamic"
        />
        <input 
          {...register('companyInfo.cityStateZip')} 
          placeholder="City, State ZIP"
          id="company-city-state-dynamic"
        />
        {/* ... more company fields */}
      </fieldset>

      {/* Purchase Order Header */}
      <fieldset>
        <legend>Purchase Order Information</legend>
        <input 
          {...register('headerInfo.date')} 
          type="date"
          placeholder="Date"
          id="po-date-dynamic"
        />
        <input 
          {...register('headerInfo.poNumber')} 
          placeholder="PO Number"
          id="po-number-dynamic"
        />
      </fieldset>

      {/* Dynamic Line Items */}
      <fieldset>
        <legend>Line Items</legend>
        {fields.map((field, index) => (
          <div key={field.id} className="line-item">
            <input
              {...register(`lineItems.${index}.itemNumber`)}
              placeholder="Item Number"
              id={`line-item-${index}-itemNumber`}
            />
            <input
              {...register(`lineItems.${index}.description`)}
              placeholder="Description"
              id={`line-item-${index}-description`}
            />
            <input
              {...register(`lineItems.${index}.quantity`, { 
                valueAsNumber: true 
              })}
              type="number"
              placeholder="Quantity"
              id={`line-item-${index}-quantity`}
            />
            <input
              {...register(`lineItems.${index}.unitPrice`, { 
                valueAsNumber: true 
              })}
              type="number"
              step="0.01"
              placeholder="Unit Price"
              id={`line-item-${index}-unitPrice`}
            />
            <button type="button" onClick={() => remove(index)}>
              Remove
            </button>
          </div>
        ))}
        <button 
          type="button" 
          onClick={() => append({ 
            itemNumber: '', 
            description: '', 
            quantity: 0, 
            unitPrice: 0, 
            total: 0 
          })}
        >
          Add Line Item
        </button>
      </fieldset>

      {/* Submit Button */}
      <button type="submit">Generate Purchase Order PDF</button>
    </form>
  );
}

export default PurchaseOrderForm;
```

## Manual Form Data Collection

### Collecting from DOM Elements
```javascript
import { collectFormDataFromDOM } from './templates/FormDataMapper';

// Collect all form data from the current DOM
function handleGeneratePDF() {
  try {
    // This will automatically find fields using dynamic ID strategies
    const formData = collectFormDataFromDOM();
    
    console.log('Collected form data:', formData);
    
    // Generate XML
    const xml = generatePurchaseOrderXML(formData, {
      calculateTotals: true,
      validate: true
    });
    
    // Process the XML...
  } catch (error) {
    console.error('Error collecting form data:', error);
  }
}
```

### Working with contentEditable Fields
```html
<!-- HTML structure that works with the dynamic ID system -->
<div class="company-section">
  <div 
    id="company-name" 
    contenteditable="true" 
    data-field="company-name"
    data-section="company-info"
  >
    Enter company name
  </div>
  
  <div 
    id="company-address-12345" 
    contenteditable="true" 
    data-field="company-address"
  >
    Enter address
  </div>
</div>

<div class="line-items">
  <div data-row="0" class="line-item-row">
    <span 
      id="line-item-0-itemNumber" 
      contenteditable="true"
      data-field="itemNumber"
    >Item #</span>
    <span 
      id="line-item-0-description" 
      contenteditable="true"
      data-field="description"
    >Description</span>
  </div>
</div>
```

## Advanced Features

### Custom Field Mapping
```javascript
import { FormDataMapper } from './templates/FormDataMapper';

// Create a custom mapper with different field mappings
const customMapper = new FormDataMapper();

// Override default mapping
customMapper.mappingConfig.companyInfo['custom-company-field'] = 'companyInfo.customField';

// Collect data with custom mapping
const formData = customMapper.collectFromDOM();
```

### Real-time Calculation
```javascript
import { calculateTotals } from './templates/FormDataMapper';

// Watch for changes and recalculate totals
function handleLineItemChange(formData) {
  const updatedData = calculateTotals(formData);
  
  // Update the totals in your UI
  document.getElementById('subtotal-display').textContent = 
    `$${updatedData.totals.subtotal.toFixed(2)}`;
  document.getElementById('total-display').textContent = 
    `$${updatedData.totals.total.toFixed(2)}`;
}
```

### Validation with Custom Rules
```javascript
import { FormDataMapper } from './templates/FormDataMapper';

const mapper = new FormDataMapper();

// Override validation method
const originalValidate = mapper.validateFormData.bind(mapper);
mapper.validateFormData = function(formData) {
  const result = originalValidate(formData);
  
  // Add custom validation rules
  if (formData.lineItems.length === 0) {
    result.errors.push('At least one line item is required');
    result.isValid = false;
  }
  
  if (formData.totals.total > 10000) {
    result.errors.push('Purchase orders over $10,000 require additional approval');
    result.isValid = false;
  }
  
  return result;
};

// Use custom validation
const validation = mapper.validateFormData(formData);
if (!validation.isValid) {
  console.log('Validation errors:', validation.errors);
}
```

## Error Handling

### Graceful Error Recovery
```javascript
import { generatePurchaseOrderXML } from './templates/PurchaseOrderTemplate';

async function safeGeneratePDF(formData) {
  try {
    // Try with validation enabled
    const xml = generatePurchaseOrderXML(formData, {
      validate: true,
      calculateTotals: true,
      throwOnValidationError: true
    });
    
    return { success: true, xml };
  } catch (validationError) {
    console.warn('Validation failed, trying without validation:', validationError);
    
    try {
      // Fallback: generate without validation
      const xml = generatePurchaseOrderXML(formData, {
        validate: false,
        calculateTotals: true
      });
      
      return { 
        success: true, 
        xml, 
        warnings: ['PDF generated with validation errors: ' + validationError.message]
      };
    } catch (criticalError) {
      return { 
        success: false, 
        error: criticalError.message 
      };
    }
  }
}

// Usage
safeGeneratePDF(formData).then(result => {
  if (result.success) {
    if (result.warnings) {
      console.warn('Warnings:', result.warnings);
    }
    // Process the XML...
  } else {
    console.error('Failed to generate PDF:', result.error);
  }
});
```

## Real-World Example

### Complete Integration with Backend
```javascript
// Frontend: Complete form submission handler
import { 
  generatePurchaseOrderXML, 
  processFormData, 
  validateFormData 
} from './templates/PurchaseOrderTemplate';

class PurchaseOrderService {
  static async generatePDF(formData, options = {}) {
    try {
      // Step 1: Process and validate form data
      const processedData = processFormData(formData, {
        calculateTotals: true,
        validate: true,
        formatForXML: true
      });
      
      // Step 2: Check validation results
      if (processedData._validation && !processedData._validation.isValid) {
        if (options.strictValidation) {
          throw new Error(`Validation failed: ${processedData._validation.errors.join(', ')}`);
        } else {
          console.warn('Validation warnings:', processedData._validation.errors);
        }
      }
      
      // Step 3: Generate XML
      const xml = generatePurchaseOrderXML(processedData, {
        validate: false, // Already validated
        calculateTotals: false // Already calculated
      });
      
      // Step 4: Send to backend
      const response = await fetch('/api/purchase-orders/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'X-PO-Number': processedData.headerInfo.poNumber || 'draft'
        },
        body: xml
      });
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} ${response.statusText}`);
      }
      
      // Step 5: Handle PDF response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      return {
        success: true,
        pdfUrl: url,
        filename: `purchase-order-${processedData.headerInfo.poNumber || 'draft'}.pdf`,
        formData: processedData
      };
      
    } catch (error) {
      console.error('PDF generation failed:', error);
      return {
        success: false,
        error: error.message,
        details: error
      };
    }
  }
  
  static downloadPDF(pdfUrl, filename) {
    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(pdfUrl);
  }
  
  static async savePurchaseOrder(formData) {
    const processedData = processFormData(formData, {
      calculateTotals: true,
      validate: true
    });
    
    const response = await fetch('/api/purchase-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(processedData)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save purchase order');
    }
    
    return await response.json();
  }
}

// Usage in a React component
function PurchaseOrderPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  
  const handleGeneratePDF = async (formData) => {
    setIsGenerating(true);
    
    try {
      const result = await PurchaseOrderService.generatePDF(formData, {
        strictValidation: false
      });
      
      setLastResult(result);
      
      if (result.success) {
        PurchaseOrderService.downloadPDF(result.pdfUrl, result.filename);
        
        // Optionally save to backend
        await PurchaseOrderService.savePurchaseOrder(result.formData);
        
        alert('Purchase Order PDF generated successfully!');
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Unexpected error:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div>
      {/* Your form components */}
      <button 
        onClick={() => handleGeneratePDF(formData)}
        disabled={isGenerating}
      >
        {isGenerating ? 'Generating PDF...' : 'Generate PDF'}
      </button>
      
      {lastResult && !lastResult.success && (
        <div className="error">
          Error: {lastResult.error}
        </div>
      )}
    </div>
  );
}
```

### Backend Implementation (Node.js Example)
```javascript
// Backend: Express server with Big Faceless Report Generator
const express = require('express');
const { Report } = require('big-faceless-pdf'); // Hypothetical BFG library

const app = express();
app.use(express.xml()); // Middleware to parse XML

app.post('/api/purchase-orders/generate-pdf', async (req, res) => {
  try {
    const xml = req.body;
    
    // Validate XML structure
    if (!xml || typeof xml !== 'string') {
      return res.status(400).json({ error: 'Invalid XML data' });
    }
    
    // Generate PDF using Big Faceless Report Generator
    const report = new Report();
    const pdfBuffer = await report.generateFromXML(xml);
    
    // Set response headers
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="purchase-order-${Date.now()}.pdf"`,
      'Content-Length': pdfBuffer.length
    });
    
    // Send PDF
    res.send(pdfBuffer);
    
  } catch (error) {
    console.error('PDF generation error:', error);
    res.status(500).json({ 
      error: 'PDF generation failed', 
      details: error.message 
    });
  }
});

app.listen(3000, () => {
  console.log('PDF generation service running on port 3000');
});
```

This comprehensive system provides:

1. **Flexible Form Data Collection** - Works with React Hook Form, field arrays, or DOM elements
2. **Dynamic ID Support** - Handles any ID format automatically
3. **Robust Validation** - Built-in validation with custom rule support
4. **Automatic Calculations** - Real-time total calculations
5. **Error Recovery** - Graceful fallbacks when validation fails
6. **Production Ready** - Complete integration examples with backend services

The system is designed to work with your existing Purchase Order form while providing maximum flexibility for future enhancements and different ID strategies.
