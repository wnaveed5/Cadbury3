import React, { useState } from 'react';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  dragListeners,
  dragAttributes,
  showDummyData = true,
  getNetSuiteVariable
}) {
  const [isPaletteOver, setIsPaletteOver] = useState(false);
  
  // Make the section droppable for palette fields
  const { isOver, setNodeRef } = useDroppable({
    id: 'section4',
    data: {
      type: 'section',
      sectionNumber: 4,
      accepts: 'palette-fields'
    }
  });

  // Debug logging for droppable zone
  console.log('Section4ShipTo - Droppable zone created:', {
    id: 'section4',
    isOver,
    setNodeRef: !!setNodeRef
  });

  // Update palette over state
  React.useEffect(() => {
    setIsPaletteOver(isOver);
    console.log('📍 Section4 droppable state:', {
      isOver,
      nodeRef: setNodeRef,
      droppableId: 'section4'
    });
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

  return (
    <div 
      ref={setNodeRef}
      className={`section-4 ${isPaletteOver ? 'palette-over' : ''}`}
      data-palette-over={isPaletteOver}
      style={{
        minHeight: '300px',
        padding: '20px',
        border: isPaletteOver ? '3px dashed #4CAF50' : '2px solid #ddd',
        borderRadius: '8px',
        backgroundColor: isPaletteOver ? 'rgba(76, 175, 80, 0.05)' : 'transparent',
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Section Header */}
      <div className="section-header">
        SHIP TO
        <span 
          className="drag-indicator"
          {...dragAttributes}
          {...dragListeners}
          style={{ cursor: 'grab' }}
        >
          ::
        </span>
      </div>
      
      {/* Ship To Fields with Drag and Drop */}
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
      
      {/* Add Field Button */}
      <div className="add-field-section">
        <button 
          type="button" 
          className="add-field-btn"
          onClick={handleAddField}
          title="Add new ship-to field"
        >
          +
        </button>
      </div>
      
      {/* Drop indicator when palette field is over */}
      {isPaletteOver && (
        <div className="drop-indicator" style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          padding: '20px 40px',
          backgroundColor: 'rgba(76, 175, 80, 0.9)',
          color: 'white',
          borderRadius: '8px',
          fontSize: '18px',
          fontWeight: 'bold',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <div className="drop-message">
            ✅ Drop field here to add to SHIP TO
          </div>
        </div>
      )}
    </div>
  );
}

export default Section4ShipTo;
