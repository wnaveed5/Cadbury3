import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableCompanyField({ field, onRemove, onLabelChange, onContentChange, section }) {
  // Drag and drop functionality
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: field.id });

  // Apply drag transform styles
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Event handlers
  const handleRemove = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onRemove) {
      onRemove(field.id);
    }
  };

  const handleLabelChange = (event) => {
    if (onLabelChange) {
      onLabelChange(field.id, event.target.textContent);
    }
  };

  const handleContentChange = (event) => {
    if (onContentChange) {
      onContentChange(field.id, event.target.textContent, section);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.target.blur();
    }
  };

  return (
    <div ref={setNodeRef} style={style} className="field-item" data-field={field.id}>
      {/* Drag Handle - Only show for non-title fields */}
      {!field.isTitle && (
        <div className="drag-handle" {...attributes} {...listeners}>
          ::
        </div>
      )}

      {/* Field Content */}
      <div className="field-content">
        <span 
          className={`field-label editable-label ${field.isTitle ? 'title-field' : ''}`}
          contentEditable={!field.isTitle}
          suppressContentEditableWarning={true}
          onBlur={handleLabelChange}
          onKeyDown={handleKeyDown}
          data-is-title={field.isTitle}
          style={field.isTitle ? {
            fontSize: '32px',
            fontWeight: 'bold',
            color: '#000000',
            textAlign: 'center',
            display: 'block',
            width: '100%',
            marginBottom: '10px'
          } : {}}
        >
          {field.label}
        </span>
        {!field.isTitle && (
          <span 
            id={field.id} 
            className="editable-field" 
            contentEditable="true" 
            data-placeholder={field.placeholder}
            dangerouslySetInnerHTML={{ __html: field.value || field.placeholder }}
          />
        )}
      </div>

      {/* Remove Button (only for non-title fields) */}
      {onRemove && !field.isTitle && (
                        <button 
                  type="button" 
                  className="remove-field-btn"
                  onClick={handleRemove}
                  title="Remove field"
                >
                  ×
                </button>
      )}
      
      
    </div>
  );
}

export default SortableCompanyField;
