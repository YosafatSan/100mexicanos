import Wordmark from "../components/Wordmark";

function abrir(ruta: string, nombre: string) {
  window.open(`${window.location.origin}/#${ruta}`, nombre);
}

const botonEstilo = {
  fontFamily: "var(--font-display)",
  fontWeight: 800,
  fontSize: 18,
  padding: "16px 28px",
  borderRadius: 14,
  border: "2px solid rgba(255,255,255,0.25)",
  background: "rgba(0,0,0,0.55)",
  color: "#fff",
  cursor: "pointer",
  boxShadow: "0 0 0 2px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.5)",
};

export default function HomeView() {
  return (
    <div
      className="pantalla-tablero"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        textAlign: "center",
        padding: 24,
      }}
    >
      <Wordmark size={44} />
      <p style={{ opacity: 0.85, maxWidth: 480, margin: 0 }}>
        Abre cada vista en su propia ventana. Mueve la vista Tablero a tu segundo monitor o proyector — lo que hagas
        en Presentador se refleja ahí en vivo.
      </p>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
        <button style={botonEstilo} onClick={() => abrir("/presentador", "presentador-100mx")}>
          🎙️ Vista Presentador
        </button>
        <button style={botonEstilo} onClick={() => abrir("/tablero", "tablero-100mx")}>
          🖥️ Vista Tablero
        </button>
      </div>
      <p style={{ opacity: 0.5, fontSize: 13, margin: 0 }}>
        (También puedes abrir <code>/#/presentador</code> y <code>/#/tablero</code> directamente en dos pestañas)
      </p>
    </div>
  );
}
