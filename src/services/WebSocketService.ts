import { Client } from '@stomp/stompjs';
import type { CounterStatus, OccupancyStatus } from '../api/CafeteriaApiService';

interface LiveUpdateMessage {
  cafeteriaCode: string;
  counters: CounterStatus[];
  occupancyStatus: OccupancyStatus | null;
  timestamp: string;
  updateType: 'counter_update' | 'occupancy_update' | 'full_update';
}

class WebSocketService {
  private stompClient: Client | null = null;
  private isConnected: boolean = false;
  private subscriptions: Map<string, any> = new Map();

  connect(
    cafeteriaCode: string,
    onUpdate: (update: LiveUpdateMessage) => void,
    onError?: (error: any) => void
  ): void {
    if (this.isConnected) {
      console.log('⚠️ WebSocket already connected');
      return;
    }

    // ✅ Use native WebSocket (no SockJS)
    this.stompClient = new Client({
      brokerURL: 'ws://45.79.121.181:8085/ws-cafeteria/websocket',
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (str) => {
        console.log('🔍 STOMP Debug:', str);
      },
    });

    this.stompClient.onConnect = () => {
      console.log('✅ WebSocket Connected to cafeteria:', cafeteriaCode);
      this.isConnected = true;
      
      // Subscribe to cafeteria updates
      const subscription = this.stompClient!.subscribe(
        `/topic/cafeteria/${cafeteriaCode}`,
        (message) => {
          try {
            const update: LiveUpdateMessage = JSON.parse(message.body);
            console.log('📡 Live update received:', update);
            onUpdate(update);
          } catch (error) {
            console.error('❌ Error parsing WebSocket message:', error);
          }
        }
      );

      this.subscriptions.set(cafeteriaCode, subscription);
    };

    this.stompClient.onStompError = (frame) => {
      console.error('❌ WebSocket STOMP error:', frame);
      this.isConnected = false;
      if (onError) {
        onError(frame);
      }
    };

    this.stompClient.onWebSocketClose = () => {
      console.log('🔌 WebSocket connection closed');
      this.isConnected = false;
    };

    this.stompClient.onWebSocketError = (error) => {
      console.error('❌ WebSocket error:', error);
      if (onError) {
        onError(error);
      }
    };

    try {
      this.stompClient.activate();
    } catch (error) {
      console.error('❌ Error activating WebSocket:', error);
      if (onError) {
        onError(error);
      }
    }
  }

  disconnect(): void {
    if (this.stompClient && this.isConnected) {
      this.subscriptions.forEach((subscription) => {
        subscription.unsubscribe();
      });
      this.subscriptions.clear();
      
      this.stompClient.deactivate();
      this.isConnected = false;
      console.log('🔌 WebSocket disconnected');
    }
  }

  getConnectionStatus(): boolean {
    return this.isConnected;
  }
}

// Export singleton instance
const websocketService = new WebSocketService();
export default websocketService;