import React, { useState, useEffect } from 'react';
import './PurchaseOrderForm.css';
import './section-styles.css';
import './section-title-colors.css';
import SectionTitleColorPicker from './components/SectionTitleColorPicker';
import FileUploadButton from './components/FileUploadButton';
import { generatePurchaseOrderXML } from './templates/PurchaseOrderTemplate';
import { generateNetSuiteTemplate } from './templates/NetSuiteIntegration';

// Import modular components
import Section1CompanyInfo from './components/Section1CompanyInfo';
import Section2PurchaseOrder from './components/Section2PurchaseOrder';
import Section3Vendor from './components/Section3Vendor';
import Section4ShipTo from './components/Section4ShipTo';
import Section5Shipping from './components/Section5Shipping';

import AvailableFields from './components/AvailableFields';
import SortableTotalsField from './components/SortableTotalsField';
import SortableCommentsField from './components/SortableCommentsField';
import SortableContactField from './components/SortableContactField';

import { useAIProvider } from './hooks/useAIProvider';

// Import custom hooks
import { 
  useDragAndDropSensors, 
  useCompanyFieldsDragEnd, 
  usePurchaseOrderFieldsDragEnd,
  useVendorFieldsDragEnd,
  useShipToFieldsDragEnd
} from './hooks/useDragAndDrop';

import { DndContext, closestCenter, useDraggable, rectIntersection } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { arrayMove } from '@dnd-kit/sortable';


// Draggable Section Wrapper Component for Sections
function DraggableSectionWrapper({ children, id, sectionNumber, isSectionHandleDragging = false, showDragHandle = true }) {

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id, 
    data: {
      type: 'section',
      sectionNumber: sectionNumber
    }
  });

  // Map section numbers to proper CSS classes
  const getSectionClass = (sectionNum) => {
    switch(sectionNum) {
      case 1:
        return 'section-1-company-info';
      case 2:
        return 'section-2-purchase-order';
      case 3:
        return 'section-3';
      case 4:
        return 'section-4';
      default:
        return `section-${sectionNum}`;
    }
  };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
    position: 'relative',
    width: '100%',
    height: '100%',
    border: isDragging ? '3px solid #ff6b6b' : '2px solid #ddd',
    borderRadius: '8px',
    backgroundColor: isDragging ? 'rgba(255, 107, 107, 0.1)' : 'transparent'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`sortable-section ${getSectionClass(sectionNumber)} ${isDragging ? 'dragging' : ''}`}
      data-section={sectionNumber}
      data-testid={`draggable-section-${id}`}
      data-dragging={isDragging}
      {...attributes}
    >
      <div 
        className="section-content"
        style={{ position: 'relative', width: '100%', height: '100%' }}
      >
        {React.cloneElement(children, { dragListeners: listeners, dragAttributes: attributes })}
      </div>
    </div>
  );
}



// Sortable shipping column header component for shipping details
function SortableShippingColumnHeader({ children, id }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    userSelect: 'none'
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`sortable-column-header ${isDragging ? 'dragging' : ''}`}
    >
      {children}
    </div>
  );
}

// Sortable line item column header component for line items
function SortableLineItemColumnHeader({ children, id }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    userSelect: 'none'
  };

  return (
    <th 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`sortable-column-header ${isDragging ? 'dragging' : ''}`}
    >
      {children}
    </th>
  );
}

// Draggable Section Header Component for Comments and Totals
function DraggableSectionHeader({ children, id }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="section-header"
      {...attributes} 
      {...listeners} 
      title="Drag to reorder sections"
    >
      {children}
    </div>
  );
}

// Draggable Group Handle Component for Sections 3 & 4
function DraggableGroupHandle({ children, id, label }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id,
    data: {
      type: 'section-group',
      label: label
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative'
  };

  return (
    <div ref={setNodeRef} id={id} style={style}>
      {/* Group Drag Handle */}
      <div 
        {...attributes} 
        {...listeners}
        style={{
          position: 'absolute',
          left: '-40px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '30px',
          height: '60px',
          backgroundColor: 'white',
          borderRadius: '6px',
          cursor: 'grab',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '4px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          zIndex: 10,
          border: '2px solid #8b5cf6'
        }}
        title={`Drag to move ${label} as a group`}
      >
        <span style={{ color: '#8b5cf6', fontSize: '18px', fontWeight: 'bold' }}>⋮⋮</span>

      </div>
      {children}
    </div>
  );
}

// Main Purchase Order Form Component
function PurchaseOrderForm() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Company fields state for Section 1
  const [companyFields, setCompanyFields] = useState([
    { id: 'company-name', label: 'Company Name:', placeholder: 'Enter company name', value: '' },
    { id: 'company-address', label: 'Street Address:', placeholder: 'Enter street address', value: '' },
    { id: 'company-city-state', label: 'City, ST ZIP:', placeholder: 'City, State ZIP', value: '' },
    { id: 'company-phone', label: 'Phone:', placeholder: '(555) 123-4567', value: '' },
    { id: 'company-fax', label: 'Fax:', placeholder: '(555) 123-4567', value: '' },
    { id: 'company-website', label: 'Website:', placeholder: 'www.example.com', value: '' }
  ]);

  // Debug: Log company fields state changes
  useEffect(() => {
  
  }, [companyFields]);

  

  // Track last modification time for company fields
  const [lastModified, setLastModified] = useState(new Date().toISOString());

  // Track last modification time for purchase order fields
  const [poLastModified, setPoLastModified] = useState(new Date().toISOString());

  // ============================================================================
  // SIDEBAR MANAGEMENT
  // ============================================================================
  
  // State for sidebar visibility on mobile
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarVisible(!sidebarVisible);
  };

  // State for showing dummy data vs field pills
  const [showDummyData, setShowDummyData] = useState(true);

  // Toggle between dummy data and field pills
  const toggleDataMode = () => {
    setShowDummyData(!showDummyData);
  };

  // Helper function to get NetSuite variable for a field
  const getNetSuiteVariable = (fieldId, section) => {
    const netSuiteMapping = {
      // Company fields
      'company-name': '${record.companyname}',
      'company-address': '${record.companyaddress}',
      'company-city-state': '${record.companycitystate}',
      'company-phone': '${record.companyphone}',
      'company-fax': '${record.companyfax}',
      'company-website': '${record.companywebsite}',
      
      // Purchase Order fields
      'po-title': '${record.title}',
      'po-date': '${record.trandate}',
      'po-number': '${record.tranid}',
      'po-delivery-date': '${record.shipdate}',
      'po-payment-terms': '${record.terms}',
      'po-due-date': '${record.duedate}',
      'po-reference': '${record.otherrefnum}',
      'po-requisitioner': '${record.memo}',
      
      // Vendor fields
      'vendor-company': '${record.billaddresslist}',
      'vendor-contact': '${record.billcontact}',
      'vendor-address': '${record.billaddress}',
      'vendor-city-state': '${record.billcitystate}',
      'vendor-phone': '${record.billphone}',
      'vendor-fax': '${record.billfax}',
      
      // Ship To fields
      'ship-to-name': '${record.shipcontact}',
      'ship-to-company': '${record.shipaddresslist}',
      'ship-to-address': '${record.shipaddress}',
      'ship-to-city-state': '${record.shipcitystate}',
      'ship-to-phone': '${record.shipphone}',
      'ship-to-fax': '${record.shipfax}',
      
      // Shipping fields
      'ship-via': '${record.shipmethod}',
      'fob': '${record.fob}',
      'shipping-terms': '${record.shippingterms}',
      
      // Totals fields
      'subtotal': '${record.subtotal}',
      'tax': '${record.taxtotal}',
      'shipping': '${record.shippingcost}',
      'other': '${record.othercost}',
      'total': '${record.total}',
      
      // Comments and Contact
      'comments': '${record.memo}',
      'contact': '${record.memo}'
    };
    
    // For custom fields, generate a generic NetSuite variable
    if (fieldId.startsWith('custom-') || fieldId.includes('field-')) {
      const cleanId = fieldId.replace(/^(custom-|.*field-)/, '').replace(/[^a-zA-Z0-9]/g, '');
      return `\${record.${cleanId}}`;
    }
    
    return netSuiteMapping[fieldId] || `\${record.${fieldId}}`;
  };

  // Helper: slugify and ensure unique id for new fields
  const generateUniqueFieldId = (baseLabel, existingIds) => {
    const slugBase = String(baseLabel)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    let candidate = slugBase || 'field';
    let counter = 1;
    while (existingIds.includes(candidate)) {
      candidate = `${slugBase}-${counter++}`;
    }
    return candidate;
  };

  // ============================================================================
  // DROPPABLE ZONES
  // ============================================================================





  // Handle palette drag end to add fields to target sections
  const handlePaletteDragEnd = (event) => {
    const { active, over } = event;

    console.log('🎯 Palette drag end detected:', {
      active: active?.id,
      over: over?.id,
      activeData: active?.data?.current,
      overData: over?.data?.current,
      overType: over?.data?.current?.type,
      overSectionNumber: over?.data?.current?.sectionNumber
    });
    
    // Debug: Log all droppable zones
    console.log('📍 Available droppable zones:', {
      section1: document.querySelector('[data-droppable-id="section1"]'),
      section2: document.querySelector('[data-droppable-id="section2"]'),
      section3: document.querySelector('[data-droppable-id="section3"]'),
      section4: document.querySelector('[data-droppable-id="section4"]')
    });
    
    if (!active?.data?.current || !over?.id) {
      console.log('❌ Missing active data or over id:', {
        hasActiveData: !!active?.data?.current,
        hasOverId: !!over?.id,
        overObject: over
      });
      return;
    }
    const data = active.data.current;
    if (data.source !== 'palette') {
      console.log('❌ Not a palette source:', data.source);
      return;
    }

    const baseLabel = data.label;

    console.log('🎯 Attempting to add field to section:', {
      baseLabel,
      targetSection: over.id,
      availableSections: ['section1', 'section2', 'section3', 'section4'],
      isValidTarget: ['section1', 'section2', 'section3', 'section4'].includes(over.id)
    });
    
    // Check if dropping on section elements
    if (over.id === 'section1') {
      console.log('✅ Adding to section1 (Company Info)');
      const existingIds = companyFields.map(f => f.id);
      const id = generateUniqueFieldId(baseLabel, existingIds);
      const newField = { id, label: `${baseLabel}:`, placeholder: baseLabel, value: '' };
      handleAddCompanyField(newField);
      showNotification(`➕ Added "${baseLabel}" to Company Info`, 'success');
    } else if (over.id === 'section2') {
      console.log('✅ Adding to section2 (Purchase Order)');
      const existingIds = purchaseOrderFields.map(f => f.id);
      const id = generateUniqueFieldId(baseLabel, existingIds);
      const newField = { id, label: `${baseLabel}:`, placeholder: baseLabel, value: '' };
      handleAddPurchaseOrderField(newField);
      showNotification(`➕ Added "${baseLabel}" to Purchase Order`, 'success');
    } else if (over.id === 'section3') {
      console.log('✅ Adding to section3 (Vendor)');
      const existingIds = vendorFields.map(f => f.id);
      const id = generateUniqueFieldId(baseLabel, existingIds);
      const newField = { id, label: `${baseLabel}:`, placeholder: baseLabel, value: '' };
      handleAddVendorField(newField);
      showNotification(`➕ Added "${baseLabel}" to Vendor section`, 'success');
    } else if (over.id === 'section4') {
      console.log('✅ Adding to section4 (Ship To)');
      const existingIds = shipToFields.map(f => f.id);
      const id = generateUniqueFieldId(baseLabel, existingIds);
      const newField = { id, label: `${baseLabel}:`, placeholder: baseLabel, value: '' };
      handleAddShipToField(newField);
      showNotification(`➕ Added "${baseLabel}" to Ship-To section`, 'success');
    } else {
      console.log('❌ Unknown target section:', over.id);
    }
  };

  // Handle file analysis results (PDF/PNG upload)
  const handleFileAnalysisComplete = (analysisResult) => {
    console.log('📄 File analysis complete:', analysisResult);
    
    try {
      // Update section colors if detected
      if (analysisResult.colors) {
        console.log('🎨 Updating section colors:', analysisResult.colors);
        // TODO: Update section title colors based on analysis
        showNotification('🎨 Section colors updated from file analysis', 'success');
      }
      
      // Update fields if detected
      if (analysisResult.fields) {
        console.log('📝 Updating fields from analysis:', analysisResult.fields);
        console.log('🔍 Full analysis result:', JSON.stringify(analysisResult, null, 2));
        
        // Update company fields if detected - preserve existing structure, update values
        if (analysisResult.fields.company) {
          console.log('🏢 Processing company fields:', analysisResult.fields.company);
          setCompanyFields(prev => {
            console.log('🏢 Existing company fields:', prev);
            return prev.map(existingField => {
              // Try to find a matching field from analysis by ID
              const matchingField = analysisResult.fields.company.find(f => f.id === existingField.id);
              
              if (matchingField && matchingField.value) {
                console.log(`🏢 Updating "${existingField.label}" with value: "${matchingField.value}"`);
                return { ...existingField, value: matchingField.value };
              }
              return existingField;
            });
          });
        }
        
        // Update purchase order fields if detected - preserve existing structure, update values
        if (analysisResult.fields.purchaseOrder) {
          console.log('📋 Processing purchase order fields:', analysisResult.fields.purchaseOrder);
          setPurchaseOrderFields(prev => {
            console.log('📋 Existing purchase order fields:', prev);
            return prev.map(existingField => {
              // Try to find a matching field from analysis by ID
              const matchingField = analysisResult.fields.purchaseOrder.find(f => f.id === existingField.id);
              
              if (matchingField && matchingField.value) {
                console.log(`📋 Updating "${existingField.label}" with value: "${matchingField.value}"`);
                return { ...existingField, value: matchingField.value };
              }
              return existingField;
            });
          });
        }
        
        // Update vendor fields if detected - preserve existing structure, update values
        if (analysisResult.fields.vendor) {
          console.log('🏪 Processing vendor fields:', analysisResult.fields.vendor);
          setVendorFields(prev => {
            return prev.map(existingField => {
              // Try to find a matching field from analysis by ID
              const matchingField = analysisResult.fields.vendor.find(f => f.id === existingField.id);
              
              if (matchingField && matchingField.value) {
                console.log(`🏪 Updating "${existingField.label}" with value: "${matchingField.value}"`);
                return { ...existingField, value: matchingField.value };
              }
              return existingField;
            });
          });
        }
        
        // Update ship-to fields if detected - preserve existing structure, update values
        if (analysisResult.fields.shipTo) {
          console.log('📦 Processing ship-to fields:', analysisResult.fields.shipTo);
          setShipToFields(prev => {
            return prev.map(existingField => {
              // Try to find a matching field from analysis by ID
              const matchingField = analysisResult.fields.shipTo.find(f => f.id === existingField.id);
              
              if (matchingField && matchingField.value) {
                console.log(`📦 Updating "${existingField.label}" with value: "${matchingField.value}"`);
                return { ...existingField, value: matchingField.value };
              }
              return existingField;
            });
          });
        }
        
        // Update item table if detected
        if (analysisResult.fields.items && analysisResult.fields.items.length > 0) {
          console.log('📦 Processing items:', analysisResult.fields.items);
          
          // Update line items with extracted data
          setLineItemData(prev => {
            const newData = { ...prev };
            analysisResult.fields.items.forEach((item, index) => {
              const rowNumber = index + 1;
              if (newData[rowNumber]) {
                newData[rowNumber] = {
                  itemNumber: item.itemNumber || '',
                  description: item.description || '',
                  qty: item.qty || '',
                  rate: item.unitPrice || '',
                  amount: item.total || ''
                };
                console.log(`📦 Updated line item ${rowNumber}:`, newData[rowNumber]);
              }
            });
            return newData;
          });
        }
        
        // Update totals if detected
        if (analysisResult.fields.totals && analysisResult.fields.totals.length > 0) {
          console.log('💰 Processing totals:', analysisResult.fields.totals);
          
          setTotalsFields(prev => {
            return prev.map(existingField => {
              // Try to find a matching field from analysis
              const matchingField = analysisResult.fields.totals.find(f => 
                f.id === existingField.id || 
                f.label === existingField.label ||
                f.label.toLowerCase().includes(existingField.label.toLowerCase())
              );
              
              if (matchingField && matchingField.value) {
                console.log(`💰 Updating "${existingField.label}" with value: "${matchingField.value}"`);
                return { ...existingField, value: matchingField.value };
              }
              return existingField;
            });
          });
        }
        
        showNotification('📝 Fields updated from file analysis', 'success');
      }
      
      // Show overall success
      showNotification('✅ File analysis complete! Form updated with detected structure.', 'success');
      
    } catch (error) {
      console.error('❌ Error updating form from analysis:', error);
      showNotification('❌ Error updating form from analysis: ' + error.message, 'error');
    }
  };

  // Purchase Order fields state for Section 2
  const [purchaseOrderFields, setPurchaseOrderFields] = useState([
    { id: 'po-title', label: 'Purchase Order', placeholder: '', isTitle: true, value: 'Purchase Order' },
    { id: 'po-date', label: 'DATE:', placeholder: 'MM/DD/YYYY', value: '' },
    { id: 'po-number', label: 'PO #:', placeholder: 'PO#123456', value: '' }
  ]);

  // Vendor fields state for Section 3
  const [vendorFields, setVendorFields] = useState([
    { id: 'vendor-company', label: 'Company:', placeholder: 'Vendor name', value: '' },
    { id: 'vendor-contact', label: 'Contact:', placeholder: 'Contact person', value: '' },
    { id: 'vendor-address', label: 'Address:', placeholder: 'Street address', value: '' },
    { id: 'vendor-city-state', label: 'City/State:', placeholder: 'City, ST ZIP', value: '' },
    { id: 'vendor-phone', label: 'Phone:', placeholder: '(555) 123-4567', value: '' }
  ]);

  // Ship To fields state for Section 3
  const [shipToFields, setShipToFields] = useState([
    { id: 'ship-to-name', label: 'Name:', placeholder: 'Contact name', value: '' },
    { id: 'ship-to-company', label: 'Company:', placeholder: 'Shipping company', value: '' },
    { id: 'ship-to-address', label: 'Address:', placeholder: 'Street address', value: '' },
    { id: 'ship-to-city-state', label: 'City/State:', placeholder: 'City, ST ZIP', value: '' },
    { id: 'ship-to-phone', label: 'Phone:', placeholder: '(555) 123-4567', value: '' }
  ]);

  // Line Items state for the items table
  const [lineItemRows, setLineItemRows] = useState([1, 2, 3, 4, 5]);
  
  // Line Item Data state to store the actual values
  const [lineItemData, setLineItemData] = useState({
    1: { itemNumber: '', description: '', qty: '', rate: '', amount: '' },
    2: { itemNumber: '', description: '', qty: '', rate: '', amount: '' },
    3: { itemNumber: '', description: '', qty: '', rate: '', amount: '' },
    4: { itemNumber: '', description: '', qty: '', rate: '', amount: '' },
    5: { itemNumber: '', description: '', qty: '', rate: '', amount: '' }
  });

  // Totals fields state for Section 9
  const [totalsFields, setTotalsFields] = useState([
    { id: 'subtotal', label: 'SUBTOTAL:', placeholder: '$0.00', value: '$0.00', isCalculated: true },
    { id: 'tax', label: 'TAX:', placeholder: '$0.00', value: '' },
    { id: 'shipping', label: 'SHIPPING:', placeholder: '$0.00', value: '' },
    { id: 'other', label: 'OTHER:', placeholder: '$0.00', value: '' },
    { id: 'total', label: 'TOTAL:', placeholder: '$0.00', value: '$0.00', isCalculated: true }
  ]);

  // Comments fields state for Section 8
  const [commentsFields, setCommentsFields] = useState([
    { id: 'comments-main', label: 'Comments or Special Instructions:', placeholder: 'Enter comments or special instructions...', value: '' }
  ]);

  // Contact fields state
  const [contactFields, setContactFields] = useState([
    { id: 'contact-main', label: 'Contact Information:', placeholder: 'Enter contact information here', value: '' }
  ]);



  // ============================================================================
  // CUSTOM HOOKS
  // ============================================================================
  
  const sensors = useDragAndDropSensors();
  const handleVendorDragEnd = useVendorFieldsDragEnd(setVendorFields);
  const handleShipToDragEnd = useShipToFieldsDragEnd(setShipToFields);
  
  // Handle totals fields drag end
  const handleTotalsDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setTotalsFields((prevFields) => {
        const oldIndex = prevFields.findIndex(field => field.id === active.id);
        const newIndex = prevFields.findIndex(field => field.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) {
          return prevFields;
        }
        
        const newFields = [...prevFields];
        const [movedField] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, movedField);
        
        return newFields;
      });
    }
  };

  // Handle comments fields drag end
  const handleCommentsDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setCommentsFields((prevFields) => {
        const oldIndex = prevFields.findIndex(field => field.id === active.id);
        const newIndex = prevFields.findIndex(field => field.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) {
          return prevFields;
        }
        
        const newFields = [...prevFields];
        const [movedField] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, movedField);
        
        return newFields;
      });
    }
  };

  // Handle contact fields drag end
  const handleContactDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {
      setContactFields((prevFields) => {
        const oldIndex = prevFields.findIndex(field => field.id === active.id);
        const newIndex = prevFields.findIndex(field => field.id === over.id);
        
        if (oldIndex === -1 || newIndex === -1) {
          return prevFields;
        }
        
        const newFields = [...prevFields];
        const [movedField] = newFields.splice(oldIndex, 1);
        newFields.splice(newIndex, 0, movedField);
        
        return newFields;
      });
    }
  };

  // ============================================================================
  // COMPANY FIELD MANAGEMENT FUNCTIONS
  // ============================================================================
  
  // Helper function to update timestamp when company fields change
  const updateCompanyFieldsTimestamp = () => {
    setLastModified(new Date().toISOString());
  };

  // Add new company field
  const handleAddCompanyField = (newField) => {
    setCompanyFields(prevFields => [...prevFields, newField]);
    updateCompanyFieldsTimestamp();
    
    logChange('field-add', newField.id, '', newField.label, 'company');
    

  };

  // Remove company field
  const handleRemoveCompanyField = (fieldId) => {
    setCompanyFields(prevFields => {
      const fieldToRemove = prevFields.find(field => field.id === fieldId);
      showNotification(`🗑️ Removed company field: "${fieldToRemove?.label}"`, 'warning');
      const newFields = prevFields.filter(field => field.id !== fieldId);
      return newFields;
    });
    updateCompanyFieldsTimestamp();
  };

  // ============================================================================
  // TOTALS FIELD MANAGEMENT FUNCTIONS
  // ============================================================================
  
  // Add new totals field
  const handleAddTotalsField = () => {
    const newField = {
      id: `totals-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: 'NEW FIELD:',
      placeholder: '$0.00',
      value: '',
      isCalculated: false
    };
    setTotalsFields(prevFields => [...prevFields, newField]);
    
    logChange('field-add', newField.id, '', newField.label, 'totals');
  };

  // Remove totals field
  const handleRemoveTotalsField = (fieldId) => {
    setTotalsFields(prevFields => {
      const fieldToRemove = prevFields.find(field => field.id === fieldId);
      showNotification(`🗑️ Removed totals field: "${fieldToRemove?.label}"`, 'warning');
      const newFields = prevFields.filter(field => field.id !== fieldId);
      return newFields;
    });
  };

  // Update totals field label
  const handleTotalsFieldLabelChange = (fieldId, newLabel) => {
    setTotalsFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId ? { ...field, label: newLabel } : field
      )
    );
    
    logChange('label-change', fieldId, '', newLabel, 'totals');
  };

  // Update totals field value
  const handleTotalsFieldValueChange = (fieldId, newValue) => {
    setTotalsFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId ? { ...field, value: newValue } : field
      )
    );
    
    logChange('value-change', fieldId, '', newValue, 'totals');
  };

  // ============================================================================
  // COMMENTS FIELD MANAGEMENT FUNCTIONS
  // ============================================================================
  
  // Add new comments field
  const handleAddCommentsField = () => {
    const newField = {
      id: `comments-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: 'Additional Comments:',
      placeholder: 'Enter additional comments...',
      value: ''
    };
    setCommentsFields(prevFields => [...prevFields, newField]);
    
    logChange('field-add', newField.id, '', newField.label, 'comments');
  };

  // Remove comments field
  const handleRemoveCommentsField = (fieldId) => {
    setCommentsFields(prevFields => {
      const fieldToRemove = prevFields.find(field => field.id === fieldId);
      if (fieldToRemove && fieldToRemove.id !== 'comments-main') {
        showNotification(`🗑️ Removed comments field: "${fieldToRemove?.label}"`, 'warning');
        const newFields = prevFields.filter(field => field.id !== fieldId);
        return newFields;
      }
      return prevFields;
    });
  };

  // Update comments field label
  const handleCommentsFieldLabelChange = (fieldId, newLabel) => {
    setCommentsFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId ? { ...field, label: newLabel } : field
      )
    );
    
    logChange('label-change', fieldId, '', newLabel, 'comments');
  };

  // Update comments field value
  const handleCommentsFieldValueChange = (fieldId, newValue) => {
    setCommentsFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId ? { ...field, value: newValue } : field
      )
    );
    
    logChange('value-change', fieldId, '', newValue, 'comments');
  };

  // ============================================================================
  // CONTACT FIELD MANAGEMENT FUNCTIONS
  // ============================================================================
  
  // Add new contact field
  const handleAddContactField = () => {
    const newField = {
      id: `contact-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: 'Additional Contact:',
      placeholder: 'Enter additional contact information...',
      value: ''
    };
    setContactFields(prevFields => [...prevFields, newField]);
    
    logChange('field-add', newField.id, '', newField.label, 'contact');
  };

  // Remove contact field
  const handleRemoveContactField = (fieldId) => {
    setContactFields(prevFields => {
      const fieldToRemove = prevFields.find(field => field.id === fieldId);
      if (fieldToRemove && fieldToRemove.id !== 'contact-main') {
        showNotification(`🗑️ Removed contact field: "${fieldToRemove?.label}"`, 'warning');
        const newFields = prevFields.filter(field => field.id !== fieldId);
        return newFields;
      }
      return prevFields;
    });
  };

  // Update contact field label
  const handleContactFieldLabelChange = (fieldId, newLabel) => {
    setContactFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId ? { ...field, label: newLabel } : field
      )
    );
    
    logChange('label-change', fieldId, '', newLabel, 'contact');
  };

  // Update contact field value
  const handleContactFieldValueChange = (fieldId, newValue) => {
    setContactFields(prevFields => 
      prevFields.map(field => 
        field.id === fieldId ? { ...field, value: newValue } : field
      )
    );
    
    logChange('value-change', fieldId, '', newValue, 'contact');
  };

  // ============================================================================
  // ENHANCED CHANGE TRACKING
  // ============================================================================
  
  // State for tracking all changes
  const [changeHistory, setChangeHistory] = useState([]);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [lastExportTime, setLastExportTime] = useState(null);
  


  
  // Function to log changes with timestamps
  const logChange = (changeType, fieldId, oldValue, newValue, section) => {
    const change = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: changeType,
      fieldId,
      oldValue,
      newValue,
      section
    };
    
    setChangeHistory(prev => [change, ...prev.slice(0, 49)]); // Keep last 50 changes

  };

  // Function to add changes to change history (for section operations)
  const addToChangeHistory = (changeType, fieldId, newValue) => {
    const change = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: changeType,
      fieldId,
      oldValue: '',
      newValue,
      section: 'section'
    };
    
    setChangeHistory(prev => [change, ...prev.slice(0, 49)]); // Keep last 50 changes

  };

  // Enhanced field update functions with change logging
  const handleCompanyFieldLabelChange = (fieldId, newLabel) => {
    setCompanyFields(prevFields => {
      const oldField = prevFields.find(field => field.id === fieldId);
      const oldLabel = oldField ? oldField.label : '';
      
      logChange('label-change', fieldId, oldLabel, newLabel, 'company');
      
      return prevFields.map(field => 
        field.id === fieldId ? { ...field, label: newLabel } : field
      );
    });
    updateCompanyFieldsTimestamp();
  };

  const handlePurchaseOrderFieldLabelChange = (fieldId, newLabel) => {
    setPurchaseOrderFields(prevFields => {
      const oldField = prevFields.find(field => field.id === fieldId);
      const oldLabel = oldField ? oldField.label : '';
      
      logChange('label-change', fieldId, oldLabel, newLabel, 'purchase-order');
      
      return prevFields.map(field => 
        field.id === fieldId ? { ...field, label: newLabel } : field
      );
    });
    updatePurchaseOrderFieldsTimestamp();
  };

  // Function to handle content changes in editable fields
  const handleContentChange = (fieldId, newContent, section) => {
    // Find the field and log the change
    let oldValue = '';
    let fieldType = '';
    
    if (section === 'company') {
      const field = companyFields.find(f => f.id === fieldId);
      if (field) {
        oldValue = field.value || '';
        fieldType = field.label;
      }
    } else if (section === 'purchase-order') {
      const field = purchaseOrderFields.find(f => f.id === fieldId);
      if (field) {
        oldValue = field.value || '';
        fieldType = field.label;
      }
    } else if (section === 'vendor') {
      const field = vendorFields.find(f => f.id === fieldId);
      if (field) {
        oldValue = field.value || '';
        fieldType = field.label;
      }
    } else if (section === 'ship-to') {
      const field = shipToFields.find(f => f.id === fieldId);
      if (field) {
        oldValue = field.value || '';
        fieldType = field.label;
      }
    }
    
    if (oldValue !== newContent) {
      logChange('content-change', fieldId, oldValue, newContent, section);
    }
  };



  // Function to toggle preview mode
  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode);
  };

  // Function to clear change history
  const clearChangeHistory = () => {
    setChangeHistory([]);

  };

  // ============================================================================
  // XML DISPLAY MODAL
  // ============================================================================
  
  // State for XML modal
  const [showXMLModal, setShowXMLModal] = useState(false);
  const [xmlOutput, setXmlOutput] = useState('');
  
  // State for NetSuite integration
  const [showNetSuiteModal, setShowNetSuiteModal] = useState(false);
  const [netSuiteOutput, setNetSuiteOutput] = useState('');
  
  // State for XML generation workflow
  const [isXmlGenerated, setIsXmlGenerated] = useState(false);
  

  
  
  // Function to display XML output in a modal
  const displayXMLOutput = (xml) => {
    setXmlOutput(xml);
    setShowXMLModal(true);
  };
  
  // Function to close XML modal
  const closeXMLModal = () => {
    setShowXMLModal(false);
    setXmlOutput('');
  };
  
  // Function to copy XML to clipboard
  const copyXMLToClipboard = () => {
    navigator.clipboard.writeText(xmlOutput).then(() => {
      showNotification('📋 XML copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('❌ Failed to copy XML to clipboard', 'error');
    });
  };
  
  // Function to download XML file
  const downloadXML = () => {
    const blob = new Blob([xmlOutput], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-order-${purchaseOrderFields.find(f => f.id === 'po-number')?.value || 'unknown'}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showNotification('📥 XML downloaded successfully!', 'success');
  };

  // =========================================================================
  // NETSUITE INTEGRATION
  // =========================================================================
  
  // Function to save form and generate XML
  const handleSaveForm = () => {
    try {
      // Use the existing working logic from exportToXML
      const capturedData = captureFieldValues();
      
      // Determine current visual order of sections 1 & 2 from DOM to avoid async state lag
      const headerSections = Array.from(document.querySelectorAll('.header-section .sortable-section'));
      const visualSections1And2 = headerSections
        .map(el => el.id)
        .filter(id => id === 'section1' || id === 'section2');
      const sections1And2ForExport = (visualSections1And2.length === 2) ? visualSections1And2 : sections1And2Order;
      
      // Determine current visual order of sections 3 & 4 (Vendor / Ship-To) from DOM
      const vendorShipToSections = Array.from(document.querySelectorAll('.vendor-shipping-section .sortable-section'));
      const visualSections3And4 = vendorShipToSections
        .map(el => el.id)
        .filter(id => id === 'section3' || id === 'section4');
      const sections3And4ForExport = (visualSections3And4.length === 2) ? visualSections3And4 : vendorShipToSectionOrder;
      
      // Helpers for DOM reads
      const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || '';
      
      // Normalize line items to include both UI keys (qty/rate/amount) and template keys (quantity/unitPrice/total)
      const normalizedLineItems = (capturedData.lineItems || []).map(row => {
        const normalizedRow = {
          // original UI keys
          itemNumber: row.itemNumber || '',
          description: row.description || '',
          qty: row.qty || row.quantity || '',
          rate: row.rate || row.unitPrice || '',
          amount: row.amount || row.total || '',
          // template-expected keys
          quantity: row.quantity || row.qty || '',
          unitPrice: row.unitPrice || row.rate || '',
          total: row.total || row.amount || ''
        };
        
        // Preserve all custom column data
        lineItemColumnOrder.forEach(columnId => {
          if (columnId.startsWith('custom-') && row[columnId] !== undefined) {
            normalizedRow[columnId] = row[columnId];
          }
        });
        
        return normalizedRow;
      });

      const exportData = {
        ...capturedData,
        // Add major sections order for group swapping
        majorSectionsOrder: majorSectionsOrder,
        // Add section order information for dynamic XML generation
        sectionOrder: {
          sections1And2: sections1And2ForExport,
          sections3And4: sections3And4ForExport,
          sections5And6: sections5And6Order,
          sections8And9: commentsTotalsSectionOrder,
          lineItemColumns: lineItemColumnOrder,
          shippingColumns: shippingColumnOrder
        },
        // CRITICAL: Add field order information for dynamic XML generation
        fieldOrder: {
          company: companyFieldOrder,
          purchaseOrder: purchaseOrderFieldOrder,
          vendor: vendorFields.map(f => f.id),
          shipTo: shipToFields.map(f => f.id)
        },
        // Add normalized line items (support both key schemes)
        lineItems: normalizedLineItems,
        // Shipping details (prefer data-field; fall back handled in XML builder too)
        ...(() => {
          const shippingData = {};
          shippingColumnOrder.forEach(columnId => {
            const value = getText(`.section-5 [data-field="${columnId}"] .editable-field`);
            shippingData[columnId] = value;
          });
          return shippingData;
        })(),
        // Totals: include the current totalsFields state for dynamic ordering
        totalsFields: totalsFields,
        // Comments: include the current commentsFields state for dynamic ordering
        commentsFields: commentsFields,
        // Contact: include the current contactFields state for dynamic ordering
        contactFields: contactFields,
        // Also include individual totals for backward compatibility
        subtotal: getText('.totals-section .total-row[data-field="subtotal"] .calculated-field') || '$0.00',
        tax: getText('.totals-section .total-row[data-field="tax"] .editable-field') || '$0.00',
        shipping: getText('.totals-section .total-row[data-field="shipping"] .editable-field') || '$0.00',
        other: getText('.totals-section .total-row[data-field="other"] .editable-field') || '$0.00',
        total: getText('.totals-section .total-row[data-field="total"] .total-field') || '$0.00',
        comments: getText('.comments-content .editable-field'),
        contactInfo: getText('.contact-section .editable-field')
      };
      
      // Generate XML
      const xml = generatePurchaseOrderXML(exportData);
      setXmlOutput(xml);
      setShowXMLModal(true);
      setIsXmlGenerated(true);
      
      showNotification('💾 Form saved and XML generated!', 'success');
      
    } catch (error) {
      console.error('❌ Form save failed:', error);
      showNotification(`❌ Form save failed: ${error.message}`, 'error');
    }
  };

  // Function to handle NetSuite integration
  const handleNetSuiteIntegration = () => {
    try {
      if (!isXmlGenerated) {
        showNotification('❌ Please save the form and generate XML first!', 'error');
        return;
      }
      
      // Generate NetSuite XML directly from form data (more reliable than XML parsing)
      console.log('🔀 Generating NetSuite XML from form data');
      
      // Prepare the same export data structure that was used for XML generation
      const capturedData = captureFieldValues();
      
      // Determine current visual order of sections 1 & 2 from DOM to avoid async state lag
      const headerSections = Array.from(document.querySelectorAll('.header-section .sortable-section'));
      const visualSections1And2 = headerSections
        .map(el => el.id)
        .filter(id => id === 'section1' || id === 'section2');
      const sections1And2ForExport = (visualSections1And2.length === 2) ? visualSections1And2 : sections1And2Order;
      
      // Determine current visual order of sections 3 & 4 (Vendor / Ship-To) from DOM
      const vendorShipToSections = Array.from(document.querySelectorAll('.vendor-shipping-section .sortable-section'));
      const visualSections3And4 = vendorShipToSections
        .map(el => el.id)
        .filter(id => id === 'section3' || id === 'section4');
      const sections3And4ForExport = (visualSections3And4.length === 2) ? visualSections3And4 : vendorShipToSectionOrder;
      
      // Helpers for DOM reads
      const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || '';
      
      // Determine current visual order of major sections (sections 3,4,5 swapping) from DOM
      const majorSectionsContainer = document.querySelector('.major-sections-container');
      console.log('🔍 NetSuite DOM Debug - majorSectionsContainer:', majorSectionsContainer);
      console.log('🔍 NetSuite DOM Debug - Current majorSectionsOrder state:', majorSectionsOrder);
      
      let visualMajorSectionsOrder = majorSectionsOrder; // fallback to state
      if (majorSectionsContainer) {
        const majorSectionElements = Array.from(majorSectionsContainer.querySelectorAll('[id]'));
        console.log('🔍 NetSuite DOM Debug - majorSectionElements:', majorSectionElements.map(el => ({ id: el.id, tagName: el.tagName })));
        console.log('🔍 NetSuite DOM Debug - All IDs found:', JSON.stringify(majorSectionElements.map(el => el.id)));
        const visualOrder = majorSectionElements
          .map(el => el.id)
          .filter(id => id === 'vendor-shipto-group' || id === 'shipping-section');
        console.log('🔍 NetSuite DOM Debug - visualOrder:', visualOrder);
        if (visualOrder.length === 2) {
          visualMajorSectionsOrder = visualOrder;
          console.log('🔍 NetSuite DOM Debug - Using visual order:', visualMajorSectionsOrder);
        } else {
          console.log('🔍 NetSuite DOM Debug - Using fallback order:', visualMajorSectionsOrder);
        }
      } else {
        console.log('🔍 NetSuite DOM Debug - No majorSectionsContainer found');
      }
      
      // Additional debugging: Log the final order being used
      console.log('🔍 NetSuite DOM Debug - Final visualMajorSectionsOrder:', visualMajorSectionsOrder);
      console.log('🔍 NetSuite DOM Debug - This should match the current UI order');
      
      // Build the data structure that NetSuite generator expects
      const netSuiteData = {
        companyFields: companyFields,
        purchaseOrderFields: purchaseOrderFields,
        vendorFields: vendorFields,
        shipToFields: shipToFields,
        totalsFields: totalsFields,
        commentsFields: commentsFields,
        contactFields: contactFields,
        // Add major sections order for sections 3,4,5 swapping
        majorSectionsOrder: visualMajorSectionsOrder,
        // Add section order information for dynamic XML generation
        sectionOrder: {
          sections1And2: sections1And2ForExport,
          sections3And4: sections3And4ForExport,
          sections5And6: sections5And6Order,
          sections8And9: commentsTotalsSectionOrder,
          lineItemColumns: lineItemColumnOrder,
          shippingColumns: shippingColumnOrder
        },
        // Add field order information for dynamic XML generation
        fieldOrder: {
          company: companyFieldOrder,
          purchaseOrder: purchaseOrderFieldOrder,
          vendor: vendorFields.map(f => f.id),
          shipTo: shipToFields.map(f => f.id)
        },
        // Add shipping fields data
        shippingFields: {
          'requisitioner': getText(`.section-5 [data-field="requisitioner"] .editable-field`) || '',
          'ship-via': getText(`.section-5 [data-field="shipVia"] .editable-field`) || '',
          'fob': getText(`.section-5 [data-field="fob"] .editable-field`) || '',
          'shipping-terms': getText(`.section-5 [data-field="shippingTerms"] .editable-field`) || ''
        }
      };
      
      // Debug: Log the exact data being sent to NetSuite template
      console.log('🔍 NetSuite Debug - Full netSuiteData object:', netSuiteData);
      console.log('🔍 NetSuite Debug - majorSectionsOrder being sent:', netSuiteData.majorSectionsOrder);
      console.log('🔍 NetSuite Debug - This should reflect the current UI order');
      
      const netSuiteXML = generateNetSuiteTemplate(netSuiteData);
      
      console.log('🔀 NetSuite XML generated:', netSuiteXML ? netSuiteXML.substring(0, 200) + '...' : 'No output');
      
      setNetSuiteOutput(netSuiteXML);
      setShowNetSuiteModal(true);
      
      showNotification('🔀 NetSuite XML generated successfully!', 'success');
      
    } catch (error) {
      console.error('❌ NetSuite generation failed:', error);
      showNotification(`❌ NetSuite generation failed: ${error.message}`, 'error');
    }
  };

  // Function to display NetSuite output in a modal
  const displayNetSuiteOutput = (xml) => {
    setNetSuiteOutput(xml);
    setShowNetSuiteModal(true);
  };

  // Function to close NetSuite modal
  const closeNetSuiteModal = () => {
    setShowNetSuiteModal(false);
    setNetSuiteOutput('');
  };

  // Function to copy NetSuite XML to clipboard
  const copyNetSuiteToClipboard = () => {
    navigator.clipboard.writeText(netSuiteOutput).then(() => {
      showNotification('📋 NetSuite XML copied to clipboard!', 'success');
    }).catch(() => {
      showNotification('❌ Failed to copy NetSuite XML to clipboard', 'error');
    });
  };

  // Function to download NetSuite XML file
  const downloadNetSuiteXML = () => {
    const blob = new Blob([netSuiteOutput], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purchase-order-netsuite-${purchaseOrderFields.find(f => f.id === 'po-number')?.value || 'unknown'}.xml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    showNotification('📥 NetSuite XML downloaded successfully!', 'success');
  };

  // =========================================================================
  // AI SUGGESTIONS
  // =========================================================================
  const { getFieldSuggestions } = useAIProvider();

  const applySuggestionsToFields = (suggestionsMap, fields) => {
    if (!Array.isArray(fields)) return fields;
    return fields.map(f => {
      const newVal = suggestionsMap?.[f.id];
      if (typeof newVal === 'string') {
        return { ...f, value: newVal };
      }
      return f;
    });
  };

  // Helper function to generate additional line item suggestions for rows beyond the first 3
  const generateAdditionalLineItemSuggestions = (rowNumber, baseSuggestions) => {
    // Try to extract patterns from existing AI suggestions for more realistic data
    const baseItem = baseSuggestions?.itemNumber1 || 'ITEM';
    const baseDesc = baseSuggestions?.description1 || 'Product';
    
    // Safely parse base values with fallbacks
    const baseQty = parseFloat(baseSuggestions?.qty1) || 1;
    const baseRate = parseFloat(baseSuggestions?.rate1) || 50.00;
    
    // Create variations that follow similar patterns to the base suggestions
    const variations = [
      {
        itemNumber: `${baseItem.replace(/\d+$/, '')}${rowNumber.toString().padStart(3, '0')}`,
        description: `${baseDesc} ${rowNumber} - Extended`,
        qty: Math.max(1, Math.floor(Math.random() * 10) + 1),
        rate: (baseRate * (0.8 + Math.random() * 0.6)).toFixed(2),
        amount: ''
      },
      {
        itemNumber: `${baseItem.replace(/\d+$/, '')}${rowNumber.toString().padStart(3, '0')}`,
        description: `${baseDesc} ${rowNumber} - Premium`,
        qty: Math.max(1, Math.floor(Math.random() * 5) + 1),
        rate: (baseRate * (1.2 + Math.random() * 0.8)).toFixed(2),
        amount: ''
      },
      {
        itemNumber: `${baseItem.replace(/\d+$/, '')}${rowNumber.toString().padStart(3, '0')}`,
        description: `${baseDesc} ${rowNumber} - Standard`,
        qty: Math.max(1, Math.floor(Math.random() * 8) + 1),
        rate: (baseRate * (0.6 + Math.random() * 0.4)).toFixed(2),
        amount: ''
      }
    ];
    
    // Select a variation based on row number for consistency
    const variationIndex = (rowNumber - 1) % variations.length;
    const variation = variations[variationIndex];
    
    // Calculate amount based on qty and rate (ensure both are numbers)
    const qty = parseFloat(variation.qty) || 1;
    const rate = parseFloat(variation.rate) || 50.00;
    variation.amount = (qty * rate).toFixed(2);
    
    return variation;
  };

  // Helper function to generate data for custom columns
  const generateCustomColumnData = (columnId, rowNumber, baseSuggestions) => {
    const customType = columnId.replace('custom-', '');
    
    // Generate different types of data based on column patterns
    if (customType.includes('date') || customType.includes('Date')) {
      const today = new Date();
      const futureDate = new Date(today.getTime() + (Math.random() * 30 + 1) * 24 * 60 * 60 * 1000);
      return futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } else if (customType.includes('status') || customType.includes('Status')) {
      const statuses = ['Pending', 'Approved', 'In Progress', 'Completed', 'On Hold'];
      return statuses[Math.floor(Math.random() * statuses.length)];
    } else if (customType.includes('priority') || customType.includes('Priority')) {
      const priorities = ['Low', 'Medium', 'High', 'Urgent'];
      return priorities[Math.floor(Math.random() * priorities.length)];
    } else if (customType.includes('category') || customType.includes('Category')) {
      const categories = ['Electronics', 'Office Supplies', 'Services', 'Equipment', 'Software'];
      return categories[Math.floor(Math.random() * categories.length)];
    } else if (customType.includes('location') || customType.includes('Location')) {
      const locations = ['Warehouse A', 'Warehouse B', 'Main Office', 'Branch Office', 'Remote'];
      return locations[Math.floor(Math.random() * locations.length)];
    } else if (customType.includes('supplier') || customType.includes('Supplier')) {
      const suppliers = ['TechCorp', 'OfficeMax', 'ServicePro', 'EquipmentPlus', 'SupplyCo'];
      return suppliers[Math.floor(Math.random() * suppliers.length)];
    } else {
      // Generic custom field - generate realistic data
      const genericData = [
        `Value ${rowNumber}`,
        `Option ${rowNumber}`,
        `Setting ${rowNumber}`,
        `Config ${rowNumber}`,
        `Param ${rowNumber}`
      ];
      return genericData[Math.floor(Math.random() * genericData.length)];
    }
  };

  const handleAIFill = async () => {
    try {
      showNotification('🤖 Fetching AI suggestions...', 'info');

      const payload = {
        context: 'purchase_order',
        companyFields,
        purchaseOrderFields,
                vendorFields,
        shipToFields,
        shippingFields: [
          // Include default shipping fields
          { id: 'requisitioner', label: 'Requisitioner name' },
          { id: 'shipVia', label: 'Shipping method' },
          { id: 'fob', label: 'FOB terms' },
          { id: 'shippingTerms', label: 'Shipping terms' },
          // Include custom columns dynamically
          ...shippingColumnOrder
            .filter(id => id.startsWith('custom-'))
            .map(id => ({ 
              id, 
              label: `Custom ${id.replace('custom-', '')}` 
            }))
        ]
      };

      const { suggestions } = await getFieldSuggestions(payload);
      try {
        console.debug('🧪 AI suggestions keys:', Object.keys(suggestions || {}));
        // Preview a few critical values to verify mapping
        console.debug('🧪 AI preview:', {
          company: {
            name: suggestions?.['company-name'],
            phone: suggestions?.['company-phone']
          },
          po: {
            date: suggestions?.['po-date'],
            number: suggestions?.['po-number']
          },
          shipping: {
            requisitioner: suggestions?.requisitioner,
            shipVia: suggestions?.shipVia
          },
          totals: {
            subtotal: suggestions?.subtotal,
            tax: suggestions?.tax,
            total: suggestions?.total
          },
          line1: {
            item: suggestions?.itemNumber1,
            desc: suggestions?.description1,
            qty: suggestions?.qty1,
            rate: suggestions?.rate1,
            amount: suggestions?.amount1
          }
        });
      } catch {}

      // 1) Apply to Section 1–3 states (company/po/vendor/ship-to) with mapping logs
      setCompanyFields(prev => {
        const next = applySuggestionsToFields(suggestions, prev);
        try {
          const before = Object.fromEntries(prev.map(f => [f.id, f.value]));
          const after  = Object.fromEntries(next.map(f => [f.id, f.value]));
          Object.keys(after).forEach(id => {
            if (before[id] !== after[id] && suggestions[id] !== undefined) {
              console.debug('🧭 map(companyFields):', { id, from: before[id], to: after[id], sourceKey: id });
            }
          });
        } catch {}
        return next;
      });

      setPurchaseOrderFields(prev => {
        const next = applySuggestionsToFields(suggestions, prev);
        try {
          const before = Object.fromEntries(prev.map(f => [f.id, f.value]));
          const after  = Object.fromEntries(next.map(f => [f.id, f.value]));
          Object.keys(after).forEach(id => {
            if (before[id] !== after[id] && suggestions[id] !== undefined) {
              console.debug('🧭 map(purchaseOrderFields):', { id, from: before[id], to: after[id], sourceKey: id });
            }
          });
        } catch {}
        return next;
      });

      setVendorFields(prev => {
        const next = applySuggestionsToFields(suggestions, prev);
        try {
          const before = Object.fromEntries(prev.map(f => [f.id, f.value]));
          const after  = Object.fromEntries(next.map(f => [f.id, f.value]));
          Object.keys(after).forEach(id => {
            if (before[id] !== after[id] && suggestions[id] !== undefined) {
              console.debug('🧭 map(vendorFields):', { id, from: before[id], to: after[id], sourceKey: id });
            }
          });
        } catch {}
        return next;
      });

      setShipToFields(prev => {
        const next = applySuggestionsToFields(suggestions, prev);
        try {
          const before = Object.fromEntries(prev.map(f => [f.id, f.value]));
          const after  = Object.fromEntries(next.map(f => [f.id, f.value]));
          Object.keys(after).forEach(id => {
            if (before[id] !== after[id] && suggestions[id] !== undefined) {
              console.debug('🧭 map(shipToFields):', { id, from: before[id], to: after[id], sourceKey: id });
            }
          });
        } catch {}
        return next;
      });

      // 2) Shipping details (DOM spans)
      const write = (el, val) => { if (el && typeof val === 'string') el.textContent = val; };

      const shipSelectors = (key) => [
        `.shipping-details [data-field="${key}"] .editable-field`,
        `.shipping-field[data-field="${key}"] .editable-field`,
        `#shipping-${key}`,
        `.shipping-field-${key} .editable-field`
      ];

      // Use dynamic shipping column order instead of hardcoded array
      const shipOrder = shippingColumnOrder;
      shipOrder.forEach((key, idx) => {
        let el = null, used = '';
        
        // Handle custom columns (those that start with 'custom-')
        let suggestionKey = key;
        if (key.startsWith('custom-')) {
          // For custom columns, try to find a relevant suggestion or generate one
          suggestionKey = 'customField'; // Use a generic key for AI suggestions
        }
        
        for (const sel of shipSelectors(key)) {
          el = document.querySelector(sel);
          if (el) { used = sel; break; }
        }
        // Fallback to positional selector used in your JSX
        if (!el) {
          const nth = idx + 1; // 1-based
          // Prefer :nth-of-type within container to ignore headers
          const selA = `.shipping-details .shipping-field:nth-of-type(${nth}) .editable-field`;
          el = document.querySelector(selA);
          if (el) {
            used = selA;
          } else {
            // Last resort: original child-based selector
            const selB = `.shipping-field:nth-child(${nth}) .editable-field`;
            el = document.querySelector(selB);
            if (el) used = selB;
          }
        }
        
        // Get the suggestion value, with fallback for custom columns
        let suggestionValue = suggestions[suggestionKey];
        if (key.startsWith('custom-') && !suggestionValue) {
          // Generate a placeholder value for custom columns
          suggestionValue = `[Custom ${key.replace('custom-', '')}]`;
        }
        
        write(el, suggestionValue);
        try {
          const count = document.querySelectorAll('.shipping-details .shipping-field').length;
          console.debug('🧭 map(shippingDetails):', { key, selector: used || '(not found)', value: suggestionValue, fieldsInDOM: count, isCustom: key.startsWith('custom-') });
        } catch {}
      });

      // 3) Line items (fill all rows dynamically)
      // Rows are rendered with data-column per your table; we fill itemNumber, description, qty, rate, amount.
      const setCell = (row, col, val) => {
        const selector = `.itemtable tbody tr:nth-child(${row}) td[data-column="${col}"] .editable-field`;
        const cell = document.querySelector(selector);
        if (cell && typeof val === 'string') {
          cell.textContent = val;
        }
        try { console.debug('🧭 map(lineItem):', { row, col, selector, value: val }); } catch {}
      };

      const li = (i, k) => suggestions?.[`${k}${i}`];

      // Get the total number of rows in the table
      const totalRows = document.querySelectorAll('.itemtable tbody tr').length;
  

      // Fill all rows with AI suggestions
      for (let i = 1; i <= totalRows; i++) {
        // For rows beyond the first 3, generate additional suggestions or use fallbacks
        let itemNumber, description, qty, rate, amount;
        
        if (i <= 3) {
          // Use existing AI suggestions for first 3 rows
          itemNumber = li(i, 'itemNumber') || `ITEM${i.toString().padStart(3, '0')}`;
          description = li(i, 'description') || `Product ${i}`;
          qty = li(i, 'qty') || '1';
          rate = li(i, 'rate') || '50.00';
          amount = li(i, 'amount') || '50.00';
          

        } else {
          // Generate additional suggestions for rows 4+
          const additionalSuggestions = generateAdditionalLineItemSuggestions(i, suggestions);
          itemNumber = additionalSuggestions.itemNumber;
          description = additionalSuggestions.description;
          qty = additionalSuggestions.qty;
          rate = additionalSuggestions.rate;
          amount = additionalSuggestions.amount;
          

        }

        // Ensure all values are strings and handle any undefined/null values
        setCell(i, 'itemNumber', String(itemNumber || ''));
        setCell(i, 'description', String(description || ''));
        setCell(i, 'qty', String(qty || ''));
        setCell(i, 'rate', String(rate || ''));
        setCell(i, 'amount', String(amount || ''));
        
        // Fill custom columns with AI-generated data
        lineItemColumnOrder.forEach(columnId => {
          if (columnId.startsWith('custom-')) {
            const customValue = generateCustomColumnData(columnId, i, suggestions);
            setCell(i, columnId, String(customValue || ''));
          }
        });
      }

      // 4) Totals (state + DOM)
      setTotalsFields(prev => {
        const map = {
          subtotal: suggestions.subtotal,
          tax: suggestions.tax,
          shipping: suggestions.shipping,
          other: suggestions.other,
          total: suggestions.total,
        };
        const next = prev.map(f => (map[f.id] ? { ...f, value: map[f.id] } : f));
        try {
          const before = Object.fromEntries(prev.map(f => [f.id, f.value]));
          const after  = Object.fromEntries(next.map(f => [f.id, f.value]));
          Object.keys(after).forEach(id => {
            if (before[id] !== after[id] && map[id] !== undefined) {
              console.debug('🧭 map(totalsFields):', { id, from: before[id], to: after[id], sourceKey: id });
            }
          });
        } catch {}
        return next;
      });

      // Write editable totals into DOM for non-calculated rows
      const domTotals = (field) => document.querySelector(`.totals-section .total-row[data-field="${field}"] .editable-field`);
      ['tax','shipping','other'].forEach(key => {
        const sel = `.totals-section .total-row[data-field="${key}"] .editable-field`;
        write(domTotals(key), suggestions[key]);
        try { console.debug('🧭 map(totalsDOM):', { key, selector: sel, value: suggestions[key] }); } catch {}
      });

      // Calculated-looking spans (subtotal, total) in your layout use .calculated-field
      const calcTotal = document.querySelector(`.totals-section .total-row[data-field="total"] .total-field`);
      const calcSub   = document.querySelector(`.totals-section .total-row[data-field="subtotal"] .calculated-field`);
      write(calcSub, suggestions.subtotal);
      write(calcTotal, suggestions.total);
      try {
        console.debug('🧭 map(totalsDOM):', { key: 'subtotal', selector: `.totals-section .total-row[data-field="subtotal"] .calculated-field`, value: suggestions.subtotal });
        console.debug('🧭 map(totalsDOM):', { key: 'total', selector: `.totals-section .total-row[data-field="total"] .total-field`, value: suggestions.total });
      } catch {}

      // 5) Comments, Contact Info (DOM)
      const commentsEl = document.querySelector('.comments-content .editable-field');
      const contactEl  = document.querySelector('.contact-section .editable-field');
      write(commentsEl, suggestions.comments);
      write(contactEl, suggestions.contactInfo);
      try {
        console.debug('🧭 map(comments):', { selector: '.comments-content .editable-field', value: suggestions.comments });
        console.debug('🧭 map(contactInfo):', { selector: '.contact-section .editable-field', value: suggestions.contactInfo });
      } catch {}

      // 6) Bump timestamps
      updateCompanyFieldsTimestamp();
      updatePurchaseOrderFieldsTimestamp();

      showNotification('✅ AI suggestions applied', 'success');
    } catch (e) {
      console.error('AI fill failed:', e);
      showNotification(`❌ AI fill failed: ${e.message}`, 'error');
    }
  };

  // ============================================================================
  // XML EXPORT FUNCTIONALITY
  // ============================================================================
  
  // Function to export form data as XML
  const exportToXML = () => {
    try {
  
      
      // Capture current field values first
      const capturedData = captureFieldValues();
      
      // Prepare data for XML generation
      // Determine current visual order of sections 1 & 2 from DOM to avoid async state lag
      const headerSections = Array.from(document.querySelectorAll('.header-section .sortable-section'));
      const visualSections1And2 = headerSections
        .map(el => el.id)
        .filter(id => id === 'section1' || id === 'section2');
      const sections1And2ForExport = (visualSections1And2.length === 2) ? visualSections1And2 : sections1And2Order;
      
      // Determine current visual order of sections 3 & 4 (Vendor / Ship-To) from DOM
      const vendorShipToSections = Array.from(document.querySelectorAll('.vendor-shipping-section .sortable-section'));
      const visualSections3And4 = vendorShipToSections
        .map(el => el.id)
        .filter(id => id === 'section3' || id === 'section4');
      const sections3And4ForExport = (visualSections3And4.length === 2) ? visualSections3And4 : vendorShipToSectionOrder;
      
      // Helpers for DOM reads
      const getText = (sel) => document.querySelector(sel)?.textContent?.trim() || '';
      
      // Normalize line items to include both UI keys (qty/rate/amount) and template keys (quantity/unitPrice/total)
      // Also preserve all custom column data
      const normalizedLineItems = (capturedData.lineItems || []).map(row => {
        const normalizedRow = {
          // original UI keys
          itemNumber: row.itemNumber || '',
          description: row.description || '',
          qty: row.qty || row.quantity || '',
          rate: row.rate || row.unitPrice || '',
          amount: row.amount || row.total || '',
          // template-expected keys
          quantity: row.quantity || row.qty || '',
          unitPrice: row.unitPrice || row.rate || '',
          total: row.total || row.amount || ''
        };
        
        // Preserve all custom column data
        lineItemColumnOrder.forEach(columnId => {
          if (columnId.startsWith('custom-') && row[columnId] !== undefined) {
            normalizedRow[columnId] = row[columnId];
          }
        });
        
        return normalizedRow;
      });

      const exportData = {
        ...capturedData,
        // Add major sections order for group swapping
        majorSectionsOrder: majorSectionsOrder, // New state for sections 3+4 group swapping with section 5
        // Add section order information for dynamic XML generation
        sectionOrder: {
          sections1And2: sections1And2ForExport, // Use current visual order to ensure XML matches UI
          sections3And4: sections3And4ForExport, // Use current visual order to ensure XML matches UI
          sections5And6: sections5And6Order, // Use actual state for sections 5&6
          sections8And9: commentsTotalsSectionOrder, // Use actual state for sections 8&9
          lineItemColumns: lineItemColumnOrder, // Use actual state for line item columns
          shippingColumns: shippingColumnOrder // Use actual state for shipping columns
        },
        // CRITICAL: Add field order information for dynamic XML generation (same pattern as section order)
        fieldOrder: {
          company: companyFieldOrder, // Preserve company field order independently of section position
          purchaseOrder: purchaseOrderFieldOrder, // Preserve PO field order independently of section position
          vendor: vendorFields.map(f => f.id), // Vendor field order
          shipTo: shipToFields.map(f => f.id) // Ship-to field order
        },
                // Add normalized line items (support both key schemes)
        lineItems: normalizedLineItems,
        // Shipping details (prefer data-field; fall back handled in XML builder too)
        // Capture all shipping columns dynamically, including custom ones
        ...(() => {
          const shippingData = {};
          shippingColumnOrder.forEach(columnId => {
            const value = getText(`.section-5 [data-field="${columnId}"] .editable-field`);
            shippingData[columnId] = value;
          });
          return shippingData;
        })(),
        // Totals: include the current totalsFields state for dynamic ordering
        totalsFields: totalsFields,
        // Comments: include the current commentsFields state for dynamic ordering
        commentsFields: commentsFields,
        // Contact: include the current contactFields state for dynamic ordering
        contactFields: contactFields,
        // Also include individual totals for backward compatibility
        subtotal: getText('.totals-section .total-row[data-field="subtotal"] .calculated-field') || '$0.00',
        tax: getText('.totals-section .total-row[data-field="tax"] .editable-field') || '$0.00',
        shipping: getText('.totals-section .total-row[data-field="shipping"] .editable-field') || '$0.00',
        other: getText('.totals-section .total-row[data-field="other"] .editable-field') || '$0.00',
        total: getText('.totals-section .total-row[data-field="total"] .total-field') || '$0.00',
        comments: getText('.comments-content .editable-field'),
        contactInfo: getText('.contact-section .editable-field')
      };
      
      console.debug('🔎 Export DOM reads:', {
        requisitioner: exportData.requisitioner,
        shipVia: exportData.shipVia,
        fob: exportData.fob,
        shippingTerms: exportData.shippingTerms,
        subtotal: exportData.subtotal,
        tax: exportData.tax,
        shipping: exportData.shipping,
        other: exportData.other,
        total: exportData.total
      });

      








      

      
      // Generate XML
      const xml = generatePurchaseOrderXML(exportData);
      
      // Display XML in a modal instead of downloading
      displayXMLOutput(xml);
      
      // Update export timestamp
      setLastExportTime(new Date().toISOString());
      
      showNotification('📄 XML generated successfully!', 'success');
      
      
    } catch (error) {
      console.error('❌ XML generation failed:', error);
      showNotification(`❌ XML generation failed: ${error.message}`, 'error');
    }
  };







  // Show notification function
  const showNotification = (message, type = 'info') => {
    // Remove any existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
      existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    // Add to notification container
    const container = document.getElementById('notification-container');
    if (container) {
      container.appendChild(notification);
    } else {
      // Fallback to body if container not found
      document.body.appendChild(notification);
    }

    // Auto-remove after 3 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 3000);
  };

  // Get current form statistics
  const getFormStats = () => {
    return {
      totalFields: companyFields.length + purchaseOrderFields.length + vendorFields.length + shipToFields.length,
      companyFields: companyFields.length,
      purchaseOrderFields: purchaseOrderFields.length,
      vendorFields: vendorFields.length,
      shipToFields: shipToFields.length,
      totalChanges: changeHistory.length,
      lastModified: Math.max(new Date(lastModified).getTime(), new Date(poLastModified).getTime())
    };
  };

  // Handle company field drag and drop with timestamp update
  const handleCompanyDragEnd = (event) => {
    useCompanyFieldsDragEnd(setCompanyFields)(event);
    updateCompanyFieldsTimestamp();
    
    // CRITICAL: Update field order state to preserve drag-and-drop order (same pattern as section swapping)
    if (event.active.id !== event.over.id) {
      setCompanyFieldOrder(prevOrder => {
        const oldIndex = prevOrder.indexOf(event.active.id);
        const newIndex = prevOrder.indexOf(event.over.id);
        
        const newOrder = [...prevOrder];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, event.active.id);
        
    
        return newOrder;
      });
      
      
    }
  };

  // ============================================================================
  // SUMMARY LOGGING FUNCTION
  // ============================================================================
  
  // Function to log a summary of all field states
  const logFieldSummary = () => {
    // Field summary logging removed for production
  };

  // Log summary on component mount
  React.useEffect(() => {
    logFieldSummary();
  }, []); // Only run once on mount

  // ============================================================================
  // PURCHASE ORDER FIELD MANAGEMENT FUNCTIONS
  // ============================================================================
  
  // Helper function to update timestamp when purchase order fields change
  const updatePurchaseOrderFieldsTimestamp = () => {
    setPoLastModified(new Date().toISOString());
  };

  // Add new purchase order field
  const handleAddPurchaseOrderField = (newField) => {
    setPurchaseOrderFields(prevFields => [...prevFields, newField]);
    updatePurchaseOrderFieldsTimestamp();

  };

  // Remove purchase order field
  const handleRemovePurchaseOrderField = (fieldId) => {
    setPurchaseOrderFields(prevFields => {
      const fieldToRemove = prevFields.find(field => field.id === fieldId);
      showNotification(`🗑️ Removed purchase order field: "${fieldToRemove?.label}"`, 'warning');

      return prevFields.filter(field => field.id !== fieldId);
    });
    updatePurchaseOrderFieldsTimestamp();
  };

  // ============================================================================
  // VENDOR FIELD MANAGEMENT FUNCTIONS
  // ============================================================================
  
  // Add new vendor field
  const handleAddVendorField = (newField) => {
    setVendorFields(prevFields => [...prevFields, newField]);

    showNotification(`➕ Added vendor field: "${newField.label}"`, 'success');
  };

  // Remove vendor field
  const handleRemoveVendorField = (fieldId) => {
    setVendorFields(prevFields => {
      const fieldToRemove = prevFields.find(field => field.id === fieldId);
      showNotification(`🗑️ Removed vendor field: "${fieldToRemove?.label}"`, 'warning');

      return prevFields.filter(field => field.id !== fieldId);
    });
  };

  // Handle vendor field label changes
  const handleVendorFieldLabelChange = (fieldId, newLabel) => {
    setVendorFields(prevFields => {
      const oldField = prevFields.find(field => field.id === fieldId);
      const oldLabel = oldField ? oldField.label : '';
      
      logChange('label-change', fieldId, oldLabel, newLabel, 'vendor');
      
      return prevFields.map(field => 
        field.id === fieldId ? { ...field, label: newLabel } : field
      );
    });
  };

  // ============================================================================
  // SHIP-TO FIELD MANAGEMENT FUNCTIONS
  // ============================================================================
  
  // Add new ship-to field
  const handleAddShipToField = (newField) => {
    setShipToFields(prevFields => [...prevFields, newField]);

    showNotification(`➕ Added ship-to field: "${newField.label}"`, 'success');
  };

  // Remove ship-to field
  const handleRemoveShipToField = (fieldId) => {
    setShipToFields(prevFields => {
      const fieldToRemove = prevFields.find(field => field.id === fieldId);
      showNotification(`🗑️ Removed ship-to field: "${fieldToRemove?.label}"`, 'warning');

      return prevFields.filter(field => field.id !== fieldId);
    });
  };

  // Add new line item row
  const handleAddLineItemRow = () => {
    setLineItemRows(prevRows => {
      const newRowNumber = Math.max(...prevRows) + 1;
      const newRows = [...prevRows, newRowNumber];
  
      showNotification(`➕ Added new line item row ${newRowNumber}`, 'success');
      return newRows;
    });
  };

  // Add new line item column
  const handleAddLineItemColumn = () => {
    setLineItemColumnOrder(prevOrder => {
      // Generate a more descriptive column ID
      const columnTypes = ['Status', 'Priority', 'Category', 'Location', 'Supplier', 'Date', 'Notes', 'Reference'];
      const randomType = columnTypes[Math.floor(Math.random() * columnTypes.length)];
      const newColumnId = `custom-${randomType.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newOrder = [...prevOrder, newColumnId];
  
      showNotification(`➕ Added new ${randomType} column`, 'success');
      return newOrder;
    });
  };

  // Handle ship-to field label changes
  const handleShipToFieldLabelChange = (fieldId, newLabel) => {
    setShipToFields(prevFields => {
      const oldField = prevFields.find(field => field.id === fieldId);
      const oldLabel = oldField ? oldField.label : '';
      
      logChange('label-change', fieldId, oldLabel, newLabel, 'ship-to');
      
      return prevFields.map(field => 
        field.id === fieldId ? { ...field, label: newLabel } : field
      );
    });
  };

  // Handle purchase order field drag and drop with timestamp update
  const handlePurchaseOrderDragEnd = (event) => {
    usePurchaseOrderFieldsDragEnd(setPurchaseOrderFields)(event);
    updatePurchaseOrderFieldsTimestamp();
    
    // CRITICAL: Update field order state to preserve drag-and-drop order (same pattern as section swapping)
    if (event.active.id !== event.over.id) {
      setPurchaseOrderFieldOrder(prevOrder => {
        const oldIndex = prevOrder.indexOf(event.active.id);
        const newIndex = prevOrder.indexOf(event.over.id);
        
        const newOrder = [...prevOrder];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, event.active.id);
        
    
        return newOrder;
      });
      
      
    }
  };

  // ============================================================================
  // SECTION-LEVEL DRAG AND DROP
  // ============================================================================
  
  // State for vendor/ship-to section order
  const [vendorShipToSectionOrder, setVendorShipToSectionOrder] = useState(['section3', 'section4']);
  const [vendorShipToShippingGroupOrder, setVendorShipToShippingGroupOrder] = useState(['vendor-ship-to-shipping-group']);
  
  // State for sections 1 and 2 order (Company Info and Purchase Order)
  const [sections1And2Order, setSections1And2Order] = useState(['section1', 'section2']);
  
  // State for sections 5 and 6 order (Vendor/Ship-To and Shipping Details)
  const [sections5And6Order, setSections5And6Order] = useState(['section5']);  

  // State for major sections order (vendor-shipto-group and shipping-section)
  const [majorSectionsOrder, setMajorSectionsOrder] = useState(['vendor-shipto-group', 'shipping-section']);
  
  // State for vendor-ship-to and shipping-details sections order (sections 3,4,5 can swap)
  const [vendorShipToAndShippingDetailsOrder, setVendorShipToAndShippingDetailsOrder] = useState(['vendor-shipto-group', 'section5']);
  
  // CRITICAL: Add field order state management (same pattern as section order)
  // State for company field order (preserves drag-and-drop order independently of section position)
  const [companyFieldOrder, setCompanyFieldOrder] = useState([]);
  
  // State for purchase order field order (preserves drag-and-drop order independently of section position)
  const [purchaseOrderFieldOrder, setPurchaseOrderFieldOrder] = useState([]);
  
  // Initialize field order states with current field IDs
  React.useEffect(() => {
    setCompanyFieldOrder(companyFields.map(field => field.id));
  }, [companyFields]);
  
  React.useEffect(() => {
    setPurchaseOrderFieldOrder(purchaseOrderFields.map(field => field.id));
  }, [purchaseOrderFields]);
  
  // Line item column order state
  const [lineItemColumnOrder, setLineItemColumnOrder] = useState([
    'itemNumber',
    'description', 
    'qty',
    'rate',
    'amount'
  ]);
  
  // Log line item column order changes
  useEffect(() => {

  }, [lineItemColumnOrder]);
  
  // Shipping column order state
  const [shippingColumnOrder, setShippingColumnOrder] = useState([
    'requisitioner',
    'shipVia',
    'fob',
    'shippingTerms'
  ]);
  
  // Log shipping column order changes
  useEffect(() => {

  }, [shippingColumnOrder]);

  // Comments and Totals section order state (Section 8 & 9)
  const [commentsTotalsSectionOrder, setCommentsTotalsSectionOrder] = useState(['section8', 'section9']);

  // Function to handle drag start
  const handleDragStart = (event) => {
    const { active } = event;
    
    console.log('🎯 Drag start detected:', {
      activeId: active?.id,
      activeData: active?.data?.current,
      source: active?.data?.current?.source
    });

    // Add dragging state to the dragged element
    if (active.id === 'section1' || active.id === 'section2') {
      const element = document.getElementById(active.id);
      if (element) {
        element.setAttribute('data-is-dragging', 'true');

        
        // Add visual feedback
        element.style.border = '3px solid #ff6b6b';
        element.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
      }
    }
  };

  // Function to handle drag over
  const handleDragOver = (event) => {
    const { active, over } = event;
    

    

    
    // Handle section reordering drag over
    if (active.id === 'section1' || active.id === 'section2') {
      if (over && (over.id === 'section1' || over.id === 'section2')) {

        
        // Add over state to the target element
        const targetElement = document.getElementById(over.id);
        if (targetElement) {
          targetElement.setAttribute('data-is-over', 'true');
          
          // Enhanced visual feedback for section reordering
          targetElement.style.border = '3px solid #4ecdc4';
          targetElement.style.backgroundColor = 'rgba(78, 205, 196, 0.15)';
          targetElement.style.transform = 'scale(1.01)';
          targetElement.style.transition = 'all 0.2s ease-in-out';
          targetElement.style.boxShadow = '0 6px 20px rgba(78, 205, 196, 0.3)';
        }
      }
    }
  };

  // Function to handle section reordering
  const handleSectionDragEnd = (event) => {
    const { active, over } = event;
    

    
    if (!active || !over) {

      return;
    }
    
    if (active.id !== over.id) {

      
      setSections1And2Order((prevOrder) => {

        
        const oldIndex = prevOrder.indexOf(active.id);
        const newIndex = prevOrder.indexOf(over.id);
        
        
        
        if (oldIndex === -1 || newIndex === -1) {
  
          return prevOrder;
        }
        
        const newOrder = arrayMove(prevOrder, oldIndex, newIndex);
        
        showNotification('🔄 Sections swapped successfully!', 'success');
        
        return newOrder;
      });
      
      // Clean up data attributes and visual feedback
      const section1Element = document.getElementById('section1');
      const section2Element = document.getElementById('section2');
      if (section1Element) {
        section1Element.removeAttribute('data-is-dragging');
        section1Element.removeAttribute('data-is-over');
        section1Element.style.border = '';
        section1Element.style.backgroundColor = '';
      }
      if (section2Element) {
        section2Element.removeAttribute('data-is-dragging');
        section2Element.removeAttribute('data-is-over');
        section2Element.style.border = '';
        section2Element.style.backgroundColor = '';
      }
    } else {

      
      // Clean up data attributes and visual feedback even if no swap
      const section1Element = document.getElementById('section1');
      const section2Element = document.getElementById('section2');
      if (section1Element) {
        section1Element.removeAttribute('data-is-dragging');
        section1Element.removeAttribute('data-is-over');
        section1Element.style.border = '';
        section1Element.style.backgroundColor = '';
      }
      if (section2Element) {
        section2Element.removeAttribute('data-is-dragging');
        section2Element.removeAttribute('data-is-over');
        section2Element.style.border = '';
        section2Element.style.backgroundColor = '';
      }
    }
  };

  // Function to handle sections 5 and 6 reordering (Vendor/Ship-To and Shipping Details)
  const handleSections5And6DragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {

      
      setSections5And6Order(prevOrder => {
        
        
        const oldIndex = prevOrder.indexOf(active.id);
        const newIndex = prevOrder.indexOf(over.id);
        

        
        const newOrder = [...prevOrder];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, active.id);
        
        showNotification('🔄 Sections 5 and 6 reordered!', 'info');
        
        return newOrder;
      });
    } else {

    }
  };

  // Handle line item column drag end
  const handleLineItemColumnDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {

      
      // Extract column IDs from the header IDs (remove 'line-item-header-' prefix)
      const activeColumnId = active.id.replace('line-item-header-', '');
      const overColumnId = over.id.replace('line-item-header-', '');
      
      setLineItemColumnOrder((items) => {
        const oldIndex = items.indexOf(activeColumnId);
        const newIndex = items.indexOf(overColumnId);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        showNotification('🔄 Line item columns reordered!', 'info');
        
        return newOrder;
      });
    } else {

    }
  };

  // Handle shipping column drag end
  const handleShippingColumnDragEnd = (event) => {
    // Check if this is an add-column event from Section5Shipping
    if (event.type === 'add-column' && event.newOrder) {

      setShippingColumnOrder(event.newOrder);
      showNotification('🚢 New shipping column added!', 'success');
      return;
    }
    
    // Check if this is the new event format from Section5Shipping (reordering)
    if (event.newOrder) {

      setShippingColumnOrder(event.newOrder);
      showNotification('🚢 Shipping columns reordered!', 'info');
      return;
    }
    
    // Handle the old event format (fallback)
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {

      
      setShippingColumnOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        const newOrder = arrayMove(items, oldIndex, newIndex);
        showNotification('🚢 Shipping columns reordered!', 'info');
        
        return newOrder;
      });
    } else {

    }
  };



  // Handle Comments and Totals section drag end
  const handleCommentsTotalsDragEnd = (event) => {
    const { active, over } = event;
    
    // Check if over exists (user didn't drag outside valid area)
    if (!over) return;
    
    if (active.id !== over.id) {
      setCommentsTotalsSectionOrder((items) => {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  // Function to handle vendor/ship-to section reordering
  const handleVendorShipToSectionDragEnd = (event) => {
    const { active, over } = event;
    
    // Check if over exists (user didn't drag outside valid area)
    if (!over) return;
    
    if (active.id !== over.id) {

      
      setVendorShipToSectionOrder(prevOrder => {
        const oldIndex = prevOrder.indexOf(active.id);
        const newIndex = prevOrder.indexOf(over.id);
        
        const newOrder = [...prevOrder];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, active.id);
        
        // The sections are already reordered by the code above, no need to swap field data
        // Just show notification that sections were reordered
        showNotification('🔄 Vendor and Ship To sections reordered!', 'info');
        
        return newOrder;
      });
    } else {

    }
  };

  // Function to handle vendor-ship-to and shipping-details sections reordering
  const handleVendorShipToAndShippingDetailsDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {

      
      setVendorShipToAndShippingDetailsOrder(prevOrder => {
        const oldIndex = prevOrder.indexOf(active.id);
        const newIndex = prevOrder.indexOf(over.id);
        
        const newOrder = [...prevOrder];
        newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, active.id);
        
        showNotification('🔄 Vendor-ShipTo and Shipping Details sections reordered!', 'info');
        
        return newOrder;
      });
    } else {

    }
  };

  // ============================================================================
  // SECTION SWAPPING FUNCTION
  // ============================================================================
  

  
  // Function to swap Section 1 and Section 2
  const handleSwapSections = () => {

    
    // Store current values before swapping
    const companyFieldValues = companyFields.map(field => {
      const element = document.getElementById(field.id);
      return {
        ...field,
        value: element ? element.textContent.trim() : ''
      };
    });
    
    const purchaseOrderFieldValues = purchaseOrderFields.map(field => {
      const element = document.getElementById(field.id);
      return {
        ...field,
        isTitle: field.isTitle, // Explicitly preserve isTitle property
        value: element ? element.textContent.trim() : ''
      };
    });
    

    
    // IMPORTANT: Create new field arrays to avoid reference issues
    const newCompanyFields = purchaseOrderFields.map(field => ({
      ...field,
      isTitle: field.isTitle // Ensure isTitle is preserved
    }));
    
    const newPurchaseOrderFields = companyFields.map(field => ({
      ...field,
      isTitle: false // Company fields should never be title
    }));
    

    
    // Swap the fields - keep Purchase Order section intact (title + date + po#)
    setCompanyFields(newCompanyFields);
    setPurchaseOrderFields(newPurchaseOrderFields);
    
    // Update timestamps
    setLastModified(new Date().toISOString());
    setPoLastModified(new Date().toISOString());
    
              showNotification('🔄 Sections swapped!', 'info');
    

    };

  // Function to manually swap Vendor and Ship To sections
  const handleSwapVendorShipTo = () => {

    
    // Store current values before swapping
    const vendorFieldValues = vendorFields.map(field => {
      const element = document.getElementById(field.id);
      return {
        ...field,
        value: element ? element.textContent.trim() : ''
      };
    });
    
    const shipToFieldValues = shipToFields.map(field => {
      const element = document.getElementById(field.id);
      return {
        ...field,
        value: element ? element.textContent.trim() : ''
      };
    });
    

    
    // Swap the fields
    setVendorFields(shipToFieldValues);
    setShipToFields(vendorFieldValues);
    
    // Update section order
    setVendorShipToSectionOrder(prevOrder => {
      const newOrder = [...prevOrder].reverse();
      return newOrder;
    });
    
    showNotification('🔄 Vendor and Ship To sections swapped!', 'info');
    

  };

  // ============================================================================
  // FIELD VALUE CAPTURE
  // ============================================================================
  
  // Function to capture current field values from the DOM
  const captureFieldValues = () => {
    // Capture company field values - PRESERVE CURRENT ORDER
    
    const updatedCompanyFields = companyFields.map(field => {
      const element = document.getElementById(field.id);
      const value = element ? element.textContent.trim() : '';
      return { ...field, value };
    });
    
    // Capture purchase order field values
    const updatedPurchaseOrderFields = purchaseOrderFields.map(field => {
      const element = document.getElementById(field.id);
      const value = element ? element.textContent.trim() : '';
      return { ...field, value };
    });
    
    // Capture vendor field values
    const updatedVendorFields = vendorFields.map(field => {
      const element = document.getElementById(field.id);
      const value = element ? element.textContent.trim() : '';
      return { ...field, value };
    });
    
    // Capture ship-to field values
    const updatedShipToFields = shipToFields.map(field => {
      const element = document.getElementById(field.id);
      const value = element ? element.textContent.trim() : '';
      return { ...field, value };
    });
    
    // Capture line item values from the state (more reliable than DOM scraping)
    const capturedLineItems = Object.entries(lineItemData).map(([rowNumber, rowData]) => ({
      itemNumber: rowData.itemNumber,
      description: rowData.description,
      qty: rowData.qty,
      rate: rowData.rate,
      amount: rowData.amount
    }));

    
    // Capture totals field values using the new state structure
    const updatedTotalsFields = totalsFields.map(field => {
      let value = field.value; // Default to current state value
      
      // For editable fields, try to get from DOM
      if (!field.isCalculated) {
        const selector = `.totals-section .total-row[data-field="${field.id}"] .editable-field`;
        const element = document.querySelector(selector);
        if (element) {
          value = element.textContent.trim();
        }
      }
      
      return { ...field, value };
    });
    
    // Update state with captured values
    setCompanyFields(updatedCompanyFields);
    setPurchaseOrderFields(updatedPurchaseOrderFields);
    setVendorFields(updatedVendorFields);
    setShipToFields(updatedShipToFields);
    setTotalsFields(updatedTotalsFields);
    
    return {
      companyFields: updatedCompanyFields,
      purchaseOrderFields: updatedPurchaseOrderFields,
      vendorFields: updatedVendorFields,
      shipToFields: updatedShipToFields,
      lineItems: capturedLineItems,
      totalsFields: updatedTotalsFields
    };
  };

  // Unified drag end dispatcher for a single top-level DndContext
  const handleRootDragEnd = (event) => {
    const { active, over } = event;
    const activeId = active?.id || '';
    const source = active?.data?.current?.source;

    console.log('🔍 ROOT DRAG END:', {
      activeId,
      overId: over?.id,
      source,
      activeType: active?.data?.current?.type,
      overType: over?.data?.current?.type,
      isOverSection3: over?.id === 'section3',
      isOverSection4: over?.id === 'section4',
      isPaletteSource: source === 'palette'
    });

    // Reset section handle dragging state
    setIsSectionHandleDragging(false);
    
    // Clean up all visual feedback states
    const allSections = document.querySelectorAll('[id^="section"]');
    allSections.forEach(section => {

      section.removeAttribute('data-is-over');
      section.removeAttribute('data-is-dragging');
      
      // Reset styles
      section.style.border = '';
      section.style.backgroundColor = '';
      section.style.transform = '';
      section.style.transition = '';
      section.style.boxShadow = '';
      
      // Remove drop indicators
      const dropIndicator = section.querySelector('.drop-indicator');
      if (dropIndicator) {
        dropIndicator.remove();
      }
    });

    if (source === 'palette') {
      handlePaletteDragEnd(event);
      return;
    }

    // Sections 1 & 2 swap
    if (activeId === 'section1' || activeId === 'section2') {
      handleSectionDragEnd(event);
      return;
    }
    // Major sections swap (vendor-shipto-group and shipping-section)
    if (activeId === 'vendor-shipto-group' || activeId === 'shipping-section') {
      handleMajorSectionsDragEnd(event);
      return;
    }
    // Vendor-ShipTo + ShippingDetails container swap
    if (activeId === 'sections3And4' || activeId === 'sections5And6') {
      handleVendorShipToAndShippingDetailsDragEnd(event);
      return;
    }
    // Vendor or Ship-To section reordering
    if (activeId === 'section3' || activeId === 'section4') {
      handleVendorShipToSectionDragEnd(event);
      return;
    }
    // Vendor or Ship-To individual field drags
    if (String(activeId).startsWith('vendor-')) {
      handleVendorDragEnd(event);
      return;
    }
    if (String(activeId).startsWith('ship-to-')) {
      handleShipToDragEnd(event);
      return;
    }
    // Line item column reorder
    if (['itemNumber','description','qty','rate','amount'].includes(activeId)) {
      handleLineItemColumnDragEnd(event);
      return;
    }
    // Comments & totals sections reorder
    if (activeId === 'section8' || activeId === 'section9') {
      handleCommentsTotalsDragEnd(event);
      return;
    }
  };



  // State for tracking section handle drag operations (simplified)
  const [isSectionHandleDragging, setIsSectionHandleDragging] = useState(false);

  const handleVendorShipToDragEnd = (event) => {
    const { active, over } = event;



    // Only handle reordering between sections 3 and 4 within the group
    if (active.id !== over.id &&
        (active.id === 'section3' || active.id === 'section4') &&
        (over.id === 'section3' || over.id === 'section4')) {
      
      const oldIndex = vendorShipToSectionOrder.indexOf(active.id);
      const newIndex = vendorShipToSectionOrder.indexOf(over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = arrayMove(vendorShipToSectionOrder, oldIndex, newIndex);
        setVendorShipToSectionOrder(newOrder);

        addToChangeHistory('section-reorder', `${active.id} → ${over.id}`, newOrder.join(', '));
        showNotification('✅ Sections 3 and 4 reordered successfully', 'success');
      }
    } else {

    }
  };

  const handleVendorShipToShippingGroupDragEnd = (event) => {
    const { active, over } = event;
    
    if (!over) return;
    
    if (active.id !== over.id) {

      
      // For now, this group can only be in one position
      // In the future, this could be expanded to allow reordering with other major sections
    }
  };

  // Handle major sections drag end (vendor-shipto-group and shipping-section)
  const handleMajorSectionsDragEnd = (event) => {
    const { active, over } = event;
    
    console.log('🔄⚠️ MAJOR SECTIONS DRAG END (NESTED CONTEXT):', {
      activeId: active?.id,
      overId: over?.id,
      activeSource: active?.data?.current?.source,
      isPalette: active?.data?.current?.source === 'palette',
      activeType: active?.data?.current?.type,
      overType: over?.data?.current?.type,
      WARNING: 'This nested DndContext might be intercepting palette drops!'
    });
    
    // If this is a palette drag, pass it through - don't handle it here
    if (active?.data?.current?.source === 'palette') {
      console.log('⚠️ PALETTE DRAG INTERCEPTED BY MAJOR SECTIONS CONTEXT - PASSING THROUGH');
      return;
    }
    
    if (!active || !over || active.id === over.id) {
      return;
    }



    // Check if we're dragging the vendor-shipto-group or shipping-section
    if ((active.id === 'vendor-shipto-group' || active.id === 'shipping-section') &&
        (over.id === 'vendor-shipto-group' || over.id === 'shipping-section')) {
      
      setMajorSectionsOrder(prevOrder => {
        const oldIndex = prevOrder.indexOf(active.id);
        const newIndex = prevOrder.indexOf(over.id);
        
        if (oldIndex !== -1 && newIndex !== -1) {
          const newOrder = arrayMove(prevOrder, oldIndex, newIndex);
          
          // Debug: Log the state change
          console.log('🔄 Major Sections State Change:', {
            from: prevOrder,
            to: newOrder,
            activeId: active.id,
            overId: over.id,
            oldIndex,
            newIndex
          });
          
          // Add to change history
          addToChangeHistory('major-sections-swap', 
            active.id === 'vendor-shipto-group' ? 'Vendor & Ship To Group' : 'Shipping Section',
            `Swapped with ${over.id === 'vendor-shipto-group' ? 'Vendor & Ship To Group' : 'Shipping Section'}`
          );
          
          showNotification('🔄 Sections 3+4 swapped with Section 5!', 'success');
          
          return newOrder;
        }
        
        return prevOrder;
      });
    }
  };



  return (
    <div className={`purchase-order-container ${!sidebarVisible ? 'sidebar-hidden' : ''}`}>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter}
        onDragCancel={() => {
    
        }}
        onDragMove={(event) => {
          
        }}
        onDragStart={(event) => {
          
          handleDragStart(event);
        }}
        onDragOver={(event) => {
          
          handleDragOver(event);
        }}
        onDragEnd={(event) => {
          
          handleRootDragEnd(event);
        }}
      >

      {/* Available Fields Sidebar Component */}
      <AvailableFields 
        isVisible={sidebarVisible}
        onToggleVisibility={toggleSidebar}
        showNotification={showNotification}
      />

      {/* Page Header */}
      <header className="page-header">
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          width: '100%',
          textAlign: 'center',
          marginBottom: '20px',
          position: 'relative'
        }}>
          {/* File Upload Button - Upper Right */}
          <FileUploadButton onAnalysisComplete={handleFileAnalysisComplete} />
          
          {/* Toggle Switch - Upper Right */}
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '120px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            backgroundColor: 'white',
            padding: '8px 12px',
            borderRadius: '20px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e0e0e0'
          }}>
            <span style={{ 
              fontSize: '12px', 
              color: showDummyData ? '#666' : '#333',
              fontWeight: showDummyData ? 'normal' : 'bold'
            }}>
              Dummy Data
            </span>
            <button
              onClick={toggleDataMode}
              style={{
                width: '40px',
                height: '20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: showDummyData ? '#ccc' : '#4CAF50',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.3s ease'
              }}
              title={showDummyData ? 'Switch to Field Pills' : 'Switch to Dummy Data'}
            >
              <div style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: '2px',
                left: showDummyData ? '2px' : '22px',
                transition: 'left 0.3s ease',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)'
              }} />
            </button>
            <span style={{ 
              fontSize: '12px', 
              color: showDummyData ? '#333' : '#666',
              fontWeight: showDummyData ? 'bold' : 'normal'
            }}>
              Field Pills
            </span>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <h1>Purchase Order Management System</h1>
            <p>Create, edit, and manage purchase orders with ease</p>
          </div>
          <SectionTitleColorPicker />
        </div>
        {/* Sidebar toggle is now handled by AvailableFields component */}
      </header>

      

      {/* Real-time Status Indicator removed per request */}

      {/* Purchase Order Form */}
      <div className="container">
        <div className="form-content">
          {/* Header Section */}
          <div className="section-container">
            <div className="header-section vendor-shipping-columns">
              {/* Section-level Drag and Drop */}
              <SortableContext 
                items={sections1And2Order}
                strategy={horizontalListSortingStrategy}
              >

                {/* CRITICAL: Render sections dynamically based on sections1And2Order state */}
                {sections1And2Order.map((sectionId, index) => {

                  
                  if (sectionId === 'section1') {
                    return (
                      <DraggableSectionWrapper key={`section1-${index}`} id="section1" sectionNumber="1" isSectionHandleDragging={isSectionHandleDragging} showDragHandle={true}>
                        <Section1CompanyInfo 
                          companyFields={companyFields}
                          sensors={sensors}
                          onCompanyDragEnd={handleCompanyDragEnd}
                          onAddCompanyField={handleAddCompanyField}
                          onRemoveCompanyField={handleRemoveCompanyField}
                          onLabelChange={handleCompanyFieldLabelChange}
                          onContentChange={handleContentChange}
                          lastModified={lastModified}
                          showDummyData={showDummyData}
                          getNetSuiteVariable={getNetSuiteVariable}
                        />
                      </DraggableSectionWrapper>
                    );
                  } else if (sectionId === 'section2') {
                    return (
                      <DraggableSectionWrapper key={`section2-${index}`} id="section2" sectionNumber="2" isSectionHandleDragging={isSectionHandleDragging} showDragHandle={true}>
                        <Section2PurchaseOrder 
                          purchaseOrderFields={purchaseOrderFields}
                          sensors={sensors}
                          onPurchaseOrderDragEnd={handlePurchaseOrderDragEnd}
                          onAddPurchaseOrderField={handleAddPurchaseOrderField}
                          onRemovePurchaseOrderField={handleRemovePurchaseOrderField}
                          onLabelChange={handlePurchaseOrderFieldLabelChange}
                          onContentChange={handleContentChange}
                          lastModified={poLastModified}
                          showDummyData={showDummyData}
                          getNetSuiteVariable={getNetSuiteVariable}
                        />
                      </DraggableSectionWrapper>
                    );
                  }
                  return null;
                })}
              </SortableContext>
            </div>
          </div>

          {/* Combined container for sections 3,4,5 swapping */}
          <div className="major-sections-container" style={{ marginTop: '30px' }}>
            {/* REMOVED NESTED DndContext - it was blocking palette drops! */}
            <SortableContext 
              items={majorSectionsOrder}
              strategy={verticalListSortingStrategy}
            >
              {majorSectionsOrder.map((sectionGroup, index) => {
                if (sectionGroup === 'vendor-shipto-group') {
                  return (
                    <div key={`vendor-shipto-group-${index}`}>
                      <DraggableGroupHandle id="vendor-shipto-group" label="Vendor & Ship-To">
                        <div className="vendor-shipto-sections">
                          <SortableContext 
                            items={vendorShipToSectionOrder}
                            strategy={horizontalListSortingStrategy}
                          >
                            <div className="vendor-shipping-columns">
                              {vendorShipToSectionOrder.map((sectionId, sectionIndex) => (
                                <DraggableSectionWrapper 
                                  key={`${sectionId}-${sectionIndex}`} 
                                  id={sectionId} 
                                  sectionNumber={sectionId === 'section3' ? 3 : 4}
                                  isSectionHandleDragging={isSectionHandleDragging}
                                  showDragHandle={true}
                                >
                                  {sectionId === 'section3' ? (
                                    <Section3Vendor 
                                          vendorFields={vendorFields}
                                          sensors={sensors}
                                          onVendorDragEnd={handleVendorDragEnd}
                                          onAddVendorField={handleAddVendorField}
                                          onRemoveVendorField={handleRemoveVendorField}
                                          onLabelChange={handleVendorFieldLabelChange}
                                          onContentChange={handleContentChange}
                                          lastModified={Date.now()}
                                          showDummyData={showDummyData}
                                          getNetSuiteVariable={getNetSuiteVariable}
                                        />
                                    ) : sectionId === 'section4' ? (
                                        <Section4ShipTo 
                                          shipToFields={shipToFields}
                                          sensors={sensors}
                                          onShipToDragEnd={handleShipToDragEnd}
                                          onAddShipToField={handleAddShipToField}
                                          onRemoveShipToField={handleRemoveShipToField}
                                          onLabelChange={handleShipToFieldLabelChange}
                                          onContentChange={handleContentChange}
                                          lastModified={Date.now()}
                                          showDummyData={showDummyData}
                                          getNetSuiteVariable={getNetSuiteVariable}
                                        />
                                    ) : null}
                                </DraggableSectionWrapper>
                                ))}
                              </div>
                            </SortableContext>
                          </div>
                        </DraggableGroupHandle>
                      </div>
                    );
                  } else if (sectionGroup === 'shipping-section') {
                    return (
                      <div key={`shipping-section-${index}`}>
                        <DraggableGroupHandle id="shipping-section" label="Shipping">
                          <div className="section-5">
                            <Section5Shipping 
                              shippingColumnOrder={shippingColumnOrder}
                              onShippingColumnDragEnd={handleShippingColumnDragEnd}
                              showDummyData={showDummyData}
                            />
                          </div>
                        </DraggableGroupHandle>
                      </div>
                    );
                  }
                  return null;
                })}
              </SortableContext>
            {/* Removed closing DndContext tag */}
          </div>



          {/* Items Table */}
          <div className="sortable-section items-section" style={{ marginBottom: '20px' }}>

            <DndContext
              collisionDetection={closestCenter}
              onDragEnd={handleLineItemColumnDragEnd}
            >
              <SortableContext items={lineItemColumnOrder.map(columnId => `line-item-header-${columnId}`)} strategy={horizontalListSortingStrategy}>
                <table className="itemtable">
              <thead>
                <tr>
                  <th></th>
                  {lineItemColumnOrder.map((columnId, index) => {
                    const columnConfig = {
                      itemNumber: { label: 'Item#', colSpan: 3 },
                      description: { label: 'Description', colSpan: 12 },
                      qty: { label: 'Qty', colSpan: 2 },
                      rate: { label: 'Rate', colSpan: 3 },
                      amount: { label: 'Amount', colSpan: 3 }
                    };
                    
                    // Handle custom columns
                    if (columnId.startsWith('custom-')) {
                      const customType = columnId.replace('custom-', '').split('-')[0]; // Get first part after 'custom-'
                      const label = customType.charAt(0).toUpperCase() + customType.slice(1); // Capitalize first letter
                      const config = { label: label, colSpan: 3 };
                      return (
                        <SortableLineItemColumnHeader key={`header-${columnId}`} id={`line-item-header-${columnId}`}>
                          <th key={`${columnId}-${index}`} colSpan={config.colSpan}>
                            {label} ::
                          </th>
                        </SortableLineItemColumnHeader>
                      );
                    }
                    
                    const config = columnConfig[columnId];
                    return (
                      <SortableLineItemColumnHeader key={`header-${columnId}`} id={`line-item-header-${columnId}`}>
                        <th key={`${columnId}-${index}`} colSpan={config.colSpan}>
                          {config.label} ::
                        </th>
                      </SortableLineItemColumnHeader>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {lineItemRows.map((row, rowIndex) => (
                  <tr key={`row-${row}-${rowIndex}`} className="draggable-row">
                    <td></td>
                    {lineItemColumnOrder.map((columnId, colIndex) => {
                      const columnConfig = {
                        itemNumber: { colSpan: 3, placeholder: 'Item number' },
                        description: { colSpan: 12, placeholder: 'Item description' },
                        qty: { colSpan: 2, placeholder: 'Qty' },
                        rate: { colSpan: 3, placeholder: '$0.00' },
                        amount: { colSpan: 3, placeholder: '$0.00' }
                      };
                      
                      // Handle custom columns
                      if (columnId.startsWith('custom-')) {
                        const config = { colSpan: 3, placeholder: 'Custom value' };
                        return (
                          <td key={`${row}-${columnId}-${rowIndex}-${colIndex}`} colSpan={config.colSpan} data-column={columnId}>
                            <span className="editable-field" contentEditable="true" data-placeholder={config.placeholder} />
                          </td>
                        );
                      }
                      
                      const config = columnConfig[columnId];
                      return (
                        <td key={`${row}-${columnId}-${rowIndex}-${colIndex}`} colSpan={config.colSpan} data-column={columnId}>
                          <span 
                            className="editable-field" 
                            contentEditable="true" 
                            data-placeholder={config.placeholder}
                            onBlur={(e) => {
                              const newData = { ...lineItemData };
                              newData[row][columnId] = e.target.textContent.trim();
                              setLineItemData(newData);
                            }}
                          >
                            {lineItemData[row]?.[columnId] || ''}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
              </SortableContext>
            </DndContext>
            
            {/* Add Row and Column Buttons - Grouped and Right Aligned */}
            <div className="add-buttons-group">
              <button 
                className="add-row-btn-grouped" 
                onClick={handleAddLineItemRow}
              >
                + Add Row
              </button>
              <button 
                className="add-column-btn-grouped" 
                onClick={handleAddLineItemColumn}
              >
                + Add Column
              </button>
            </div>
          </div>



          {/* Comments and Totals - Sections 8 & 9 */}
          <SortableContext items={commentsTotalsSectionOrder} strategy={horizontalListSortingStrategy}>
            <div className="comments-totals-section" style={{ display: 'flex', gap: '20px' }}>
                          {commentsTotalsSectionOrder.map((sectionId, index) => {
              if (sectionId === 'section8') {
                return (
                  <div key={`section8-${index}`} id="section8" className="sortable-section comments-section" style={{ flex: 1 }}>
                    <DraggableSectionHeader id="section8">
                      Comments or Special Instructions ::
                    </DraggableSectionHeader>
                    <div className="section-content">
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleCommentsDragEnd}
                      >
                        <SortableContext 
                          items={commentsFields.map(field => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {commentsFields.map(field => (
                            <SortableCommentsField 
                              key={field.id} 
                              field={field} 
                              onRemove={handleRemoveCommentsField}
                              onLabelChange={handleCommentsFieldLabelChange}
                              onValueChange={handleCommentsFieldValueChange}
                              isMainField={field.id === 'comments-main'}
                              showDummyData={showDummyData}
                              getNetSuiteVariable={getNetSuiteVariable}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                      
                      {/* Add Field Button */}
                      <div className="add-field-section">
                        <button 
                          type="button" 
                          className="add-field-btn"
                          onClick={handleAddCommentsField}
                          title="Add new comments field"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else if (sectionId === 'section9') {
                return (
                  <div key={`section9-${index}`} id="section9" className="sortable-section totals-section" style={{ flex: 1 }}>
                    <DraggableSectionHeader id="section9">
                      Totals ::
                    </DraggableSectionHeader>
                    <div className="section-content">
                      <DndContext 
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleTotalsDragEnd}
                      >
                        <SortableContext 
                          items={totalsFields.map(field => field.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {totalsFields.map(field => (
                            <SortableTotalsField 
                              key={field.id} 
                              field={field} 
                              onRemove={handleRemoveTotalsField}
                              onLabelChange={handleTotalsFieldLabelChange}
                              onValueChange={handleTotalsFieldValueChange}
                              showDummyData={showDummyData}
                              getNetSuiteVariable={getNetSuiteVariable}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>
                      
                      {/* Add Field Button */}
                      <div className="add-field-section">
                        <button 
                          type="button" 
                          className="add-field-btn"
                          onClick={handleAddTotalsField}
                          title="Add new totals field"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
            </div>
          </SortableContext>



          {/* Contact Information */}
          <div className="contact-section">
            <div className="contact-content">
              <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleContactDragEnd}
              >
                <SortableContext 
                  items={contactFields.map(field => field.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {contactFields.map(field => (
                    <SortableContactField 
                      key={field.id} 
                      field={field} 
                      onRemove={handleRemoveContactField}
                      onLabelChange={handleContactFieldLabelChange}
                      onValueChange={handleContactFieldValueChange}
                      isMainField={field.id === 'contact-main'}
                      showDummyData={showDummyData}
                      getNetSuiteVariable={getNetSuiteVariable}
                    />
                  ))}
                </SortableContext>
              </DndContext>
              
              {/* Add Field Button */}
              <div className="add-field-section">
                <button 
                  type="button" 
                  className="add-field-btn"
                  onClick={handleAddContactField}
                  title="Add new contact field"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="button-section">

            <button className="btn" onClick={handleAIFill}>
              🤖 AI Fill
            </button>
            <button className="btn save-btn" onClick={handleSaveForm}>
              💾 Save Form & Generate XML
            </button>

          </div>

          {/* Change History Display */}
          {changeHistory.length > 0 && (
            <div className="change-history-section">
              <div className="section-header">
                📝 Change History ({changeHistory.length} changes)
                <button className="clear-history-btn" onClick={clearChangeHistory}>
                  🗑️ Clear
                </button>
              </div>
              <div className="change-list">
                {changeHistory.slice(0, 10).map((change, index) => (
                  <div key={`${change.id}-${index}`} className="change-item">
                    <span className="change-time">
                      {new Date(change.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="change-type">{change.type}</span>
                    <span className="change-field">{change.fieldId}</span>
                    <span className="change-old">{change.oldValue || 'empty'}</span>
                    <span className="change-arrow">→</span>
                    <span className="change-new">{change.newValue || 'empty'}</span>
                  </div>
                ))}
                {changeHistory.length > 10 && (
                  <div className="change-more">
                    ... and {changeHistory.length - 10} more changes
                  </div>
                )}
              </div>
            </div>
          )}

          {/* XML Output Modal */}
          {showXMLModal && (
            <div className="xml-modal-overlay" onClick={closeXMLModal}>
              <div className="xml-modal" onClick={(e) => e.stopPropagation()}>
                <div className="xml-modal-header">
                  <h3>📄 Generated XML Output</h3>
                  <button className="xml-modal-close" onClick={closeXMLModal}>×</button>
                </div>
                <div className="xml-modal-content">
                  <div className="xml-output-container">
                    <pre className="xml-code">{xmlOutput}</pre>
                  </div>
                </div>
                <div className="xml-modal-actions">
                  <button className="btn copy-btn" onClick={copyXMLToClipboard}>
                    📋 Copy XML
                  </button>
                  <button className="btn download-btn" onClick={downloadXML}>
                    📥 Download XML
                  </button>
                  <button className="btn netsuite-btn" onClick={handleNetSuiteIntegration}>
                    🔀 Generate NetSuite XML
                  </button>
                  <button className="btn close-btn" onClick={closeXMLModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* NetSuite XML Modal */}
          {showNetSuiteModal && (
            <div className="xml-modal-overlay" onClick={closeNetSuiteModal}>
              <div className="xml-modal" onClick={(e) => e.stopPropagation()}>
                <div className="xml-modal-header">
                  <h3>🔀 NetSuite XML Template</h3>
                  <button className="xml-modal-close" onClick={closeNetSuiteModal}>×</button>
                </div>
                <div className="xml-modal-content">
                  <div className="xml-output-container">
                    <pre className="xml-code">{netSuiteOutput}</pre>
                  </div>
                </div>
                <div className="xml-modal-actions">
                  <button className="btn copy-btn" onClick={copyNetSuiteToClipboard}>
                    📋 Copy NetSuite XML
                  </button>
                  <button className="btn download-btn" onClick={downloadNetSuiteXML}>
                    📥 Download NetSuite XML
                  </button>
                  <button className="btn close-btn" onClick={closeNetSuiteModal}>
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}





        </div>
      </div>
      </DndContext>
      
      {/* Notification Container */}
      <div id="notification-container"></div>
    </div>
  );
}

export default PurchaseOrderForm;
