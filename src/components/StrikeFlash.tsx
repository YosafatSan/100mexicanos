import { AnimatePresence, motion } from "framer-motion";

const easeOut = [0.23, 1, 0.32, 1] as const;

export default function StrikeFlash({ trigger }: { trigger: number }) {
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <motion.div
          key={trigger}
          initial={{ opacity: 0.55 }}
          animate={{ opacity: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: easeOut }}
          style={{
            position: "fixed",
            inset: 0,
            pointerEvents: "none",
            background: "radial-gradient(circle, rgba(225,29,46,0.6) 0%, rgba(225,29,46,0) 70%)",
          }}
        />
      )}
    </AnimatePresence>
  );
}
