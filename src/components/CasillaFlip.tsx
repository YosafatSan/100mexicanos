import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Casilla } from "../types";

const easeInOut = [0.77, 0, 0.175, 1] as const;

export default function CasillaFlip({ numero, casilla }: { numero: number; casilla: Casilla }) {
  return (
    <div style={{ perspective: 1000, height: 76 }}>
      <motion.div
        animate={{ rotateY: casilla.revelada ? 180 : 0 }}
        transition={{ duration: 0.45, ease: easeInOut }}
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
        }}
      >
        <Cara revelada={false}>
          <span className="marcador-digital" style={{ fontSize: 26, fontWeight: 700 }}>
            {numero}
          </span>
        </Cara>
        <Cara revelada transformExtra="rotateY(180deg)">
          <span style={{ fontSize: 18, fontWeight: 700, textTransform: "uppercase" }}>
            {casilla.respuesta.texto}
          </span>
          <span className="marcador-digital" style={{ fontSize: 22, fontWeight: 800, color: "var(--color-accent)" }}>
            {casilla.respuesta.puntos}
          </span>
        </Cara>
      </motion.div>
    </div>
  );
}

function Cara({
  children,
  revelada,
  transformExtra,
}: {
  children: ReactNode;
  revelada: boolean;
  transformExtra?: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backfaceVisibility: "hidden",
        transform: transformExtra,
        borderRadius: 8,
        overflow: "hidden",
        background: revelada ? "var(--color-panel-revelada)" : "var(--color-panel)",
        border: `2px solid ${revelada ? "#2f6b3f" : "var(--color-border)"}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        color: "#fff",
      }}
    >
      {!revelada && (
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: "var(--arcoiris)" }} />
      )}
      {children}
    </div>
  );
}
