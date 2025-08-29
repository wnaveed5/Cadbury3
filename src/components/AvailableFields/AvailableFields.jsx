import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { availableFieldsData } from './fieldData';
import './AvailableFields.css';

// Draggable field item component
const PaletteDraggable = ({ label, category, onAddField, showNotification }) => {
  const [isHovered, setIsHovered] = useState(false);
  const id = `palette-${category}-${label}`;
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: { 
      source: 'palette', 
      label, 
      category,
      type: 'palette-field'
    }
  });
  
  const style = {
    transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
    cursor: 'grab',
    opacity: isDragging ? 0.6 : 1,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    transformOrigin: 'center center'
  };

  const handleAddClick = (e) => {
    e.stopPropagation();
    if (onAddField) {
      onAddField(label, category);
    }
    if (showNotification) {
      showNotification(`➕ ${label} field added to form`, 'info');
    }
  };

  return (
    <li 
      ref={setNodeRef} 
      style={style} 
      className={`field-item ${isDragging ? 'dragging' : ''} ${isHovered ? 'hovered' : ''}`}
      {...attributes} 
      {...listeners}
      data-dragging={isDragging}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className="field-name">{label}</span>
      <button 
        className="add-field-btn" 
        title={`Add ${label} to form`} 
        onClick={handleAddClick}
      >
        +
      </button>
      
      {/* Enhanced drag indicator */}
      {isDragging && (
        <div className="drag-indicator">
          <div className="drag-pulse"></div>
        </div>
      )}
    </li>
  );
};

// Main AvailableFields component
const AvailableFields = ({ 
  onAddField, 
  showNotification 
}) => {
  return (
    <div className="field-list-sidebar">
      <div className="field-list-header">
        <h3>Available Fields</h3>
        <p>Drag fields to sections or click + to add</p>
      </div>
      <div className="field-list-content">
        {availableFieldsData.map((category, categoryIndex) => (
          <div key={categoryIndex} className="field-category">
            <h4 className="category-title">{category.category}</h4>
            <ul className="field-list">
              {category.fields.map((field, fieldIndex) => (
                <PaletteDraggable 
                  key={`${categoryIndex}-${fieldIndex}`} 
                  label={field} 
                  category={category.category}
                  onAddField={onAddField}
                  showNotification={showNotification}
                />
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AvailableFields;
