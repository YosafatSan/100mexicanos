import { Link } from "react-router-dom";
import Wordmark from "../components/Wordmark";

export default function HomeView() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
      }}
    >
      <Wordmark size={44} />
      <p>Abre cada vista en su propia ventana/monitor.</p>
      <div style={{ display: "flex", gap: 16 }}>
        <Link to="/presentador">Vista Presentador</Link>
        <Link to="/tablero">Vista Tablero</Link>
      </div>
    </div>
  );
}
