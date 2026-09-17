import { useBoardState } from "../hooks/useBoardState";
import ScoreNumber from "../components/ScoreNumber";
import CasillaFlip from "../components/CasillaFlip";
import StrikeMarks from "../components/StrikeMarks";
import DineroRapidoBoard from "../components/DineroRapidoBoard";

export default function BoardView() {
  const s = useBoardState();

  if (!s) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center" }}>
        <p style={{ opacity: 0.6 }}>Esperando conexión con el Presentador…</p>
      </div>
    );
  }

  const esDineroRapido = s.fase === "dineroRapidoSetup" || s.fase === "dineroRapidoJugando";
  const esResultadoFinal = s.fase === "dineroRapidoResultado";

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        textAlign: "center",
        padding: 24,
      }}
    >
      {esDineroRapido && <DineroRapidoBoard dr={s.dineroRapido} />}

      {esResultadoFinal && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <p style={{ opacity: 0.7, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Resultado final</p>
          <h1 style={{ fontSize: 36, margin: 0, maxWidth: 700 }}>{s.mensaje}</h1>
          <p style={{ fontSize: 20, opacity: 0.8, margin: 0 }}>
            {s.dineroRapido.jugador1} + {s.dineroRapido.jugador2} · objetivo {s.reglas.objetivoDineroRapido} pts
          </p>
        </div>
      )}

      {!esDineroRapido && !esResultadoFinal && (
        <>
          <p style={{ opacity: 0.7, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>
            {s.esDesempate ? "Desempate" : `Ronda ${s.numeroRonda}`} · x{s.multiplicadorActual}
          </p>

          {s.preguntaActual ? (
            <h1 style={{ fontSize: 32, margin: 0, maxWidth: 900 }}>{s.preguntaActual.texto}</h1>
          ) : (
            <h1 style={{ fontSize: 32, margin: 0 }}>{s.mensaje}</h1>
          )}

          {(s.fase === "jugando" || s.fase === "robo") && (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: 560 }}>
                {s.casillas.map((c, i) => (
                  <CasillaFlip key={i} numero={i + 1} casilla={c} />
                ))}
              </div>
              <StrikeMarks strikes={s.strikes} max={s.strikesMax} />
              {s.fase === "robo" && (
                <p style={{ color: "var(--color-red)", fontSize: 24, fontWeight: 800, margin: 0 }}>¡ROBO!</p>
              )}
            </>
          )}

          {(s.fase === "finRonda" || s.fase === "finJuego") && (
            <p style={{ fontSize: 24, margin: 0, opacity: 0.9 }}>{s.mensaje}</p>
          )}

          <div style={{ display: "flex", gap: 64 }}>
            {(["equipoA", "equipoB"] as const).map((id) => {
              const equipo = s.equipos[id];
              const enControl = s.equipoEnControl === id;
              return (
                <div key={id} style={{ opacity: s.equipoEnControl && !enControl ? 0.5 : 1 }}>
                  <h2 style={{ margin: 0 }}>{equipo.nombre}</h2>
                  <div style={{ fontSize: 72, fontWeight: 800, color: "var(--color-accent)" }}>
                    <ScoreNumber value={equipo.puntos} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
