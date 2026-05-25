'use client';

import { useEffect, useRef } from 'react';
import { io, type Socket } from 'socket.io-client';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type ExhibitCreatedEvent = { exhibitId: string; roomSlug?: string | null };
export type AtmosphereEvent = { weather: string; lighting: string; intensity: string };
export type PresenceEvent = { roomSlug: string; count: number };

interface MuseumSocketHandlers {
  onExhibitCreated?: (e: ExhibitCreatedEvent) => void;
  onAtmosphere?: (e: AtmosphereEvent) => void;
  onPresence?: (e: PresenceEvent) => void;
  /** Optional museum room slug to auto-join on connect. */
  joinRoom?: string;
}

/**
 * Connects to the backend Socket.IO gateway and forwards museum events
 * to optional handler callbacks. Designed to be a thin, reusable hook
 * — components that don't need a particular event simply omit the
 * handler.
 */
export function useMuseumSocket(handlers: MuseumSocketHandlers = {}): React.RefObject<Socket | null> {
  const socketRef = useRef<Socket | null>(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = io(API_BASE, {
      transports: ['websocket'],
      withCredentials: true,
      reconnection: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      const room = handlersRef.current.joinRoom;
      if (room) socket.emit('museum:join_room', room);
    });

    socket.on('museum:exhibit_created', (e: ExhibitCreatedEvent) => {
      handlersRef.current.onExhibitCreated?.(e);
    });
    socket.on('museum:atmosphere', (e: AtmosphereEvent) => {
      handlersRef.current.onAtmosphere?.(e);
    });
    socket.on('museum:presence', (e: PresenceEvent) => {
      handlersRef.current.onPresence?.(e);
    });

    return () => {
      const room = handlersRef.current.joinRoom;
      if (room) socket.emit('museum:leave_room', room);
      socket.disconnect();
    };
  }, []);

  return socketRef;
}
