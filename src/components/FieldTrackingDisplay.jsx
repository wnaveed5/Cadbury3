import React from 'react';

function FieldTrackingDisplay({ companyFields, lastModified }) {
  // Handler for copying field data as JSON
  const handleCopyJSON = () => {
    const jsonData = JSON.stringify(companyFields, null, 2);
    navigator.clipboard.writeText(jsonData);
    alert('Field data copied to clipboard!');
  };

  // Format timestamp for display
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="change-tracking-section">
      {/* Tracking Header */}
      <div className="tracking-header">
        <h4>Field Tracking</h4>
        <div className="tracking-controls">
          <span className="field-count">
            Total Fields: {companyFields.length}
          </span>
          <span className="last-modified">
            Last Modified: {formatTimestamp(lastModified)}
          </span>
          <button 
            type="button" 
            className="export-json-btn"
            onClick={handleCopyJSON}
            title="Copy field data as JSON"
          >
            Copy JSON
          </button>
        </div>
      </div>

      {/* Field List */}
      <div className="tracking-content">
        {companyFields.map((field, index) => (
          <div key={field.id} className="tracking-item">
            <span className="tracking-index">#{index + 1}</span>
            <span className="tracking-id">{field.id}</span>
            <span className="tracking-label">{field.label}</span>
            <span className="tracking-placeholder">{field.placeholder}</span>
          </div>
        ))}
      </div>
      
      {/* JSON Data Preview */}
      <div className="json-preview">
        <details>
          <summary>View Raw JSON Data</summary>
          <pre className="json-content">
            {JSON.stringify(companyFields, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}

export default FieldTrackingDisplay;
