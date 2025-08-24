// Purchase Order XML Template for NetSuite Integration
// This template generates XML compatible with Big Faceless Report Generator (BFR)

import { processFormData } from './FormDataMapper';

// Function to get current header colors from CSS variables
function getHeaderColors() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  return {
    headerBackground: computedStyle.getPropertyValue('--header-background').trim() || '#000000',
    headerText: computedStyle.getPropertyValue('--header-text').trim() || '#ffffff',
    headerBorder: computedStyle.getPropertyValue('--header-border').trim() || 'rgba(255, 255, 255, 0.3)',
    sectionTitleBackground: computedStyle.getPropertyValue('--section-title-background').trim() || '#f8fafc',
    sectionTitleText: computedStyle.getPropertyValue('--section-title-text').trim() || '#374151'
  };
}

// Function to generate XML from React form data
export function generatePurchaseOrderXML(formData, options = {}) {
  // DEBUG: Log that we're using the DYNAMIC ID template
  console.log('🚀 DYNAMIC ID TEMPLATE VERSION LOADED - generatePurchaseOrderXML called');
  console.log('📅 Template updated at:', new Date().toISOString());
  console.log('📊 Raw form data received:', formData);
  
  // Get current header colors for XML generation
  const headerColors = getHeaderColors();
  console.log('🎨 Current header colors:', headerColors);
  
  // Process and validate form data using the FormDataMapper
  let processedData;
  try {
    processedData = processFormData(formData, {
      calculateTotals: options.calculateTotals !== false,
      validate: options.validate !== false,
      formatForXML: true,
      throwOnValidationError: options.throwOnValidationError || false
    });
    console.log('📊 Processed form data:', processedData);
  } catch (error) {
    console.error('❌ Form data processing failed:', error);
    if (options.throwOnValidationError) {
      throw error;
    }
    // Fallback to using raw data
    processedData = formData || {};
  }
  
  // Merge processed data with original so ad-hoc fields (totals, shipping, UI line item keys) survive
  // Prefer original ad-hoc keys when present (they reflect the live DOM at export time)
  const data = {
    ...(processedData || {}),
    ...(formData || {})
  };

  // Normalize line items to expose both key styles expected by template rendering
  if (Array.isArray(data.lineItems)) {
    data.lineItems = data.lineItems.map((row) => {
      const quantity = row.quantity ?? row.qty ?? '';
      const unitPrice = row.unitPrice ?? row.rate ?? '';
      const total = row.total ?? row.amount ?? '';
      return {
        ...row,
        qty: row.qty ?? (quantity !== '' ? String(quantity) : ''),
        rate: row.rate ?? (unitPrice !== '' ? String(unitPrice) : ''),
        amount: row.amount ?? (total !== '' ? String(total) : ''),
        quantity: row.quantity ?? (quantity !== '' ? Number(String(quantity).replace(/[$,]/g, '')) : 0),
        unitPrice: row.unitPrice ?? (unitPrice !== '' ? Number(String(unitPrice).replace(/[$,]/g, '')) : 0),
        total: row.total ?? (total !== '' ? Number(String(total).replace(/[$,]/g, '')) : 0)
      };
    });
  }
  
  // IMPORTANT: For field ordering, use the original formData to preserve drag-and-drop order
  const fieldOrderData = {
    ...data,
    companyFields: formData.companyFields || data.companyFields || [],
    purchaseOrderFields: formData.purchaseOrderFields || data.purchaseOrderFields || [],
    vendorFields: formData.vendorFields || data.vendorFields || [],
    shipToFields: formData.shipToFields || data.shipToFields || []
  };
  
  // DEBUG: Log field order data creation
  console.log('🔍 DEBUG: fieldOrderData created with:');
  console.log('🔍 DEBUG: - companyFields:', fieldOrderData.companyFields?.map(f => ({ id: f.id, label: f.label })));
  console.log('🔍 DEBUG: - purchaseOrderFields:', fieldOrderData.purchaseOrderFields?.map(f => ({ id: f.id, label: f.label })));
  console.log('🔍 DEBUG: - formData.companyFields:', formData.companyFields?.map(f => ({ id: f.id, label: f.label })));
  console.log('🔍 DEBUG: - data.companyFields:', data.companyFields?.map(f => ({ id: f.id, label: f.label })));
  
  // VALIDATION: Ensure field order data is robust and independent of section order
  console.log('🔍 DEBUG: Field order data validation:');
  console.log('🔍 DEBUG: - fieldOrderData.companyFields length:', fieldOrderData.companyFields?.length);
  console.log('🔍 DEBUG: - fieldOrderData.companyFields is array:', Array.isArray(fieldOrderData.companyFields));
  console.log('🔍 DEBUG: - fieldOrderData.companyFields IDs:', fieldOrderData.companyFields?.map(f => f.id));
  
  // Ensure field order data is always available and valid
  if (!Array.isArray(fieldOrderData.companyFields) || fieldOrderData.companyFields.length === 0) {
    console.warn('⚠️ WARNING: companyFields is not available or empty, this may cause field order issues');
  }
  
  // Helper function to safely get field values with fallbacks (for simple fields)
  const getFieldValue = (fieldName, defaultValue = '') => {
    return data[fieldName] || defaultValue;
  };

  // Enhanced helper function to get field values by dynamic ID or static fallback
  const getDynamicFieldValue = (fieldArray, possibleIds, defaultValue = '') => {
    if (!fieldArray || !Array.isArray(fieldArray)) {
      return defaultValue;
    }
    
    // Try each possible ID in order of preference
    for (const fieldId of possibleIds) {
      const field = fieldArray.find(f => f.id === fieldId);
      if (field && field.value) {
        return field.value;
      }
    }
    return defaultValue;
  };

  // Helper function to get company field values with dynamic ID support
  const getCompanyFieldValue = (staticId, defaultValue = '') => {
    if (data.companyFields && Array.isArray(data.companyFields)) {
      // First try the static ID, then try dynamic IDs that might have been generated
      const possibleIds = [
        staticId,
        `company-field-${staticId}`,
        `${staticId}-${Date.now()}`,
        ...data.companyFields.filter(f => f.id.includes(staticId.replace('company-', ''))).map(f => f.id)
      ];
      return getDynamicFieldValue(data.companyFields, possibleIds, defaultValue);
    }
    return defaultValue;
  };

  // Helper function to get purchase order field values with dynamic ID support
  const getPOFieldValue = (staticId, defaultValue = '') => {
    if (data.purchaseOrderFields && Array.isArray(data.purchaseOrderFields)) {
      const possibleIds = [
        staticId,
        `po-field-${staticId}`,
        `${staticId}-${Date.now()}`,
        ...data.purchaseOrderFields.filter(f => f.id.includes(staticId.replace('po-', ''))).map(f => f.id)
      ];
      return getDynamicFieldValue(data.purchaseOrderFields, possibleIds, defaultValue);
    }
    return defaultValue;
  };

  // Helper function to get vendor field values with dynamic ID support
  const getVendorFieldValue = (staticId, defaultValue = '') => {
    if (data.vendorFields && Array.isArray(data.vendorFields)) {
      const possibleIds = [
        staticId,
        `vendor-field-${staticId}`,
        `${staticId}-${Date.now()}`,
        ...data.vendorFields.filter(f => f.id.includes(staticId.replace('vendor-', ''))).map(f => f.id)
      ];
      return getDynamicFieldValue(data.vendorFields, possibleIds, defaultValue);
    }
    return defaultValue;
  };

  // Helper function to get ship-to field values with dynamic ID support
  const getShipToFieldValue = (staticId, defaultValue = '') => {
    if (data.shipToFields && Array.isArray(data.shipToFields)) {
      const possibleIds = [
        staticId,
        `ship-to-field-${staticId}`,
        `${staticId}-${Date.now()}`,
        ...data.shipToFields.filter(f => f.id.includes(staticId.replace('ship-to-', ''))).map(f => f.id)
      ];
      return getDynamicFieldValue(data.shipToFields, possibleIds, defaultValue);
    }
    return defaultValue;
  };

  // Helper function to get totals field values with dynamic ID support
  const getTotalsFieldValue = (staticId, defaultValue = '') => {
    if (data.totalsFields && Array.isArray(data.totalsFields)) {
      const possibleIds = [
        staticId,
        `totals-field-${staticId}`,
        `${staticId}-${Date.now()}`,
        ...data.totalsFields.filter(f => f.id.includes(staticId)).map(f => f.id)
      ];
      return getDynamicFieldValue(data.totalsFields, possibleIds, defaultValue);
    }
    return defaultValue;
  };

  // --------------------------------------------------------------------------
  // Generic label+value formatter for dynamic fields across sections
  // Ensures fields like "Tax ID Number" render as "Tax ID Number: 123..."
  // Avoids double-prefixing when the value already starts with the label/prefix
  const formatFieldWithLabel = (field, rawValue) => {
    const value = (rawValue ?? '').toString();
    const labelText = (field?.label || field?.id || '').toString().replace(/:\s*$/, '').trim();
    if (!labelText) return value;
    // If value already starts with the label or a known prefix, don't double prefix
    const lowered = value.toLowerCase();
    const loweredLabel = labelText.toLowerCase();
    if (lowered.startsWith(`${loweredLabel}:`) || lowered.startsWith('phone:') || lowered.startsWith('fax:') || lowered.startsWith('website:')) {
      return value || labelText; // if empty, show just label
    }
    if (!value) return labelText; // show label alone if no value
    return `${labelText}: ${value}`;
  };

  // ============================================================================
  // MODULAR XML BUILDER FUNCTIONS
  // ============================================================================
  
  // Build Company Information XML with dynamic field ordering (same pattern as section swapping)
  
  const buildCompanyXML = (position = 'left') => {
    // Get company fields from fieldOrderData to preserve drag-and-drop order
    const companyFields = fieldOrderData.companyFields || [];
    
    // CRITICAL: Get field order from data (same pattern as section order)
    const fieldOrder = data.fieldOrder?.company || companyFields.map(f => f.id);
    
    console.log('🔀 Building company XML with dynamic field ordering');
    console.log('🔀 Company fields received from data:', companyFields.length);
    console.log('🔀 Company fields IDs in current order:', companyFields.map(f => f.id));
    console.log('🔀 Company fields labels in current order:', companyFields.map(f => f.label));
    console.log('🔀 Company fields values in current order:', companyFields.map(f => f.value));
    console.log('🔀 Field order from data:', fieldOrder);
    
    // CRITICAL: Ensure field order is completely independent of section order
    // The field order should be preserved exactly as it appears in fieldOrderData.companyFields
    // regardless of whether this section is on the left or right
    console.log('🔍 DEBUG: Field order independence verification:');
    console.log('🔍 DEBUG: - Current section order:', data.sectionOrder?.sections1And2);
    console.log('🔍 DEBUG: - Company fields order (should be independent):', companyFields.map(f => ({ id: f.id, label: f.label, position: companyFields.indexOf(f) })));
    
    // CRITICAL: Reorder fields based on fieldOrder (same pattern as section swapping)
    const orderedCompanyFields = fieldOrder.map(fieldId => {
      const field = companyFields.find(f => f.id === fieldId);
      if (!field) {
        console.warn(`⚠️ WARNING: Field with ID ${fieldId} not found in companyFields`);
        return null;
      }
      return field;
    }).filter(Boolean); // Remove any null fields
    
    console.log('🔀 Ordered company fields for XML generation:', orderedCompanyFields.map(f => ({ id: f.id, label: f.label, position: orderedCompanyFields.indexOf(f) })));
    
    // Build rows dynamically based on ordered field order (same as section swapping)
    const fieldRows = orderedCompanyFields.map((field, index) => {
      const fieldValue = field.value || field.placeholder || '';
      const isHeader = field.id === 'company-name';
      
      console.log(`🔀 Processing field ${index}:`, { id: field.id, label: field.label, value: fieldValue, isHeader, position: index });
      
      if (isHeader) {
        const row = `<tr><td class="header-company" style="text-align: left;" data-field="${field.id}">${fieldValue}</td></tr>`;
        console.log(`🔀 Generated header row for ${field.id}:`, row);
        return row;
      } else {
        // Prefix generic dynamic fields with their label (except known special cases handled by formatter)
        const displayText = formatFieldWithLabel(field, fieldValue);
        const row = `<tr><td style="text-align: left;" data-field="${field.id}">${displayText}</td></tr>`;
        console.log(`🔀 Generated regular row for ${field.id}:`, row);
        return row;
      }
    }).join('');
    
    console.log('🔀 Final generated fieldRows:', fieldRows);
    
    // Side-aware padding to keep spacing consistent when swapped
    const companyTdPadding = position === 'left' ? 'padding-right: 24px;' : 'padding-left: 36px;';
    const result = `
      <td style="width: 65%; ${companyTdPadding}" data-section="company-info">
        <table>
          ${fieldRows}
        </table>
      </td>
    `;
    
    console.log('🔀 Final company XML result:', result);
    return result;
  };

  // Build Company Information XML with NetSuite variables (FreeMarker syntax)
  const buildCompanyNetSuiteXML = (position = 'left') => {
    // Get company fields from fieldOrderData to preserve drag-and-drop order
    const companyFields = fieldOrderData.companyFields || [];
    
    // Field mapping from form field IDs to NetSuite variables
    const netSuiteFieldMapping = {
      'company-name': '${companyInformation.companyName}',
      'company-address': '${companyInformation.addressText}',
      'company-phone': '${companyInformation.phone}',
      'company-fax': '${companyInformation.fax}',
      'company-email': '${companyInformation.email}',
      'company-website': '${companyInformation.website}',
      'company-tax-id': '${companyInformation.taxId}',
      'company-duns': '${companyInformation.dunsNumber}',
      'company-business-license': '${companyInformation.businessLicense}',
      'company-registration': '${companyInformation.registrationNumber}'
    };
    
    // CRITICAL: Get field order from data (same pattern as section order)
    const fieldOrder = data.fieldOrder?.company || companyFields.map(f => f.id);
    
    console.log('🔀 Building NetSuite company XML with dynamic field ordering');
    console.log('🔀 Company fields received from data:', companyFields.length);
    console.log('🔀 Field order from data:', fieldOrder);
    
    // CRITICAL: Reorder fields based on fieldOrder
    const orderedCompanyFields = fieldOrder.map(fieldId => {
      const field = companyFields.find(f => f.id === fieldId);
      if (!field) {
        console.warn(`⚠️ WARNING: Field with ID ${fieldId} not found in companyFields`);
        return null;
      }
      return field;
    }).filter(Boolean);
    
    console.log('🔀 Ordered company fields for NetSuite XML generation:', orderedCompanyFields.map(f => ({ id: f.id, label: f.label })));
    
    // Build rows with NetSuite variables instead of hardcoded values
    const fieldRows = orderedCompanyFields.map((field, index) => {
      const isHeader = field.id === 'company-name';
      
      // Get NetSuite variable for this field, or create a generic one
      let netSuiteVariable = netSuiteFieldMapping[field.id];
      
      if (!netSuiteVariable) {
        // For dynamic fields, create a generic NetSuite variable
        const cleanId = field.id.replace(/^company-/, '').replace(/-/g, '');
        netSuiteVariable = `\${companyInformation.${cleanId}}`;
        console.log(`🔀 Generated dynamic NetSuite variable for ${field.id}: ${netSuiteVariable}`);
      }
      
      console.log(`🔀 Processing NetSuite field ${index}:`, { 
        id: field.id, 
        label: field.label, 
        netSuiteVariable, 
        isHeader, 
        position: index 
      });
      
      if (isHeader) {
        const row = `<tr><td class="header-company" style="text-align: left;" data-field="${field.id}">${netSuiteVariable}</td></tr>`;
        console.log(`🔀 Generated NetSuite header row for ${field.id}:`, row);
        return row;
      } else {
        // For non-header fields, include label if it's not already in the NetSuite variable
        const needsLabel = !['${companyInformation.addressText}', '${companyInformation.phone}', '${companyInformation.email}'].includes(netSuiteVariable);
        const displayText = needsLabel ? `${field.label}: ${netSuiteVariable}` : netSuiteVariable;
        const row = `<tr><td style="text-align: left;" data-field="${field.id}">${displayText}</td></tr>`;
        console.log(`🔀 Generated NetSuite regular row for ${field.id}:`, row);
        return row;
      }
    }).join('');
    
    console.log('🔀 Final generated NetSuite fieldRows:', fieldRows);
    
    // Side-aware padding to keep spacing consistent when swapped
    const companyTdPadding = position === 'left' ? 'padding-right: 24px;' : 'padding-left: 36px;';
    const result = `
      <td style="width: 65%; ${companyTdPadding}" data-section="company-info">
        <table>
          ${fieldRows}
        </table>
      </td>
    `;
    
    console.log('🔀 Final NetSuite company XML result:', result);
    return result;
  };

  // Build Purchase Order Information XML
  const buildPurchaseOrderXML = (position = 'right') => {
    // Get purchase order fields from fieldOrderData to preserve drag-and-drop order
    const purchaseOrderFields = fieldOrderData.purchaseOrderFields || [];
    
    // CRITICAL: Get field order from data (same pattern as section order)
    const fieldOrder = data.fieldOrder?.purchaseOrder || purchaseOrderFields.map(f => f.id);
    
    console.log('🔀 Building purchase order XML with dynamic field ordering');
    console.log('🔀 Purchase order fields received from data:', purchaseOrderFields.length);
    console.log('🔀 Purchase order fields IDs in current order:', purchaseOrderFields.map(f => f.id));
    console.log('🔀 Field order from data:', fieldOrder);
    
    // CRITICAL: Reorder fields based on fieldOrder (same pattern as section swapping)
    const orderedPOFields = fieldOrder.map(fieldId => {
      const field = purchaseOrderFields.find(f => f.id === fieldId);
      if (!field) {
        console.warn(`⚠️ WARNING: Field with ID ${fieldId} not found in purchaseOrderFields`);
        return null;
      }
      return field;
    }).filter(Boolean); // Remove any null fields
    
    console.log('🔀 Ordered purchase order fields for XML generation:', orderedPOFields.map(f => ({ id: f.id, label: f.label, position: orderedPOFields.indexOf(f) })));
    
    // Build XML based on ordered fields
    const fieldRows = orderedPOFields.map((field, index) => {
      // Prefer captured value; fallback to template getters to ensure content always present
      const isTitle = field.id === 'po-title';
      if (isTitle) {
        const value = field.value || getPOFieldValue('po-title', 'PURCHASE ORDER');
        return `<tr><td class="header-title" style="text-align: right;" data-field="${field.id}">${value}</td></tr>`;
      }
      if (field.id === 'po-date') {
        const value = field.value || getPOFieldValue('po-date', 'MM/DD/YYYY');
        return `<tr><td style="text-align: right;"><table style="width: 100%;"><tr><td class="header-info" style="width: 30%; text-align: left;"><b>DATE</b></td><td class="header-info" style="width: 70%; text-align: left;" data-field="po-date">${value}</td></tr></table></td></tr>`;
      }
      if (field.id === 'po-number') {
        const value = field.value || getPOFieldValue('po-number', '[PO Number]');
        return `<tr><td style="text-align: right;"><table style="width: 100%;"><tr><td class="header-info" style="width: 30%; text-align: left;"><b>PO #</b></td><td class="header-info" style="width: 70%; text-align: left;" data-field="po-number">${value}</td></tr></table></td></tr>`;
      }
      
      const genericValue = field.value || getPOFieldValue(field.id, '');
      const displayText = formatFieldWithLabel(field, genericValue);
      return `<tr><td style="text-align: right;" data-field="${field.id}">${displayText}</td></tr>`;
    }).join('');
    
    // Side-aware padding: when PO is on the left, push it away from the right column
    const poTdPadding = position === 'left' ? 'padding-right: 56px;' : 'padding-left: 28px;';
    return `
      <td style="width: 35%; ${poTdPadding}" align="right" data-section="purchase-order-info">
        <table>
          ${fieldRows}
        </table>
      </td>
    `;
  };



  // Build Vendor-ShipTo Section XML with dynamic ordering
  const buildVendorShipToSectionXML = () => {
    // Get section order from data, default to [section3, section4] if not provided
    const sectionOrder = data.sectionOrder?.sections3And4 || ['section3', 'section4'];
    const leftSection = sectionOrder[0];
    const rightSection = sectionOrder[1];
    
    console.log('🔀 Building vendor-shipTo section with order:', { leftSection, rightSection });
    console.log('🔀 sections3And4 array:', data.sectionOrder?.sections3And4);
    
    let leftColumn, rightColumn;
    
    if (leftSection === 'section3') {
      // Default order: Vendor left, Ship To right
      leftColumn = buildVendorXML();
      rightColumn = buildShipToXML();
      console.log('🔀 Using default order: Vendor left, Ship To right');
    } else {
      // Swapped order: Ship To left, Vendor right
      leftColumn = buildShipToXML();
      rightColumn = buildVendorXML();
      console.log('🔀 Using swapped order: Ship To left, Vendor right');
    }
    
    return `
      <table style="margin-top: 20px;" data-section="vendor-ship-to">
        <tr>
          ${leftColumn}
          ${rightColumn}
        </tr>
      </table>
    `;
  };

  // Build Shipping Details XML with dynamic column ordering
  const buildShippingDetailsXML = () => {
    // Get shipping column order from data, default to standard order if not provided
    const shippingColumnOrder = data.sectionOrder?.shippingColumns || ['requisitioner', 'shipVia', 'fob', 'shippingTerms'];
    
    console.log('🔀 Building shipping details with column order:', shippingColumnOrder);
    
    // Column configuration mapping
    const columnConfig = {
      requisitioner: { label: 'REQUISITIONER', field: 'requisitioner' },
      shipVia: { label: 'SHIP VIA', field: 'shipVia' },
      fob: { label: 'F.O.B.', field: 'fob' },
      shippingTerms: { label: 'SHIPPING TERMS', field: 'shippingTerms' }
    };
    
    // Helper function to get column configuration (handles custom columns)
    const getColumnConfig = (columnId) => {
      // Check if it's a standard column
      if (columnConfig[columnId]) {
        return columnConfig[columnId];
      }
      
      // Handle custom columns (those that start with 'custom-')
      if (columnId.startsWith('custom-')) {
        return {
          label: columnId.toUpperCase().replace('custom-', 'CUSTOM '),
          field: columnId
        };
      }
      
      // Fallback for unknown columns
      console.warn(`⚠️ Unknown shipping column: ${columnId}`);
      return {
        label: columnId.toUpperCase(),
        field: columnId
      };
    };
    
    // Build header row
    const headerCells = shippingColumnOrder.map(columnId => {
      const config = getColumnConfig(columnId);
      return `<td class="section-header" style="width: 25%;">${config.label}</td>`;
    }).join('');
    
    // Build content row
    const contentCells = shippingColumnOrder.map(columnId => {
      const config = getColumnConfig(columnId);
      return `<td class="section-content" data-field="${config.field}">${getShippingFieldValue(config.field, `[${config.label}]`)}</td>`;
    }).join('');
    
    return `
      <table style="margin-top: 15px;" data-section="shipping-details">
        <tr>
          ${headerCells}
        </tr>
        <tr>
          ${contentCells}
        </tr>
      </table>
    `;
  };

  // Build Vendor-ShipTo AND Shipping Details sections with vertical swapping
  const buildVendorShipToAndShippingDetailsXML = () => {
    // Get major sections order from data - this is the new state for group swapping
    const majorSectionsOrder = data.majorSectionsOrder || ['vendor-shipto-group', 'shipping-section'];
    const topSection = majorSectionsOrder[0];
    const bottomSection = majorSectionsOrder[1];
    
    console.log('🔀 Building vendor-shipTo + shipping details with majorSectionsOrder:', { topSection, bottomSection });
    console.log('🔀 majorSectionsOrder array:', data.majorSectionsOrder);
    
    let topContent, bottomContent;
    
    if (topSection === 'vendor-shipto-group') {
      // Default order: Vendor-ShipTo group on top, Shipping Details below
      topContent = buildVendorShipToSectionXML();
      bottomContent = buildShippingDetailsXML();
      console.log('🔀 Using default order: Vendor-ShipTo group top, Shipping section bottom');
    } else {
      // Swapped order: Shipping Details on top, Vendor-ShipTo group below
      topContent = buildShippingDetailsXML();
      bottomContent = buildVendorShipToSectionXML();
      console.log('🔀 Using swapped order: Shipping section top, Vendor-ShipTo group bottom');
    }
    
    return `
      ${topContent}
      ${bottomContent}
    `;
  };

  // Build Header Section XML (Company + Purchase Order) with dynamic ordering
  const buildHeaderSectionXML = () => {
    // Get section order from data, default to [section1, section2] if not provided
    const sectionOrder = data.sectionOrder?.sections1And2 || ['section1', 'section2'];
    const leftSection = sectionOrder[0];
    const rightSection = sectionOrder[1];
    
    console.log('🔀 Building header section with order:', { leftSection, rightSection });
    console.log('🔀 Full sectionOrder data:', data.sectionOrder);
    console.log('🔀 Full data object keys:', Object.keys(data));
    console.log('🔀 sections1And2 array:', data.sectionOrder?.sections1And2);
    console.log('🔀 sections1And2 type:', typeof data.sectionOrder?.sections1And2);
    console.log('🔀 sections1And2 length:', data.sectionOrder?.sections1And2?.length);
    console.log('🔀 sections1And2 values:', JSON.stringify(data.sectionOrder?.sections1And2));
    
    // DEBUG: Check field order data when building header
    console.log('🔍 DEBUG: fieldOrderData.companyFields when building header:', fieldOrderData.companyFields?.map(f => ({ id: f.id, label: f.label })));
    console.log('🔍 DEBUG: fieldOrderData.purchaseOrderFields when building header:', fieldOrderData.purchaseOrderFields?.map(f => ({ id: f.id, label: f.label })));
    
    // IMPORTANT: Field order should be completely independent of section order
    // Always use the current field order from fieldOrderData, regardless of section position
    console.log('🔍 DEBUG: Ensuring field order independence from section order');
    
    let leftColumn, rightColumn;
    
    if (leftSection === 'section1') {
      // Company on left, Purchase Order on right
      leftColumn = buildCompanyXML('left');
      rightColumn = buildPurchaseOrderXML('right');
      console.log('🔀 Using default order: Company left, Purchase Order right');
    } else {
      // Purchase Order on left, Company on right (sections swapped)
      leftColumn = buildPurchaseOrderXML('left');
      rightColumn = buildCompanyXML('right');
      console.log('🔀 Using swapped order: Purchase Order left, Company right');
    }
    
    // DEBUG: Verify that field order is preserved regardless of section position
    console.log('🔍 DEBUG: Field order verification - Company fields should maintain custom order');
    console.log('🔍 DEBUG: Final company XML will use fieldOrderData.companyFields order');
    
    return `
      <table>
        <tr>
          ${leftColumn}
          ${rightColumn}
        </tr>
      </table>
    `;
  };

  // Build Vendor Information XML (dynamic label prefixing for all fields)
  const buildVendorXML = () => {
    // Get field order for vendor; fallback to current array order if not provided
    const vendorFields = fieldOrderData.vendorFields || [];
    const vendorFieldOrder = data.fieldOrder?.vendor || vendorFields.map(f => f.id);
    
    const orderedVendorFields = vendorFieldOrder.map(fieldId => vendorFields.find(f => f.id === fieldId)).filter(Boolean);
    
    const rows = orderedVendorFields.map(f => {
      const raw = f.value || getVendorFieldValue(f.id, '');
      const display = formatFieldWithLabel(f, raw);
      return `<span data-field="${f.id}">${display}</span>`;
    }).join('<br/>');
    
    return `
      <td style="width: 50%;" data-subsection="vendor">
        <table>
          <tr>
            <td class="section-header">VENDOR</td>
          </tr>
          <tr>
            <td class="section-content">${rows}</td>
          </tr>
        </table>
      </td>
    `;
  };
 
  // Build Ship To Information XML (dynamic label prefixing for all fields)
  const buildShipToXML = () => {
    // Get field order for ship-to; fallback to current array order if not provided
    const shipToFields = fieldOrderData.shipToFields || [];
    const shipToFieldOrder = data.fieldOrder?.shipTo || shipToFields.map(f => f.id);
    
    const orderedShipToFields = shipToFieldOrder.map(fieldId => shipToFields.find(f => f.id === fieldId)).filter(Boolean);
    
    const rows = orderedShipToFields.map(f => {
      const raw = f.value || getShipToFieldValue(f.id, '');
      const display = formatFieldWithLabel(f, raw);
      return `<span data-field="${f.id}">${display}</span>`;
    }).join('<br/>');
    
    return `
      <td style="width: 50%;" data-subsection="ship-to">
        <table>
          <tr>
            <td class="section-header">SHIP TO</td>
          </tr>
          <tr>
            <td class="section-content">${rows}</td>
          </tr>
        </table>
      </td>
    `;
  };

  // Build Vendor/Ship-To Section XML with dynamic ordering
  const buildVendorShipToXML = () => {
    // Get section order from data, default to [section3, section4] if not provided
    const sectionOrder = data.sectionOrder?.sections3And4 || ['section3', 'section4'];
    const leftSection = sectionOrder[0];
    const rightSection = sectionOrder[1];
    
    console.log('🔀 Building vendor/ship-to section with order:', { leftSection, rightSection });
    
    let leftColumn, rightColumn;
    
    if (leftSection === 'section3') {
      leftColumn = buildVendorXML();
      rightColumn = buildShipToXML();
    } else {
      leftColumn = buildShipToXML();
      rightColumn = buildVendorXML();
    }
    
    return `
      <table style="margin-top: 20px;" data-section="vendor-ship-to">
        <tr>
          ${leftColumn}
          ${rightColumn}
        </tr>
      </table>
    `;
  };

  // Build Line Items XML with dynamic column ordering
  const buildLineItemsXML = () => {
    // Get column order from data, default to standard order if not provided
    const columnOrder = data.sectionOrder?.lineItemColumns || ['itemNumber', 'description', 'qty', 'rate', 'amount'];
    
    console.log('🔀 Building line items with column order:', columnOrder);
    console.log('🔀 Line items data:', data.lineItems);
    console.log('🔀 Column order from state:', data.sectionOrder?.lineItemColumns);
    console.log('🔀 Full data object:', data);
    
    // Column configuration mapping
    const columnConfig = {
      itemNumber: { label: 'Item#', colSpan: 3, field: 'itemNumber' },
      description: { label: 'Description', colSpan: 12, field: 'description' },
      qty: { label: 'Qty', colSpan: 2, field: 'qty' },
      rate: { label: 'Rate', colSpan: 3, field: 'rate' },
      amount: { label: 'Amount', colSpan: 3, field: 'amount' }
    };
    
    // Build header row
    const headerRow = columnOrder.map(columnId => {
      let config, label;
      
      if (columnId.startsWith('custom-')) {
        // Handle custom columns
        const customType = columnId.replace('custom-', '').split('-')[0]; // Get first part after 'custom-'
        label = customType.charAt(0).toUpperCase() + customType.slice(1); // Capitalize first letter
        config = { colSpan: 3 }; // Default colSpan for custom columns
        console.log(`🔀 Custom column "${columnId}" -> label: "${label}", colSpan: ${config.colSpan}`);
      } else {
        // Handle standard columns
        config = columnConfig[columnId];
        label = config.label;
        console.log(`🔀 Standard column "${columnId}" -> label: "${label}", colSpan: ${config.colSpan}`);
      }
      
      return `<td class="item-header" colSpan="${config.colSpan}">${label}</td>`;
    }).join('');
    
    // Build data rows using actual line item data
    const lineItems = data.lineItems || [];
    const actualRowCount = lineItems.length;
    console.log(`🔀 Building ${actualRowCount} data rows from line items data`);
    
    const dataRows = lineItems.map((rowData, rowIndex) => {
      const rowCells = columnOrder.map(columnId => {
        let config, fieldValue;
        
        if (columnId.startsWith('custom-')) {
          // Handle custom columns
          config = { colSpan: 3 }; // Default colSpan for custom columns
          fieldValue = rowData[columnId] || '-';
          console.log(`🔀 Custom column "${columnId}" row ${rowIndex}: value = "${fieldValue}"`);
        } else {
          // Handle standard columns
          config = columnConfig[columnId];
          // Resolve value with fallbacks between UI keys and numeric keys
          fieldValue = rowData[columnId];
          if (fieldValue === undefined || fieldValue === null || fieldValue === '') {
            if (columnId === 'qty') fieldValue = rowData.quantity;
            else if (columnId === 'rate') fieldValue = rowData.unitPrice;
            else if (columnId === 'amount') fieldValue = rowData.total;
          }
          if (fieldValue === undefined || fieldValue === null || fieldValue === '') fieldValue = '-';
          console.log(`🔀 Standard column "${columnId}" row ${rowIndex}: value = "${fieldValue}"`);
        }
        
        return `<td colSpan="${config.colSpan}">${fieldValue}</td>`;
      }).join('');
      
      return `<tr data-row-id="line-item-${rowIndex}" data-row-index="${rowIndex}">${rowCells}</tr>`;
    }).join('');
    
    return `
      <table style="margin-top: 15px;" data-section="line-items">
        <tr>
          ${headerRow}
        </tr>
        ${dataRows}
      </table>
    `;
  };

  // Build Comments Section XML
  const buildCommentsXML = () => {
    // Get comments fields order from data, default to standard order if not provided
    const commentsFieldsOrder = data.commentsFields || [
      { id: 'comments-main', label: 'Comments or Special Instructions:', value: '[Enter comments or special instructions...]' }
    ];

    // Helper function to get field value with fallbacks
    const getCommentsFieldValue = (fieldId) => {
      // Try data object first, then field value, then default
      if (data[fieldId] !== undefined && String(data[fieldId]).trim()) {
        return data[fieldId];
      }
      
      const field = commentsFieldsOrder.find(f => f.id === fieldId);
      if (field && field.value) {
        return field.value;
      }
      
      // Fallback to DOM lookup
      const element = document.querySelector(`[data-field="${fieldId}"] .editable-field`);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
      
      return '[Enter comments or special instructions...]';
    };

    // Build table rows dynamically based on commentsFields order
    const commentsRows = commentsFieldsOrder.map(field => {
      const value = getCommentsFieldValue(field.id);
      return `
        <tr>
          <td class="comments-header">${field.label}</td>
        </tr>
        <tr>
          <td class="comments-content">${value}</td>
        </tr>
      `;
    }).join('');

    return `
      <td style="width: 50%;" data-section="comments">
        <table>
          ${commentsRows}
        </table>
      </td>
    `;
  };

  // Build Contact Section XML
  const buildContactXML = () => {
    // Get contact fields order from data, default to standard order if not provided
    const contactFieldsOrder = data.contactFields || [
      { id: 'contact-main', label: 'Contact Information:', value: 'For inquiries, please contact us' }
    ];

    // Helper function to get field value with fallbacks
    const getContactFieldValue = (fieldId) => {
      // Try data object first, then field value, then default
      if (data[fieldId] !== undefined && String(data[fieldId]).trim()) {
        return data[fieldId];
      }
      
      const field = contactFieldsOrder.find(f => f.id === fieldId);
      if (field && field.value) {
        return field.value;
      }
      
      // Fallback to DOM lookup
      const element = document.querySelector(`[data-field="${fieldId}"] .editable-field`);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
      
      return 'For inquiries, please contact us';
    };

    // Build table rows dynamically based on contactFields order
    const contactRows = contactFieldsOrder.map(field => {
      const value = getContactFieldValue(field.id);
      return `
        <tr>
          <td class="contact-header">${field.label}</td>
        </tr>
        <tr>
          <td class="contact-content">${value}</td>
        </tr>
      `;
    }).join('');

    return `
      <td class="contact-info" style="width: 70%;" data-field="contact-info">
        <table>
          ${contactRows}
        </table>
      </td>
    `;
  };

  // Build Totals Section XML
  const buildTotalsXML = () => {
    // Get totals fields order from data, default to standard order if not provided
    const totalsFieldsOrder = data.totalsFields || [
      { id: 'subtotal', label: 'SUBTOTAL:', value: '$0.00' },
      { id: 'tax', label: 'TAX:', value: '$0.00' },
      { id: 'shipping', label: 'SHIPPING:', value: '$0.00' },
      { id: 'other', label: 'OTHER:', value: '$0.00' },
      { id: 'total', label: 'TOTAL:', value: '$0.00' }
    ];

    // Helper function to get field value with fallbacks
    const getFieldValue = (fieldId) => {
      // Try data object first, then field value, then default
      if (data[fieldId] !== undefined && String(data[fieldId]).trim()) {
        return data[fieldId];
      }
      
      const field = totalsFieldsOrder.find(f => f.id === fieldId);
      if (field && field.value) {
        return field.value;
      }
      
      // Fallback to DOM lookup
      const element = document.querySelector(`[data-field="${fieldId}"] .editable-field, [data-field="${fieldId}"] .calculated-field`);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
      
      return '$0.00';
    };

    // Build table rows dynamically based on totalsFields order
    const totalsRows = totalsFieldsOrder.map(field => {
      const value = getFieldValue(field.id);
      return `
        <tr>
          <td class="total-label">${field.label}</td>
          <td class="total-amount" align="right">${value}</td>
        </tr>
      `;
    }).join('');

    // Use table rows/cells for maximum NetSuite/BFO compatibility (avoid nested divs)
    return `
      <td style="width: 50%;" data-section="totals">
        <table>
          <tr>
            <td class="section-header" colspan="2">Totals</td>
          </tr>
          ${totalsRows}
        </table>
      </td>
    `;
  };

  // Build Comments and Totals Section XML with dynamic ordering
  const buildCommentsTotalsXML = () => {
    // Get section order from data, default to [section8, section9] if not provided
    const sectionOrder = data.sectionOrder?.sections8And9 || ['section8', 'section9'];
    const leftSection = sectionOrder[0];
    const rightSection = sectionOrder[1];
    
    console.log('🔀 Building comments/totals section with order:', { leftSection, rightSection });
    
    let leftColumn, rightColumn;
    
    if (leftSection === 'section8') {
      leftColumn = buildCommentsXML();
      rightColumn = buildTotalsXML();
    } else {
      leftColumn = buildTotalsXML();
      rightColumn = buildCommentsXML();
    }
    
    return `
      <table style="margin-top: 15px;" data-section="comments-totals">
        <tr>
          ${leftColumn}
          ${rightColumn}
        </tr>
      </table>
    `;
  };

  // Helper function to get shipping details field values with dynamic ID support
  const getShippingFieldValue = (fieldType, defaultValue = '') => {
    // Try to get value from data object first (this includes custom columns)
    if (data[fieldType] !== undefined && data[fieldType] !== '') {
      return data[fieldType];
    }
    
    const possibleSelectors = [
      `.shipping-field-${fieldType} .editable-field`,
      `.shipping-field[data-field="${fieldType}"] .editable-field`,
      `.shipping-${fieldType} .editable-field`,
      `#shipping-${fieldType}`,
      `[data-shipping-field="${fieldType}"]`
    ];
    
    // Try DOM selectors as fallback
    for (const selector of possibleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    return defaultValue;
  };

  // Helper function to get line item values with dynamic ID support
  const getLineItemValue = (rowIndex, fieldType, defaultValue = '') => {
    // Map template field names to live table data-column ids
    const colIdMap = { quantity: 'qty', unitPrice: 'rate', total: 'amount' };
    const colId = colIdMap[fieldType] || fieldType; // itemNumber, description pass through

    const possibleSelectors = [
      `#line-item-${rowIndex}-${fieldType}`,
      `.line-item-row[data-row="${rowIndex}"] .${colId}-field`,
      `.itemtable tbody tr:nth-child(${rowIndex + 1}) .${colId}-field .editable-field`,
      `.itemtable tbody tr:nth-child(${rowIndex + 1}) td[data-column="${colId}"] .editable-field`,
      `.itemtable tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${getColumnIndex(fieldType)}) .editable-field`
    ];
    
    // Try data object first
    if (data.lineItems && data.lineItems[rowIndex] && data.lineItems[rowIndex][fieldType]) {
      return data.lineItems[rowIndex][fieldType];
    }
    
    // Try DOM selectors with debugging
    for (const selector of possibleSelectors) {
      const element = document.querySelector(selector);
      const text = element ? element.textContent.trim() : '';
      try { console.debug('🔎 XML getLineItemValue', { rowIndex, fieldType, colId, selector, found: !!element, text }); } catch {}
      if (text) return text;
    }
    
    return defaultValue;
  };

  // Helper function to get column index for line items
  const getColumnIndex = (fieldType) => {
    const columnMap = {
      itemNumber: 2,
      description: 3,
      quantity: 4,
      unitPrice: 5,
      total: 6
    };
    return columnMap[fieldType] || 1;
  };

  // Helper function to get totals field values with dynamic ID support
  const getTotalFieldValue = (fieldType, defaultValue = '') => {
    const possibleSelectors = [
      `#total-${fieldType}`,
      `.total-${fieldType} .editable-field`,
      `.total-row[data-field="${fieldType}"] .editable-field`,
      `.totals-section .${fieldType}-field .editable-field`,
      // Subtotal and total are displayed as calculated spans
      `.totals-section .total-row[data-field="subtotal"] .calculated-field`,
      `.totals-section .total-row[data-field="total"] .total-field`
    ];
    
    // Try data object first
    if (data[fieldType]) {
      return data[fieldType];
    }
    
    // Try DOM selectors with debugging
    for (const selector of possibleSelectors) {
      const element = document.querySelector(selector);
      const text = element ? element.textContent.trim() : '';
      try { console.debug('🔎 XML getTotalFieldValue', { fieldType, selector, found: !!element, text }); } catch {}
      if (text) return text;
    }
    
    return defaultValue;
  };

  // Helper function to get comments field value with dynamic ID support
  const getCommentsValue = (defaultValue = '') => {
    const possibleSelectors = [
      '#comments-field',
      '.comments-content .editable-field',
      '.comments-section .editable-field',
      '[data-field="comments"]'
    ];
    
    // Try data object first
    if (data.comments) {
      return data.comments;
    }
    
    // Try DOM selectors
    for (const selector of possibleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    return defaultValue;
  };

  // Helper function to get contact info field value with dynamic ID support
  const getContactInfoValue = (defaultValue = '') => {
    const possibleSelectors = [
      '#contact-info-field',
      '.contact-section .editable-field',
      '.contact-info .editable-field',
      '[data-field="contactInfo"]'
    ];
    
    // Try data object first
    if (data.contactInfo) {
      return data.contactInfo;
    }
    
    // Try DOM selectors
    for (const selector of possibleSelectors) {
      const element = document.querySelector(selector);
      if (element && element.textContent.trim()) {
        return element.textContent.trim();
      }
    }
    
    return defaultValue;
  };

  // Generate line items XML with dynamic ID support
  const generateLineItemsXML = () => {
    const maxRows = 5; // Standard number of line item rows
    
    // Generate rows (either from data or empty placeholder rows)
    return Array(maxRows).fill(0).map((_, index) => {
      // Try to get values using dynamic ID system
      const itemNumber = getLineItemValue(index, 'itemNumber', '-');
      const description = getLineItemValue(index, 'description', '-');
      const quantity = getLineItemValue(index, 'quantity', '-');
      const unitPrice = getLineItemValue(index, 'unitPrice', '-');
      const total = getLineItemValue(index, 'total', '-');
      
      return `
        <tr data-row-id="line-item-${index}" data-row-index="${index}">
            <td class="item-cell" align="left" colspan="3" data-field="itemNumber" data-row="${index}">${itemNumber}</td>
            <td class="item-cell" align="left" colspan="12" data-field="description" data-row="${index}">${description}</td>
            <td class="item-cell" align="center" colspan="2" data-field="quantity" data-row="${index}">${quantity}</td>
            <td class="item-cell" align="right" colspan="3" data-field="unitPrice" data-row="${index}">${unitPrice}</td>
            <td class="item-cell" align="right" colspan="3" data-field="total" data-row="${index}">${total}</td>
        </tr>`;
    }).join('');
  };

  // Generate the complete XML using the new template structure
  const xml = `<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
    <meta name="title" value="Purchase Order"/>
    <meta name="author" value="Purchase Order Generator"/>
    <meta name="subject" value="Purchase Order"/>
    <meta name="creator" value="Purchase Order Generator"/>
    <meta name="producer" value="Purchase Order Generator"/>
    <meta name="creationDate" value="${new Date().toISOString()}"/>
    <!-- Header Color Configuration -->
    <!-- Generated at: ${new Date().toISOString()} -->
    <!-- Header Background: ${headerColors.headerBackground} -->
    <!-- Header Text: ${headerColors.headerText} -->
    <!-- Header Border: ${headerColors.headerBorder} -->
    <!-- Section Title Background: ${headerColors.sectionTitleBackground} -->
    <!-- Section Title Text: ${headerColors.sectionTitleText} -->
    <!-- All section headers (Purchase Order, Comments, Vendor, Ship To, etc.) now use section title colors -->
    
    <meta name="modDate" value="${new Date().toISOString()}"/>
    <link name="NotoSans" type="font" subtype="truetype" src="\${nsfont.NotoSans_Regular}" src-bold="\${nsfont.NotoSans_Bold}" src-italic="\${nsfont.NotoSans_Italic}" src-bolditalic="\${nsfont.NotoSans_BoldItalic}" bytes="2" />
    <style>
        * { font-family: NotoSans, sans-serif; font-size: 9pt; }
        table { width: 100%; border-collapse: collapse; }
        .header-company { font-size: 14pt; font-weight: bold; }
        .header-title { font-size: 20pt; font-weight: bold; background-color: ${headerColors.sectionTitleBackground}; color: ${headerColors.sectionTitleText}; padding: 6px; border: 1px solid #000; }
        .header-info { font-size: 10pt; }
        .section-header { background-color: ${headerColors.sectionTitleBackground}; color: ${headerColors.sectionTitleText}; font-weight: bold; padding: 6px; border: 1px solid #000; }
        .section-content { padding: 6px; border: 1px solid #000; vertical-align: top; }
        .item-header { background-color: ${headerColors.sectionTitleBackground}; color: ${headerColors.sectionTitleText}; font-weight: bold; padding: 8px; border: 1px solid #000; }
        .item-cell { padding: 6px; border: 1px solid #000; }
        .total-label { font-weight: bold; padding: 4px; }
        .total-amount { font-weight: bold; padding: 4px; background-color: #ffff99; }
        .comments-header { background-color: ${headerColors.sectionTitleBackground}; color: ${headerColors.sectionTitleText}; font-weight: bold; padding: 6px; border: 1px solid #000; }
        .comments-content { padding: 6px; border: 1px solid #000; min-height: 40px; }
        .contact-info { font-size: 8pt; }
        
        /* All section headers now use section title colors */
        .section-header, .header-title, .comments-header, .item-header {
            background-color: ${headerColors.sectionTitleBackground} !important;
            color: ${headerColors.sectionTitleText} !important;
        }
    </style>
</head>
<body padding="0.5in" size="Letter">
    
    ${buildHeaderSectionXML()}
    ${buildVendorShipToAndShippingDetailsXML()}


    ${buildLineItemsXML()}


    ${buildCommentsTotalsXML()}



    <table style="margin-top: 20px;" data-section="contact-signature">
        <tr>
            ${buildContactXML()}
            <td style="width: 30%; text-align: center;" data-field="signature">
                <table style="width: 100%;">
                    <tr>
                        <td style="border-top: 1px solid #000; padding-top: 10px;">
                            Authorized Signature
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</pdf>`;

  console.log('✅ DYNAMIC ID TEMPLATE: XML generated successfully with dynamic field support');
  console.log('📄 XML preview (first 200 chars):', xml.substring(0, 200));
  return xml;
}

// Export the template structure for reference with dynamic ID support
export const purchaseOrderTemplate = {
  companyInfo: {
    staticFields: ['company-name', 'company-address', 'company-city-state', 'company-phone', 'company-fax', 'company-website'],
    dynamicPrefixes: ['company-field-', 'company-'],
    dataAttribute: 'data-section="company-info"'
  },
  purchaseOrder: {
    staticFields: ['po-title', 'po-date', 'po-number'],
    dynamicPrefixes: ['po-field-', 'po-'],
    dataAttribute: 'data-section="purchase-order-info"'
  },
  vendor: {
    staticFields: ['vendor-company', 'vendor-contact', 'vendor-address', 'vendor-city-state', 'vendor-phone', 'vendor-fax'],
    dynamicPrefixes: ['vendor-field-', 'vendor-'],
    dataAttribute: 'data-subsection="vendor"'
  },
  shipTo: {
    staticFields: ['ship-to-name', 'ship-to-company', 'ship-to-address', 'ship-to-city-state', 'ship-to-phone', 'ship-to-fax'],
    dynamicPrefixes: ['ship-to-field-', 'ship-to-'],
    dataAttribute: 'data-subsection="ship-to"'
  },
  shipping: {
    staticFields: ['requisitioner', 'shipVia', 'fob', 'shippingTerms'],
    dynamicPrefixes: ['shipping-field-', 'shipping-'],
    dataAttribute: 'data-section="shipping-details"'
  },
  lineItems: {
    staticFields: ['itemNumber', 'description', 'quantity', 'unitPrice', 'total'],
    dynamicPrefixes: ['line-item-', 'item-'],
    dataAttribute: 'data-section="line-items"',
    maxRows: 5
  },
  totals: {
    staticFields: ['subtotal', 'tax', 'shipping', 'other', 'total'],
    dynamicPrefixes: ['total-', 'totals-'],
    dataAttribute: 'data-subsection="totals"'
  },
  comments: {
    staticFields: ['comments'],
    dynamicPrefixes: ['comments-field-', 'comment-'],
    dataAttribute: 'data-subsection="comments"'
  },
  contact: {
    staticFields: ['contactInfo'],
    dynamicPrefixes: ['contact-info-field-', 'contact-'],
    dataAttribute: 'data-section="contact-signature"'
  }
};

// Export a simple function to get template structure
export function getTemplateStructure() {
  return purchaseOrderTemplate;
}

// Dynamic ID Generation Utilities
export const dynamicIdUtils = {
  // Generate a new dynamic ID with timestamp and random component
  generateId: (prefix = 'field', section = 'general') => {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    return `${section}-${prefix}-${timestamp}-${random}`;
  },

  // Generate multiple possible IDs for a field to try when looking up values
  getPossibleIds: (staticId, section = 'unknown') => {
    const baseName = staticId.replace(/^(company-|po-|vendor-|ship-to-)/, '');
    return [
      staticId, // Try static ID first
      `${section}-field-${staticId}`,
      `${section}-${baseName}`,
      `${staticId}-${Date.now()}`,
      `field-${baseName}`,
      baseName
    ];
  },

  // Validate if an ID follows our dynamic ID pattern
  isValidDynamicId: (id) => {
    const dynamicPattern = /^[a-z-]+-(field-)?[a-z-]+(-\d+)?(-[a-z0-9]+)?$/;
    return dynamicPattern.test(id);
  },

  // Extract the base field type from any ID (static or dynamic)
  getFieldType: (id) => {
    // Remove common prefixes and suffixes to get the core field type
    return id
      .replace(/^(company-|po-|vendor-|ship-to-|shipping-|total-|line-item-|comments-|contact-)/, '')
      .replace(/-(field-)?(\d+)?(-[a-z0-9]+)?$/, '')
      .replace(/^(field-)?/, '');
  },

  // Get section from ID
  getSection: (id) => {
    if (id.startsWith('company-')) return 'company';
    if (id.startsWith('po-')) return 'purchase-order';
    if (id.startsWith('vendor-')) return 'vendor';
    if (id.startsWith('ship-to-')) return 'ship-to';
    if (id.startsWith('shipping-')) return 'shipping';
    if (id.startsWith('line-item-')) return 'line-items';
    if (id.startsWith('total-')) return 'totals';
    if (id.startsWith('comments-')) return 'comments';
    if (id.startsWith('contact-')) return 'contact';
    return 'unknown';
  }
};

// Field Mapping Utilities
export const fieldMappingUtils = {
  // Map all known static field IDs to their readable names
  staticFieldNames: {
    // Company fields
    'company-name': 'Company Name',
    'company-address': 'Street Address',
    'company-city-state': 'City, State, ZIP',
    'company-phone': 'Phone Number',
    'company-fax': 'Fax Number',
    'company-website': 'Website',
    
    // Purchase Order fields
    'po-title': 'Purchase Order Title',
    'po-date': 'Date',
    'po-number': 'PO Number',
    
    // Vendor fields
    'vendor-company': 'Vendor Company',
    'vendor-contact': 'Vendor Contact',
    'vendor-address': 'Vendor Address',
    'vendor-city-state': 'Vendor City/State',
    'vendor-phone': 'Vendor Phone',
    'vendor-fax': 'Vendor Fax',
    
    // Ship To fields
    'ship-to-name': 'Ship To Name',
    'ship-to-company': 'Ship To Company',
    'ship-to-address': 'Ship To Address',
    'ship-to-city-state': 'Ship To City/State',
    'ship-to-phone': 'Ship To Phone',
    'ship-to-fax': 'Ship To Fax',
    
    // Shipping fields
    'requisitioner': 'Requisitioner',
    'shipVia': 'Ship Via',
    'fob': 'F.O.B.',
    'shippingTerms': 'Shipping Terms',
    
    // Line item fields
    'itemNumber': 'Item Number',
    'description': 'Description',
    'quantity': 'Quantity',
    'unitPrice': 'Unit Price',
    'total': 'Total',
    
    // Totals fields
    'subtotal': 'Subtotal',
    'tax': 'Tax',
    'shipping': 'Shipping',
    'other': 'Other',
    
    // Other fields
    'comments': 'Comments',
    'contactInfo': 'Contact Information'
  },

  // Get human-readable name for any field ID
  getFieldName: (id) => {
    const staticName = fieldMappingUtils.staticFieldNames[id];
    if (staticName) return staticName;
    
    // For dynamic IDs, try to extract the base field type
    const fieldType = dynamicIdUtils.getFieldType(id);
    const staticFieldName = fieldMappingUtils.staticFieldNames[fieldType];
    if (staticFieldName) return staticFieldName;
    
    // Fallback: humanize the ID
    return id.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  },

  // Get all field IDs for a section
  getFieldsForSection: (section) => {
    const template = purchaseOrderTemplate[section];
    return template ? template.staticFields : [];
  }
};

// ============================================================================
// NETSUITE TEMPLATE GENERATION
// ============================================================================

/**
 * Generate NetSuite-compatible XML template with FreeMarker syntax
 * This function creates templates that can be used directly in NetSuite
 * instead of generating static XML with hardcoded values
 */
export function generateNetSuiteTemplate(formData, options = {}) {
  console.log('🔀 NETSUITE TEMPLATE VERSION - generateNetSuiteTemplate called');
  console.log('📅 NetSuite template updated at:', new Date().toISOString());
  console.log('📊 Raw form data received:', formData);
  
  // Get current header colors for template generation
  const headerColors = getHeaderColors();
  console.log('🎨 Current header colors:', headerColors);
  
  // Process and validate form data using the FormDataMapper
  let processedData;
  try {
    processedData = processFormData(formData, {
      calculateTotals: options.calculateTotals !== false,
      validate: options.validate !== false,
      formatForXML: true,
      throwOnValidationError: options.throwOnValidationError || false
    });
    console.log('📊 Processed form data:', processedData);
  } catch (error) {
    console.error('❌ Form data processing failed:', error);
    if (options.throwOnValidationError) {
      throw error;
    }
    // Fallback to using raw data
    processedData = formData || {};
  }
  
  // Merge processed data with original
  const data = {
    ...(processedData || {}),
    ...(formData || {})
  };

  // IMPORTANT: For field ordering, use the original formData to preserve drag-and-drop order
  const fieldOrderData = {
    ...data,
    companyFields: formData.companyFields || data.companyFields || [],
    purchaseOrderFields: formData.purchaseOrderFields || data.purchaseOrderFields || [],
    vendorFields: formData.vendorFields || data.vendorFields || [],
    shipToFields: formData.shipToFields || data.shipToFields || []
  };
  
  console.log('🔍 DEBUG: NetSuite fieldOrderData created with:');
  console.log('🔍 DEBUG: - companyFields:', fieldOrderData.companyFields?.map(f => ({ id: f.id, label: f.label })));
  
  // Check which section should be on the left (same logic as original)
  const sectionOrder = data.sectionOrder || {};
  const sections1And2 = sectionOrder.sections1And2 || ['section1', 'section2'];
  const leftSection = sections1And2[0];
  
  console.log('🔀 NetSuite Template - Section order:', { leftSection, sections1And2 });
  
  let leftColumn, rightColumn;
  
  if (leftSection === 'section1') {
    // Company on left, Purchase Order on right
    leftColumn = buildCompanyNetSuiteXML('left');
    rightColumn = buildPurchaseOrderNetSuiteXML('right');
    console.log('🔀 NetSuite Template - Using default order: Company left, Purchase Order right');
  } else {
    // Purchase Order on left, Company on right (sections swapped)
    leftColumn = buildPurchaseOrderNetSuiteXML('left');
    rightColumn = buildCompanyNetSuiteXML('right');
    console.log('🔀 NetSuite Template - Using swapped order: Purchase Order left, Company right');
  }
  
  // Build the complete NetSuite template with FreeMarker syntax
  const netSuiteTemplate = `<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
<head>
    <link name="NotoSans" type="font" subtype="truetype" src="\${nsfont.NotoSans_Regular}" src-bold="\${nsfont.NotoSans_Bold}" src-italic="\${nsfont.NotoSans_Italic}" src-bolditalic="\${nsfont.NotoSans_BoldItalic}" bytes="2" />
    <macrolist>
        <macro id="nlheader">
            <table class="header" style="width: 100%;">
                <tr>
                    <td rowspan="3">
                        <#if companyInformation.logoUrl?length != 0>
                            <@filecabinet nstype="image" style="float: left; margin: 7px" src="\${companyInformation.logoUrl}" />
                        </#if>
                        <span class="nameandaddress">\${companyInformation.companyName}</span><br />
                        <span class="nameandaddress">\${companyInformation.addressText}</span>
                    </td>
                    <td align="right"><span class="title">\${record@title}</span></td>
                </tr>
                <tr>
                    <td align="right"><span class="number">#\${record.tranid}</span></td>
                </tr>
                <tr>
                    <td align="right">\${record.trandate}</td>
                </tr>
            </table>
        </macro>
        <macro id="nlfooter">
            <table class="footer" style="width: 100%;">
                <tr>
                    <td>
                        <barcode codetype="code128" showtext="true" value="\${record.tranid}"/>
                    </td>
                    <td align="right">
                        <pagenumber/> of <totalpages/>
                    </td>
                </tr>
            </table>
        </macro>
    </macrolist>
    <style>
        * {
            font-family: NotoSans, sans-serif;
        }
        table {
            font-size: 9pt;
            table-layout: fixed;
        }
        th {
            font-weight: bold;
            font-size: 8pt;
            vertical-align: middle;
            padding: 5px 6px 3px;
            background-color: #e3e3e3;
            color: #333333;
        }
        td {
            padding: 4px 6px;
        }
        .header-company {
            font-weight: bold;
            font-size: 12pt;
            color: #333333;
        }
        .nameandaddress {
            font-size: 10pt;
        }
        .title {
            font-size: 28pt;
        }
        .number {
            font-size: 16pt;
        }
    </style>
</head>
<body header="nlheader" header-height="10%" footer="nlfooter" footer-height="20pt" padding="0.5in 0.5in 0.5in 0.5in" size="Letter">
    <table style="width: 100%;">
        <tr>
            ${leftColumn}
            ${rightColumn}
        </tr>
    </table>
    
    <!-- Vendor Information Section -->
    <table style="width: 100%; margin-top: 20px;">
        <tr>
            <td style="width: 50%;">
                <strong>Vendor Information:</strong><br/>
                \${record.billaddress}
            </td>
            <td style="width: 50%;">
                <strong>Ship To:</strong><br/>
                \${record.shipaddress}
            </td>
        </tr>
    </table>
    
    <!-- Line Items Section -->
    <#if record.item?has_content>
    <table class="itemtable" style="width: 100%; margin-top: 20px;">
        <#list record.item as item>
            <#if item_index==0>
                <thead>
                <tr>
                    <th colspan="3" align="center">\${item.quantity@label}</th>
                    <th colspan="12">\${item.item@label}</th>
                    <th colspan="3">\${item.options@label}</th>
                    <th colspan="4" align="right">\${item.rate@label}</th>
                    <th colspan="4" align="right">\${item.amount@label}</th>
                </tr>
                </thead>
            </#if>
            <tr>
                <td colspan="3" align="center">\${item.quantity}</td>
                <td colspan="12">\${item.item}<br/>\${item.description}</td>
                <td colspan="3">\${item.options}</td>
                <td colspan="4" align="right">\${item.rate}</td>
                <td colspan="4" align="right">\${item.amount}</td>
            </tr>
        </#list>
    </table>
    </#if>
    
    <!-- Totals Section -->
    <table style="width: 100%; margin-top: 20px;">
        <tr>
            <td style="width: 70%;"></td>
            <td style="width: 15%; text-align: right;"><strong>Subtotal:</strong></td>
            <td style="width: 15%; text-align: right;">\${record.subtotal}</td>
        </tr>
        <tr>
            <td style="width: 70%;"></td>
            <td style="width: 15%; text-align: right;"><strong>Tax:</strong></td>
            <td style="width: 15%; text-align: right;">\${record.taxtotal}</td>
        </tr>
        <tr>
            <td style="width: 70%;"></td>
            <td style="width: 15%; text-align: right;"><strong>Total:</strong></td>
            <td style="width: 15%; text-align: right;">\${record.total}</td>
        </tr>
    </table>
</body>
</pdf>`;

  console.log('📄 NetSuite Template generated successfully');
  console.log('📄 Template preview (first 500 chars):', netSuiteTemplate.substring(0, 500));
  
  return netSuiteTemplate;

  // Helper function to build Purchase Order section with NetSuite variables
  function buildPurchaseOrderNetSuiteXML(position = 'right') {
    const purchaseOrderFields = fieldOrderData.purchaseOrderFields || [];
    
    // Field mapping from form field IDs to NetSuite variables
    const netSuiteFieldMapping = {
      'po-title': '${record@title}',
      'po-number': '${record.tranid}',
      'po-date': '${record.trandate}',
      'po-delivery-date': '${record.shipdate}',
      'po-payment-terms': '${record.terms}',
      'po-due-date': '${record.duedate}',
      'po-reference': '${record.otherrefnum}'
    };
    
    const fieldOrder = data.fieldOrder?.purchaseOrder || purchaseOrderFields.map(f => f.id);
    
    const orderedPOFields = fieldOrder.map(fieldId => {
      const field = purchaseOrderFields.find(f => f.id === fieldId);
      return field;
    }).filter(Boolean);
    
    const fieldRows = orderedPOFields.map((field, index) => {
      const isTitle = field.id === 'po-title';
      
      let netSuiteVariable = netSuiteFieldMapping[field.id];
      
      if (!netSuiteVariable) {
        const cleanId = field.id.replace(/^po-/, '').replace(/-/g, '');
        netSuiteVariable = `\${record.${cleanId}}`;
      }
      
      if (isTitle) {
        return `<tr><td class="header-po" style="text-align: right; font-size: 24pt;" data-field="${field.id}">${netSuiteVariable}</td></tr>`;
      } else {
        const needsLabel = !['${record.tranid}', '${record.trandate}'].includes(netSuiteVariable);
        const displayText = needsLabel ? `${field.label}: ${netSuiteVariable}` : netSuiteVariable;
        return `<tr><td style="text-align: right;" data-field="${field.id}">${displayText}</td></tr>`;
      }
    }).join('');
    
    const poTdPadding = position === 'right' ? 'padding-left: 24px;' : 'padding-right: 36px;';
    return `
      <td style="width: 35%; ${poTdPadding}" data-section="purchase-order">
        <table>
          ${fieldRows}
        </table>
      </td>
    `;
  }
}
