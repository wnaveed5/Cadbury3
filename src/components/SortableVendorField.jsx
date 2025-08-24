import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableVendorField({ field, onRemove, onLabelChange, onContentChange }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Handle label changes
  const handleLabelChange = (e) => {
    if (onLabelChange) {
      onLabelChange(e.target.textContent);
    }
  };

  // Handle content changes
  const handleContentChange = (e) => {
    if (onContentChange) {
      onContentChange(e.target.textContent);
    }
  };

  // Handle remove field
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove(field.id);
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="vendor-field-item" data-field={field.id}>
      <button 
        className="remove-field-btn-x" 
        onClick={handleRemove}
        title="Remove field"
        style={{ 
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'red',
          border: '2px solid black',
          color: 'white',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          cursor: 'pointer',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        ×
      </button>
      <div className="field-controls">
        <div className="drag-handle" {...attributes} {...listeners} title="Drag to reorder">
          ::
        </div>
      </div>
      <div className="vendor-field-content">
        <span 
          className="vendor-field-label editable-label" 
          contentEditable="true"
          onBlur={handleLabelChange}
          suppressContentEditableWarning={true}
        >
          {field.label}
        </span>
        <span 
          id={field.id} 
          className="editable-field" 
          contentEditable="true" 
          data-placeholder={field.placeholder}
          onBlur={handleContentChange}
          suppressContentEditableWarning={true}
          dangerouslySetInnerHTML={{ __html: field.value || '' }}
        />
      </div>
    </div>
  );
}

export default SortableVendorField;
