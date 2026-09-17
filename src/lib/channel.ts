import type { EstadoJuego } from "../types";
import type { SonidoManual } from "./sound";

export const CHANNEL_NAME = "100mx-dijeron-sync";

export type SyncMessage =
  | { type: "state"; payload: EstadoJuego }
  | { type: "requestSync" }
  | { type: "sfx"; sonido: SonidoManual };

const gameChannel = new BroadcastChannel(CHANNEL_NAME);

export function broadcast(message: SyncMessage) {
  gameChannel.postMessage(message);
}

export function onMessage(handler: (message: SyncMessage) => void) {
  const listener = (event: MessageEvent<SyncMessage>) => handler(event.data);
  gameChannel.addEventListener("message", listener);
  return () => gameChannel.removeEventListener("message", listener);
}

export function enviarSfx(sonido: SonidoManual) {
  broadcast({ type: "sfx", sonido });
}
