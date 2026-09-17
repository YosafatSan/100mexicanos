import { AnimatePresence, motion } from "framer-motion";

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function ScoreNumber({ value }: { value: number }) {
  return (
    <span
      className="marcador-puntaje"
      style={{
        position: "relative",
        display: "inline-block",
        overflow: "hidden",
        textShadow: "0 0 8px currentColor",
      }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -12, opacity: 0 }}
          transition={{ duration: 0.2, ease: easeOut }}
          style={{ display: "inline-block" }}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
