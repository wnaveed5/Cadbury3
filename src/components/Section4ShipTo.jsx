import React, { useState } from 'react';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import SortableShipToField from './SortableShipToField';



function Section4ShipTo({ 
  shipToFields, 
  sensors, 
  onShipToDragEnd,
  onAddShipToField,
  onRemoveShipToField,
  onLabelChange,
  onContentChange,
  lastModified,
  showDummyData = true,
  getNetSuiteVariable
}) {
  const [isPaletteOver, setIsPaletteOver] = useState(false);
  
  // Make the section droppable for palette fields AND sortable for reordering
  const { isOver, setNodeRef: droppableRef } = useDroppable({
    id: 'section4',
    data: {
      type: 'section',
      sectionNumber: 4,
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
    id: 'section4',
    data: {
      type: 'section',
      sectionNumber: 4
    }
  });

  // Combine refs - droppable for palette fields, sortable for reordering
  const setNodeRef = (node) => {
    droppableRef(node);
    sortableRef(node);
  };

  // Debug logging for droppable zone
  console.log('Section4ShipTo - Droppable zone created:', {
    id: 'section4',
    isOver,
    setNodeRef: !!setNodeRef
  });

  // Update palette over state
  React.useEffect(() => {
    setIsPaletteOver(isOver);
  }, [isOver]);

  // Handler for adding new ship-to fields
  const handleAddField = () => {
    const newField = {
      id: `ship-to-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: 'New Field:',
      placeholder: 'Enter field value'
    };
    onAddShipToField(newField);
  };

  // Log field changes to console for tracking
  React.useEffect(() => {
    if (shipToFields.length > 0) {
              console.log('Ship To Fields Updated:', {
        totalFields: shipToFields.length,
        lastModified: new Date(lastModified).toLocaleString(),
        fields: shipToFields.map((field, index) => ({
          position: index + 1,
          id: field.id,
          label: field.label,
          placeholder: field.placeholder
        }))
      });
    }
  }, [shipToFields, lastModified]);

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
      className={`section-4 ${isPaletteOver ? 'palette-over' : ''} ${isDragging ? 'dragging' : ''}`}
      data-palette-over={isPaletteOver}
      data-dragging={isDragging}
      {...attributes}
      {...listeners}
    >
      {/* Section Header */}
      <div className="section-header">
        SHIP TO
        <span className="drag-indicator">
          ::
        </span>
      </div>
      
      {/* Ship To Fields with Drag and Drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onShipToDragEnd}
      >
        <SortableContext 
          items={shipToFields.map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="ship-to-fields-container">
            {shipToFields.map(field => (
              <SortableShipToField 
                key={field.id} 
                field={field} 
                onRemove={onRemoveShipToField}
                onLabelChange={onLabelChange}
                onContentChange={onContentChange}
                section="ship-to"
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
          className="add-field-btn" 
          onClick={handleAddField}
          title="Add new ship-to field"
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

export default Section4ShipTo;
