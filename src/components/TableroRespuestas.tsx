import { AnimatePresence, motion } from "framer-motion";
import type { Casilla } from "../types";

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function TableroRespuestas({ casillas }: { casillas: Casilla[] }) {
  return (
    <div
      style={{
        width: 620,
        maxWidth: "100%",
        padding: "18px 28px",
        borderRadius: 10,
        background: "var(--color-panel)",
        border: "6px solid #9ca3af",
        borderImage: "linear-gradient(160deg, #f3f4f6, #6b7280 40%, #374151) 1",
        boxShadow: "0 0 0 3px #111827 inset, 0 0 0 6px var(--color-neon-blue), 0 0 26px 4px rgba(56,189,248,0.55)",
      }}
    >
      {casillas.map((c, i) => (
        <FilaRespuesta key={i} numero={i + 1} casilla={c} />
      ))}
    </div>
  );
}

function FilaRespuesta({ numero, casilla }: { numero: number; casilla: Casilla }) {
  return (
    <div
      className="marcador-digital"
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 8,
        fontSize: 28,
        lineHeight: 1.3,
        color: "var(--color-accent)",
        textShadow: "0 0 6px rgba(255,180,0,0.7)",
      }}
    >
      <span style={{ minWidth: 22 }}>{numero}.</span>
      <AnimatePresence mode="popLayout" initial={false}>
        {casilla.revelada && (
          <motion.span
            key="texto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.18, ease: easeOut }}
            style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
          >
            {casilla.respuesta.texto.toUpperCase()}
          </motion.span>
        )}
      </AnimatePresence>
      <span style={{ flex: 1, minWidth: 16, borderBottom: "3px dotted currentColor", opacity: 0.35, marginBottom: 7 }} />
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={casilla.revelada ? "pts" : "vacio"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18, ease: easeOut }}
          style={{ minWidth: 34, textAlign: "right" }}
        >
          {casilla.revelada ? casilla.respuesta.puntos : "—"}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
