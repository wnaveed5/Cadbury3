import React from 'react';
import ModernHeader from './ModernHeader';

const HeaderDemo = () => {
  const handleSave = () => {
    console.log('Save button clicked');
    // Add your save logic here
  };

  const handlePreview = () => {
    console.log('Preview button clicked');
    // Add your preview logic here
  };

  const handleExport = () => {
    console.log('Export button clicked');
    // Add your export logic here
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ModernHeader
        title="Purchase Order Form"
        subtitle="Create and manage purchase orders with ease"
        status="draft"
        onSave={handleSave}
        onPreview={handlePreview}
        onExport={handleExport}
        showControls={true}
      />
      
      {/* Demo content below the header */}
      <div className="container mx-auto px-6 py-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Header Integration Example
          </h2>
          <p className="text-gray-600 mb-4">
            This demonstrates the new shadcn/ui styled header component. The header includes:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>Modern gradient background with professional styling</li>
            <li>Status badge with dynamic colors</li>
            <li>Action buttons (Preview, Export, Save)</li>
            <li>Quick stats cards showing order information</li>
            <li>Responsive design that works on all screen sizes</li>
            <li>Built with shadcn/ui components and Tailwind CSS</li>
          </ul>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Usage:</h3>
            <code className="text-sm text-blue-700">
              {`<ModernHeader
  title="Your Title"
  subtitle="Your Subtitle"
  status="draft"
  onSave={handleSave}
  onPreview={handlePreview}
  onExport={handleExport}
  showControls={true}
/>`}
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderDemo;
