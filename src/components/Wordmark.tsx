export default function Wordmark({ size = 40 }: { size?: number }) {
  return (
    <span
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: size,
        letterSpacing: 1,
        background: "var(--arcoiris)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        display: "inline-block",
      }}
    >
      100 Mexicanos Dijeron
    </span>
  );
}
