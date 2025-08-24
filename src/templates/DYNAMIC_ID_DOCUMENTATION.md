# Dynamic ID System Documentation

## Overview

The Purchase Order Template now supports a comprehensive dynamic ID system that allows for flexible field identification and value retrieval. This system can handle both static field IDs (like `company-name`) and dynamically generated IDs (like `company-field-1703876543210-abc123def`).

## Key Features

### 1. **Dynamic Field Value Retrieval**
All helper functions now support multiple ID patterns:
- Static IDs (original format)
- Dynamic IDs with timestamps
- Dynamic IDs with prefixes
- Fallback DOM selectors

### 2. **Data Attributes for XML Structure**
Every field in the generated XML now includes `data-*` attributes for easy identification:
- `data-section`: Identifies major sections (e.g., "company-info", "vendor-ship-to")
- `data-subsection`: Identifies subsections (e.g., "vendor", "ship-to")
- `data-field`: Identifies specific field types (e.g., "company-name", "po-date")
- `data-row`: For line items, identifies the row index
- `data-row-id`: Unique identifier for line item rows

## Dynamic ID Helper Functions

### Core Field Retrieval Functions
- `getDynamicFieldValue(fieldArray, possibleIds, defaultValue)` - Core function for trying multiple ID patterns
- `getCompanyFieldValue(staticId, defaultValue)` - Company fields with dynamic support
- `getPOFieldValue(staticId, defaultValue)` - Purchase order fields with dynamic support
- `getVendorFieldValue(staticId, defaultValue)` - Vendor fields with dynamic support
- `getShipToFieldValue(staticId, defaultValue)` - Ship-to fields with dynamic support
- `getShippingFieldValue(fieldType, defaultValue)` - Shipping details with DOM/data fallbacks
- `getLineItemValue(rowIndex, fieldType, defaultValue)` - Line items with row-specific IDs
- `getTotalFieldValue(fieldType, defaultValue)` - Totals with multiple selector patterns
- `getCommentsValue(defaultValue)` - Comments with multiple selector patterns
- `getContactInfoValue(defaultValue)` - Contact info with multiple selector patterns

### Utility Functions
- `dynamicIdUtils.generateId(prefix, section)` - Generate new dynamic IDs
- `dynamicIdUtils.getPossibleIds(staticId, section)` - Get all possible ID variations
- `dynamicIdUtils.isValidDynamicId(id)` - Validate dynamic ID format
- `dynamicIdUtils.getFieldType(id)` - Extract base field type from any ID
- `dynamicIdUtils.getSection(id)` - Determine section from ID

### Field Mapping Functions
- `fieldMappingUtils.getFieldName(id)` - Get human-readable field names
- `fieldMappingUtils.getFieldsForSection(section)` - Get all fields for a section

## Field Categories and Their Dynamic IDs

### 1. Company Info Fields (`data-section="company-info"`)
- **Static IDs**: `company-name`, `company-address`, `company-city-state`, `company-phone`, `company-fax`, `company-website`
- **Dynamic Patterns**: `company-field-*`, `company-*-timestamp-random`
- **XML Data Attributes**: `data-field="company-name"`, etc.

### 2. Purchase Order Fields (`data-section="purchase-order-info"`)
- **Static IDs**: `po-title`, `po-date`, `po-number`
- **Dynamic Patterns**: `po-field-*`, `po-*-timestamp-random`
- **XML Data Attributes**: `data-field="po-title"`, etc.

### 3. Vendor Fields (`data-subsection="vendor"`)
- **Static IDs**: `vendor-company`, `vendor-contact`, `vendor-address`, `vendor-city-state`, `vendor-phone`, `vendor-fax`
- **Dynamic Patterns**: `vendor-field-*`, `vendor-*-timestamp-random`
- **XML Data Attributes**: `data-field="vendor-company"`, etc.

### 4. Ship To Fields (`data-subsection="ship-to"`)
- **Static IDs**: `ship-to-name`, `ship-to-company`, `ship-to-address`, `ship-to-city-state`, `ship-to-phone`, `ship-to-fax`
- **Dynamic Patterns**: `ship-to-field-*`, `ship-to-*-timestamp-random`
- **XML Data Attributes**: `data-field="ship-to-name"`, etc.

### 5. Shipping Details (`data-section="shipping-details"`)
- **Static IDs**: `requisitioner`, `shipVia`, `fob`, `shippingTerms`
- **Dynamic Patterns**: Multiple DOM selector patterns
- **XML Data Attributes**: `data-field="requisitioner"`, etc.

### 6. Line Items (`data-section="line-items"`)
- **Row-Based IDs**: `line-item-{rowIndex}-{fieldType}`
- **Field Types**: `itemNumber`, `description`, `quantity`, `unitPrice`, `total`
- **XML Data Attributes**: `data-row="{index}"`, `data-field="{fieldType}"`, `data-row-id="line-item-{index}"`

### 7. Totals (`data-subsection="totals"`)
- **Static IDs**: `subtotal`, `tax`, `shipping`, `other`, `total`
- **Dynamic Patterns**: `total-*`, `totals-*`
- **XML Data Attributes**: `data-field="subtotal"`, etc.

### 8. Comments (`data-subsection="comments"`)
- **Static IDs**: `comments`
- **Dynamic Patterns**: `comments-field-*`, `comment-*`
- **XML Data Attributes**: `data-field="comments"`

### 9. Contact Info (`data-section="contact-signature"`)
- **Static IDs**: `contactInfo`
- **Dynamic Patterns**: `contact-info-field-*`, `contact-*`
- **XML Data Attributes**: `data-field="contact-info"`

## Usage Examples

### Generating Dynamic IDs
```javascript
import { dynamicIdUtils } from './PurchaseOrderTemplate';

// Generate a new company field ID
const newCompanyFieldId = dynamicIdUtils.generateId('field', 'company');
// Result: "company-field-1703876543210-abc123def"

// Get possible IDs for a static field
const possibleIds = dynamicIdUtils.getPossibleIds('company-name', 'company');
// Result: ['company-name', 'company-field-company-name', 'company-name', ...]
```

### Field Value Retrieval
The system will automatically try multiple ID patterns when retrieving field values:

1. **Static ID** (e.g., `company-name`)
2. **Prefixed Dynamic ID** (e.g., `company-field-company-name`)
3. **Timestamped Dynamic ID** (e.g., `company-name-1703876543210`)
4. **Pattern Matching** for similar IDs in the field array
5. **DOM Selectors** as fallback for certain field types

### XML Generation
When `generatePurchaseOrderXML()` is called, it will:
1. Try to find values using the dynamic ID system
2. Fall back to DOM queries using multiple selector patterns
3. Use default values if no value is found
4. Generate XML with comprehensive `data-*` attributes for all fields

## Benefits

1. **Backwards Compatibility**: Static IDs still work perfectly
2. **Dynamic Field Support**: Can handle runtime-generated field IDs
3. **Robust Fallbacks**: Multiple strategies for finding field values
4. **Easy Debugging**: Comprehensive `data-*` attributes in XML
5. **Extensible**: Easy to add new field types and ID patterns
6. **Self-Documenting**: Clear field mapping and utilities

## Integration Notes

- The existing React components don't need to change immediately
- The system will find values regardless of ID format used
- XML output now includes rich metadata for easy field identification
- Perfect for integrating with dynamic form builders or field management systems
