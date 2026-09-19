import { motion } from "framer-motion";
import type { Casilla } from "../types";

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function TableroRespuestas({ casillas, ronda }: { casillas: Casilla[]; ronda: string }) {
  return (
    <div className="marco-feud">
      <div
        className="anillo-azul"
        style={{ width: "min(620px, 88vw)" }}
      >
        {casillas.map((c, i) => (
          <FilaRespuesta key={i} numero={i + 1} casilla={c} />
        ))}
      </div>
      <span className="pill-ronda">{ronda}</span>
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
        fontSize: "clamp(16px, 3.4vw, 28px)",
        lineHeight: 1.3,
        color: "var(--color-accent)",
        textShadow: "0 0 6px rgba(255,180,0,0.7)",
      }}
    >
      <span style={{ minWidth: 22 }}>{numero}.</span>
      {casilla.revelada ? (
        // Aparece de izquierda a derecha (wipe), como si se "destapara" la respuesta.
        <motion.div
          key="on"
          initial={{ clipPath: "inset(0 100% 0 0)" }}
          animate={{ clipPath: "inset(0 0% 0 0)" }}
          transition={{ duration: 0.5, ease: easeOut }}
          style={{ display: "flex", alignItems: "baseline", gap: 8, flex: 1, minWidth: 0 }}
        >
          <span style={{ minWidth: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {casilla.respuesta.texto.toUpperCase()}
          </span>
          <span style={{ flex: 1, minWidth: 16, borderBottom: "3px dotted currentColor", opacity: 0.35, marginBottom: 7 }} />
          <span style={{ minWidth: 34, textAlign: "right" }}>{casilla.respuesta.puntos}</span>
        </motion.div>
      ) : (
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, flex: 1, minWidth: 0 }}>
          <span style={{ flex: 1, minWidth: 16, borderBottom: "3px dotted currentColor", opacity: 0.35, marginBottom: 7 }} />
          <span style={{ minWidth: 34, textAlign: "right" }}>—</span>
        </div>
      )}
    </div>
  );
}
