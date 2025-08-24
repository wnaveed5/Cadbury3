import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableTotalsField({ field, onRemove, onLabelChange, onContentChange, onValueChange }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: field.id, 
    data: {
      type: 'totals-field',
      fieldId: field.id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  // Handle remove field (only for non-calculated fields)
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove && !field.isCalculated) {
      onRemove(field.id);
    }
  };

  // Handle label change
  const handleLabelChange = (e) => {
    if (onLabelChange) {
      onLabelChange(field.id, e.target.textContent);
    }
  };

  // Handle value change
  const handleValueChange = (e) => {
    if (onValueChange) {
      onValueChange(field.id, e.target.textContent);
    }
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`total-row ${field.isCalculated ? 'calculated' : ''} ${field.id === 'total' ? 'total-final' : ''}`}
      data-field={field.id}
    >
      {/* Remove Button (only for non-calculated fields) */}
      {onRemove && !field.isCalculated && (
        <button 
          type="button" 
          className="remove-field-btn"
          onClick={handleRemove}
          title="Remove field"
        >
          ×
        </button>
      )}

      {/* Drag Handle */}
      <div className="field-controls">
        <div 
          className="drag-handle" 
          {...attributes} 
          {...listeners}
          title="Drag to reorder"
        >
          ::
        </div>
      </div>

      {/* Field Label */}
      <span 
        className="field-label editable-label" 
        contentEditable={!field.isCalculated}
        onBlur={handleLabelChange}
        suppressContentEditableWarning
      >
        {field.label}
      </span>

      {/* Field Value */}
      {field.isCalculated ? (
        <span className="calculated-field">
          {field.value}
        </span>
      ) : (
        <span 
          className="editable-field" 
          contentEditable="true" 
          data-placeholder={field.placeholder}
          onBlur={handleValueChange}
          suppressContentEditableWarning
        >
          {field.value}
        </span>
      )}
    </div>
  );
}

export default SortableTotalsField;
