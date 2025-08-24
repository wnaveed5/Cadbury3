// Form Data Mapping Utilities for Purchase Order Template
// This module provides comprehensive mapping between React form data and XML generation

import { dynamicIdUtils, fieldMappingUtils } from './PurchaseOrderTemplate';

/**
 * Form Data Collection Utility
 * Collects form data from various sources (React state, DOM, etc.) into a structured format
 */
export class FormDataMapper {
  constructor() {
    this.formData = this.getEmptyFormData();
    this.mappingConfig = this.getDefaultMappingConfig();
  }

  /**
   * Get empty form data structure
   */
  getEmptyFormData() {
    return {
      companyInfo: {
        name: '',
        address: '',
        cityStateZip: '',
        phone: '',
        fax: '',
        website: ''
      },
      headerInfo: {
        title: 'PURCHASE ORDER',
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
        phone: '',
        fax: ''
      },
      shippingDetails: {
        requisitioner: '',
        shipVia: '',
        fob: '',
        shippingTerms: ''
      },
      lineItems: [],
      totals: {
        subtotal: 0,
        tax: 0,
        shipping: 0,
        other: 0,
        total: 0
      },
      comments: '',
      contactInfo: ''
    };
  }

  /**
   * Default mapping configuration between form fields and data structure
   */
  getDefaultMappingConfig() {
    return {
      // Company Information mappings
      companyInfo: {
        'company-name': 'companyInfo.name',
        'company-address': 'companyInfo.address',
        'company-city-state': 'companyInfo.cityStateZip',
        'company-phone': 'companyInfo.phone',
        'company-fax': 'companyInfo.fax',
        'company-website': 'companyInfo.website'
      },
      
      // Purchase Order Header mappings
      headerInfo: {
        'po-title': 'headerInfo.title',
        'po-date': 'headerInfo.date',
        'po-number': 'headerInfo.poNumber'
      },
      
      // Vendor Information mappings
      vendor: {
        'vendor-company': 'vendor.company',
        'vendor-contact': 'vendor.contact',
        'vendor-address': 'vendor.address',
        'vendor-city-state': 'vendor.cityStateZip',
        'vendor-phone': 'vendor.phone',
        'vendor-fax': 'vendor.fax'
      },
      
      // Ship To Information mappings
      shipTo: {
        'ship-to-name': 'shipTo.name',
        'ship-to-company': 'shipTo.company',
        'ship-to-address': 'shipTo.address',
        'ship-to-city-state': 'shipTo.cityStateZip',
        'ship-to-phone': 'shipTo.phone',
        'ship-to-fax': 'shipTo.fax'
      },
      
      // Shipping Details mappings
      shippingDetails: {
        'requisitioner': 'shippingDetails.requisitioner',
        'shipVia': 'shippingDetails.shipVia',
        'fob': 'shippingDetails.fob',
        'shippingTerms': 'shippingDetails.shippingTerms'
      },
      
      // Line Items mappings (handled separately due to array structure)
      lineItems: {
        'itemNumber': 'itemNumber',
        'description': 'description',
        'quantity': 'quantity',
        'unitPrice': 'unitPrice',
        'total': 'total'
      },
      
      // Totals mappings
      totals: {
        'subtotal': 'totals.subtotal',
        'tax': 'totals.tax',
        'shipping': 'totals.shipping',
        'other': 'totals.other',
        'total': 'totals.total'
      },
      
      // Other fields
      other: {
        'comments': 'comments',
        'contactInfo': 'contactInfo'
      }
    };
  }

  /**
   * Collect form data from React component fields arrays
   * This works with the existing PurchaseOrderForm.jsx structure
   */
  collectFromReactFieldArrays(fieldArrays) {
    const formData = this.getEmptyFormData();
    
    // Process company fields
    if (fieldArrays.companyFields) {
      fieldArrays.companyFields.forEach(field => {
        const mappingKey = this.mappingConfig.companyInfo[field.id];
        if (mappingKey) {
          this.setNestedValue(formData, mappingKey, field.value || '');
        }
      });
    }
    
    // Process purchase order fields
    if (fieldArrays.purchaseOrderFields) {
      fieldArrays.purchaseOrderFields.forEach(field => {
        const mappingKey = this.mappingConfig.headerInfo[field.id];
        if (mappingKey) {
          this.setNestedValue(formData, mappingKey, field.value || '');
        }
      });
    }
    
    // Process vendor fields
    if (fieldArrays.vendorFields) {
      fieldArrays.vendorFields.forEach(field => {
        const mappingKey = this.mappingConfig.vendor[field.id];
        if (mappingKey) {
          this.setNestedValue(formData, mappingKey, field.value || '');
        }
      });
    }
    
    // Process ship-to fields
    if (fieldArrays.shipToFields) {
      fieldArrays.shipToFields.forEach(field => {
        const mappingKey = this.mappingConfig.shipTo[field.id];
        if (mappingKey) {
          this.setNestedValue(formData, mappingKey, field.value || '');
        }
      });
    }
    
    // Process line items if provided
    if (fieldArrays.lineItems) {
      formData.lineItems = fieldArrays.lineItems.map(item => ({
        itemNumber: item.itemNumber || '',
        description: item.description || '',
        quantity: this.parseNumber(item.quantity, 0),
        unitPrice: this.parseNumber(item.unitPrice, 0),
        total: this.parseNumber(item.total, 0)
      }));
    }
    
    // Process other fields
    if (fieldArrays.comments) {
      formData.comments = fieldArrays.comments;
    }
    if (fieldArrays.contactInfo) {
      formData.contactInfo = fieldArrays.contactInfo;
    }
    
    return formData;
  }

  /**
   * Collect form data from DOM elements using dynamic ID strategies
   */
  collectFromDOM() {
    const formData = this.getEmptyFormData();
    
    // Collect company information
    Object.entries(this.mappingConfig.companyInfo).forEach(([fieldId, dataPath]) => {
      const value = this.getValueFromDOMWithDynamicId(fieldId, 'company');
      if (value) {
        this.setNestedValue(formData, dataPath, value);
      }
    });
    
    // Collect header information
    Object.entries(this.mappingConfig.headerInfo).forEach(([fieldId, dataPath]) => {
      const value = this.getValueFromDOMWithDynamicId(fieldId, 'purchase-order');
      if (value) {
        this.setNestedValue(formData, dataPath, value);
      }
    });
    
    // Collect vendor information
    Object.entries(this.mappingConfig.vendor).forEach(([fieldId, dataPath]) => {
      const value = this.getValueFromDOMWithDynamicId(fieldId, 'vendor');
      if (value) {
        this.setNestedValue(formData, dataPath, value);
      }
    });
    
    // Collect ship-to information
    Object.entries(this.mappingConfig.shipTo).forEach(([fieldId, dataPath]) => {
      const value = this.getValueFromDOMWithDynamicId(fieldId, 'ship-to');
      if (value) {
        this.setNestedValue(formData, dataPath, value);
      }
    });
    
    // Collect shipping details
    Object.entries(this.mappingConfig.shippingDetails).forEach(([fieldId, dataPath]) => {
      const value = this.getShippingDetailFromDOM(fieldId);
      if (value) {
        this.setNestedValue(formData, dataPath, value);
      }
    });
    
    // Collect line items
    formData.lineItems = this.collectLineItemsFromDOM();
    
    // Collect totals
    Object.entries(this.mappingConfig.totals).forEach(([fieldId, dataPath]) => {
      const value = this.getTotalFromDOM(fieldId);
      if (value !== null) {
        this.setNestedValue(formData, dataPath, this.parseNumber(value, 0));
      }
    });
    
    // Collect comments and contact info
    formData.comments = this.getCommentsFromDOM();
    formData.contactInfo = this.getContactInfoFromDOM();
    
    return formData;
  }

  /**
   * Get value from DOM using dynamic ID strategies
   */
  getValueFromDOMWithDynamicId(staticId, section) {
    const possibleIds = dynamicIdUtils.getPossibleIds(staticId, section);
    
    // Try each possible ID
    for (const id of possibleIds) {
      const element = document.getElementById(id);
      if (element) {
        return this.getElementValue(element);
      }
    }
    
    // Try CSS selectors as fallback
    const selectors = [
      `[data-field="${staticId}"]`,
      `.${staticId}-field`,
      `.field-${staticId}`,
      `[data-field-type="${staticId}"]`
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return this.getElementValue(element);
      }
    }
    
    return '';
  }

  /**
   * Get shipping detail value from DOM
   */
  getShippingDetailFromDOM(fieldType) {
    const selectors = [
      `.shipping-field-${fieldType} .editable-field`,
      `.shipping-field[data-field="${fieldType}"] .editable-field`,
      `[data-shipping-field="${fieldType}"]`,
      `#shipping-${fieldType}`
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return this.getElementValue(element);
      }
    }
    
    return '';
  }

  /**
   * Collect line items from DOM
   */
  collectLineItemsFromDOM() {
    const lineItems = [];
    const maxRows = 5; // Standard number of rows
    
    for (let i = 0; i < maxRows; i++) {
      const item = {
        itemNumber: this.getLineItemFieldFromDOM(i, 'itemNumber'),
        description: this.getLineItemFieldFromDOM(i, 'description'),
        quantity: this.parseNumber(this.getLineItemFieldFromDOM(i, 'quantity'), 0),
        unitPrice: this.parseNumber(this.getLineItemFieldFromDOM(i, 'unitPrice'), 0),
        total: this.parseNumber(this.getLineItemFieldFromDOM(i, 'total'), 0)
      };
      
      // Only add non-empty items
      if (item.itemNumber || item.description || item.quantity || item.unitPrice) {
        lineItems.push(item);
      }
    }
    
    return lineItems;
  }

  /**
   * Get line item field value from DOM
   */
  getLineItemFieldFromDOM(rowIndex, fieldType) {
    // Map internal names -> live DOM column ids
    const colId = ({
      quantity: 'qty',
      unitPrice: 'rate',
      total: 'amount'
    })[fieldType] || fieldType; // itemNumber, description pass through

    const selectors = [
      `#line-item-${rowIndex}-${fieldType}`,
      `.line-item-row[data-row="${rowIndex}"] .${colId}-field .editable-field`,
      `.itemtable tbody tr:nth-child(${rowIndex + 1}) .${colId}-field .editable-field`,
      `.itemtable tbody tr:nth-child(${rowIndex + 1}) td[data-field="${colId}"] .editable-field`,
      // Current table uses data-column
      `.itemtable tbody tr:nth-child(${rowIndex + 1}) td[data-column="${colId}"] .editable-field`
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return this.getElementValue(element);
      }
    }
    
    return '';
  }

  /**
   * Get total field value from DOM
   */
  getTotalFromDOM(fieldType) {
    const selectors = [
      `#total-${fieldType}`,
      `.total-${fieldType} .editable-field`,
      `.total-row[data-field="${fieldType}"] .editable-field`,
      `.totals-section .${fieldType}-field .editable-field`
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return this.getElementValue(element);
      }
    }
    
    return null;
  }

  /**
   * Get comments from DOM
   */
  getCommentsFromDOM() {
    const selectors = [
      '#comments-field',
      '.comments-content .editable-field',
      '.comments-section .editable-field',
      '[data-field="comments"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return this.getElementValue(element);
      }
    }
    
    return '';
  }

  /**
   * Get contact info from DOM
   */
  getContactInfoFromDOM() {
    const selectors = [
      '#contact-info-field',
      '.contact-section .editable-field',
      '.contact-info .editable-field',
      '[data-field="contactInfo"]'
    ];
    
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        return this.getElementValue(element);
      }
    }
    
    return '';
  }

  /**
   * Get value from DOM element (handles different element types)
   */
  getElementValue(element) {
    if (!element) return '';
    
    // Handle different input types
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      return element.value || '';
    }
    
    // Handle contentEditable elements
    if (element.contentEditable === 'true' || element.hasAttribute('contenteditable')) {
      return element.textContent?.trim() || '';
    }
    
    // Handle regular text content
    return element.textContent?.trim() || '';
  }

  /**
   * Set nested object value using dot notation (e.g., "companyInfo.name")
   */
  setNestedValue(obj, path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((o, k) => (o[k] = o[k] || {}), obj);
    target[lastKey] = value;
  }

  /**
   * Get nested object value using dot notation
   */
  getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);
  }

  /**
   * Parse number with fallback
   */
  parseNumber(value, fallback = 0) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove currency symbols and commas
      const cleaned = value.replace(/[$,]/g, '');
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  }

  /**
   * Validate form data structure
   */
  validateFormData(formData) {
    const errors = [];
    
    // Required field validation
    const requiredFields = {
      'companyInfo.name': 'Company Name',
      'headerInfo.date': 'Purchase Order Date',
      'headerInfo.poNumber': 'PO Number'
    };
    
    Object.entries(requiredFields).forEach(([path, label]) => {
      const value = this.getNestedValue(formData, path);
      if (!value || value.trim() === '') {
        errors.push(`${label} is required`);
      }
    });
    
    // Number validation for totals
    const numberFields = ['totals.subtotal', 'totals.tax', 'totals.shipping', 'totals.other', 'totals.total'];
    numberFields.forEach(path => {
      const value = this.getNestedValue(formData, path);
      if (value !== null && value !== undefined && isNaN(Number(value))) {
        errors.push(`${path.split('.').pop()} must be a valid number`);
      }
    });
    
    // Line items validation
    if (formData.lineItems && formData.lineItems.length > 0) {
      formData.lineItems.forEach((item, index) => {
        if (item.quantity < 0) {
          errors.push(`Line item ${index + 1} quantity cannot be negative`);
        }
        if (item.unitPrice < 0) {
          errors.push(`Line item ${index + 1} unit price cannot be negative`);
        }
      });
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Calculate totals from line items
   */
  calculateTotals(formData) {
    if (!formData.lineItems || formData.lineItems.length === 0) {
      return formData;
    }
    
    // Calculate subtotal
    const subtotal = formData.lineItems.reduce((sum, item) => {
      return sum + (item.quantity * item.unitPrice);
    }, 0);
    
    formData.totals.subtotal = subtotal;
    
    // Calculate total
    formData.totals.total = subtotal + 
      (formData.totals.tax || 0) + 
      (formData.totals.shipping || 0) + 
      (formData.totals.other || 0);
    
    // Update line item totals
    formData.lineItems.forEach(item => {
      item.total = item.quantity * item.unitPrice;
    });
    
    return formData;
  }

  /**
   * Format form data for XML generation
   */
  formatForXMLGeneration(formData) {
    // Ensure all required fields have values
    const formattedData = {
      ...formData,
      companyFields: this.convertToFieldArray(formData.companyInfo, 'company'),
      purchaseOrderFields: this.convertToFieldArray(formData.headerInfo, 'po'),
      vendorFields: this.convertToFieldArray(formData.vendor, 'vendor'),
      shipToFields: this.convertToFieldArray(formData.shipTo, 'ship-to')
    };
    
    return formattedData;
  }

  /**
   * Convert object to field array format (for compatibility with existing template)
   */
  convertToFieldArray(dataObj, prefix) {
    const fieldArray = [];
    const reverseMapping = this.getReverseMapping(prefix);
    
    Object.entries(dataObj).forEach(([key, value]) => {
      const fieldId = reverseMapping[key];
      if (fieldId) {
        fieldArray.push({
          id: fieldId,
          value: value,
          label: fieldMappingUtils.getFieldName(fieldId)
        });
      }
    });
    
    return fieldArray;
  }

  /**
   * Get reverse mapping for converting data back to field IDs
   */
  getReverseMapping(section) {
    const mappings = {
      company: {
        name: 'company-name',
        address: 'company-address',
        cityStateZip: 'company-city-state',
        phone: 'company-phone',
        fax: 'company-fax',
        website: 'company-website'
      },
      po: {
        title: 'po-title',
        date: 'po-date',
        poNumber: 'po-number'
      },
      vendor: {
        company: 'vendor-company',
        contact: 'vendor-contact',
        address: 'vendor-address',
        cityStateZip: 'vendor-city-state',
        phone: 'vendor-phone',
        fax: 'vendor-fax'
      },
      'ship-to': {
        name: 'ship-to-name',
        company: 'ship-to-company',
        address: 'ship-to-address',
        cityStateZip: 'ship-to-city-state',
        phone: 'ship-to-phone',
        fax: 'ship-to-fax'
      }
    };
    
    return mappings[section] || {};
  }
}

// Export convenience functions
export const formDataMapper = new FormDataMapper();

/**
 * Quick function to collect form data from React field arrays
 */
export const collectFormDataFromReact = (fieldArrays) => {
  return formDataMapper.collectFromReactFieldArrays(fieldArrays);
};

/**
 * Quick function to collect form data from DOM
 */
export const collectFormDataFromDOM = () => {
  return formDataMapper.collectFromDOM();
};

/**
 * Quick function to validate form data
 */
export const validateFormData = (formData) => {
  return formDataMapper.validateFormData(formData);
};

/**
 * Quick function to calculate totals
 */
export const calculateTotals = (formData) => {
  return formDataMapper.calculateTotals(formData);
};

/**
 * Complete form data processing pipeline
 */
export const processFormData = (source, options = {}) => {
  let formData;
  
  // Collect data based on source type
  if (typeof source === 'object' && source.companyFields) {
    // React field arrays format
    formData = collectFormDataFromReact(source);
    
    // PRESERVE sectionOrder data for dynamic XML generation
    if (source.sectionOrder) {
      formData.sectionOrder = source.sectionOrder;
    }
  } else if (typeof source === 'object') {
    // Already structured form data
    formData = source;
  } else {
    // Collect from DOM
    formData = collectFormDataFromDOM();
  }
  
  // Calculate totals if requested
  if (options.calculateTotals !== false) {
    formData = calculateTotals(formData);
  }
  
  // Validate if requested
  if (options.validate !== false) {
    const validation = validateFormData(formData);
    if (!validation.isValid && options.throwOnValidationError) {
      throw new Error(`Form validation failed: ${validation.errors.join(', ')}`);
    }
    formData._validation = validation;
  }
  
  // Format for XML generation if requested
  if (options.formatForXML) {
    formData = formDataMapper.formatForXMLGeneration(formData);
  }
  
  return formData;
};
