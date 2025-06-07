import { useState, useEffect, useCallback } from 'react';
import { NodeData, EdgeData } from '../types/kubernetes';

interface WebSocketMessage {
  type: 'add' | 'update' | 'delete';
  resource: NodeData | EdgeData;
}

interface WebSocketOptions {
  onMessage?: (data: any) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: (error: Event) => void;
  reconnectAttempts?: number;
  reconnectInterval?: number;
}

interface WebSocketHook {
  sendMessage: (message: any) => void;
  lastMessage: any;
  readyState: number;
  connect: () => void;
  disconnect: () => void;
}

export const useWebSocket = (url: string, options: WebSocketOptions = {}): WebSocketHook => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<any>(null);
  const [readyState, setReadyState] = useState<number>(WebSocket.CLOSED);
  const [reconnectCount, setReconnectCount] = useState<number>(0);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const {
    onMessage,
    onOpen,
    onClose,
    onError,
    reconnectAttempts = 5,
    reconnectInterval = 3000,
  } = options;

  const connect = useCallback(() => {
    if (isConnecting || socket?.readyState === WebSocket.OPEN) return;

    setIsConnecting(true);
    const ws = new WebSocket(url);

    ws.onopen = () => {
      console.log('WebSocket connection established');
      setReadyState(WebSocket.OPEN);
      setReconnectCount(0);
      setIsConnecting(false);
      onOpen?.();
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastMessage(data);
        onMessage?.(data);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = (event) => {
      console.log('WebSocket connection closed:', event.code, event.reason);
      setReadyState(WebSocket.CLOSED);
      setIsConnecting(false);
      onClose?.();

      // Attempt to reconnect if not explicitly closed
      if (event.code !== 1000 && reconnectCount < reconnectAttempts) {
        console.log(`Attempting to reconnect (${reconnectCount + 1}/${reconnectAttempts})...`);
        setTimeout(() => {
          setReconnectCount(prev => prev + 1);
          connect();
        }, reconnectInterval);
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnecting(false);
      onError?.(error);
    };

    setSocket(ws);
  }, [url, onMessage, onOpen, onClose, onError, reconnectAttempts, reconnectInterval, reconnectCount, isConnecting]);

  const disconnect = useCallback(() => {
    if (socket) {
      socket.close(1000, 'Client disconnecting');
      setSocket(null);
      setReadyState(WebSocket.CLOSED);
    }
  }, [socket]);

  const sendMessage = useCallback((message: any) => {
    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, [socket]);

  // Connect on mount and cleanup on unmount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    sendMessage,
    lastMessage,
    readyState,
    connect,
    disconnect,
  };
}; 