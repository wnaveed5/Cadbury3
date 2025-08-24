import React, { useState } from 'react';
import { generatePurchaseOrderXML } from './templates/PurchaseOrderTemplate';

function XMLTestComponent() {
  const [xmlOutput, setXmlOutput] = useState('');
  // Test data for XML generation
  const testData = {
    companyFields: [
      { id: 'company-name', value: '' },
      { id: 'company-address', value: '' },
      { id: 'company-city-state', value: '' },
      { id: 'company-phone', value: '' },
      { id: 'company-fax', value: '' },
      { id: 'company-website', value: '' }
    ],
    purchaseOrderFields: [
      { id: 'po-date', value: '' },
      { id: 'po-number', value: '' }
    ],
    vendorFields: [
      { id: 'vendor-company', value: '' },
      { id: 'vendor-contact', value: '' },
      { id: 'vendor-address', value: '' },
      { id: 'vendor-city-state', value: '' },
      { id: 'vendor-phone', value: '' }
    ],
    shipToFields: [
      { id: 'ship-to-name', value: '' },
      { id: 'ship-to-company', value: '' },
      { id: 'ship-to-address', value: '' },
      { id: 'ship-to-city-state', value: '' },
      { id: 'ship-to-phone', value: '' }
    ],
    lineItems: [
      // Empty array for now
    ],
    requisitioner: '',
    shipVia: '',
    fob: '',
    shippingTerms: '',
    subtotal: '0.00',
    tax: '0.00',
    shipping: '0.00',
    other: '0.00',
    total: '0.00',
    comments: '',
    contactInfo: ''
  };

  const generateXML = () => {
    try {
      const xml = generatePurchaseOrderXML(testData);
      setXmlOutput(xml);
              console.log('XML generated successfully:', xml);
    } catch (error) {
              console.error('Error generating XML:', error);
      setXmlOutput(`Error: ${error.message}`);
    }
  };

  const updateTestData = (field, value) => {
    setTestData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateCompanyField = (fieldId, value) => {
    setTestData(prev => ({
      ...prev,
      companyFields: prev.companyFields.map(field => 
        field.id === fieldId ? { ...field, value } : field
      )
    }));
  };

  const updatePOField = (fieldId, value) => {
    setTestData(prev => ({
      ...prev,
      purchaseOrderFields: prev.purchaseOrderFields.map(field => 
        field.id === fieldId ? { ...field, value } : field
      )
    }));
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>XML Template Test Component</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h3>Test Data Controls</h3>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Company Name: </label>
          <input 
            type="text" 
            value={testData.companyFields.find(f => f.id === 'company-name')?.value || ''}
            onChange={(e) => updateCompanyField('company-name', e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>PO Number: </label>
          <input 
            type="text" 
            value={testData.purchaseOrderFields.find(f => f.id === 'po-number')?.value || ''}
            onChange={(e) => updatePOField('po-number', e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Comments: </label>
          <input 
            type="text" 
            value={testData.comments || ''}
            onChange={(e) => updateTestData('comments', e.target.value)}
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </div>
        
        <button 
          onClick={generateXML}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Generate XML
        </button>
      </div>

      {xmlOutput && (
        <div>
          <h3>Generated XML Output:</h3>
          <div style={{ 
            backgroundColor: '#f8f9fa', 
            padding: '15px', 
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            maxHeight: '400px',
            overflow: 'auto',
            fontFamily: 'monospace',
            fontSize: '12px'
          }}>
            <pre>{xmlOutput}</pre>
          </div>
          
          <div className="validation-results">
            <h3>XML Validation Results:</h3>
            <ul>
                      <li>Company name populated: {xmlOutput.includes('[Company Name]') ? 'No (showing placeholder)' : 'Yes'}</li>
        <li>Company address populated: {xmlOutput.includes('[Street Address]') ? 'No (showing placeholder)' : 'Yes'}</li>
        <li>Company city/state populated: {xmlOutput.includes('[City, ST ZIP]') ? 'No (showing placeholder)' : 'Yes'}</li>
        <li>PO date populated: {xmlOutput.includes('MM/DD/YYYY') ? 'No (showing placeholder)' : 'Yes'}</li>
        <li>PO number populated: {xmlOutput.includes('[PO Number]') ? 'No (showing placeholder)' : 'Yes'}</li>
        <li>Vendor company populated: {xmlOutput.includes('[Company Name]') ? 'No (showing placeholder)' : 'Yes'}</li>
        <li>Ship-to name populated: {xmlOutput.includes('[Contact Name]') ? 'No (showing placeholder)' : 'Yes'}</li>
        <li>Line items present: {xmlOutput.includes('item-cell') ? 'Yes' : 'No'}</li>
        <li>Totals section present: {xmlOutput.includes('total-label') ? 'Yes' : 'No'}</li>
        <li>Comments section present: {xmlOutput.includes('comments-header') ? 'Yes' : 'No'}</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default XMLTestComponent;
