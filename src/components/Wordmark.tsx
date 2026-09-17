// Reconstrucción tipográfica de los colores reales del logo (visto en la
// caja del juego de mesa oficial): "100" dorado, "Mexicanos" rosa/magenta
// cursiva, "dijeron" blanco con contorno azul — no es el asset oficial
// (no lo tenemos), es una aproximación con CSS.
export default function Wordmark({ size = 40 }: { size?: number }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontStyle: "italic",
        fontSize: size,
        padding: `${size * 0.25}px ${size * 0.5}px`,
        borderRadius: 999,
        background: "var(--arcoiris)",
      }}
    >
      <span style={{ color: "#ffcc00" }}>100</span>{" "}
      <span style={{ color: "#ff3fa4" }}>Mexicanos</span>{" "}
      <span
        style={{
          color: "#fff",
          WebkitTextStroke: "1.5px #1d4ed8",
          paintOrder: "stroke fill",
        }}
      >
        dijeron
      </span>
    </span>
  );
}
