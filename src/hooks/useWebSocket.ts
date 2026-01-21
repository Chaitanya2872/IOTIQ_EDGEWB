import { useEffect, useRef, useState } from 'react';
import websocketService from '../services/WebSocketService';
import type { CounterStatus, OccupancyStatus } from '../api/CafeteriaApiService';

interface LiveUpdateMessage {
  cafeteriaCode: string;
  counters: CounterStatus[];
  occupancyStatus: OccupancyStatus | null;
  timestamp: string;
  updateType: 'counter_update' | 'occupancy_update' | 'full_update';
}

export const useWebSocket = (
  cafeteriaCode: string,
  onUpdate: (update: LiveUpdateMessage) => void
) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<any>(null);
  const onUpdateRef = useRef(onUpdate);

  // Keep the callback ref updated
  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!cafeteriaCode) {
      console.warn('⚠️ No cafeteria code provided');
      return;
    }

    console.log('🔌 Connecting WebSocket for cafeteria:', cafeteriaCode);

    const handleUpdate = (update: LiveUpdateMessage) => {
      if (onUpdateRef.current) {
        onUpdateRef.current(update);
      }
    };

    const handleError = (err: any) => {
      console.error('❌ WebSocket error in hook:', err);
      setError(err);
      setIsConnected(false);
    };

    websocketService.connect(cafeteriaCode, handleUpdate, handleError);
    setIsConnected(true);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up WebSocket connection');
      websocketService.disconnect();
      setIsConnected(false);
    };
  }, [cafeteriaCode]);

  return { isConnected, error };
};