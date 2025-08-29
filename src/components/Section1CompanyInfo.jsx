import React, { useState } from 'react';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableCompanyField from './SortableCompanyField';

function Section1CompanyInfo({ 
  companyFields, 
  sensors, 
  onCompanyDragEnd,
  onAddCompanyField,
  onRemoveCompanyField,
  onLabelChange,
  onContentChange,
  lastModified,
  dragListeners,
  dragAttributes,
  showDummyData = true,
  getNetSuiteVariable
}) {
  const [isPaletteOver, setIsPaletteOver] = useState(false);
  
  // Make the section droppable for palette fields
  const { isOver, setNodeRef } = useDroppable({
    id: 'section1',
    data: {
      type: 'section',
      sectionNumber: 1,
      accepts: 'palette-fields'
    }
  });

  // Update palette over state
  React.useEffect(() => {
    setIsPaletteOver(isOver);
  }, [isOver]);

  // Handler for adding new company fields
  const handleAddField = () => {
    const newField = {
      id: `company-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: 'New Field:',
      placeholder: 'Enter field value'
    };
    onAddCompanyField(newField);
  };

  // Log field changes to console for tracking
  React.useEffect(() => {
    if (companyFields.length > 0) {
              console.log('Company Fields Updated:', {
        totalFields: companyFields.length,
        lastModified: new Date(lastModified).toLocaleString(),
        fields: companyFields.map((field, index) => ({
          position: index + 1,
          id: field.id,
          label: field.label,
          placeholder: field.placeholder
        }))
      });
    }
  }, [companyFields, lastModified]);

  return (
    <div 
      ref={setNodeRef}
      className={`section-1-company-info ${isPaletteOver ? 'palette-over' : ''}`}
      data-palette-over={isPaletteOver}
    >
      {/* Section Header */}
      <div 
        className="section-header"
        {...dragAttributes}
        {...dragListeners}
        style={{ cursor: 'grab' }}
      >
        <span className="drag-indicator">
          ::
        </span>
        COMPANY INFO
      </div>
      
      {/* Company Fields with Drag and Drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onCompanyDragEnd}
      >
        <SortableContext 
          items={companyFields.map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="company-fields-container">
            {companyFields.map(field => (
              <SortableCompanyField 
                key={field.id} 
                field={field} 
                onRemove={onRemoveCompanyField}
                onLabelChange={onLabelChange}
                onContentChange={onContentChange}
                section="company"
                showDummyData={showDummyData}
                getNetSuiteVariable={getNetSuiteVariable}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Add Field Button */}
      <div className="add-field-section">
        <button 
          type="button" 
          className="add-field-btn"
          onClick={handleAddField}
          title="Add new company field"
        >
          +
        </button>
      </div>
      
    </div>
  );
}

export default Section1CompanyInfo;
