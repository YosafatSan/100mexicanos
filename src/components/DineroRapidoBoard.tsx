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
        className="marcador-digital"
        animate={{ scale: urgente ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.6, repeat: urgente ? Infinity : 0, ease: "easeInOut" }}
        style={{
          fontSize: 96,
          color: urgente ? "var(--color-red)" : "var(--color-accent)",
          textShadow: `0 0 20px ${urgente ? "var(--color-red)" : "rgba(255,180,0,0.7)"}`,
        }}
      >
        {dr.tiempoRestante}
      </motion.div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          width: 460,
          padding: "16px 24px",
          borderRadius: 10,
          background: "var(--color-panel)",
          border: "6px solid #9ca3af",
          borderImage: "linear-gradient(160deg, #f3f4f6, #6b7280 40%, #374151) 1",
          boxShadow: "0 0 0 3px #111827 inset, 0 0 0 6px var(--color-neon-blue), 0 0 26px 4px rgba(56,189,248,0.55)",
        }}
      >
        {respuestas.map((r, i) => (
          <div
            key={i}
            className="marcador-digital"
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 8,
              fontSize: 26,
              color: "var(--color-accent)",
              textShadow: "0 0 6px rgba(255,180,0,0.7)",
              opacity: r.texto.trim() ? 1 : 0.5,
            }}
          >
            <span style={{ minWidth: 18 }}>{i + 1}.</span>
            <motion.span
              key={r.texto}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, ease: easeOut }}
              style={{ textTransform: "uppercase" }}
            >
              {r.texto || "—"}
            </motion.span>
            <span style={{ flex: 1, minWidth: 12, borderBottom: "3px dotted currentColor", opacity: 0.35, marginBottom: 6 }} />
            <span style={{ minWidth: 30, textAlign: "right" }}>{r.texto.trim() ? r.puntos : ""}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 28, margin: 0 }}>
        Total: <ScoreNumber value={total} />
      </p>
    </div>
  );
}
