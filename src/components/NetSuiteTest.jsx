import React, { useState } from 'react';
import { generateNetSuiteTemplate } from '../templates/NetSuiteIntegration';

function NetSuiteTest() {
  const [testOutput, setTestOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Test data that mimics the form structure
  const testFormData = {
    companyFields: [
      { id: 'company-name', value: 'Test Company Inc.', label: 'Company Name' },
      { id: 'company-address', value: '123 Business St', label: 'Address' },
      { id: 'company-city-state', value: 'New York, NY 10001', label: 'City, State ZIP' },
      { id: 'company-phone', value: '(555) 123-4567', label: 'Phone' },
      { id: 'company-fax', value: '(555) 123-4568', label: 'Fax' },
      { id: 'company-website', value: 'www.testcompany.com', label: 'Website' }
    ],
    purchaseOrderFields: [
      { id: 'po-title', value: 'PURCHASE ORDER', label: 'Title' },
      { id: 'po-number', value: 'PO-2024-001', label: 'PO Number' },
      { id: 'po-date', value: '12/15/2024', label: 'Date' },
      { id: 'po-delivery-date', value: '01/15/2025', label: 'Delivery Date' },
      { id: 'po-payment-terms', value: 'Net 30', label: 'Payment Terms' },
      { id: 'po-due-date', value: '01/15/2025', label: 'Due Date' }
    ],
    vendorFields: [
      { id: 'vendor-company', value: 'Vendor Corp', label: 'Vendor Company' },
      { id: 'vendor-contact', value: 'John Vendor', label: 'Contact Person' },
      { id: 'vendor-address', value: '456 Vendor Ave', label: 'Address' },
      { id: 'vendor-city-state', value: 'Vendor City, VC 12345', label: 'City, State ZIP' },
      { id: 'vendor-phone', value: '(555) 987-6543', label: 'Phone' },
      { id: 'vendor-fax', value: '(555) 987-6544', label: 'Fax' }
    ],
    shipToFields: [
      { id: 'ship-to-name', value: 'Ship To Contact', label: 'Contact Name' },
      { id: 'ship-to-company', value: 'Ship To Company', label: 'Company' },
      { id: 'ship-to-address', value: '789 Ship St', label: 'Address' },
      { id: 'ship-to-city-state', value: 'Ship City, SC 67890', label: 'City, State ZIP' },
      { id: 'ship-to-phone', value: '(555) 456-7890', label: 'Phone' }
    ],
    shippingFields: {
      'ship-via': 'FedEx Ground',
      'fob': 'Origin',
      'shipping-terms': 'FOB Origin'
    },
    totalsFields: [
      { id: 'subtotal', value: '$1,000.00', label: 'Subtotal' },
      { id: 'tax', value: '$80.00', label: 'Tax' },
      { id: 'shipping', value: '$25.00', label: 'Shipping' },
      { id: 'other', value: '$0.00', label: 'Other' },
      { id: 'total', value: '$1,105.00', label: 'Total' }
    ],
    commentsFields: [
      { id: 'comments', value: 'Please deliver to loading dock', label: 'Comments' }
    ],
    contactFields: [
      { id: 'contact-main', value: 'Jane Requester', label: 'Contact Person' }
    ],
    subtotal: '$1,000.00',
    tax: '$80.00',
    shipping: '$25.00',
    other: '$0.00',
    total: '$1,105.00',
    comments: 'Please deliver to loading dock',
    contactInfo: 'Jane Requester'
  };

  const testNetSuiteGeneration = async () => {
    try {
      setIsGenerating(true);
      console.log('🧪 Testing NetSuite generation with data:', testFormData);
      
      // Test with minimal data first
      const minimalData = {
        companyFields: testFormData.companyFields,
        purchaseOrderFields: testFormData.purchaseOrderFields,
        vendorFields: testFormData.vendorFields,
        shipToFields: testFormData.shipToFields
      };
      
      const netSuiteXML = generateNetSuiteTemplate(minimalData);
      setTestOutput(netSuiteXML);
      
      console.log('✅ NetSuite test successful');
      console.log('📄 Generated XML length:', netSuiteXML.length);
      console.log('📄 First 500 chars:', netSuiteXML.substring(0, 500));
      
    } catch (error) {
      console.error('❌ NetSuite test failed:', error);
      setTestOutput(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadTestXML = () => {
    if (!testOutput || testOutput.startsWith('Error:')) return;
    
    const blob = new Blob([testOutput], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'netsuite-test-template.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>🧪 NetSuite Integration Test</h1>
      <p>This component tests the NetSuite integration layer with sample form data.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={testNetSuiteGeneration}
          disabled={isGenerating}
          style={{
            padding: '12px 24px',
            backgroundColor: isGenerating ? '#6b7280' : '#7c3aed',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: isGenerating ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          {isGenerating ? '🔄 Generating...' : '🧪 Test NetSuite Generation'}
        </button>
        
        {testOutput && !testOutput.startsWith('Error:') && (
          <button
            onClick={downloadTestXML}
            style={{
              padding: '12px 24px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            📥 Download Test XML
          </button>
        )}
      </div>

      {testOutput && (
        <div>
          <h3>Test Results:</h3>
          <div style={{ 
            backgroundColor: testOutput.startsWith('Error:') ? '#fef2f2' : '#f0f9ff',
            padding: '15px',
            border: `1px solid ${testOutput.startsWith('Error:') ? '#fecaca' : '#bae6fd'}`,
            borderRadius: '5px',
            marginBottom: '20px'
          }}>
            {testOutput.startsWith('Error:') ? (
              <p style={{ color: '#dc2626', margin: 0 }}>{testOutput}</p>
            ) : (
              <p style={{ color: '#0369a1', margin: 0 }}>
                ✅ NetSuite template generated successfully! 
                Length: {testOutput.length} characters
              </p>
            )}
          </div>
          
          {!testOutput.startsWith('Error:') && (
            <div>
              <h4>Generated NetSuite Template:</h4>
              <div style={{ 
                backgroundColor: '#f8f9fa',
                padding: '15px',
                border: '1px solid #dee2e6',
                borderRadius: '5px',
                maxHeight: '500px',
                overflow: 'auto',
                fontFamily: 'monospace',
                fontSize: '12px'
              }}>
                <pre>{testOutput}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      <div style={{ 
        backgroundColor: '#f0f9ff',
        padding: '15px',
        borderRadius: '5px',
        border: '1px solid #bae6fd',
        marginTop: '20px'
      }}>
        <h4>Test Data Used:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>Company:</strong> Test Company Inc. with sample address and contact info</li>
          <li><strong>Purchase Order:</strong> PO-2024-001 with dates and terms</li>
          <li><strong>Vendor:</strong> Vendor Corp with sample vendor details</li>
          <li><strong>Ship To:</strong> Ship To Company with shipping address</li>
          <li><strong>Totals:</strong> Sample financial amounts</li>
          <li><strong>Comments:</strong> Sample delivery instructions</li>
        </ul>
        
        <h4>Expected NetSuite Variables:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><code>\${companyInformation.companyName}</code> → Test Company Inc.</li>
          <li><code>\${record.tranid}</code> → PO-2024-001</li>
          <li><code>\${record.trandate}</code> → 12/15/2024</li>
          <li><code>\${record.billaddress}</code> → Vendor address</li>
          <li><code>\${record.shipaddress}</code> → Ship to address</li>
          <li><code>\${record.total}</code> → $1,105.00</li>
        </ul>
      </div>
    </div>
  );
}

export default NetSuiteTest;
