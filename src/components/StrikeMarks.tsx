import { AnimatePresence, motion } from "framer-motion";

export default function StrikeMarks({ strikes, max }: { strikes: number; max: number }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 50,
            height: 50,
            borderRadius: 8,
            border: `2px solid ${i < strikes ? "var(--color-red)" : "#3a1418"}`,
            background: "#1a0808",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          <AnimatePresence>
            {i < strikes && (
              <motion.span
                className="marcador-digital"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                style={{
                  fontSize: 30,
                  fontWeight: 900,
                  color: "var(--color-red)",
                  textShadow: "0 0 12px var(--color-red)",
                }}
              >
                X
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
