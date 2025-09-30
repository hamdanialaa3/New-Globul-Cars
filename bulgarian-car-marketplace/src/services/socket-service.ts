// Socket.io Configuration - Free Real-time Messaging
// (Comment removed - was in Arabic)

import { io, Socket } from 'socket.io-client';

// Socket.io configuration
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:3001';

export class BulgarianSocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    this.setupEventListeners();
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
this.reconnectAttempts = 0;
    });

    this.socket.on('disconnect', (reason) => {
});

    this.socket.on('connect_error', (error) => {
      console.error('[SERVICE] Socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error('[SERVICE] Max reconnection attempts reached');
      }
    });

    // Car-related events
    this.socket.on('car:new', (data) => {
this.emit('car:new', data);
    });

    this.socket.on('car:updated', (data) => {
this.emit('car:updated', data);
    });

    this.socket.on('car:deleted', (data) => {
this.emit('car:deleted', data);
    });

    // Message events
    this.socket.on('message:new', (data) => {
this.emit('message:new', data);
    });

    this.socket.on('message:read', (data) => {
this.emit('message:read', data);
    });

    // User events
    this.socket.on('user:online', (data) => {
this.emit('user:online', data);
    });

    this.socket.on('user:offline', (data) => {
this.emit('user:offline', data);
    });
  }

  // Authentication
  authenticate(token: string) {
    if (this.socket) {
      this.socket.emit('authenticate', { token });
    }
  }

  // Join car room
  joinCarRoom(carId: string) {
    if (this.socket) {
      this.socket.emit('join:car', { carId });
}
  }

  // Leave car room
  leaveCarRoom(carId: string) {
    if (this.socket) {
      this.socket.emit('leave:car', { carId });
}
  }

  // Send message
  sendMessage(carId: string, message: string, type: 'text' | 'offer' | 'question' = 'text') {
    if (this.socket) {
      this.socket.emit('message:send', {
        carId,
        message,
        type,
        timestamp: new Date(),
        language: 'bg' // Bulgarian by default
      });
    }
  }

  // Mark message as read
  markMessageAsRead(messageId: string) {
    if (this.socket) {
      this.socket.emit('message:read', { messageId });
    }
  }

  // Update user status
  updateUserStatus(status: 'online' | 'offline' | 'away') {
    if (this.socket) {
      this.socket.emit('user:status', { status });
    }
  }

  // Car management
  createCar(carData: any) {
    if (this.socket) {
      this.socket.emit('car:create', carData);
    }
  }

  updateCar(carId: string, updates: any) {
    if (this.socket) {
      this.socket.emit('car:update', { carId, updates });
    }
  }

  deleteCar(carId: string) {
    if (this.socket) {
      this.socket.emit('car:delete', { carId });
    }
  }

  // Generic event emitter for React components
  private eventListeners: { [key: string]: Function[] } = {};

  on(event: string, callback: Function) {
    if (!this.eventListeners[event]) {
      this.eventListeners[event] = [];
    }
    this.eventListeners[event].push(callback);
  }

  off(event: string, callback: Function) {
    if (this.eventListeners[event]) {
      this.eventListeners[event] = this.eventListeners[event].filter(cb => cb !== callback);
    }
  }

  private emit(event: string, data: any) {
    if (this.eventListeners[event]) {
      this.eventListeners[event].forEach(callback => callback(data));
    }
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Disconnect
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Reconnect
  reconnect() {
    if (!this.socket || !this.socket.connected) {
      this.initializeSocket();
    }
  }

  // Get socket instance (for advanced usage)
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
export const bulgarianSocketService = new BulgarianSocketService();

// React hook for using Socket.io
export const useSocket = () => {
  return bulgarianSocketService;
};

export default bulgarianSocketService;