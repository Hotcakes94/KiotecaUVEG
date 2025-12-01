
/**
 * SIMULACIÓN DE SOCKET.IO
 * 
 * Dado que este es un entorno frontend sin servidor Node.js activo,
 * utilizamos la API 'BroadcastChannel' del navegador.
 * 
 * Esto permite que si abres la app en dos pestañas diferentes,
 * se comuniquen entre sí como si hubiera un servidor de por medio.
 */

type Listener = (payload: any) => void;

class MockSocketService {
  private channel: BroadcastChannel;
  private listeners: Record<string, Listener[]> = {};

  constructor() {
    // El nombre del canal actúa como la "sala" del socket
    this.channel = new BroadcastChannel('kioteca-realtime-channel');

    this.channel.onmessage = (event) => {
      const { type, payload } = event.data;
      this.trigger(type, payload);
    };
  }

  // Método para suscribirse a eventos (socket.on)
  on(event: string, callback: Listener) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  // Método para dejar de escuchar (socket.off)
  off(event: string, callback: Listener) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  // Método para enviar mensajes (socket.emit)
  emit(event: string, payload: any) {
    // 1. Enviar a otras pestañas
    this.channel.postMessage({ type: event, payload });
    // 2. Nota: BroadcastChannel NO emite el mensaje a la pestaña que lo envió.
    // La UI local debe actualizarse optimísticamente.
  }

  // Método interno para disparar callbacks
  private trigger(event: string, payload: any) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => cb(payload));
    }
  }
}

export const socket = new MockSocketService();
