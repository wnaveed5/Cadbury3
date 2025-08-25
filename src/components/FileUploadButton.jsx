import React, { useState } from 'react';
import { analyzeFile } from '../hooks/useAIProvider';

const FileUploadButton = ({ onAnalysisComplete }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadStatus('📄 Starting file analysis...');

    try {
      let fileContent = '';

      if (file.type === 'application/pdf') {
        // PDF: Try text extraction first, OCR only if needed
        setUploadStatus('📄 Extracting PDF text...');
        
        try {
          // Use pdf.js for proper PDF text extraction
          const pdfjsLib = window['pdfjs-dist/build/pdf'];
          if (!pdfjsLib) {
            throw new Error('PDF.js library not loaded');
          }
          
          pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + '\n';
          }
          
          fileContent = fullText.trim();
          console.log('📄 Extracted PDF text length:', fileContent.length);
          console.log('📄 First 200 chars:', fileContent.substring(0, 200));
          setUploadStatus('✅ PDF text extraction complete!');
        } catch (pdfError) {
          console.error('PDF extraction failed:', pdfError);
          fileContent = `[PDF File: ${file.name}, Size: ${file.size} bytes, extraction failed: ${pdfError.message}]`;
          setUploadStatus('⚠️ PDF extraction failed, using basic analysis');
        }
      } else if (file.type === 'image/png' || file.type === 'image/jpeg') {
        // Image: Use Vision API for OCR
        setUploadStatus('🖼️ Using Vision API for text extraction...');
        
        try {
          // Convert file to base64 for Vision API
          const base64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
              const base64String = reader.result.split(',')[1];
              resolve(base64String);
            };
            reader.readAsDataURL(file);
          });
          
          // Use our dedicated Vision API endpoint for OCR
          const visionResponse = await fetch('/api/vision', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64,
              prompt: 'Extract ALL text from this purchase order image, starting from the VERY TOP LEFT corner (company name, logo, header section) and work your way down to the bottom. CRITICAL: Do not skip any text at the top of the document. Include the company header section, company name, address, phone, fax, website - everything visible from the top down. Then continue with purchase order details, vendor, ship-to, line items, totals, and comments. IMPORTANT: Return the COMPLETE text content - do not truncate or omit any sections. Include every word, number, and symbol you can see. Return ONLY the extracted text, no analysis or formatting.'
            })
          });
          
          if (!visionResponse.ok) {
            const errorData = await visionResponse.json();
            throw new Error(`Vision API failed: ${errorData.error || 'Unknown error'}`);
          }
          
          const visionData = await visionResponse.json();
          fileContent = visionData.text || '';
          
          // Clean up the extracted text
          fileContent = fileContent
            .replace(/\s+/g, ' ') // Replace multiple spaces with single space
            .replace(/\n\s*\n/g, '\n') // Remove empty lines
            .trim();
          
          setUploadStatus('✅ Vision API text extraction complete!');
        } catch (visionError) {
          console.error('Vision API failed:', visionError);
          // Fallback to basic file info if Vision API fails
          fileContent = `[Image: ${file.name}, Size: ${file.size} bytes, Vision API failed]`;
          setUploadStatus('⚠️ Vision API failed, using basic analysis');
        }
      } else {
        // Unsupported file type
        throw new Error('Unsupported file type. Please upload PDF or image files.');
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
        accept=".pdf,.png,.jpg,.jpeg"
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
};

export default FileUploadButton;
