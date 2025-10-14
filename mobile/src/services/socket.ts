import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '@/config';

class SocketService {
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  async connect() {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      if (!token) {
        console.error('No access token available');
        return;
      }

      this.socket = io(API_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error('Socket connection error:', error);
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.reconnectAttempts = 0;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      this.reconnectAttempts++;

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        this.disconnect();
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
    });
  }

  subscribeThreatAlerts(callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('subscribe:threats');
    this.socket.on('threat:new', callback);
  }

  subscribePortfolioUpdates(portfolioId: string, callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('subscribe:portfolio', portfolioId);
    this.socket.on('portfolio:update', callback);
  }

  subscribeComplianceUpdates(callback: (data: any) => void) {
    if (!this.socket) return;

    this.socket.emit('subscribe:compliance');
    this.socket.on('compliance:update', callback);
  }

  unsubscribeThreatAlerts() {
    if (!this.socket) return;
    this.socket.off('threat:new');
  }

  unsubscribePortfolioUpdates() {
    if (!this.socket) return;
    this.socket.off('portfolio:update');
  }

  unsubscribeComplianceUpdates() {
    if (!this.socket) return;
    this.socket.off('compliance:update');
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }
}

export const socketService = new SocketService();