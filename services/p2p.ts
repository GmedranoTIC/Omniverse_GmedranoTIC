
import { Peer, DataConnection } from 'peerjs';
import { WorldState, WorldObject } from '../types';

export enum P2PMessageType {
  SYNC_WORLD = 'SYNC_WORLD',
  UPDATE_OBJECT = 'UPDATE_OBJECT',
  ADD_OBJECT = 'ADD_OBJECT',
  DELETE_OBJECT = 'DELETE_OBJECT',
  USER_JOINED = 'USER_JOINED',
  CHAT = 'CHAT'
}

export interface P2PMessage {
  type: P2PMessageType;
  payload: any;
  senderId: string;
}

export class P2PManager {
  private peer: Peer | null = null;
  private connections: Map<string, DataConnection> = new Map();
  private onMessageCallback: (msg: P2PMessage) => void;
  private onConnectionsUpdate: (count: number) => void;
  public peerId: string = '';

  constructor(
    onMessage: (msg: P2PMessage) => void,
    onConnectionsUpdate: (count: number) => void
  ) {
    this.onMessageCallback = onMessage;
    this.onConnectionsUpdate = onConnectionsUpdate;
  }

  public initialize(id?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.peer = new Peer(id);

      this.peer.on('open', (peerId) => {
        this.peerId = peerId;
        console.log('P2P: Peer opened with ID:', peerId);
        resolve(peerId);
      });

      this.peer.on('connection', (conn) => {
        this.handleConnection(conn);
      });

      this.peer.on('error', (err) => {
        console.error('P2P Error:', err);
        reject(err);
      });
    });
  }

  private handleConnection(conn: DataConnection) {
    conn.on('open', () => {
      this.connections.set(conn.peer, conn);
      this.onConnectionsUpdate(this.connections.size);
      
      // If we are the host, we should send the current world state to the new peer
      // This logic will be handled in the App component via the callback
      this.onMessageCallback({
        type: P2PMessageType.USER_JOINED,
        payload: conn.peer,
        senderId: conn.peer
      });
    });

    conn.on('data', (data: any) => {
      this.onMessageCallback(data as P2PMessage);
    });

    conn.on('close', () => {
      this.connections.delete(conn.peer);
      this.onConnectionsUpdate(this.connections.size);
    });
  }

  public connectToPeer(targetId: string) {
    if (!this.peer) return;
    const conn = this.peer.connect(targetId);
    this.handleConnection(conn);
  }

  public broadcast(type: P2PMessageType, payload: any) {
    const message: P2PMessage = {
      type,
      payload,
      senderId: this.peerId
    };

    this.connections.forEach((conn) => {
      if (conn.open) {
        conn.send(message);
      }
    });
  }

  public sendTo(targetId: string, type: P2PMessageType, payload: any) {
    const conn = this.connections.get(targetId);
    if (conn && conn.open) {
      conn.send({
        type,
        payload,
        senderId: this.peerId
      });
    }
  }

  public disconnect() {
    this.connections.forEach(conn => conn.close());
    this.peer?.destroy();
  }
}
