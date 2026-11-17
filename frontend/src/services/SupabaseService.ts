import { createClient, SupabaseClient, RealtimeChannel } from '@supabase/supabase-js';
import { WebRTCSignal, ChatMessage } from '../types';

export class SupabaseService {
  private client: SupabaseClient;
  private channel: RealtimeChannel | null = null;

  constructor(url: string, key: string) {
    this.client = createClient(url, key);
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.client.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  }

  async signUp(email: string, password: string) {
    const { data, error } = await this.client.auth.signUp({
      email,
      password,
    });
    return { data, error };
  }

  async signOut() {
    await this.client.auth.signOut();
  }

  async createRoom(name: string) {
    const { data, error } = await this.client
      .from('rooms')
      .insert({ name, host_id: (await this.client.auth.getUser()).data.user?.id })
      .select()
      .single();
    return { data, error };
  }

  async joinRoom(roomId: string) {
    const { data, error } = await this.client
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();
    return { data, error };
  }

  subscribeToRoom(
    roomId: string,
    callbacks: {
      onSignal?: (signal: WebRTCSignal) => void;
      onPresence?: (presences: any) => void;
      onChat?: (message: ChatMessage) => void;
    }
  ) {
    this.channel = this.client.channel(`room:${roomId}`);

    this.channel
      .on('broadcast', { event: 'webrtc-signal' }, (payload) => {
        callbacks.onSignal?.(payload.payload as WebRTCSignal);
      })
      .on('broadcast', { event: 'chat-message' }, (payload) => {
        callbacks.onChat?.(payload.payload as ChatMessage);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = this.channel?.presenceState();
        callbacks.onPresence?.(state);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('Subscribed to room:', roomId);
        }
      });
  }

  async trackPresence(userId: string, displayName: string) {
    if (!this.channel) return;

    await this.channel.track({
      user_id: userId,
      display_name: displayName,
      online_at: new Date().toISOString(),
    });
  }

  async untrackPresence() {
    if (!this.channel) return;
    await this.channel.untrack();
  }

  async sendSignal(signal: WebRTCSignal) {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'webrtc-signal',
      payload: signal,
    });
  }

  async sendChatMessage(message: ChatMessage) {
    if (!this.channel) return;

    await this.channel.send({
      type: 'broadcast',
      event: 'chat-message',
      payload: message,
    });
  }

  async saveMessageToDb(message: ChatMessage) {
    const { data, error } = await this.client.from('chat_messages').insert(message).select();
    return { data, error };
  }

  async getChatHistory(roomId: string, limit: number = 50) {
    const { data, error } = await this.client
      .from('chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('timestamp', { ascending: false })
      .limit(limit);
    return { data, error };
  }

  async saveMediaQueue(roomId: string, queue: any[]) {
    const { data, error } = await this.client
      .from('media_queues')
      .upsert({ room_id: roomId, items: queue })
      .select();
    return { data, error };
  }

  async getMediaQueue(roomId: string) {
    const { data, error } = await this.client
      .from('media_queues')
      .select('*')
      .eq('room_id', roomId)
      .single();
    return { data, error };
  }

  leaveRoom() {
    if (this.channel) {
      this.channel.unsubscribe();
      this.channel = null;
    }
  }

  destroy() {
    this.leaveRoom();
  }
}
