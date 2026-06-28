import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import useAuthStore from '../store/authStore';

const useWebSocket = (onMessageReceived) => {
  const clientRef = useRef(null);
  const { user, token } = useAuthStore();

  useEffect(() => {
    if (!user || !token) return;

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8085/ws'),
      connectHeaders: { Authorization: `Bearer ${token}` },
      onConnect: () => {
        client.subscribe(`/user/${user.userId}/queue/messages`, (message) => {
          const body = JSON.parse(message.body);
          onMessageReceived(body);
        });
      },
      onDisconnect: () => console.log('WebSocket disconnected'),
      reconnectDelay: 5000,
    });

    client.activate();
    clientRef.current = client;

    return () => client.deactivate();
  }, [user, token]);

  return clientRef;
};

export default useWebSocket;