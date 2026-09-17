import { motion } from "framer-motion";
import type { ReactNode } from "react";
import type { Casilla } from "../types";

const easeInOut = [0.77, 0, 0.175, 1] as const;

export default function CasillaFlip({ numero, casilla }: { numero: number; casilla: Casilla }) {
  return (
    <div style={{ perspective: 1000, height: 72 }}>
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
        <Cara oculta={false}>
          <span style={{ fontSize: 24, fontWeight: 700 }}>{numero}</span>
        </Cara>
        <Cara oculta transformExtra="rotateY(180deg)">
          <span style={{ fontSize: 18, fontWeight: 700, textTransform: "uppercase" }}>
            {casilla.respuesta.texto}
          </span>
          <span style={{ fontSize: 20, fontWeight: 800, color: "var(--color-accent)" }}>
            {casilla.respuesta.puntos}
          </span>
        </Cara>
      </motion.div>
    </div>
  );
}

function Cara({
  children,
  oculta,
  transformExtra,
}: {
  children: ReactNode;
  oculta: boolean;
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
        background: oculta ? "#1f4d2b" : "#1a1a2e",
        border: "2px solid #333",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        color: "#fff",
      }}
    >
      {children}
    </div>
  );
}
