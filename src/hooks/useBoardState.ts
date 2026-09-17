import { useEffect, useState } from "react";
import type { EstadoJuego } from "../types";
import { broadcast, onMessage } from "../lib/channel";

// Board no tiene estado propio: solo renderiza el último snapshot del Presentador.
export function useBoardState() {
  const [estado, setEstado] = useState<EstadoJuego | null>(null);

  useEffect(() => {
    const unsubscribe = onMessage((message) => {
      if (message.type === "state") {
        setEstado(message.payload);
      }
    });
    broadcast({ type: "requestSync" });
    return unsubscribe;
  }, []);

  return estado;
}
