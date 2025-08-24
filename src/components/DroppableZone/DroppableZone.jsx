import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import './DroppableZone.css';

// DroppableZone component for sections
const DroppableZone = ({ id, children, zoneLabel }) => {
  const { isOver, setNodeRef } = useDroppable({ 
    id,
    data: {
      type: 'drop-zone',
      accepts: 'palette-fields'
    }
  });
  
      console.log(`Droppable zone ${id} - isOver: ${isOver}`);
  
  return (
    <div 
      ref={setNodeRef} 
      className={`droppable-zone ${isOver ? 'droppable-over' : ''}`}
      data-zone-id={id}
      data-is-over={isOver}
      data-zone-label={zoneLabel}
    >
      {children}
    </div>
  );
};

export default DroppableZone;
