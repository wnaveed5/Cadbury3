import React, { useState } from 'react';
import { useAIProvider } from '../hooks/useAIProvider';
import Tesseract from 'tesseract.js';

function FileUploadButton({ onAnalysisComplete }) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const { analyzeFile } = useAIProvider();

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
    setUploadStatus('📤 Analyzing file...');

    try {
      let fileContent = '';
      
      if (file.type === 'application/pdf') {
        // For PDF, we'll extract text content
        setUploadStatus('📄 Extracting PDF content...');
        // For now, use basic info since PDF text extraction requires additional libraries
        fileContent = `[PDF File: ${file.name}, Size: ${file.size} bytes] - Note: PDF text extraction not yet implemented`;
      } else if (file.type === 'image/png') {
        // For PNG, use OCR to extract text content
        setUploadStatus('🖼️ Extracting text from PNG image...');
        
        try {
          const result = await Tesseract.recognize(file, 'eng', {
            logger: m => {
              if (m.status === 'recognizing text') {
                setUploadStatus(`🖼️ Extracting text... ${Math.round(m.progress * 100)}%`);
              }
            }
          });
          
          fileContent = result.data.text;
          setUploadStatus('✅ Text extraction complete!');
        } catch (ocrError) {
          console.error('OCR failed:', ocrError);
          // Fallback to basic file info if OCR fails
          fileContent = `[PNG Image: ${file.name}, Size: ${file.size} bytes, OCR failed]`;
          setUploadStatus('⚠️ OCR failed, using basic analysis');
        }
      }

      // Use the AI provider to analyze the file
      console.log('📤 Calling analyzeFile with content length:', fileContent.length);
      console.log('📤 Content preview:', fileContent.substring(0, 500));
      const analysisResult = await analyzeFile(fileContent);
      console.log('✅ Analysis result:', analysisResult);

      setUploadStatus('✅ Analysis complete!');
      
      // Call the callback with the parsed result
      onAnalysisComplete(analysisResult);
      
    } catch (error) {
      console.error('File analysis failed:', error);
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
      top: '100px',
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
