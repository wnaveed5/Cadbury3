import React, { useState } from 'react';
import { DndContext, closestCenter, useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortablePurchaseOrderField from './SortablePurchaseOrderField';

function Section2PurchaseOrder({ 
  purchaseOrderFields, 
  sensors, 
  onPurchaseOrderDragEnd,
  onAddPurchaseOrderField,
  onRemovePurchaseOrderField,
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
    id: 'section2',
    data: {
      type: 'section',
      sectionNumber: 2,
      accepts: 'palette-fields'
    }
  });

  // Update palette over state
  React.useEffect(() => {
    setIsPaletteOver(isOver);
  }, [isOver]);

  // Handler for adding new purchase order fields
  const handleAddField = () => {
    const newField = {
      id: `po-field-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      label: 'New Field:',
      placeholder: 'Enter field value'
    };
    onAddPurchaseOrderField(newField);
  };

  // Log field changes to console for tracking
  React.useEffect(() => {
    if (purchaseOrderFields.length > 0) {
              console.log('Purchase Order Fields Updated:', {
        totalFields: purchaseOrderFields.length,
        lastModified: new Date(lastModified).toLocaleString(),
        fields: purchaseOrderFields.map((field, index) => ({
          position: index + 1,
          id: field.id,
          label: field.label,
          placeholder: field.placeholder
        }))
      });
    }
  }, [purchaseOrderFields, lastModified]);

  return (
    <div 
      ref={setNodeRef}
      className={`section-2-purchase-order ${isPaletteOver ? 'palette-over' : ''}`}
      data-palette-over={isPaletteOver}
    >
      {/* Section Header */}
      <div className="section-header">
        PURCHASE ORDER
        <span 
          className="drag-indicator"
          {...dragAttributes}
          {...dragListeners}
          style={{ cursor: 'grab' }}
        >
          ::
        </span>
      </div>
      
      {/* Purchase Order Fields with Drag and Drop */}
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onPurchaseOrderDragEnd}
      >
        <SortableContext 
          items={purchaseOrderFields.map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="purchase-order-fields-container">
            {purchaseOrderFields.map(field => (
              <SortablePurchaseOrderField 
                key={field.id} 
                field={field} 
                onRemove={onRemovePurchaseOrderField}
                onLabelChange={onLabelChange}
                onContentChange={onContentChange}
                section="purchaseOrder"
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
          title="Add new purchase order field"
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

export default Section2PurchaseOrder;
