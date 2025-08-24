# NetSuite Integration Layer

This document describes the NetSuite integration layer that has been added to the Purchase Order XML generation system. The layer converts the existing XML data to NetSuite-compatible format using their FreeMarker syntax and variable structure.

## Overview

The NetSuite integration layer provides:

1. **Direct NetSuite Template Generation** - Generate NetSuite-compatible XML directly from form data
2. **XML Conversion** - Convert existing XML output to NetSuite format
3. **NetSuite Variable Mapping** - Map form fields to NetSuite record variables
4. **Structure Preservation** - Maintains exact layout and styling of your original form
5. **Hybrid Data Approach** - Uses form values when available, falls back to NetSuite variables
6. **Professional Styling** - Clean, professional table-based layout with black headers

## Architecture

```
React Form → Form Data → NetSuite Integration Layer → NetSuite XML Template
     ↓              ↓                    ↓                    ↓
  User Input   Field Values      Variable Mapping    FreeMarker XML
```

## Components

### 1. NetSuiteIntegration.js
Core integration logic that handles:
- NetSuite variable mapping
- Template structure generation
- XML conversion utilities

### 2. NetSuiteIntegration.jsx
React component that provides:
- UI for generating NetSuite XML
- Tabbed interface (Original XML vs NetSuite XML)
- Download and copy functionality

### 3. NetSuiteTest.jsx
Test component for verifying:
- NetSuite generation works correctly
- Variable mapping is accurate
- Template structure is valid

## NetSuite Variable Mapping

The integration maps form fields to NetSuite record variables:

### Company Information
- `company-name` → `${companyInformation.companyName}`
- `company-address` → `${companyInformation.addressText}`
- `company-phone` → `${companyInformation.phone}`

### Purchase Order
- `po-number` → `${record.tranid}`
- `po-date` → `${record.trandate}`
- `po-title` → `${record@title}`

### Vendor Information
- `vendor-company` → `${record.billaddresslist}`
- `vendor-address` → `${record.billaddress}`
- `vendor-phone` → `${record.billphone}`

### Ship To Information
- `ship-to-company` → `${record.shipaddresslist}`
- `ship-to-address` → `${record.shipaddress}`
- `ship-to-phone` → `${record.shipphone}`

### Line Items
- `item-number` → `${item.item}`
- `description` → `${item.description}`
- `quantity` → `${item.quantity}`
- `unit-price` → `${item.rate}`
- `total` → `${item.amount}`

### Totals
- `subtotal` → `${record.subtotal}`
- `tax` → `${record.taxtotal}`
- `shipping` → `${record.shippingcost}`
- `total` → `${record.total}`

## Usage

### 1. In PurchaseOrderForm.jsx

The NetSuite integration is already integrated into the main form. Users can:

1. Fill out the purchase order form
2. Click the "🔀 NetSuite XML" button
3. View the generated NetSuite template in a modal
4. Copy or download the NetSuite XML

**How it works:**
- **Step 1**: Click "💾 Save Form & Generate XML" to save your form and generate XML
- **Step 2**: Click "🔀 Generate NetSuite XML" to convert the XML to NetSuite format
- The system first generates the regular XML, then converts it to NetSuite format using FreeMarker syntax
- This ensures the NetSuite XML always matches the final XML output exactly

### 2. Programmatic Usage

```javascript
import { generateNetSuiteTemplate, convertToNetSuite } from './templates/NetSuiteIntegration';

// Generate NetSuite template directly from form data
const netSuiteXML = generateNetSuiteTemplate(formData);

// Convert existing XML to NetSuite format
const netSuiteXML = convertToNetSuite(existingXML, formData);

### 3. XML-to-NetSuite Conversion Process

The integration now uses a two-step process for better consistency:

1. **Generate Regular XML**: Uses the existing `generatePurchaseOrderXML()` function
2. **Convert to NetSuite**: Parses the XML and converts it to NetSuite format

**Benefits of this approach:**
- ✅ **Always in sync**: NetSuite XML matches the final XML output exactly
- ✅ **No real-time complexity**: No need to sync with every form change
- ✅ **Consistent data**: Both XMLs use the same source data
- ✅ **Easier maintenance**: Single source of truth for form data

### 4. New Workflow with Save Buttons

The integration now provides a clear, step-by-step workflow:

**Step 1: Save Form & Generate XML**
- Click "💾 Save Form & Generate XML" button
- Saves your current form data
- Generates the regular XML output
- Opens XML modal for review

**Step 2: Generate NetSuite XML**
- Click "🔀 Generate NetSuite XML" button (only enabled after Step 1)
- Converts the existing XML to NetSuite format
- Opens NetSuite XML modal
- Ready for NetSuite integration

**Visual Indicators:**
- NetSuite button is **disabled** until XML is generated
- Clear button labels show the workflow
- Success notifications for each step
```

### 3. Testing

Use the NetSuiteTest component to verify the integration:

```javascript
import NetSuiteTest from './components/NetSuiteTest';

// In your app
<NetSuiteTest />
```

## NetSuite Template Structure

The generated template follows NetSuite's Big Faceless Report Generator format:

```xml
<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
    <!-- Font definitions with locale support -->
    <link name="NotoSans" type="font" subtype="truetype" src="${nsfont.NotoSans_Regular}" />
    
    <!-- Header and footer macros -->
    <macrolist>
        <macro id="nlheader">...</macro>
        <macro id="nlfooter">...</macro>
    </macrolist>
    
    <!-- Professional styling -->
    <style>...</style>
</head>
<body header="nlheader" footer="nlfooter">
    <!-- Company and PO information -->
    <!-- Vendor and Ship To sections -->
    <!-- Line items with conditional rendering -->
    <!-- Totals and comments -->
</body>
</pdf>
```

## Key Features

### 1. Structure Matching
- **Exact Layout Match**: Generates XML that matches your original form structure exactly
- **Data Section Preservation**: Maintains all data-section attributes and subsections
- **Field Mapping**: Preserves field IDs and data attributes for consistency

### 2. NetSuite Variable Integration
- **Hybrid Approach**: Uses actual form values when available, falls back to NetSuite variables
- **Smart Fallbacks**: Automatically switches between form data and NetSuite variables
- **Variable Examples**: `${record.tranid}`, `${companyInformation.companyName}`, `${item.quantity}`

### 3. Professional Layout
- **Table-based Design**: Consistent rendering across all sections
- **Black Header Styling**: Matches your original black header design
- **Responsive Layout**: Proper spacing and alignment for all sections

### 4. Complete Section Coverage
- Company Information (left column)
- Purchase Order Header (right column)
- Vendor & Ship To (side by side)
- Shipping Details (4-column layout)
- Line Items (5-column table)
- Comments & Totals (side by side)
- Contact & Signature (70/30 split)

## Integration Points

### 1. Form Data Collection
The integration automatically collects data from:
- Company fields (drag-and-drop ordered)
- Purchase order fields
- Vendor fields
- Ship to fields
- Shipping details
- Totals and calculations
- Comments and contact info

### 2. Data Processing
- Validates form data before generation
- Handles missing or empty fields gracefully
- Preserves field ordering from drag-and-drop

### 3. Error Handling
- Comprehensive error logging
- User-friendly error messages
- Fallback to safe defaults

## Customization

### 1. Adding New Fields
To add new fields to the NetSuite template:

1. Add the field to the form
2. Update the variable mapping in `getNetSuiteVariableMapping()`
3. Add the field to the appropriate template section

### 2. Modifying Templates
To modify the template structure:

1. Edit the appropriate `build*Section()` method
2. Update the styling in `buildHeaderSection()`
3. Test with the NetSuiteTest component

### 3. Adding New Sections
To add new sections:

1. Create a new `build*Section()` method
2. Add it to `buildBodySection()`
3. Update the template structure documentation

## Testing and Validation

### 1. Unit Testing
- Test individual mapping functions
- Verify template generation
- Check error handling

### 2. Integration Testing
- Test with real form data
- Verify NetSuite compatibility
- Check XML validation

### 3. User Testing
- Test the UI components
- Verify download functionality
- Check copy-to-clipboard

## Troubleshooting

### Common Issues

1. **Template Generation Fails**
   - Check form data structure
   - Verify field mappings
   - Check console for errors

2. **Missing Variables**
   - Ensure all required fields are present
   - Check variable mapping configuration
   - Verify field IDs match

3. **Styling Issues**
   - Check CSS compatibility
   - Verify font definitions
   - Test with different locales

4. **"getText is not defined" Error**
   - This error occurs when the NetSuite integration tries to access DOM elements
   - **Solution**: The integration now uses React state data directly instead of DOM reading
   - Ensure you're passing the form data object to the NetSuite functions
   - The integration automatically collects data from the form state

5. **NetSuite Template "item is not defined" Error**
   - **Problem**: When using the NetSuite template, you get errors like:
     ```
     The following has evaluated to null or missing:
     ==> item [in template "ID: -1" at line 109, column 76]
     ```
   - **Cause**: The template was using `${item.item}`, `${item.description}`, etc. without proper FreeMarker conditional syntax
   - **Solution**: Updated the line items section to use proper FreeMarker syntax with safe navigation:
     ```xml
     <#if record.item?has_content>
         <#list record.item as item>
             <td>${item.item!'-'}</td>
             <td>${item.description!'-'}</td>
             <!-- ... -->
         </#list>
     <#else>
         <!-- Fallback table with dashes -->
     </#if>
     ```
   - **Status**: ✅ **RESOLVED**

### Debug Mode

Enable debug logging by checking the browser console:
- Look for "🔀 NETSUITE INTEGRATION" messages
- Check "📄 NetSuite template generated successfully" confirmation
- Review any error messages
- Verify that form data is being passed correctly

## Future Enhancements

### 1. Advanced Templates
- Support for multiple template types
- Custom template selection
- Template versioning

### 2. Enhanced Mapping
- Dynamic field discovery
- Custom mapping rules
- Field validation rules

### 3. Integration Features
- Direct NetSuite API integration
- Template preview functionality
- Batch processing support

## Support

For issues or questions about the NetSuite integration:

1. Check the console for error messages
2. Review the variable mapping configuration
3. Test with the NetSuiteTest component
4. Verify form data structure

## License

This NetSuite integration layer is part of the Purchase Order XML generation system and follows the same licensing terms.
