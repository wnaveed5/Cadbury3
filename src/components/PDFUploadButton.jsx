import React, { useState } from 'react';

function FileUploadButton({ onAnalysisComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type - accept both PDF and PNG
    const allowedTypes = ['application/pdf', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      setUploadStatus('❌ Please select a PDF or PNG file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setUploadStatus('❌ File size must be less than 10MB');
      return;
    }

    setIsUploading(true);
    setUploadStatus('📤 Uploading PDF...');

    try {
      const formData = new FormData();
      formData.append('pdf', file);

      const response = await fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const analysisResult = await response.json();
      setUploadStatus('✅ Analysis complete!');
      
      // Call the callback to update the frontend
      onAnalysisComplete(analysisResult);
      
    } catch (error) {
      console.error('PDF analysis failed:', error);
      setUploadStatus('❌ Analysis failed: ' + error.message);
    } finally {
      setIsUploading(false);
      // Clear status after 3 seconds
      setTimeout(() => setUploadStatus(''), 3000);
    }
  };

  return (
    <div className="pdf-upload-container" style={{
      position: 'absolute',
      top: '10px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
      zIndex: 1000
    }}>
      {/* Upload Button */}
      <label 
        htmlFor="pdf-upload" 
        className="pdf-upload-button"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '10px 16px',
          backgroundColor: '#8b5cf6',
          color: 'white',
          borderRadius: '8px',
          cursor: isUploading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          opacity: isUploading ? 0.6 : 1,
          transition: 'all 0.2s ease',
          boxShadow: '0 2px 8px rgba(139, 92, 246, 0.3)',
          border: 'none'
        }}
        title="Upload PDF or PNG to analyze structure and colors"
      >
        {isUploading ? '⏳' : '📄'} 
        {isUploading ? 'Analyzing...' : 'Upload File'}
      </label>
      
      <input
        id="pdf-upload"
        type="file"
        accept=".pdf,.png"
        onChange={handleFileUpload}
        disabled={isUploading}
        style={{ display: 'none' }}
      />

      {/* Status Message */}
      {uploadStatus && (
        <div className="upload-status" style={{
          fontSize: '12px',
          color: uploadStatus.includes('❌') ? '#ef4444' : 
                 uploadStatus.includes('✅') ? '#10b981' : '#6b7280',
          textAlign: 'center',
          maxWidth: '200px',
          wordWrap: 'break-word'
        }}>
          {uploadStatus}
        </div>
      )}
    </div>
  );
}

export default FileUploadButton;
