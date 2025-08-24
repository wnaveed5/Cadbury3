import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCommentsField({ field, onRemove, onLabelChange, onValueChange, isMainField = false, showDummyData = true, getNetSuiteVariable }) {
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
      type: 'comments-field',
      fieldId: field.id
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  // Handle remove field (only for non-main fields)
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove && !isMainField) {
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
      className={`comments-field-item ${isMainField ? 'main-comment' : ''}`}
      data-field={field.id}
    >
      {/* Remove Button (only for non-main fields) */}
      {onRemove && !isMainField && (
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
        contentEditable={!isMainField}
        onBlur={handleLabelChange}
        suppressContentEditableWarning
      >
        {field.label}
      </span>

      {/* Field Value */}
      {showDummyData ? (
        <span 
          className="editable-field" 
          contentEditable="true" 
          data-placeholder={field.placeholder}
          onBlur={handleValueChange}
          suppressContentEditableWarning
        >
          {field.value}
        </span>
      ) : (
        <span 
          className="netsuite-variable"
          style={{
            display: 'inline-block',
            backgroundColor: '#f0f8ff',
            color: '#0066cc',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '11px',
            fontWeight: '600',
            border: '1px solid #b3d9ff',
            fontFamily: 'monospace',
            fontStyle: 'italic'
          }}
        >
          {getNetSuiteVariable ? getNetSuiteVariable(field.id, 'comments') : `\${record.${field.id}}`}
        </span>
      )}
    </div>
  );
}

export default SortableCommentsField;
