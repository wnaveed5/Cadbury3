import React, { useState } from 'react';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableVendorField from './SortableVendorField';

function Section3Vendor({ 
  vendorFields, 
  sensors, 
  onVendorDragEnd,
  onAddVendorField,
  onRemoveVendorField,
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
    id: 'section3',
    data: {
      type: 'section',
      sectionNumber: 3,
      accepts: 'palette-fields'
    }
  });

  // Debug logging for droppable zone
  console.log('Section3Vendor - Droppable zone created:', {
    id: 'section3',
    isOver,
    setNodeRef: !!setNodeRef
  });

  // Update palette over state
  React.useEffect(() => {
    setIsPaletteOver(isOver);
    console.log('📍 Section3 droppable state:', {
      isOver,
      nodeRef: setNodeRef,
      droppableId: 'section3'
    });
  }, [isOver]);

  // Handler for adding new vendor fields
  const handleAddField = () => {
    const newField = {
      id: `vendor-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: 'New Field:',
      placeholder: 'Enter field value'
    };
    onAddVendorField(newField);
  };

  // Log field changes to console for tracking
  React.useEffect(() => {
    if (vendorFields.length > 0) {
              console.log('Vendor Fields Updated:', {
        totalFields: vendorFields.length,
        lastModified: new Date(lastModified).toLocaleString(),
        fields: vendorFields.map((field, index) => ({
          position: index + 1,
          id: field.id,
          label: field.label,
          placeholder: field.placeholder
        }))
      });
    }
  }, [vendorFields, lastModified]);

  return (
    <div 
      ref={setNodeRef}
      className={`section-3 ${isPaletteOver ? 'palette-over' : ''}`}
      data-palette-over={isPaletteOver}
    >
      {/* Section Header */}
      <div className="section-header">
        VENDOR
        <span 
          className="drag-indicator"
          {...dragAttributes}
          {...dragListeners}
          style={{ cursor: 'grab' }}
        >
          ::
        </span>
      </div>
      
      {/* Vendor Fields with Drag and Drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onVendorDragEnd}
      >
        <SortableContext 
          items={vendorFields.map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="vendor-fields-container">
            {vendorFields.map(field => (
              <SortableVendorField 
                key={field.id} 
                field={field} 
                onRemove={onRemoveVendorField}
                onLabelChange={onLabelChange}
                onContentChange={onContentChange}
                section="vendor"
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
          title="Add new vendor field"
        >
          +
        </button>
      </div>
      
    </div>
  );
}

export default Section3Vendor;
