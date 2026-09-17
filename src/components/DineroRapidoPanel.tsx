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
    <div>
      <h3>
        Dinero Rápido — Jugador {dr.jugadorActivo}: {jugadorActivoNombre || "(sin nombre)"}
      </h3>
      <p style={{ fontSize: 40, fontWeight: 800, margin: "4px 0" }}>{dr.tiempoRestante}s</p>

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        {!dr.corriendo && (
          <button onClick={iniciarTurnoDineroRapido}>
            Iniciar turno ({dr.jugadorActivo === 1 ? 15 : 20}s)
          </button>
        )}
        {dr.corriendo && <button onClick={pararTiempoDineroRapido}>Detener</button>}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {respuestas.map((r, i) => {
          const duplicado = dr.jugadorActivo === 2 && esDuplicado(dr, i);
          return (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <span style={{ width: 16 }}>{i + 1}.</span>
              <input
                placeholder="Respuesta"
                value={r.texto}
                onChange={(e) => setRespuestaDineroRapido(dr.jugadorActivo, i, "texto", e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                placeholder="Pts"
                value={r.puntos}
                onChange={(e) => setRespuestaDineroRapido(dr.jugadorActivo, i, "puntos", Number(e.target.value))}
                style={{ width: 70 }}
              />
              {duplicado && <span style={{ color: "var(--color-red)", fontSize: 12 }}>duplicado, no cuenta</span>}
            </div>
          );
        })}
      </div>

      <p style={{ marginTop: 8 }}>Total del jugador: {total}</p>

      <button onClick={terminarTurnoDineroRapido} style={{ marginTop: 12 }}>
        {dr.jugadorActivo === 1 ? "Terminar turno de Jugador 1" : "Terminar y ver resultado"}
      </button>
    </div>
  );
}
