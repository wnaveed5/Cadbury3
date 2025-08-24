import React, { useState, useEffect } from 'react';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';



// Sortable Shipping Column Header Component
function SortableShippingColumnHeader({ children, id, onDragEnd }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id,
    data: {
      type: 'shipping-column',
      columnId: id
    }
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
    userSelect: 'none',
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...attributes} 
      {...listeners}
      className={`sortable-shipping-column-header ${isDragging ? 'dragging' : ''}`}
      title="Drag to reorder shipping columns"
    >
      {children}
    </div>
  );
}

const Section5Shipping = ({ shippingColumnOrder = ['requisitioner', 'shipVia', 'fob', 'shippingTerms'], onShippingColumnDragEnd }) => {
  const [localColumnOrder, setLocalColumnOrder] = useState(shippingColumnOrder);

  // Update local state when prop changes
  useEffect(() => {
            console.log('Section5Shipping: shippingColumnOrder prop changed:', shippingColumnOrder);
    setLocalColumnOrder(shippingColumnOrder);
  }, [shippingColumnOrder]);

  // Column configuration mapping
  const columnConfig = {
    requisitioner: { label: 'REQUISITIONER', placeholder: 'Requisitioner name' },
    shipVia: { label: 'SHIP VIA', placeholder: 'Shipping method' },
    fob: { label: 'F.O.B.', placeholder: 'FOB terms' },
    shippingTerms: { label: 'SHIPPING TERMS', placeholder: 'Shipping terms' }
  };

  // Generate configuration for custom columns (those that start with 'custom-')
  const generateCustomColumnConfig = (columnId) => {
    if (columnId.startsWith('custom-')) {
      return {
        label: columnId.toUpperCase().replace('custom-', 'CUSTOM '),
        placeholder: 'Enter custom value'
      };
    }
    return null;
  };

  // Merge default and custom column configs
  const allColumnConfig = {
    ...columnConfig,
    ...shippingColumnOrder.reduce((acc, columnId) => {
      const customConfig = generateCustomColumnConfig(columnId);
      if (customConfig) {
        acc[columnId] = customConfig;
      }
      return acc;
    }, {})
  };



  // Handle column reordering
  const handleColumnDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = localColumnOrder.indexOf(active.id.replace('shipping-header-', ''));
      const newIndex = localColumnOrder.indexOf(over.id.replace('shipping-header-', ''));
      
      if (oldIndex !== -1 && newIndex !== -1) {
        const newOrder = [...localColumnOrder];
        const [movedItem] = newOrder.splice(oldIndex, 1);
        newOrder.splice(newIndex, 0, movedItem);
        
        // Update local state
        setLocalColumnOrder(newOrder);
        
        if (onShippingColumnDragEnd) {
          // Pass the event object with the new order in the expected format
          onShippingColumnDragEnd({
            active: { id: active.id },
            over: { id: over.id },
            newOrder: newOrder
          });
        }
      }
    }
  };

  return (
    <div className="section-5">

      
      <DndContext
        collisionDetection={closestCenter}
        onDragEnd={handleColumnDragEnd}
      >
        <SortableContext 
          items={localColumnOrder.map(columnId => `shipping-header-${columnId}`)}
          strategy={horizontalListSortingStrategy}
        >
          <div
            className="shipping-details"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${localColumnOrder.length}, 1fr)`,
              gap: '0',
              border: '1px solid #e5e7eb',
              borderRadius: '0 0 8px 8px',
              overflow: 'hidden',
              position: 'relative',
              padding: '10px'
            }}
          >
                    {/* Section Headers - Now Sortable */}
        {localColumnOrder.map((columnId, index) => {
          const config = allColumnConfig[columnId];
          const isLastColumn = index === localColumnOrder.length - 1;
          
          return (
            <SortableShippingColumnHeader 
              key={`header-${columnId}`} 
              id={`shipping-header-${columnId}`}
            >
              <div className="section-header" style={{
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderBottom: '1px solid #e5e7eb',
                borderRight: isLastColumn ? 'none' : '1px solid #e5e7eb',
                fontWeight: '600',
                fontSize: '14px',
                textAlign: 'center',
                color: '#374151',
                cursor: 'grab',
                position: 'relative'
              }}>
                {config.label}
                <span className="drag-indicator">
                  ::
                </span>
              </div>
            </SortableShippingColumnHeader>
          );
        })}

        {/* Field Content - Matching Column Order */}
        {localColumnOrder.map((columnId, index) => {
          const config = allColumnConfig[columnId];
          const isLastColumn = index === localColumnOrder.length - 1;
          
          return (
            <div 
              key={`field-${columnId}`}
              className="shipping-field" 
              data-field={columnId} 
              style={{
                padding: '15px',
                borderRight: isLastColumn ? 'none' : '1px solid #e5e7eb',
                minHeight: '60px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span 
                className="editable-field" 
                contentEditable="true" 
                data-placeholder={config.placeholder}
                style={{
                  fontSize: '14px',
                  color: '#374151',
                  width: '100%',
                  outline: 'none'
                }}
              />
            </div>
          );
        })}


          </div>
        </SortableContext>
      </DndContext>
      
      {/* Add Column Button - Attached to Section 5 */}
      <div style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: '10px',
        padding: '10px',
        backgroundColor: 'white',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <button 
          className="add-column-btn" 
          style={{
            backgroundColor: 'white',
            color: 'black',
            border: '2px solid black',
            padding: '8px 14px',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            console.log('Add Column Button clicked from Section 5!');
            
            const currentColumns = shippingColumnOrder || ['requisitioner', 'shipVia', 'fob', 'shippingTerms'];
            const nextCustomId = `custom-${Date.now()}`;
            const newColumnOrder = [...currentColumns, nextCustomId];
            
            console.log('Adding new column:', {
              currentColumns,
              nextCustomId,
              newColumnOrder
            });
            
            // Emit the add-column event to parent
            if (onShippingColumnDragEnd) {
              onShippingColumnDragEnd({
                type: 'add-column',
                newOrder: newColumnOrder,
                addedColumn: nextCustomId
              });
            }
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'black';
            e.target.style.color = 'white';
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'white';
            e.target.style.color = 'black';
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
          }}
          title="Add a new custom shipping column"
        >
          <span style={{ fontSize: '16px' }}>+</span>
          Add Column
        </button>
      </div>

      </div>
  );
};

export default Section5Shipping;
