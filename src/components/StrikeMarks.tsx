import { AnimatePresence, motion } from "framer-motion";

export default function StrikeMarks({ strikes, max }: { strikes: number; max: number }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {Array.from({ length: max }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 48,
            height: 48,
            borderRadius: 8,
            border: "2px solid #5a1a1a",
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
          }}
        >
          <AnimatePresence>
            {i < strikes && (
              <motion.span
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.4, bounce: 0.25 }}
                style={{ fontSize: 32, fontWeight: 900, color: "var(--color-red)" }}
              >
                ✗
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
