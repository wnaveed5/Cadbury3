import { useSensor, useSensors, PointerSensor, KeyboardSensor, MouseSensor, TouchSensor } from '@dnd-kit/core';
import { sortableKeyboardCoordinates, arrayMove } from '@dnd-kit/sortable';

export function useDragAndDropSensors() {
  console.log('🔧 Creating sensors...');
  
  // Try using MouseSensor and TouchSensor instead of PointerSensor
  const mouseSensor = useSensor(MouseSensor);
  const touchSensor = useSensor(TouchSensor);
  const keyboardSensor = useSensor(KeyboardSensor, {
    coordinateGetter: sortableKeyboardCoordinates,
  });
  
  console.log('🔧 Individual sensors:', {
    mouseSensor: mouseSensor,
    touchSensor: touchSensor,
    keyboardSensor: keyboardSensor,
    mouseSensorType: mouseSensor?.constructor?.name,
    touchSensorType: touchSensor?.constructor?.name,
    keyboardSensorType: keyboardSensor?.constructor?.name
  });
  
  const sensors = useSensors(mouseSensor, touchSensor, keyboardSensor);
  
  console.log('🔧 Sensors created:', {
    sensors: sensors,
    sensorCount: sensors.length,
    sensorTypes: sensors.map(s => s.constructor.name || 'unknown'),
    timestamp: new Date().toISOString()
  });
  
  return sensors;
}



export function useCompanyFieldsDragEnd(setCompanyFields) {
  return (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      console.log('🔄 Company field drag detected:', { active: active.id, over: over.id });
      setCompanyFields((items) => {
        const oldIndex = items.findIndex(field => field.id === active.id);
        const newIndex = items.findIndex(field => field.id === over.id);
        
        console.log('🔄 Company field indices:', { oldIndex, newIndex });
        const newOrder = arrayMove(items, oldIndex, newIndex);
        console.log('🔄 New company field order:', newOrder.map(f => f.id));
        
        return newOrder;
      });
    }
  };
}

export function usePurchaseOrderFieldsDragEnd(setPurchaseOrderFields) {
  return (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setPurchaseOrderFields((items) => {
        const oldIndex = items.findIndex(field => field.id === active.id);
        const newIndex = items.findIndex(field => field.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
}

export function useVendorFieldsDragEnd(setVendorFields) {
  return (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setVendorFields((items) => {
        const oldIndex = items.findIndex(field => field.id === active.id);
        const newIndex = items.findIndex(field => field.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
}

export function useShipToFieldsDragEnd(setShipToFields) {
  return (event) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setShipToFields((items) => {
        const oldIndex = items.findIndex(field => field.id === active.id);
        const newIndex = items.findIndex(field => field.id === over.id);
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };
}
