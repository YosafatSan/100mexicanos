import { motion } from "framer-motion";
import type { EstadoDineroRapido } from "../types";
import { totalJugador1, totalJugador2 } from "../lib/dineroRapido";
import ScoreNumber from "./ScoreNumber";

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function DineroRapidoBoard({ dr }: { dr: EstadoDineroRapido }) {
  const jugadorActivoNombre = dr.jugadorActivo === 1 ? dr.jugador1 : dr.jugador2;
  const respuestas = dr.jugadorActivo === 1 ? dr.respuestasJugador1 : dr.respuestasJugador2;
  const total = dr.jugadorActivo === 1 ? totalJugador1(dr) : totalJugador2(dr);
  const urgente = dr.corriendo && dr.tiempoRestante <= 5;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <p style={{ opacity: 0.7, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
        Dinero Rápido · Jugador {dr.jugadorActivo}
      </p>
      <h1 style={{ margin: 0 }}>{jugadorActivoNombre || "…"}</h1>

      <motion.div
        animate={{ scale: urgente ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.6, repeat: urgente ? Infinity : 0, ease: "easeInOut" }}
        style={{
          fontSize: 88,
          fontWeight: 900,
          color: urgente ? "var(--color-red)" : "var(--color-accent)",
        }}
      >
        {dr.tiempoRestante}
      </motion.div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, width: 420 }}>
        {respuestas.map((r, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 16px",
              borderRadius: 8,
              background: r.texto.trim() ? "#1f4d2b" : "#1a1a2e",
              border: "1px solid #333",
              opacity: r.texto.trim() ? 1 : 0.4,
            }}
          >
            <motion.span
              key={r.texto}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: easeOut }}
            >
              {r.texto || "—"}
            </motion.span>
            <span style={{ fontWeight: 700 }}>{r.texto.trim() ? r.puntos : ""}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 28, margin: 0 }}>
        Total: <ScoreNumber value={total} />
      </p>
    </div>
  );
}
