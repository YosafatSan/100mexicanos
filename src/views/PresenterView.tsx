import { useState } from "react";
import { useGameStore } from "../store/gameStore";
import BancoEditor from "../components/BancoEditor";
import DineroRapidoPanel from "../components/DineroRapidoPanel";
import { totalCombinado } from "../lib/dineroRapido";
import { enviarSfx } from "../lib/channel";

export default function PresenterView() {
  const s = useGameStore((st) => st.estado);
  const historial = useGameStore((st) => st.historial);
  const {
    deshacer,
    reiniciarPartida,
    ganarFaceOff,
    revelarCasilla,
    marcarStrike,
    resolverRobo,
    siguienteRonda,
    setNombreEquipo,
    irADineroRapido,
  } = useGameStore();

  return (
    <div style={{ padding: 24, maxWidth: 780, display: "flex", flexDirection: "column", gap: 20 }}>
      <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22 }}>Vista Presentador</h1>
          <p style={{ opacity: 0.7, margin: "4px 0 0" }}>
            {s.esDesempate ? "Ronda de desempate" : `Ronda ${s.numeroRonda}`} · multiplicador x{s.multiplicadorActual} · strikes máx {s.strikesMax}
          </p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button onClick={() => enviarSfx("redoble")} title="Suena solo en el Tablero">
            🥁 Redoble
          </button>
          <button onClick={() => enviarSfx("aplausos")} title="Suena solo en el Tablero">
            👏 Aplausos
          </button>
          <button onClick={deshacer} disabled={historial.length === 0}>
            Deshacer
          </button>
          <button onClick={reiniciarPartida}>Reiniciar partida</button>
        </div>
      </header>

      <section style={{ display: "flex", gap: 16 }}>
        {(["equipoA", "equipoB"] as const).map((id) => (
          <div key={id} style={{ border: "1px solid #333", borderRadius: 8, padding: 12, flex: 1 }}>
            <input
              value={s.equipos[id].nombre}
              onChange={(e) => setNombreEquipo(id, e.target.value)}
              style={{ fontWeight: 700, marginBottom: 6, width: "100%" }}
            />
            <p style={{ fontSize: 28, margin: 0 }}>{s.equipos[id].puntos} pts</p>
            {s.equipoEnControl === id && <p style={{ color: "#ffcc00", margin: "4px 0 0" }}>En control</p>}
          </div>
        ))}
      </section>

      <p style={{ background: "#14142a", padding: 12, borderRadius: 8 }}>{s.mensaje}</p>

      {s.fase === "seleccionPregunta" && <BancoEditor />}

      {s.fase === "faceoff" && s.preguntaActual && (
        <div>
          <h3>{s.preguntaActual.texto}</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => ganarFaceOff("equipoA")}>{s.equipos.equipoA.nombre} gana el control</button>
            <button onClick={() => ganarFaceOff("equipoB")}>{s.equipos.equipoB.nombre} gana el control</button>
          </div>
          <VistaPreviaCasillas casillas={s.casillas} />
        </div>
      )}

      {s.fase === "jugando" && (
        <div>
          <h3>{s.preguntaActual?.texto}</h3>
          <p>
            Strikes: {"✗".repeat(s.strikes)}
            {"·".repeat(Math.max(0, s.strikesMax - s.strikes))}
          </p>
          <CasillasPresenter casillas={s.casillas} onRevelar={revelarCasilla} />
          <button onClick={marcarStrike} style={{ marginTop: 12 }}>
            Marcar strike
          </button>
        </div>
      )}

      {s.fase === "robo" && (
        <div>
          <h3>Robo — {s.preguntaActual?.texto}</h3>
          <p>Respuestas restantes (elige la que digan, o marca robo fallido):</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {s.casillas.map(
              (c, i) =>
                !c.revelada && (
                  <button key={i} onClick={() => resolverRobo(true, i)}>
                    Acertó: {c.respuesta.texto} ({c.respuesta.puntos})
                  </button>
                ),
            )}
          </div>
          <button onClick={() => resolverRobo(false)} style={{ marginTop: 12 }}>
            Robo fallido
          </button>
        </div>
      )}

      {s.fase === "finRonda" && <button onClick={siguienteRonda}>Siguiente ronda</button>}

      {s.fase === "finJuego" && s.ganadorRondaPrincipal && (
        <IniciarDineroRapido
          nombreEquipo={s.equipos[s.ganadorRondaPrincipal].nombre}
          jugadoresSugeridos={s.equipos[s.ganadorRondaPrincipal].jugadores.map((j) => j.nombre)}
          onIniciar={irADineroRapido}
        />
      )}

      {(s.fase === "dineroRapidoSetup" || s.fase === "dineroRapidoJugando") && <DineroRapidoPanel />}

      {s.fase === "dineroRapidoResultado" && (
        <div>
          <h2>{s.mensaje}</h2>
          <p>
            Jugador 1 ({s.dineroRapido.jugador1}): suma parcial —{" "}
            {s.dineroRapido.respuestasJugador1.reduce((a, r) => a + r.puntos, 0)}
          </p>
          <p>
            Jugador 2 ({s.dineroRapido.jugador2}): suma parcial —{" "}
            {s.dineroRapido.respuestasJugador2.reduce((a, r) => a + r.puntos, 0)}
          </p>
          <p style={{ fontWeight: 700 }}>Total combinado: {totalCombinado(s.dineroRapido)}</p>
          <button onClick={reiniciarPartida}>Nueva partida</button>
        </div>
      )}
    </div>
  );
}

function IniciarDineroRapido({
  nombreEquipo,
  jugadoresSugeridos,
  onIniciar,
}: {
  nombreEquipo: string;
  jugadoresSugeridos: string[];
  onIniciar: (j1: string, j2: string) => void;
}) {
  const [j1, setJ1] = useState(jugadoresSugeridos[0] ?? "");
  const [j2, setJ2] = useState(jugadoresSugeridos[1] ?? "");

  return (
    <div>
      <h2>{nombreEquipo} gana la ronda principal 🎉</h2>
      <p>Elige a los 2 jugadores para Dinero Rápido:</p>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input placeholder="Jugador 1 (15s)" value={j1} onChange={(e) => setJ1(e.target.value)} />
        <input placeholder="Jugador 2 (20s)" value={j2} onChange={(e) => setJ2(e.target.value)} />
      </div>
      <button onClick={() => onIniciar(j1, j2)} disabled={!j1.trim() || !j2.trim()}>
        Ir a Dinero Rápido
      </button>
    </div>
  );
}

function VistaPreviaCasillas({ casillas }: { casillas: { respuesta: { texto: string; puntos: number } }[] }) {
  return (
    <div style={{ marginTop: 12, fontSize: 14, opacity: 0.8 }}>
      <p>Respuestas (solo tú las ves):</p>
      <ol>
        {casillas.map((c, i) => (
          <li key={i}>
            {c.respuesta.texto} — {c.respuesta.puntos}
          </li>
        ))}
      </ol>
    </div>
  );
}

function CasillasPresenter({
  casillas,
  onRevelar,
}: {
  casillas: { respuesta: { texto: string; puntos: number }; revelada: boolean }[];
  onRevelar: (i: number) => void;
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 12 }}>
      {casillas.map((c, i) => (
        <button
          key={i}
          onClick={() => onRevelar(i)}
          disabled={c.revelada}
          style={{
            padding: 10,
            textAlign: "left",
            background: c.revelada ? "#1f4d2b" : "#1a1a2e",
          }}
        >
          {c.revelada
            ? `${c.respuesta.texto} — ${c.respuesta.puntos}`
            : `${i + 1}. ${c.respuesta.texto} (${c.respuesta.puntos}) — revelar`}
        </button>
      ))}
    </div>
  );
}
