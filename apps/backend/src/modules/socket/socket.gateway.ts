import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';

/**
 * Events the gateway emits/accepts.
 *
 * Inbound (client → server):
 *  - museum:join_room   { slug }
 *  - museum:leave_room  { slug }
 *
 * Outbound (server → client):
 *  - museum:exhibit_created    { exhibitId, roomSlug? }
 *  - museum:atmosphere         { weather, lighting, intensity }
 *  - museum:presence           { roomSlug, count }
 */
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(SocketGateway.name);

  @WebSocketServer()
  server!: Server;

  /** Tracks current visitor count per museum room (slug). */
  private presence = new Map<string, Set<string>>();

  handleConnection(client: Socket) {
    this.logger.debug(`Visitor connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.debug(`Visitor disconnected: ${client.id}`);
    // Clean up any rooms this socket was a part of.
    for (const [slug, set] of this.presence) {
      if (set.delete(client.id)) {
        this.broadcastPresence(slug);
      }
    }
  }

  @SubscribeMessage('museum:join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() slug: string) {
    if (typeof slug !== 'string' || !slug) return;
    client.join(slug);
    const set = this.presence.get(slug) ?? new Set<string>();
    set.add(client.id);
    this.presence.set(slug, set);
    this.broadcastPresence(slug);
  }

  @SubscribeMessage('museum:leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() slug: string) {
    if (typeof slug !== 'string' || !slug) return;
    client.leave(slug);
    this.presence.get(slug)?.delete(client.id);
    this.broadcastPresence(slug);
  }

  // --- Server-side broadcast helpers ---------------------------------------

  /** Emit when a new exhibit is preserved. */
  broadcastExhibitCreated(payload: { exhibitId: string; roomSlug?: string | null }) {
    this.server?.emit('museum:exhibit_created', payload);
    if (payload.roomSlug) {
      this.server?.to(payload.roomSlug).emit('museum:exhibit_created', payload);
    }
  }

  /** Emit a global atmosphere change (weather / lighting / intensity). */
  broadcastAtmosphere(payload: { weather: string; lighting: string; intensity: string }) {
    this.server?.emit('museum:atmosphere', payload);
  }

  private broadcastPresence(slug: string) {
    const count = this.presence.get(slug)?.size ?? 0;
    this.server?.to(slug).emit('museum:presence', { roomSlug: slug, count });
  }
}
