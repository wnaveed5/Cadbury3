import React, { useState } from 'react';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import SortableVendorField from './SortableVendorField';



function Section3Vendor({ 
  vendorFields, 
  sensors, 
  onVendorDragEnd,
  onAddVendorField,
  onRemoveVendorField,
  onLabelChange,
  onContentChange,
  lastModified
}) {
  const [isPaletteOver, setIsPaletteOver] = useState(false);
  
  // Make the section droppable for palette fields AND sortable for reordering
  const { isOver, setNodeRef: droppableRef } = useDroppable({
    id: 'section3',
    data: {
      type: 'section',
      sectionNumber: 3,
      accepts: 'palette-fields'
    }
  });

  // Make the section sortable for reordering
  const { 
    attributes, 
    listeners, 
    setNodeRef: sortableRef, 
    transform, 
    transition, 
    isDragging 
  } = useSortable({
    id: 'section3',
    data: {
      type: 'section',
      sectionNumber: 3
    }
  });

  // Combine refs - droppable for palette fields, sortable for reordering
  const setNodeRef = (node) => {
    droppableRef(node);
    sortableRef(node);
  };

  // Debug logging for droppable zone
  console.log('Section3Vendor - Droppable zone created:', {
    id: 'section3',
    isOver,
    setNodeRef: !!setNodeRef
  });

  // Update palette over state
  React.useEffect(() => {
    setIsPaletteOver(isOver);
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

  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`section-3 ${isPaletteOver ? 'palette-over' : ''} ${isDragging ? 'dragging' : ''}`}
      data-palette-over={isPaletteOver}
      data-dragging={isDragging}
      {...attributes}
      {...listeners}
    >
      {/* Section Header */}
      <div className="section-header">
        VENDOR
        <span className="drag-indicator">
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
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      {/* Add Field Button */}
      <div className="add-field-section">
        <button 
          className="add-field-btn" 
          onClick={handleAddField}
          title="Add new vendor field"
        >
          +
        </button>
      </div>
      
      {/* Drop indicator when palette field is over */}
      {isPaletteOver && (
        <div className="drop-indicator">
          <div className="drop-message">
            Drop field here
          </div>
        </div>
      )}
    </div>
  );
}

export default Section3Vendor;
