import React, { useState } from 'react';

const PurchaseOrderSync = () => {
  const [formData, setFormData] = useState({
    // Company Info Fields
    companyName: '',
    companyAddress: '',
    companyCityState: '',
    companyPhone: '',
    companyFax: '',
    companyWebsite: '',
    
    // Purchase Order Fields
    poDate: '',
    poNumber: '',
    
    // Vendor Fields
    vendorCompany: '',
    vendorContact: '',
    vendorAddress: '',
    vendorCityState: '',
    vendorPhone: '',
    
    // Ship To Fields
    shipToName: '',
    shipToCompany: '',
    shipToAddress: '',
    shipToCityState: '',
    shipToPhone: '',
    
    // Shipping Details
    requisitioner: '',
    shipVia: '',
    fob: '',
    shippingTerms: '',
    
    // Line Items (5 rows)
    items: [
      { itemNumber: '', description: '', qty: '', rate: '', amount: '' },
      { itemNumber: '', description: '', qty: '', rate: '', amount: '' },
      { itemNumber: '', description: '', qty: '', rate: '', amount: '' },
      { itemNumber: '', description: '', qty: '', rate: '', amount: '' },
      { itemNumber: '', description: '', qty: '', rate: '', amount: '' }
    ],
    
    // Comments and Totals
    comments: '',
    tax: '',
    shipping: '',
    other: '',
    contactInfo: ''
  });

  const updateField = (fieldPath, value) => {
    setFormData(prev => {
      if (fieldPath.includes('.')) {
        // Handle nested updates for items array
        const [section, index, field] = fieldPath.split('.');
        return {
          ...prev,
          [section]: prev[section].map((item, i) => 
            i === parseInt(index) ? { ...item, [field]: value } : item
          )
        };
      } else {
        // Handle direct field updates
        return { ...prev, [fieldPath]: value };
      }
    });
  };

  return (
    <div className="purchase-order-sync">
      {/* React Controls Section */}
      <div className="controls-section" style={{padding: '20px', backgroundColor: '#f8f9fa', marginBottom: '20px'}}>
        <h3>Purchase Order Controls</h3>
        
        {/* Company Info Controls */}
        <div className="form-group" style={{marginBottom: '20px'}}>
          <h4>Company Information</h4>
          <input
            type="text"
            placeholder="Company Name"
            value={formData.companyName}
            onChange={(e) => updateField('companyName', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Company Address"
            value={formData.companyAddress}
            onChange={(e) => updateField('companyAddress', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="City, ST ZIP"
            value={formData.companyCityState}
            onChange={(e) => updateField('companyCityState', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Phone"
            value={formData.companyPhone}
            onChange={(e) => updateField('companyPhone', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Fax"
            value={formData.companyFax}
            onChange={(e) => updateField('companyFax', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Website"
            value={formData.companyWebsite}
            onChange={(e) => updateField('companyWebsite', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
        </div>
        
        {/* Purchase Order Controls */}
        <div className="form-group" style={{marginBottom: '20px'}}>
          <h4>Purchase Order Details</h4>
          <input
            type="date"
            value={formData.poDate}
            onChange={(e) => updateField('poDate', e.target.value)}
            style={{margin: '5px', padding: '8px'}}
          />
          <input
            type="text"
            placeholder="PO Number"
            value={formData.poNumber}
            onChange={(e) => updateField('poNumber', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '150px'}}
          />
        </div>
        
        {/* Vendor Controls */}
        <div className="form-group" style={{marginBottom: '20px'}}>
          <h4>Vendor Information</h4>
          <input
            type="text"
            placeholder="Vendor Company"
            value={formData.vendorCompany}
            onChange={(e) => updateField('vendorCompany', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Vendor Contact"
            value={formData.vendorContact}
            onChange={(e) => updateField('vendorContact', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Vendor Address"
            value={formData.vendorAddress}
            onChange={(e) => updateField('vendorAddress', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Vendor City/State"
            value={formData.vendorCityState}
            onChange={(e) => updateField('vendorCityState', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Vendor Phone"
            value={formData.vendorPhone}
            onChange={(e) => updateField('vendorPhone', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
        </div>
        
        {/* Ship To Controls */}
        <div className="form-group" style={{marginBottom: '20px'}}>
          <h4>Ship To Information</h4>
          <input
            type="text"
            placeholder="Ship To Name"
            value={formData.shipToName}
            onChange={(e) => updateField('shipToName', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Ship To Company"
            value={formData.shipToCompany}
            onChange={(e) => updateField('shipToCompany', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Ship To Address"
            value={formData.shipToAddress}
            onChange={(e) => updateField('shipToAddress', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Ship To City/State"
            value={formData.shipToCityState}
            onChange={(e) => updateField('shipToCityState', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
          <input
            type="text"
            placeholder="Ship To Phone"
            value={formData.shipToPhone}
            onChange={(e) => updateField('shipToPhone', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '200px'}}
          />
        </div>
        
        {/* Shipping Details Controls */}
        <div className="form-group" style={{marginBottom: '20px'}}>
          <h4>Shipping Details</h4>
          <input
            type="text"
            placeholder="Requisitioner"
            value={formData.requisitioner}
            onChange={(e) => updateField('requisitioner', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '150px'}}
          />
          <input
            type="text"
            placeholder="Ship Via"
            value={formData.shipVia}
            onChange={(e) => updateField('shipVia', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '150px'}}
          />
          <input
            type="text"
            placeholder="F.O.B."
            value={formData.fob}
            onChange={(e) => updateField('fob', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '150px'}}
          />
          <input
            type="text"
            placeholder="Shipping Terms"
            value={formData.shippingTerms}
            onChange={(e) => updateField('shippingTerms', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '150px'}}
          />
        </div>
        
        {/* Item Controls */}
        <div className="form-group" style={{marginBottom: '20px'}}>
          <h4>Line Items</h4>
          {formData.items.map((item, index) => (
            <div key={index} className="item-row" style={{marginBottom: '10px', padding: '10px', border: '1px solid #ddd', borderRadius: '4px'}}>
              <span style={{fontWeight: 'bold', marginRight: '10px'}}>Row {index + 1}:</span>
              <input
                type="text"
                placeholder="Item Number"
                value={item.itemNumber}
                onChange={(e) => updateField(`items.${index}.itemNumber`, e.target.value)}
                style={{margin: '2px', padding: '5px', width: '120px'}}
              />
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => updateField(`items.${index}.description`, e.target.value)}
                style={{margin: '2px', padding: '5px', width: '200px'}}
              />
              <input
                type="number"
                placeholder="Qty"
                value={item.qty}
                onChange={(e) => updateField(`items.${index}.qty`, e.target.value)}
                style={{margin: '2px', padding: '5px', width: '80px'}}
              />
              <input
                type="text"
                placeholder="Rate"
                value={item.rate}
                onChange={(e) => updateField(`items.${index}.rate`, e.target.value)}
                style={{margin: '2px', padding: '5px', width: '100px'}}
              />
              <input
                type="text"
                placeholder="Amount"
                value={item.amount}
                onChange={(e) => updateField(`items.${index}.amount`, e.target.value)}
                style={{margin: '2px', padding: '5px', width: '100px'}}
              />
            </div>
          ))}
        </div>
        
        {/* Comments and Totals Controls */}
        <div className="form-group" style={{marginBottom: '20px'}}>
          <h4>Comments and Totals</h4>
          <textarea
            placeholder="Comments"
            value={formData.comments}
            onChange={(e) => updateField('comments', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '400px', height: '60px'}}
          />
          <br />
          <input
            type="text"
            placeholder="Tax"
            value={formData.tax}
            onChange={(e) => updateField('tax', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '100px'}}
          />
          <input
            type="text"
            placeholder="Shipping"
            value={formData.shipping}
            onChange={(e) => updateField('shipping', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '100px'}}
          />
          <input
            type="text"
            placeholder="Other"
            value={formData.other}
            onChange={(e) => updateField('other', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '100px'}}
          />
          <br />
          <input
            type="text"
            placeholder="Contact Information"
            value={formData.contactInfo}
            onChange={(e) => updateField('contactInfo', e.target.value)}
            style={{margin: '5px', padding: '8px', width: '300px'}}
          />
        </div>
      </div>
      
      
        <table className="container">
          <tr>
            <td style={{padding: '40px 50px'}}>
              {/* Header Section - Now Draggable */}
              <div className="section-container" style={{position: 'relative'}}>
                <div className="section-drag-handle" style={{position: 'absolute', left: '-40px', top: '50%', transform: 'translateY(-50%)', cursor: 'grab', color: '#6b7280', fontSize: '16px', opacity: '0.8', transition: 'opacity 0.2s', userSelect: 'none', fontFamily: 'monospace', fontWeight: 'bold', background: 'white', padding: '8px 10px', borderRadius: '8px', border: '2px solid #6b7280', boxShadow: '0 2px 6px rgba(0,0,0,0.1)'}} title="Drag to reorder section">::</div>
                <table className="header-section" style={{width: '100%', marginBottom: '40px'}}>
                  <tr className="draggable-header-row">
                    <td className="header-cell company-info" style={{width: '50%', verticalAlign: 'top'}} data-section="company-info">
                    <table style={{width: '100%'}}>
                      <tr>
                        <td style={{paddingTop: '15px'}}>
                          <div className="company-fields-container" id="company-fields-sortable">
                            <div className="field-item" data-field="company-name" data-id="company-name">
                              <div className="field-content">
                                <span className="field-label">Company Name:</span>
                                <span className="field-drag-handle" title="Drag to reorder field">⋮⋮</span>
                                <span id="company-name" className="editable-field">{formData.companyName || "Enter company name"}</span>
                              </div>
                            </div>
                            <div className="field-item" data-field="company-address" data-id="company-address">
                              <div className="field-content">
                                <span className="field-label">Street Address:</span>
                                <span className="field-drag-handle" title="Drag to reorder field">⋮⋮</span>
                                <span id="company-address" className="editable-field">{formData.companyAddress || "Enter street address"}</span>
                              </div>
                            </div>
                            <div className="field-item" data-field="company-city-state" data-id="company-city-state">
                              <div className="field-content">
                                <span className="field-label">City, ST ZIP:</span>
                                <span className="field-drag-handle" title="Drag handle">⋮⋮</span>
                                <span id="company-city-state" className="editable-field">{formData.companyCityState || "City, State ZIP"}</span>
                              </div>
                            </div>
                            <div className="field-item" data-field="company-phone" data-id="company-phone">
                              <div className="field-content">
                                <span className="field-label">Phone:</span>
                                <span className="field-drag-handle" title="Drag to reorder field">⋮⋮</span>
                                <span id="company-phone" className="editable-field">{formData.companyPhone || "(555) 123-4567"}</span>
                              </div>
                            </div>
                            <div className="field-item" data-field="company-fax" data-id="company-fax">
                              <div className="field-content">
                                <span className="field-label">Fax:</span>
                                <span className="field-drag-handle" title="Drag to reorder field">⋮⋮</span>
                                <span id="company-fax" className="editable-field">{formData.companyFax || "(555) 123-4567"}</span>
                              </div>
                            </div>
                            <div className="field-item" data-field="company-website" data-id="company-website">
                              <div className="field-content">
                                <span className="field-label">Website:</span>
                                <span className="field-drag-handle" title="Drag to reorder field">⋮⋮</span>
                                <span id="company-website" className="editable-field">{formData.companyWebsite || "www.example.com"}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  
                  <td className="header-cell purchase-order" style={{width: '50%', textAlign: 'center', verticalAlign: 'top'}} data-section="purchase-order">
                    <table style={{width: '100%'}}>
                      <tr>
                        <td style={{textAlign: 'center', fontSize: '32px', fontWeight: 'bold', color: '#000000', padding: '10px 0'}}>
                          Purchase Order
                        </td>
                      </tr>
                      <tr>
                        <td style={{paddingTop: '10px'}}>
                          <table style={{width: '100%'}}>
                            <tr>
                              <td style={{textAlign: 'right', paddingRight: '10px', padding: '8px 10px 8px 0', fontWeight: 'bold', fontSize: '12px'}}>DATE:</td>
                              <td style={{fontSize: '12px', padding: '8px 0'}}><span id="po-date" className="editable-field">{formData.poDate || "MM/DD/YYYY"}</span></td>
                            </tr>
                            <tr>
                              <td style={{textAlign: 'right', paddingRight: '10px', padding: '8px 10px 8px 0', fontWeight: 'bold', fontSize: '12px'}}>PO #:</td>
                              <td style={{fontSize: '12px', padding: '8px 0'}}><span id="po-number" className="editable-field">{formData.poNumber || "PO#123456"}</span></td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              </div>
              
              {/* Vendor and Ship To Section - Draggable Container */}
              <div className="draggable-vendor-section" draggable="true" data-section="vendor-container" style={{marginBottom: '35px', position: 'relative'}}>
                <div className="vendor-drag-handle" style={{position: 'absolute', left: '-35px', top: '50%', transform: 'translateY(-50%)', cursor: 'grab', color: '#10b981', fontSize: '14px', zIndex: '10', opacity: '1', background: 'white', padding: '6px 8px', borderRadius: '8px', border: '2px solid #10b981', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', transition: 'all 0.2s', userSelect: 'none', fontFamily: 'monospace', fontWeight: 'bold'}} title="Drag to move vendor section">⋮⋮</div>
                <table style={{width: '100%', tableLayout: 'fixed'}}>
                <tr className="draggable-vendor-row">
                  <td className="vendor-cell vendor-section" style={{width: '50%', paddingRight: '5px', verticalAlign: 'top'}} data-section="vendor">
                    <table style={{width: '100%', border: '1px solid #e5e7eb'}}>
                      <tr>
                        <td className="section-header">VENDOR</td>
                      </tr>
                      <tr>
                        <td style={{padding: '10px', height: '100px', verticalAlign: 'top'}}>
                          <div style={{fontSize: '11px', lineHeight: '1.3'}}>
                            <div style={{marginBottom: '3px'}}>Company: <span id="vendor-company" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.vendorCompany || "Vendor name"}</span></div>
                            <div style={{marginBottom: '3px'}}>Contact: <span id="vendor-contact" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.vendorContact || "Contact person"}</span></div>
                            <div style={{marginBottom: '3px'}}>Address: <span id="vendor-address" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.vendorAddress || "Street address"}</span></div>
                            <div style={{marginBottom: '3px'}}>City/State: <span id="vendor-city-state" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.vendorCityState || "City, ST ZIP"}</span></div>
                            <div style={{marginBottom: '3px'}}>Phone: <span id="vendor-phone" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.vendorPhone || "(555) 123-4567"}</span></div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                  
                  <td className="vendor-cell ship-to-section" style={{width: '50%', paddingLeft: '5px', verticalAlign: 'top'}} data-section="ship-to">
                    <table style={{width: '100%', border: '1px solid #e5e7eb'}}>
                      <tr>
                        <td className="section-header">SHIP TO</td>
                      </tr>
                      <tr>
                        <td style={{padding: '10px', height: '100px', verticalAlign: 'top'}}>
                          <div style={{fontSize: '11px', lineHeight: '1.3'}}>
                            <div style={{marginBottom: '3px'}}>Name: <span id="ship-to-name" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.shipToName || "Contact name"}</span></div>
                            <div style={{marginBottom: '3px'}}>Company: <span id="ship-to-company" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.shipToCompany || "Shipping company"}</span></div>
                            <div style={{marginBottom: '3px'}}>Address: <span id="ship-to-address" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.shipToAddress || "Street address"}</span></div>
                            <div style={{marginBottom: '3px'}}>City/State: <span id="ship-to-city-state" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.shipToCityState || "City, ST ZIP"}</span></div>
                            <div style={{marginBottom: '3px'}}>Phone: <span id="ship-to-phone" className="editable-field" style={{fontWeight: 'normal', fontSize: '11px'}}>{formData.shipToPhone || "(555) 123-4567"}</span></div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                </table>
              </div>
              
              {/* Shipping Details Row - Draggable */}
              <div className="draggable-shipping-section" draggable="true" data-section="shipping" style={{marginBottom: '30px', position: 'relative'}}>
                <div className="shipping-drag-handle" style={{position: 'absolute', left: '-35px', top: '50%', transform: 'translateY(-50%)', cursor: 'grab', color: '#3b82f6', fontSize: '14px', zIndex: '10', opacity: '1', background: 'white', padding: '6px 8px', borderRadius: '8px', border: '2px solid #3b82f6', boxShadow: '0 2px 6px rgba(0,0,0,0.15)', transition: 'all 0.2s', userSelect: 'none', fontFamily: 'monospace', fontWeight: 'bold'}} title="Drag to move shipping section">⋮⋮</div>
                <table className="shipping-details" style={{width: '100%', border: '1px solid #e5e7eb'}}>
                  <tr>
                    <td className="section-header" style={{width: '25%'}}>REQUISITIONER</td>
                    <td className="section-header" style={{width: '25%'}}>SHIP VIA</td>
                    <td className="section-header" style={{width: '25%'}}>F.O.B.</td>
                    <td className="section-header" style={{width: '25%'}}>SHIPPING TERMS</td>
                  </tr>
                  <tr>
                    <td style={{padding: '10px', height: '50px', borderRight: '1px solid #e5e7eb', verticalAlign: 'top'}}>
                      <span className="editable-field" style={{fontSize: '12px'}}>{formData.requisitioner || "Requisitioner name"}</span>
                    </td>
                    <td style={{padding: '10px', height: '50px', borderRight: '1px solid #e5e7eb', verticalAlign: 'top'}}>
                      <span className="editable-field" style={{fontSize: '12px'}}>{formData.shipVia || "Shipping method"}</span>
                    </td>
                    <td style={{padding: '10px', height: '50px', borderRight: '1px solid #e5e7eb', verticalAlign: 'top'}}>
                      <span className="editable-field" style={{fontSize: '12px'}}>{formData.fob || "FOB terms"}</span>
                    </td>
                    <td style={{padding: '10px', height: '50px', verticalAlign: 'top'}}>
                      <span className="editable-field" style={{fontSize: '12px'}}>{formData.shippingTerms || "Shipping terms"}</span>
                    </td>
                  </tr>
                </table>
              </div>
              
              {/* Items Table - NetSuite Compatible Structure */}
              <table className="itemtable" style={{width: '100%', marginBottom: '40px', border: '1px solid #e5e7eb'}}>
                {/* Header Row with NetSuite-style column spans */}
                <thead>
                  <tr>
                    <th style={{width: '40px', background: '#333333', color: 'white', padding: '12px', fontWeight: 'bold', textAlign: 'center', fontSize: '10px'}}></th>
                    <th colSpan="3" style={{background: '#333333', color: 'white', padding: '12px', fontWeight: 'bold'}}>:: Item#</th>
                    <th colSpan="12" style={{background: '#333333', color: 'white', padding: '12px', fontWeight: 'bold'}}>:: Description</th>
                    <th colSpan="2" align="center" style={{background: '#333333', color: 'white', padding: '12px', fontWeight: 'bold'}}>:: Qty</th>
                    <th colSpan="3" align="right" style={{background: '#333333', color: 'white', padding: '12px', fontWeight: 'bold'}}>:: Rate</th>
                    <th colSpan="3" align="right" style={{background: '#333333', color: 'white', padding: '12px', fontWeight: 'bold'}}>:: Amount</th>
                  </tr>
                </thead>
                
                {/* Dynamic Item Rows */}
                {formData.items.map((item, index) => (
                  <tr key={index} className="draggable-row">
                    <td style={{padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', lineHeight: '150%', background: '#f8f9fa', cursor: 'default', fontWeight: 'bold', color: '#666', fontSize: '10px'}}></td>
                    <td colSpan="3" style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>
                      <span className="editable-field">{item.itemNumber || "Item number"}</span>
                    </td>
                    <td colSpan="12" style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>
                      <span className="editable-field">{item.description || "Item description"}</span>
                    </td>
                    <td colSpan="2" style={{padding: '10px', borderBottom: '1px solid #e5e7eb', textAlign: 'center', lineHeight: '150%'}}>
                      <span className="editable-field">{item.qty || "Qty"}</span>
                    </td>
                    <td colSpan="3" align="right" style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>
                      <span className="editable-field">{item.rate || "$0.00"}</span>
                    </td>
                    <td colSpan="3" align="right" style={{padding: '10px', borderBottom: '1px solid #e5e7eb'}}>
                      <span className="editable-field">{item.amount || "$0.00"}</span>
                    </td>
                  </tr>
                ))}
              </table>
              
              {/* Summary and Comments Section */}
              <table style={{width: '100%', marginBottom: '30px'}}>
                <tr className="draggable-comments-row">
                  <td className="comments-cell comments-section" style={{width: '70%', paddingRight: '25px', verticalAlign: 'top'}} data-section="comments" draggable="true">
                    <table style={{width: '100%', border: '1px solid #e5e7eb'}}>
                      <tr>
                        <td className="section-header">Comments or Special Instructions</td>
                      </tr>
                      <tr>
                        <td style={{padding: '15px', height: '120px'}}>
                          <span id="comments-field" className="editable-field" style={{display: 'block', width: '100%', height: '100%'}}>{formData.comments || "Enter comments or special instructions..."}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                  
                  <td className="comments-cell totals-section" style={{width: '30%', paddingLeft: '25px', verticalAlign: 'top'}} data-section="totals" draggable="true">
                    <table style={{width: '100%', border: '1px solid #e5e7eb'}}>
                      <tr>
                        <td style={{padding: '15px'}}>
                          <table style={{width: '100%'}}>
                            <tr>
                              <td style={{padding: '8px 0', fontWeight: 'bold', color: '#000000'}}>SUBTOTAL:</td>
                              <td style={{textAlign: 'right', padding: '8px 0', color: '#000000'}}><span id="totals-subtotal" className="calculated-field" style={{backgroundColor: '#f8f9fa', padding: '3px 6px', borderRadius: '3px', border: '1px solid #e9ecef'}} data-placeholder=""></span></td>
                            </tr>
                            <tr>
                              <td style={{padding: '8px 0', fontWeight: 'bold', color: '#000000'}}>TAX:</td>
                              <td style={{textAlign: 'right', padding: '8px 0', color: '#000000'}}><span id="totals-tax" className="editable-field">{formData.tax || "$0.00"}</span></td>
                            </tr>
                            <tr>
                              <td style={{padding: '8px 0', fontWeight: 'bold', color: '#000000'}}>SHIPPING:</td>
                              <td style={{textAlign: 'right', padding: '8px 0', color: '#000000'}}><span id="totals-shipping" className="editable-field">{formData.shipping || "$0.00"}</span></td>
                            </tr>
                            <tr>
                              <td style={{padding: '8px 0', fontWeight: 'bold', color: '#000000'}}>OTHER:</td>
                              <td style={{textAlign: 'right', padding: '8px 0', color: '#000000'}}><span id="totals-other" className="editable-field">{formData.other || "$0.00"}</span></td>
                            </tr>
                            <tr>
                              <td colSpan="2" style={{paddingTop: '15px'}}>
                                <table style={{width: '100%', textAlign: 'center', color: '#000000'}}>
                                  <tr>
                                    <td>TOTAL: <span id="totals-total" className="calculated-field total-field" style={{backgroundColor: '#f8f9fa', padding: '3px 6px', borderRadius: '3px', border: '1px solid #e9ecef', fontWeight: 'bold'}} data-placeholder=""></span></td>
                                  </tr>
                                </table>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              
              {/* Contact Information Section */}
              <table style={{width: '100%', marginBottom: '30px', borderTop: '2px solid #333333', paddingTop: '20px'}}>
                <tr>
                  <td style={{textAlign: 'center', padding: '20px'}}>
                    <strong>Contact Information:</strong><br />
                    <span className="editable-field">{formData.contactInfo || "Enter contact information here"}</span>
                  </td>
                </tr>
              </table>
              

            </td>
          </tr>
        </table>
      </div>
    </div>
  );
};

export default PurchaseOrderSync;
