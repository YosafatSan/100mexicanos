import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import { esDuplicado, totalJugador1, totalJugador2 } from "../lib/dineroRapido";

export default function DineroRapidoPanel() {
  const s = useGameStore((st) => st.estado);
  const { iniciarTurnoDineroRapido, descontarSegundoDineroRapido, pararTiempoDineroRapido, setRespuestaDineroRapido, terminarTurnoDineroRapido } =
    useGameStore();
  const dr = s.dineroRapido;

  useEffect(() => {
    if (!dr.corriendo) return;
    const id = setInterval(() => descontarSegundoDineroRapido(), 1000);
    return () => clearInterval(id);
  }, [dr.corriendo, descontarSegundoDineroRapido]);

  const jugadorActivoNombre = dr.jugadorActivo === 1 ? dr.jugador1 : dr.jugador2;
  const respuestas = dr.jugadorActivo === 1 ? dr.respuestasJugador1 : dr.respuestasJugador2;
  const total = dr.jugadorActivo === 1 ? totalJugador1(dr) : totalJugador2(dr);

  return (
    <div className="pv-card">
      <p className="pv-card-title">Dinero Rápido — Jugador {dr.jugadorActivo}</p>
      <h3 style={{ margin: "0 0 10px" }}>{jugadorActivoNombre || "(sin nombre)"}</h3>
      <p className="marcador-puntaje" style={{ fontSize: 44, margin: "0 0 14px", color: "var(--pv-accent)" }}>
        {dr.tiempoRestante}s
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {!dr.corriendo && (
          <button className="pv-btn pv-btn-primary" onClick={iniciarTurnoDineroRapido}>
            ▶️ Iniciar turno ({dr.jugadorActivo === 1 ? 15 : 20}s)
          </button>
        )}
        {dr.corriendo && (
          <button className="pv-btn pv-btn-danger" onClick={pararTiempoDineroRapido}>
            ⏸️ Detener
          </button>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {respuestas.map((r, i) => {
          const duplicado = dr.jugadorActivo === 2 && esDuplicado(dr, i);
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 16, color: "var(--pv-text-dim)", fontSize: 13 }}>{i + 1}.</span>
              <input
                className="pv-input"
                placeholder="Respuesta"
                value={r.texto}
                onChange={(e) => setRespuestaDineroRapido(dr.jugadorActivo, i, "texto", e.target.value)}
                style={{ flex: 1, minWidth: 0 }}
              />
              <input
                className="pv-input"
                type="number"
                placeholder="Pts"
                value={r.puntos}
                onChange={(e) => setRespuestaDineroRapido(dr.jugadorActivo, i, "puntos", Number(e.target.value))}
                style={{ width: 70 }}
              />
              {duplicado && (
                <span style={{ color: "var(--pv-danger)", fontSize: 12, whiteSpace: "nowrap" }}>duplicado, no cuenta</span>
              )}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 12, color: "var(--pv-text-dim)" }}>
        Total del jugador: <span style={{ color: "var(--pv-text)", fontWeight: 700 }}>{total}</span>
      </p>

      <button className="pv-btn pv-btn-primary pv-btn-block" style={{ marginTop: 8 }} onClick={terminarTurnoDineroRapido}>
        {dr.jugadorActivo === 1 ? "Terminar turno de Jugador 1" : "Terminar y ver resultado"}
      </button>
    </div>
  );
}
