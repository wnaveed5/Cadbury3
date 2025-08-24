// NetSuite Integration Layer
// This module converts the existing XML generation to NetSuite-compatible format
// using NetSuite's FreeMarker syntax and variable structure

/**
 * NetSuite Template Generator
 * Converts form data to NetSuite-compatible XML templates
 */
export class NetSuiteTemplateGenerator {
  constructor() {
    this.netSuiteVariables = this.getNetSuiteVariableMapping();
    this.templateStructure = this.getTemplateStructure();
  }

  /**
   * Get NetSuite variable mapping for different field types
   */
  getNetSuiteVariableMapping() {
    return {
      // Company Information
      company: {
        'company-name': '${companyInformation.companyName}',
        'company-address': '${companyInformation.addressText}',
        'company-city-state': '${companyInformation.cityStateZip}',
        'company-phone': '${companyInformation.phone}',
        'company-fax': '${companyInformation.fax}',
        'company-website': '${companyInformation.website}',
        'company-logo': '${companyInformation.logoUrl}'
      },
      
      // Purchase Order
      purchaseOrder: {
        'po-title': '${record@title}',
        'po-number': '${record.tranid}',
        'po-date': '${record.trandate}',
        'po-delivery-date': '${record.shipdate}',
        'po-payment-terms': '${record.terms}',
        'po-due-date': '${record.duedate}',
        'po-reference': '${record.otherrefnum}',
        'po-requisitioner': '${record.memo}'
      },
      
      // Vendor Information
      vendor: {
        'vendor-company': '${record.billaddresslist}',
        'vendor-contact': '${record.billcontact}',
        'vendor-address': '${record.billaddress}',
        'vendor-city-state': '${record.billcitystate}',
        'vendor-phone': '${record.billphone}',
        'vendor-fax': '${record.billfax}'
      },
      
      // Ship To Information
      shipTo: {
        'ship-to-name': '${record.shipcontact}',
        'ship-to-company': '${record.shipaddresslist}',
        'ship-to-address': '${record.shipaddress}',
        'ship-to-city-state': '${record.shipcitystate}',
        'ship-to-phone': '${record.shipphone}',
        'ship-to-fax': '${record.shipfax}'
      },
      
      // Shipping Details
      shipping: {
        'ship-via': '${record.shipmethod}',
        'fob': '${record.fob}',
        'shipping-terms': '${record.shippingterms}'
      },
      
      // Line Items
      lineItems: {
        'item-number': '${item.item}',
        'description': '${item.description}',
        'quantity': '${item.quantity}',
        'unit-price': '${item.rate}',
        'total': '${item.amount}',
        'options': '${item.options}'
      },
      
      // Totals
      totals: {
        'subtotal': '${record.subtotal}',
        'tax': '${record.taxtotal}',
        'shipping': '${record.shippingcost}',
        'other': '${record.othercost}',
        'total': '${record.total}'
      }
    };
  }

  /**
   * Get the basic template structure for NetSuite
   */
  getTemplateStructure() {
    return {
      header: {
        fonts: ['NotoSans', 'NotoSansCJKsc', 'NotoSansCJKtc', 'NotoSansCJKjp', 'NotoSansCJKkr', 'NotoSansThai'],
        macros: ['nlheader', 'nlfooter'],
        styles: ['base', 'tables', 'headers', 'totals']
      },
      body: {
        sections: ['company-po', 'vendor-shipto', 'line-items', 'totals', 'comments'],
        layout: 'table-based',
        orientation: 'portrait',
        size: 'Letter'
      }
    };
  }

  /**
   * Generate NetSuite XML template with complete mapping
   */
  generateNetSuiteTemplate(data) {
    console.log('🔀 Generating NetSuite XML template with complete mapping');
    
    // Extract all dynamic ordering and custom elements
    const mappingData = this.extractCompleteMapping(data);
    
    // Build the complete template
    const head = this.buildHeaderSection();
    const body = this.buildBodySection(mappingData);
    
    return `<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
${head}
${body}
</pdf>`;
  }

  /**
   * Extract complete mapping from form data including all dynamic elements
   */
  extractCompleteMapping(data) {
    const mapping = {
      // Original data
      companyFields: data.companyFields || [],
      purchaseOrderFields: data.purchaseOrderFields || [],
      vendorFields: data.vendorFields || [],
      shipToFields: data.shipToFields || [],
      totalsFields: data.totalsFields || [],
      commentsFields: data.commentsFields || [],
      contactFields: data.contactFields || [],
      
      // Major sections ordering (sections 3,4,5 swapping)
      majorSectionsOrder: data.majorSectionsOrder || ['vendor-shipto-group', 'shipping-section'],
      
      // Section ordering (major layout changes)
      sectionOrder: data.sectionOrder || {},
      
      // Field ordering within sections
      fieldOrder: data.fieldOrder || {},
      
      // Column ordering for tables
      columnOrder: {
        lineItems: data.sectionOrder?.lineItemColumns || ['itemNumber', 'description', 'qty', 'rate', 'amount'],
        shipping: data.sectionOrder?.shippingColumns || ['requisitioner', 'shipVia', 'fob', 'shippingTerms']
      },
      
      // Custom fields and columns
      customElements: this.extractCustomElements(data),
      
      // Dynamic rows and content
      dynamicContent: this.extractDynamicContent(data),
      
      // NetSuite variable mapping
      netSuiteMapping: this.getNetSuiteVariableMapping()
    };
    
    console.log('📋 Complete mapping extracted:', mapping);
    return mapping;
  }

  /**
   * Extract all custom fields and columns
   */
  extractCustomElements(data) {
    const custom = {
      company: [],
      purchaseOrder: [],
      vendor: [],
      shipTo: [],
      lineItems: [],
      shipping: [],
      totals: [],
      comments: [],
      contact: []
    };
    
    // Extract custom company fields
    if (data.companyFields) {
      data.companyFields.forEach(field => {
        if (field.id.startsWith('custom-')) {
          custom.company.push({
            id: field.id,
            label: field.label || field.id.replace('custom-', '').toUpperCase(),
            value: field.value
          });
        }
      });
    }
    
    // Extract custom purchase order fields
    if (data.purchaseOrderFields) {
      data.purchaseOrderFields.forEach(field => {
        if (field.id.startsWith('custom-')) {
          custom.purchaseOrder.push({
            id: field.id,
            label: field.label || field.id.replace('custom-', '').toUpperCase(),
            value: field.value
          });
        }
      });
    }
    
    // Extract custom vendor fields
    if (data.vendorFields) {
      data.vendorFields.forEach(field => {
        if (field.id.startsWith('custom-')) {
          custom.vendor.push({
            id: field.id,
            label: field.label || field.id.replace('custom-', '').toUpperCase(),
            value: field.value
          });
        }
      });
    }
    
    // Extract custom ship-to fields
    if (data.shipToFields) {
      data.shipToFields.forEach(field => {
        if (field.id.startsWith('custom-')) {
          custom.shipTo.push({
            id: field.id,
            label: field.label || field.id.replace('custom-', '').toUpperCase(),
            value: field.value
          });
        }
      });
    }
    
    // Extract custom line item columns
    if (data.sectionOrder?.lineItemColumns) {
      data.sectionOrder.lineItemColumns.forEach(columnId => {
        if (columnId.startsWith('custom-')) {
          custom.lineItems.push({
            id: columnId,
            label: columnId.replace('custom-', '').replace(/-/g, ' ').toUpperCase()
          });
        }
      });
    }
    
    // Extract custom shipping columns
    if (data.sectionOrder?.shippingColumns) {
      data.sectionOrder.shippingColumns.forEach(columnId => {
        if (columnId.startsWith('custom-')) {
          custom.shipping.push({
            id: columnId,
            label: columnId.replace('custom-', '').replace(/-/g, ' ').toUpperCase()
          });
        }
      });
    }
    
    return custom;
  }

  /**
   * Extract dynamic content like rows and conditional elements
   */
  extractDynamicContent(data) {
    return {
      lineItemRows: data.lineItemRows || 5, // Default 5 rows
      customRows: data.customRows || [],
      conditionalSections: data.conditionalSections || []
    };
  }

  /**
   * Get complete NetSuite variable mapping
   */
  getNetSuiteVariableMapping() {
    return {
      // Company Information
      company: {
        'company-name': '${companyInformation.companyName}',
        'company-address': '${companyInformation.addressText}',
        'company-city-state': '${companyInformation.cityStateZip}',
        'company-phone': '${companyInformation.phone}',
        'company-fax': '${companyInformation.fax}',
        'company-website': '${companyInformation.website}'
      },
      
      // Purchase Order
      purchaseOrder: {
        'po-date': '${record.trandate}',
        'po-number': '${record.tranid}',
        'po-title': 'PURCHASE ORDER'
      },
      
      // Vendor Information
      vendor: {
        'vendor-company': '${record.billaddresslist}',
        'vendor-contact': '${record.billcontact}',
        'vendor-address': '${record.billaddress}',
        'vendor-city-state': '${record.billcitystate}',
        'vendor-phone': '${record.billphone}'
      },
      
      // Ship To Information
      shipTo: {
        'ship-to-name': '${record.shipcontact}',
        'ship-to-company': '${record.shipaddresslist}',
        'ship-to-address': '${record.shipaddress}',
        'ship-to-city-state': '${record.shipcitystate}',
        'ship-to-phone': '${record.shipphone}'
      },
      
      // Shipping Details
      shipping: {
        'requisitioner': '${record.memo}',
        'shipVia': '${record.shipmethod}',
        'fob': '${record.fob}',
        'shippingTerms': '${record.shippingterms}'
      },
      
      // Line Items
      lineItems: {
        'itemNumber': '${item.item!\"-\"}',
        'description': '${item.description!\"-\"}',
        'qty': '${item.quantity!\"-\"}',
        'rate': '${item.rate!\"-\"}',
        'amount': '${item.amount!\"-\"}'
      },
      
      // Totals
      totals: {
        'subtotal': '${record.subtotal}',
        'tax': '${record.taxtotal}',
        'shipping': '${record.shippingcost}',
        'other': '${record.othercost}',
        'total': '${record.total}'
      },
      
      // Comments and Contact
      comments: '${record.memo}',
      contact: '${record.memo}'
    };
  }

  /**
   * Build the complete NetSuite template
   */
  buildCompleteTemplate(data) {
    try {
      const headerSection = this.buildHeaderSection();
      const bodySection = this.buildBodySection(data);
      
      return `<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
${headerSection}
${bodySection}
</pdf>`;
    } catch (error) {
      console.error('❌ Error building NetSuite template:', error);
      throw new Error(`Failed to build NetSuite template: ${error.message}`);
    }
  }

  /**
   * Build the header section with fonts, macros, and styles
   */
  buildHeaderSection() {
    return `<head>
    <link name="NotoSans" type="font" subtype="truetype" src="\${nsfont.NotoSans_Regular}" src-bold="\${nsfont.NotoSans_Bold}" src-italic="\${nsfont.NotoSans_Italic}" src-bolditalic="\${nsfont.NotoSans_BoldItalic}" bytes="2" />
    <#if .locale == "zh_CN">
        <link name="NotoSansCJKsc" type="font" subtype="opentype" src="\${nsfont.NotoSansCJKsc_Regular}" src-bold="\${nsfont.NotoSansCJKsc_Bold}" bytes="2" />
    <#elseif .locale == "zh_TW">
        <link name="NotoSansCJKtc" type="font" subtype="opentype" src="\${nsfont.NotoSansCJKtc_Regular}" src-bold="\${nsfont.NotoSansCJKtc_Bold}" bytes="2" />
    <#elseif .locale == "ja_JP">
        <link name="NotoSansCJKjp" type="font" subtype="opentype" src="\${nsfont.NotoSansCJKjp_Regular}" src-bold="\${nsfont.NotoSansCJKjp_Bold}" bytes="2" />
    <#elseif .locale == "ko_KR">
        <link name="NotoSansCJKkr" type="font" subtype="opentype" src="\${nsfont.NotoSansCJKkr_Regular}" src-bold="\${nsfont.NotoSansCJKkr_Bold}" bytes="2" />
    <#elseif .locale == "th_TH">
        <link name="NotoSansThai" type="font" subtype="opentype" src="\${nsfont.NotoSansThai_Regular}" src-bold="\${nsfont.NotoSansThai_Bold}" bytes="2" />
    </#if>

    <style>
        * { 
            font-family: NotoSans, sans-serif; 
            font-size: 9pt; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-bottom: 0;
        }
        .header-company { 
            font-size: 14pt; 
            font-weight: bold; 
        }
        .header-title { 
            font-size: 20pt; 
            font-weight: bold; 
            background-color: #000000; 
            color: #ffffff; 
            padding: 6px; 
            border: 1px solid #000; 
        }
        .header-info { 
            font-size: 10pt; 
        }
        .section-header { 
            background-color: #000000; 
            color: #ffffff; 
            font-weight: bold; 
            padding: 6px; 
            border: 1px solid #000; 
        }
        .section-content { 
            padding: 6px; 
            border: 1px solid #000; 
            vertical-align: top; 
            min-height: 20px;
        }
        .item-header { 
            background-color: #000000; 
            color: #ffffff; 
            font-weight: bold; 
            padding: 8px; 
            border: 1px solid #000; 
        }
        .item-cell { 
            padding: 6px; 
            border: 1px solid #000; 
        }
        .total-label { 
            font-weight: bold; 
            padding: 4px; 
        }
        .total-amount { 
            font-weight: bold; 
            padding: 4px; 
            background-color: #ffff99; 
        }
        .comments-header { 
            background-color: #000000; 
            color: #ffffff; 
            font-weight: bold; 
            padding: 6px; 
            border: 1px solid #000; 
        }
        .comments-content { 
            padding: 6px; 
            border: 1px solid #000; 
            min-height: 40px; 
        }
        .contact-info { 
            font-size: 8pt; 
        }
        
        /* Ensure proper spacing and borders */
        td { 
            border: 1px solid #000; 
            padding: 6px; 
        }
        
        /* All section headers now use section title colors */
        .section-header, .header-title, .comments-header, .item-header {
            background-color: #000000 !important;
            color: #ffffff !important;
        }
        
        /* Fix vendor/ship-to content spacing */
        .section-content span {
            display: block;
            margin-bottom: 4px;
        }
        .section-content span:last-child {
            margin-bottom: 0;
        }
    </style>
</head>`;
  }

  /**
   * Build the body section with all the content
   */
  buildBodySection(data) {
    // Check if we have section order information
    const sectionOrder = data.sectionOrder || {};
    
    // Debug: Log the data being received
    console.log('🔍 NetSuite buildBodySection - Full data:', data);
    console.log('🔍 NetSuite buildBodySection - majorSectionsOrder:', data.majorSectionsOrder);
    console.log('🔍 NetSuite buildBodySection - sectionOrder:', sectionOrder);
    
    const companyPOSection = this.buildCompanyPOSection(data, sectionOrder);
    const lineItemsSection = this.buildLineItemsSection(data);
    const commentsTotalsSection = this.buildCommentsTotalsSection(data, sectionOrder);
    const contactSignatureSection = this.buildContactSignatureSection(data);

    // Build vendor/shipto and shipping sections separately
    const vendorShipToSection = this.buildVendorShipToSection(data, sectionOrder);
    const shippingDetailsSection = this.buildShippingDetailsSection(data);
    
    // Use majorSectionsOrder for dynamic section arrangement (sections 3,4,5 swapping)
    const majorSectionsOrder = data.majorSectionsOrder || ['vendor-shipto-group', 'shipping-section'];
    
    console.log('🔍 NetSuite buildBodySection - Using majorSectionsOrder:', majorSectionsOrder);
    console.log('🔍 NetSuite buildBodySection - majorSectionsOrder[0]:', majorSectionsOrder[0]);
    console.log('🔍 NetSuite buildBodySection - majorSectionsOrder[1]:', majorSectionsOrder[1]);
    
    // Build the sections in the correct order based on majorSectionsOrder
    // Use the same logic as the regular template for consistent behavior
    let vendorShipToAndShippingContent = '';
    if (majorSectionsOrder[0] === 'vendor-shipto-group') {
      // Default order: Vendor-ShipTo group on top, Shipping Details below
      console.log('🔍 NetSuite buildBodySection - Using default order: Vendor-ShipTo group top, Shipping section bottom');
      vendorShipToAndShippingContent = vendorShipToSection + shippingDetailsSection;
    } else if (majorSectionsOrder[0] === 'shipping-section') {
      // Swapped order: Shipping Details on top, Vendor-ShipTo group below
      console.log('🔍 NetSuite buildBodySection - Using swapped order: Shipping section top, Vendor-ShipTo group bottom');
      vendorShipToAndShippingContent = shippingDetailsSection + vendorShipToSection;
    } else {
      // Fallback to default if unexpected value
      console.log('🔍 NetSuite buildBodySection - Unexpected majorSectionsOrder[0]:', majorSectionsOrder[0], '- using default');
      vendorShipToAndShippingContent = vendorShipToSection + shippingDetailsSection;
    }

    console.log('🔍 NetSuite buildBodySection - Final vendorShipToAndShippingContent length:', vendorShipToAndShippingContent.length);

    return `<body padding="0.5in" size="Letter">
    ${companyPOSection}
    ${vendorShipToAndShippingContent}
    ${lineItemsSection}
    ${commentsTotalsSection}
    ${contactSignatureSection}
</body>`;
  }

  /**
   * Build company and purchase order section with complete mapping
   */
  buildCompanyPOSection(data, sectionOrder = {}) {
    const companyFields = data.companyFields || [];
    const purchaseOrderFields = data.purchaseOrderFields || [];
    const fieldOrder = data.fieldOrder || {};
    const customElements = data.customElements || {};
    const netSuiteMapping = data.netSuiteMapping || {};
    
    console.log('🔍 Company section data:', {
      companyFields,
      fieldOrder,
      customElements,
      netSuiteMapping: netSuiteMapping.company
    });
    
    // Build company fields in the correct order
    const companyFieldOrder = fieldOrder.company || ['company-name', 'company-address', 'company-city-state', 'company-phone', 'company-fax', 'company-website'];
    console.log('🔍 Company field order:', companyFieldOrder);
    
    const companyRows = companyFieldOrder.map(fieldId => {
      console.log(`🔍 Processing company field: ${fieldId}`);
      
      // Check if it's a standard field
      if (netSuiteMapping.company && netSuiteMapping.company[fieldId]) {
        console.log(`✅ Standard field found: ${fieldId} -> ${netSuiteMapping.company[fieldId]}`);
        return `<tr><td class="header-company" style="text-align: left;" data-field="${fieldId}">${netSuiteMapping.company[fieldId]}</td></tr>`;
      }
      
      // Check if it's a custom field
      if (fieldId.startsWith('custom-')) {
        const customField = customElements.company.find(f => f.id === fieldId);
        if (customField) {
          console.log(`✅ Custom field found: ${fieldId}`);
          return `<tr><td style="text-align: left;" data-field="${fieldId}">\${record.${fieldId}}</td></tr>`;
        }
      }
      
      console.log(`❌ No mapping found for field: ${fieldId}`);
      return '';
    }).filter(row => row !== '').join('');
    
    console.log('🔍 Company rows generated:', companyRows);
    
    // Build PO fields in the correct order
    const poFieldOrder = fieldOrder.purchaseOrder || ['po-date', 'po-number'];
    const poRows = poFieldOrder.map(fieldId => {
      // Check if it's a standard field
      if (netSuiteMapping.purchaseOrder && netSuiteMapping.purchaseOrder[fieldId]) {
        if (fieldId === 'po-date') {
          return `<tr><td style="text-align: right;"><table style="width: 100%;"><tr><td class="header-info" style="width: 30%; text-align: left;"><b>DATE</b></td></tr><tr><td class="header-info" style="width: 70%; text-align: left;" data-field="po-date">${netSuiteMapping.purchaseOrder[fieldId]}</td></tr></table></td></tr>`;
        }
        if (fieldId === 'po-number') {
          return `<tr><td style="text-align: right;"><table style="width: 100%;"><tr><td class="header-info" style="width: 30%; text-align: left;"><b>PO #</b></td></tr><tr><td class="header-info" style="width: 70%; text-align: left;" data-field="po-number">${netSuiteMapping.purchaseOrder[fieldId]}</td></tr></table></td></tr>`;
        }
      }
      
      // Check if it's a custom field
      if (fieldId.startsWith('custom-')) {
        const customField = customElements.purchaseOrder.find(f => f.id === fieldId);
        if (customField) {
          const label = customField.label || fieldId.replace('custom-', '').toUpperCase();
          return `<tr><td style="text-align: right;"><table style="width: 100%;"><tr><td class="header-info" style="width: 30%; text-align: left;"><b>${label}</b></td></tr><tr><td class="header-info" style="width: 70%; text-align: left;" data-field="${fieldId}">\${record.${fieldId}}</td></tr></table></td></tr>`;
        }
      }
      
      return '';
    }).filter(row => row !== '').join('');
    
    // Determine the order of sections 1 and 2
    const sections1And2 = sectionOrder.sections1And2 || ['section1', 'section2'];
    const isSwapped = sections1And2[0] === 'section2';
    
    const companySection = `
            <td style="width: 65%; padding-right: 24px;" data-section="company-info">
                <table>
                    ${companyRows}
                </table>
            </td>`;
    
    const poSection = `
            <td style="width: 35%; padding-left: 28px;" align="right" data-section="purchase-order-info">
                <table>
                    <tr><td class="header-title" style="text-align: right;" data-field="po-title">PURCHASE ORDER</td></tr>
                    ${poRows}
                </table>
            </td>`;
    
    return `<table>
        <tr>${isSwapped ? poSection + companySection : companySection + poSection}
        </tr>
    </table>`;
  }

  /**
   * Build vendor and ship to section with complete mapping
   */
  buildVendorShipToSection(data, sectionOrder = {}) {
    const vendorFields = data.vendorFields || [];
    const shipToFields = data.shipToFields || [];
    const fieldOrder = data.fieldOrder || {};
    const customElements = data.customElements || {};
    const netSuiteMapping = data.netSuiteMapping || {};
    
    // Build vendor fields in the correct order
    const vendorFieldOrder = fieldOrder.vendor || ['vendor-company', 'vendor-contact', 'vendor-address', 'vendor-city-state', 'vendor-phone'];
    const vendorContent = vendorFieldOrder.map(fieldId => {
      // Check if it's a standard field
      if (netSuiteMapping.vendor && netSuiteMapping.vendor[fieldId]) {
        return `<span data-field="${fieldId}">${netSuiteMapping.vendor[fieldId]}</span>`;
      }
      
      // Check if it's a custom field
      if (fieldId.startsWith('custom-')) {
        const customField = customElements.vendor.find(f => f.id === fieldId);
        if (customField) {
          return `<span data-field="${fieldId}">\${record.${fieldId}}</span>`;
        }
      }
      
      return '';
    }).filter(content => content !== '').join('');
    
    // Build ship-to fields in the correct order
    const shipToFieldOrder = fieldOrder.shipTo || ['ship-to-name', 'ship-to-company', 'ship-to-address', 'ship-to-city-state', 'ship-to-phone'];
    const shipToContent = shipToFieldOrder.map(fieldId => {
      // Check if it's a standard field
      if (netSuiteMapping.shipTo && netSuiteMapping.shipTo[fieldId]) {
        return `<span data-field="${fieldId}">${netSuiteMapping.shipTo[fieldId]}</span>`;
      }
      
      // Check if it's a custom field
      if (fieldId.startsWith('custom-')) {
        const customField = customElements.shipTo.find(f => f.id === fieldId);
        if (customField) {
          return `<span data-field="${fieldId}">\${record.${fieldId}}</span>`;
        }
      }
      
      return '';
    }).filter(content => content !== '').join('');
    
    // Determine the order of sections 3 and 4
    const sections3And4 = sectionOrder.sections3And4 || ['section3', 'section4'];
    const isSwapped = sections3And4[0] === 'section4';
    
    const vendorSection = `
            <td style="width: 50%;" data-subsection="vendor">
                <table>
                    <tr>
                        <td class="section-header">VENDOR</td>
                    </tr>
                    <tr>
                        <td class="section-content">${vendorContent}</td>
                    </tr>
                </table>
            </td>`;
    
    const shipToSection = `
            <td style="width: 50%;" data-subsection="ship-to">
                <table>
                    <tr>
                        <td class="section-header">SHIP TO</td>
                    </tr>
                    <tr>
                        <td class="section-content">${shipToContent}</td>
                    </tr>
                </table>
            </td>`;
    
    return `<table style="margin-top: 20px;" data-section="vendor-ship-to">
        <tr>${isSwapped ? shipToSection + vendorSection : vendorSection + shipToSection}
        </tr>
    </table>`;
  }

  /**
   * Build shipping details section with complete mapping
   */
  buildShippingDetailsSection(data) {
    const sectionOrder = data.sectionOrder || {};
    const customElements = data.customElements || {};
    const netSuiteMapping = data.netSuiteMapping || {};
    const shippingColumnOrder = sectionOrder.shippingColumns || ['requisitioner', 'shipVia', 'fob', 'shippingTerms'];
    
    // Build headers and values based on column order
    const headers = [];
    const values = [];
    
    shippingColumnOrder.forEach(columnId => {
      // Check if it's a standard column
      if (netSuiteMapping.shipping && netSuiteMapping.shipping[columnId]) {
        const label = this.getShippingColumnLabel(columnId);
        headers.push(`<td class="section-header" style="width: ${100/shippingColumnOrder.length}%;">${label}</td>`);
        values.push(`<td class="section-content" data-field="${columnId}">${netSuiteMapping.shipping[columnId]}</td>`);
      }
      // Check if it's a custom column
      else if (columnId.startsWith('custom-')) {
        const customColumn = customElements.shipping.find(c => c.id === columnId);
        if (customColumn) {
          headers.push(`<td class="section-header" style="width: ${100/shippingColumnOrder.length}%;">${customColumn.label}</td>`);
          values.push(`<td class="section-content" data-field="${columnId}">\${record.${columnId}}</td>`);
        }
      }
    });
    
    return `<table style="margin-top: 15px;" data-section="shipping-details">
        <tr>
            ${headers.join('\n            ')}
        </tr>
        <tr>
            ${values.join('\n            ')}
        </tr>
    </table>`;
  }

  /**
   * Get shipping column label
   */
  getShippingColumnLabel(columnId) {
    const labels = {
      'requisitioner': 'REQUISITIONER',
      'shipVia': 'SHIP VIA',
      'fob': 'F.O.B.',
      'shippingTerms': 'SHIPPING TERMS'
    };
    return labels[columnId] || columnId.toUpperCase();
  }

  /**
   * Build line items section with complete mapping
   */
  buildLineItemsSection(data) {
    const sectionOrder = data.sectionOrder || {};
    const customElements = data.customElements || {};
    const netSuiteMapping = data.netSuiteMapping || {};
    const lineItemColumnOrder = sectionOrder.lineItemColumns || ['itemNumber', 'description', 'qty', 'rate', 'amount'];
    
    // Build headers based on column order
    const headers = [];
    const cellTemplates = [];
    const emptyCells = [];
    
    lineItemColumnOrder.forEach(columnId => {
      // Check if it's a standard column
      if (netSuiteMapping.lineItems && netSuiteMapping.lineItems[columnId]) {
        const label = this.getLineItemColumnLabel(columnId);
        const colspan = this.getLineItemColumnSpan(columnId);
        headers.push(`<td class="item-header" colSpan="${colspan}">${label}</td>`);
        cellTemplates.push(`<td colSpan="${colspan}">${netSuiteMapping.lineItems[columnId]}</td>`);
        emptyCells.push(`<td colSpan="${colspan}">-</td>`);
      }
      // Check if it's a custom column
      else if (columnId.startsWith('custom-')) {
        const customColumn = customElements.lineItems.find(c => c.id === columnId);
        if (customColumn) {
          headers.push(`<td class="item-header" colSpan="3">${customColumn.label}</td>`);
          cellTemplates.push(`<td colSpan="3">\${item.${columnId}!\"-\"}</td>`);
          emptyCells.push(`<td colSpan="3">-</td>`);
        }
      }
    });
    
    const headerRow = headers.join('\n            ');
    const cellRow = cellTemplates.join('\n                ');
    const emptyRow = emptyCells.join('');
    
    return `<#if record.item?has_content>
    <table style="margin-top: 15px;" data-section="line-items">
        <tr>
            ${headerRow}
        </tr>
        <#list record.item as item>
            <tr data-row-id="line-item-\${item_index}" data-row-index="\${item_index}">
                ${cellRow}
            </tr>
        </#list>
    </table>
<#else>
    <table style="margin-top: 15px;" data-section="line-items">
        <tr>
            ${headerRow}
        </tr>
        <tr data-row-id="line-item-0" data-row-index="0">${emptyRow}</tr>
        <tr data-row-id="line-item-1" data-row-index="1">${emptyRow}</tr>
        <tr data-row-id="line-item-2" data-row-index="2">${emptyRow}</tr>
        <tr data-row-id="line-item-3" data-row-index="3">${emptyRow}</tr>
        <tr data-row-id="line-item-4" data-row-index="4">${emptyRow}</tr>
    </table>
</#if>`;
  }

  /**
   * Get line item column label
   */
  getLineItemColumnLabel(columnId) {
    const labels = {
      'itemNumber': 'Item#',
      'description': 'Description',
      'qty': 'Qty',
      'rate': 'Rate',
      'amount': 'Amount'
    };
    return labels[columnId] || columnId.toUpperCase();
  }

  /**
   * Get line item column span
   */
  getLineItemColumnSpan(columnId) {
    const spans = {
      'itemNumber': 3,
      'description': 12,
      'qty': 2,
      'rate': 3,
      'amount': 3
    };
    return spans[columnId] || 3;
  }

  /**
   * Build comments and totals section with complete mapping
   */
  buildCommentsTotalsSection(data, sectionOrder = {}) {
    const commentsFields = data.commentsFields || [];
    const totalsFields = data.totalsFields || [];
    const netSuiteMapping = data.netSuiteMapping || {};
    
    // Use NetSuite variables for all totals
    const subtotal = netSuiteMapping.totals?.subtotal || '${record.subtotal}';
    const tax = netSuiteMapping.totals?.tax || '${record.taxtotal}';
    const shipping = netSuiteMapping.totals?.shipping || '${record.shippingcost}';
    const other = netSuiteMapping.totals?.other || '${record.othercost}';
    const total = netSuiteMapping.totals?.total || '${record.total}';
    
    // Determine the order of sections 8 and 9 (Comments and Totals)
    const sections8And9 = sectionOrder.sections8And9 || ['section8', 'section9'];
    const isSwapped = sections8And9[0] === 'section9';
    
    const commentsSection = `
            <td style="width: 50%;" data-section="comments">
                <table>
                    <tr>
                        <td class="comments-header">Comments or Special Instructions:</td>
                    </tr>
                    <tr>
                        <td class="comments-content">
                            <#if record.memo?has_content>
                                \${record.memo}
                            <#else>
                                [Enter comments or special instructions...]
                            </#if>
                        </td>
                    </tr>
                </table>
            </td>`;
    
    const totalsSection = `
            <td style="width: 50%;" data-section="totals">
                <table>
                    <tr>
                        <td class="section-header" colspan="2">Totals</td>
                    </tr>
                    <tr>
                        <td class="total-label">SUBTOTAL:</td>
                        <td class="total-amount" align="right">${subtotal}</td>
                    </tr>
                    <tr>
                        <td class="total-label">TAX:</td>
                        <td class="total-amount" align="right">${tax}</td>
                    </tr>
                    <tr>
                        <td class="total-label">SHIPPING:</td>
                        <td class="total-amount" align="right">${shipping}</td>
                    </tr>
                    <tr>
                        <td class="total-label">OTHER:</td>
                        <td class="total-amount" align="right">${other}</td>
                    </tr>
                    <tr>
                        <td class="total-label">TOTAL:</td>
                        <td class="total-amount" align="right">${total}</td>
                    </tr>
                </table>
            </td>`;
    
    return `<table style="margin-top: 15px;" data-section="comments-totals">
        <tr>${isSwapped ? totalsSection + commentsSection : commentsSection + totalsSection}
        </tr>
    </table>`;
  }

  /**
   * Build contact signature section with complete mapping
   */
  buildContactSignatureSection(data) {
    const contactFields = data.contactFields || [];
    const netSuiteMapping = data.netSuiteMapping || {};
    
    return `<table style="margin-top: 20px;" data-section="contact-signature">
        <tr>
            <td class="contact-info" style="width: 70%;" data-field="contact-info">
                <table>
                    <tr>
                        <td class="contact-header">Contact Information:</td>
                    </tr>
                    <tr>
                        <td class="contact-content">
                            <#if record.memo?has_content>
                                \${record.memo}
                            <#else>
                                For inquiries, please contact us
                            </#if>
                        </td>
                    </tr>
                </table>
            </td>
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
    </table>`;
  }

  /**
   * Convert existing XML data to NetSuite format
   */
  convertExistingXMLToNetSuite(existingXML, formData) {
    console.log('🔄 Converting existing XML to NetSuite format');
    
    // Extract data from existing XML if needed
    const extractedData = this.extractDataFromXML(existingXML);
    
    // Merge with form data
    const mergedData = {
      ...formData,
      ...extractedData
    };
    
    // Generate NetSuite template
    return this.generateNetSuiteTemplate(mergedData);
  }

  /**
   * Extract data from existing XML (if needed for conversion)
   */
  extractDataFromXML(xmlString) {
    console.log('📄 Extracting data from existing XML');
    
    try {
      // Check if DOMParser is available (browser environment)
      if (typeof DOMParser === 'undefined') {
        console.log('⚠️ DOMParser not available, skipping XML extraction');
        return {};
      }
      
      // Create a DOM parser to extract data from the XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      const extractedData = {};
      
      // Extract company information
      const companyName = xmlDoc.querySelector('[data-field="company-name"]')?.textContent;
      const companyAddress = xmlDoc.querySelector('[data-field="company-address"]')?.textContent;
      const companyCityState = xmlDoc.querySelector('[data-field="company-city-state"]')?.textContent;
      const companyPhone = xmlDoc.querySelector('[data-field="company-phone"]')?.textContent;
      const companyFax = xmlDoc.querySelector('[data-field="company-fax"]')?.textContent;
      const companyWebsite = xmlDoc.querySelector('[data-field="company-website"]')?.textContent;
      
      // Extract purchase order information
      const poDate = xmlDoc.querySelector('[data-field="po-date"]')?.textContent;
      const poNumber = xmlDoc.querySelector('[data-field="po-number"]')?.textContent;
      
      // Extract vendor information
      const vendorCompany = xmlDoc.querySelector('[data-field="vendor-company"]')?.textContent;
      const vendorContact = xmlDoc.querySelector('[data-field="vendor-contact"]')?.textContent;
      const vendorAddress = xmlDoc.querySelector('[data-field="vendor-address"]')?.textContent;
      const vendorCityState = xmlDoc.querySelector('[data-field="vendor-city-state"]')?.textContent;
      const vendorPhone = xmlDoc.querySelector('[data-field="vendor-phone"]')?.textContent;
      
      // Extract ship to information
      const shipToName = xmlDoc.querySelector('[data-field="ship-to-name"]')?.textContent;
      const shipToCompany = xmlDoc.querySelector('[data-field="ship-to-company"]')?.textContent;
      const shipToAddress = xmlDoc.querySelector('[data-field="ship-to-address"]')?.textContent;
      const shipToCityState = xmlDoc.querySelector('[data-field="ship-to-city-state"]')?.textContent;
      const shipToPhone = xmlDoc.querySelector('[data-field="ship-to-phone"]')?.textContent;
      
      // Extract shipping details
      const requisitioner = xmlDoc.querySelector('[data-field="requisitioner"]')?.textContent;
      const shipVia = xmlDoc.querySelector('[data-field="shipVia"]')?.textContent;
      const fob = xmlDoc.querySelector('[data-field="fob"]')?.textContent;
      const shippingTerms = xmlDoc.querySelector('[data-field="shippingTerms"]')?.textContent;
      
      // Extract totals
      const subtotal = xmlDoc.querySelector('[data-field="subtotal"]')?.textContent;
      const tax = xmlDoc.querySelector('[data-field="tax"]')?.textContent;
      const shipping = xmlDoc.querySelector('[data-field="shipping"]')?.textContent;
      const other = xmlDoc.querySelector('[data-field="other"]')?.textContent;
      const total = xmlDoc.querySelector('[data-field="total"]')?.textContent;
      
      // Extract comments and contact
      const comments = xmlDoc.querySelector('[data-field="comments"]')?.textContent;
      const contactInfo = xmlDoc.querySelector('[data-field="contact-info"]')?.textContent;
      
      // Build extracted data object
      if (companyName) extractedData.companyName = companyName;
      if (companyAddress) extractedData.companyAddress = companyAddress;
      if (companyCityState) extractedData.companyCityState = companyCityState;
      if (companyPhone) extractedData.companyPhone = companyPhone;
      if (companyFax) extractedData.companyFax = companyFax;
      if (companyWebsite) extractedData.companyWebsite = companyWebsite;
      
      if (poDate) extractedData.poDate = poDate;
      if (poNumber) extractedData.poNumber = poNumber;
      
      if (vendorCompany) extractedData.vendorCompany = vendorCompany;
      if (vendorContact) extractedData.vendorContact = vendorContact;
      if (vendorAddress) extractedData.vendorAddress = vendorAddress;
      if (vendorCityState) extractedData.vendorCityState = vendorCityState;
      if (vendorPhone) extractedData.vendorPhone = vendorPhone;
      
      if (shipToName) extractedData.shipToName = shipToName;
      if (shipToCompany) extractedData.shipToCompany = shipToCompany;
      if (shipToAddress) extractedData.shipToAddress = shipToAddress;
      if (shipToCityState) extractedData.shipToCityState = shipToCityState;
      if (shipToPhone) extractedData.shipToPhone = shipToPhone;
      
      if (requisitioner) extractedData.requisitioner = requisitioner;
      if (shipVia) extractedData.shipVia = shipVia;
      if (fob) extractedData.fob = fob;
      if (shippingTerms) extractedData.shippingTerms = shippingTerms;
      
      if (subtotal) extractedData.subtotal = subtotal;
      if (tax) extractedData.tax = tax;
      if (shipping) extractedData.shipping = shipping;
      if (other) extractedData.other = other;
      if (total) extractedData.total = total;
      
      if (comments) extractedData.comments = comments;
      if (contactInfo) extractedData.contactInfo = contactInfo;
      
      console.log('📊 Extracted data from XML:', extractedData);
      return extractedData;
      
    } catch (error) {
      console.error('❌ Error extracting data from XML:', error);
      return {};
    }
  }
}

/**
 * Factory function to create NetSuite template generator
 */
export function createNetSuiteGenerator() {
  return new NetSuiteTemplateGenerator();
}

/**
 * Quick function to generate NetSuite template from form data
 */
export function generateNetSuiteTemplate(formData, options = {}) {
  const generator = createNetSuiteGenerator();
  return generator.generateNetSuiteTemplate(formData, options);
}

/**
 * Convert existing XML to NetSuite format
 */
export function convertToNetSuite(existingXML, formData) {
  const generator = createNetSuiteGenerator();
  return generator.convertExistingXMLToNetSuite(existingXML, formData);
}
