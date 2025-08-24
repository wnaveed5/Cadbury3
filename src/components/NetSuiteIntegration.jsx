import React, { useState } from 'react';
import { generatePurchaseOrderXML } from '../templates/PurchaseOrderTemplate';
import { generateNetSuiteTemplate, convertToNetSuite } from '../templates/NetSuiteIntegration';

function NetSuiteIntegration({ formData, onNetSuiteGenerated }) {
  const [currentXML, setCurrentXML] = useState('');
  const [netSuiteXML, setNetSuiteXML] = useState('');
  const [isConverting, setIsConverting] = useState(false);
  const [activeTab, setActiveTab] = useState('original'); // 'original' or 'netsuite'

  // Generate original XML first
  const generateOriginalXML = () => {
    try {
      setIsConverting(true);
      const xml = generatePurchaseOrderXML(formData);
      setCurrentXML(xml);
      console.log('📄 Original XML generated successfully');
      return xml;
    } catch (error) {
      console.error('❌ Original XML generation failed:', error);
      setCurrentXML(`Error: ${error.message}`);
      return null;
    } finally {
      setIsConverting(false);
    }
  };

  // Convert to NetSuite format
  const convertToNetSuiteFormat = () => {
    if (!currentXML) {
      alert('Please generate the original XML first');
      return;
    }

    try {
      setIsConverting(true);
      const netSuiteXML = convertToNetSuite(currentXML, formData);
      setNetSuiteXML(netSuiteXML);
      console.log('🔀 NetSuite XML generated successfully');
      
      // Notify parent component
      if (onNetSuiteGenerated) {
        onNetSuiteGenerated(netSuiteXML);
      }
    } catch (error) {
      console.error('❌ NetSuite conversion failed:', error);
      setNetSuiteXML(`Error: ${error.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Generate NetSuite directly from form data
  const generateNetSuiteDirectly = () => {
    try {
      setIsConverting(true);
      const netSuiteXML = generateNetSuiteTemplate(formData);
      setNetSuiteXML(netSuiteXML);
      console.log('🔀 NetSuite XML generated directly from form data');
      
      // Notify parent component
      if (onNetSuiteGenerated) {
        onNetSuiteGenerated(netSuiteXML);
      }
    } catch (error) {
      console.error('❌ Direct NetSuite generation failed:', error);
      setNetSuiteXML(`Error: ${error.message}`);
    } finally {
      setIsConverting(false);
    }
  };

  // Download XML as file
  const downloadXML = (xmlContent, filename) => {
    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="netsuite-integration" style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h2>NetSuite Integration Layer</h2>
      <p>This layer converts your form data to NetSuite-compatible XML format using their FreeMarker syntax.</p>
      
      {/* Control Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={generateOriginalXML}
          disabled={isConverting}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isConverting ? 'not-allowed' : 'pointer',
            opacity: isConverting ? 0.6 : 1
          }}
        >
          {isConverting ? 'Generating...' : '1. Generate Original XML'}
        </button>
        
        <button
          onClick={convertToNetSuiteFormat}
          disabled={!currentXML || isConverting}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: (!currentXML || isConverting) ? 'not-allowed' : 'pointer',
            opacity: (!currentXML || isConverting) ? 0.6 : 1
          }}
        >
          {isConverting ? 'Converting...' : '2. Convert to NetSuite'}
        </button>
        
        <button
          onClick={generateNetSuiteDirectly}
          disabled={isConverting}
          style={{
            padding: '10px 20px',
            backgroundColor: '#ffc107',
            color: 'black',
            border: 'none',
            borderRadius: '5px',
            cursor: isConverting ? 'not-allowed' : 'pointer',
            opacity: isConverting ? 0.6 : 1
          }}
        >
          {isConverting ? 'Generating...' : 'Generate NetSuite Directly'}
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('original')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'original' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'original' ? 'white' : '#333',
            border: '1px solid #dee2e6',
            borderRadius: '5px 0 0 5px',
            cursor: 'pointer'
          }}
        >
          Original XML
        </button>
        <button
          onClick={() => setActiveTab('netsuite')}
          style={{
            padding: '8px 16px',
            backgroundColor: activeTab === 'netsuite' ? '#28a745' : '#f8f9fa',
            color: activeTab === 'netsuite' ? 'white' : '#333',
            border: '1px solid #dee2e6',
            borderRadius: '0 5px 5px 0',
            cursor: 'pointer'
          }}
        >
          NetSuite XML
        </button>
      </div>

      {/* Content Tabs */}
      <div style={{ marginBottom: '20px' }}>
        {activeTab === 'original' && (
          <div>
            <h3>Original XML Output</h3>
            {currentXML ? (
              <div>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  border: '1px solid #dee2e6',
                  borderRadius: '5px',
                  maxHeight: '400px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  marginBottom: '10px'
                }}>
                  <pre>{currentXML}</pre>
                </div>
                <button
                  onClick={() => downloadXML(currentXML, 'purchase-order-original.xml')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Download Original XML
                </button>
              </div>
            ) : (
              <p>Click "Generate Original XML" to create the initial XML output.</p>
            )}
          </div>
        )}

        {activeTab === 'netsuite' && (
          <div>
            <h3>NetSuite XML Output</h3>
            {netSuiteXML ? (
              <div>
                <div style={{ 
                  backgroundColor: '#f8f9fa', 
                  padding: '15px', 
                  border: '1px solid #dee2e6',
                  borderRadius: '5px',
                  maxHeight: '400px',
                  overflow: 'auto',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  marginBottom: '10px'
                }}>
                  <pre>{netSuiteXML}</pre>
                </div>
                <button
                  onClick={() => downloadXML(netSuiteXML, 'purchase-order-netsuite.xml')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  Download NetSuite XML
                </button>
              </div>
            ) : (
              <p>Click "Convert to NetSuite" or "Generate NetSuite Directly" to create the NetSuite-compatible XML.</p>
            )}
          </div>
        )}
      </div>

      {/* Information Panel */}
      <div style={{ 
        backgroundColor: '#e7f3ff', 
        padding: '15px', 
        borderRadius: '5px', 
        border: '1px solid #b3d9ff' 
      }}>
        <h4>NetSuite Integration Features:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><strong>FreeMarker Syntax:</strong> Uses NetSuite's template engine syntax</li>
          <li><strong>NetSuite Variables:</strong> Maps form fields to NetSuite record variables</li>
          <li><strong>Multi-language Support:</strong> Includes CJK and Thai font support</li>
          <li><strong>Header/Footer Macros:</strong> Built-in NetSuite header and footer macros</li>
          <li><strong>Dynamic Content:</strong> Supports conditional rendering with <code>&lt;#if&gt;</code> and <code>&lt;#list&gt;</code></li>
          <li><strong>Professional Styling:</strong> Clean, professional table-based layout</li>
        </ul>
        
        <h4>Key NetSuite Variables Used:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li><code>\${record.tranid}</code> - Transaction ID (PO Number)</li>
          <li><code>\${record.trandate}</code> - Transaction Date</li>
          <li><code>\${record.billaddress}</code> - Vendor Address</li>
          <li><code>\${record.shipaddress}</code> - Ship To Address</li>
          <li><code>\${record.total}</code> - Total Amount</li>
          <li><code>\${item.quantity}</code> - Line Item Quantity</li>
          <li><code>\${item.rate}</code> - Line Item Unit Price</li>
        </ul>
      </div>
    </div>
  );
}

export default NetSuiteIntegration;
