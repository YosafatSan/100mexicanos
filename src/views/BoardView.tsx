import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { motion } from "framer-motion";
import { useBoardState } from "../hooks/useBoardState";
import { useGameSounds } from "../hooks/useGameSounds";
import { onMessage } from "../lib/channel";
import { desbloquear, sonidos } from "../lib/sound";
import ScoreNumber from "../components/ScoreNumber";
import TableroRespuestas from "../components/TableroRespuestas";
import StrikeMarks from "../components/StrikeMarks";
import StrikeFlash from "../components/StrikeFlash";
import DineroRapidoBoard from "../components/DineroRapidoBoard";
import Wordmark from "../components/Wordmark";

const BARRA_ARCOIRIS: CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  height: 6,
  background: "var(--arcoiris)",
  zIndex: 5,
};

export default function BoardView() {
  const s = useBoardState();
  const [audioListo, setAudioListo] = useState(false);

  useGameSounds(s, audioListo);

  useEffect(() => {
    if (!audioListo) return;
    return onMessage((msg) => {
      if (msg.type === "sfx") sonidos[msg.sonido]();
    });
  }, [audioListo]);

  if (!s) {
    return (
      <div style={{ height: "100%", display: "grid", placeItems: "center", gap: 16 }}>
        <div style={{ ...BARRA_ARCOIRIS, top: 0 }} />
        <Wordmark size={32} />
        <p style={{ opacity: 0.6 }}>Esperando conexión con el Presentador…</p>
        <div style={{ ...BARRA_ARCOIRIS, bottom: 0 }} />
      </div>
    );
  }

  const esDineroRapido = s.fase === "dineroRapidoSetup" || s.fase === "dineroRapidoJugando";
  const esResultadoFinal = s.fase === "dineroRapidoResultado";
  const esFinJuego = s.fase === "finJuego";

  return (
    <div
      className="pantalla-tablero"
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 24,
        textAlign: "center",
        padding: 24,
        position: "relative",
      }}
    >
      {!audioListo && (
        <button
          onClick={() => {
            desbloquear();
            setAudioListo(true);
          }}
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            zIndex: 10,
            padding: "8px 14px",
            borderRadius: 8,
            border: "1px solid #444",
            background: "#1a1a2e",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          🔊 Activar sonido
        </button>
      )}

      <div style={{ ...BARRA_ARCOIRIS, top: 0 }} />
      <div style={{ ...BARRA_ARCOIRIS, bottom: 0 }} />

      <StrikeFlash trigger={s.strikes} />

      {esDineroRapido && <DineroRapidoBoard dr={s.dineroRapido} />}

      {esResultadoFinal && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <p style={{ opacity: 0.7, letterSpacing: 2, textTransform: "uppercase", margin: 0 }}>Resultado final</p>
          <h1 style={{ fontSize: "clamp(22px, 5vw, 36px)", margin: 0, maxWidth: "90vw" }}>{s.mensaje}</h1>
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

          {esFinJuego && s.ganadorRondaPrincipal ? (
            <motion.h1
              key="ganador"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
              style={{ fontSize: "clamp(24px, 5.5vw, 40px)", margin: 0, maxWidth: "90vw" }}
            >
              🎉 {s.equipos[s.ganadorRondaPrincipal].nombre} gana la ronda principal con{" "}
              {s.equipos[s.ganadorRondaPrincipal].puntos} puntos
            </motion.h1>
          ) : s.preguntaActual ? (
            <h1 style={{ fontSize: "clamp(20px, 4.5vw, 32px)", margin: 0, maxWidth: "90vw" }}>{s.preguntaActual.texto}</h1>
          ) : (
            <h1 style={{ fontSize: "clamp(20px, 4.5vw, 32px)", margin: 0 }}>{s.mensaje}</h1>
          )}

          {(s.fase === "jugando" || s.fase === "robo") && (
            <>
              <TableroRespuestas casillas={s.casillas} />
              <StrikeMarks strikes={s.strikes} max={s.strikesMax} />
              {s.fase === "robo" && (
                <p style={{ color: "var(--color-red)", fontSize: 24, fontWeight: 800, margin: 0 }}>¡ROBO!</p>
              )}
            </>
          )}

          {s.fase === "finRonda" && <p style={{ fontSize: 24, margin: 0, opacity: 0.9 }}>{s.mensaje}</p>}

          <div style={{ display: "flex", gap: "clamp(24px, 8vw, 64px)" }}>
            {(["equipoA", "equipoB"] as const).map((id) => {
              const equipo = s.equipos[id];
              const enControl = s.equipoEnControl === id;
              return (
                <div key={id} style={{ opacity: s.equipoEnControl && !enControl ? 0.5 : 1 }}>
                  <h2 style={{ margin: 0, fontSize: "clamp(16px, 3vw, 24px)" }}>{equipo.nombre}</h2>
                  <div style={{ fontSize: "clamp(40px, 10vw, 72px)", fontWeight: 800, color: "var(--color-accent)" }}>
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
