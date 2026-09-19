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
    nuevaPartida,
    comenzarPartida,
    agregarRondaExtra,
    ganarFaceOff,
    revelarCasilla,
    marcarStrike,
    resolverRobo,
    revelarRestante,
    revelarTodasLasCasillas,
    siguienteRonda,
    setNombreEquipo,
    irADineroRapido,
  } = useGameStore();

  const quedanOcultas = (s.fase === "finRonda" || s.fase === "finJuego") && s.casillas.some((c) => !c.revelada);

  return (
    <div className="panel-presentador">
      <div style={{ maxWidth: 820, margin: "0 auto", padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 800 }}>Vista Presentador</h1>
            <p style={{ color: "var(--pv-text-dim)", margin: "4px 0 0", fontSize: 13 }}>
              {s.fase === "configuracion"
                ? "Configurando partida"
                : s.fase === "finJuego"
                  ? "Partida terminada"
                  : s.esDesempate
                    ? "Ronda extra (desempate)"
                    : `Ronda ${s.numeroRonda} de ${s.reglas.numeroRondas}`}{" "}
              · multiplicador x{s.multiplicadorActual} · strikes máx {s.strikesMax}
            </p>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            <button
              className="pv-btn pv-btn-primary"
              onClick={() => window.open(`${window.location.origin}/#/tablero`, "tablero-100mx")}
              title="Abre (o enfoca) la vista Tablero en otra ventana — muévela a tu segundo monitor/proyector"
            >
              🖥️ Abrir Tablero
            </button>
            <button className="pv-btn" onClick={() => enviarSfx("redoble")} title="Suena solo en el Tablero">
              🥁 Redoble
            </button>
            <button className="pv-btn" onClick={() => enviarSfx("aplausos")} title="Suena solo en el Tablero">
              👏 Aplausos
            </button>
            <button className="pv-btn" onClick={deshacer} disabled={historial.length === 0}>
              ↩️ Deshacer
            </button>
            <button
              className="pv-btn pv-btn-danger"
              onClick={reiniciarPartida}
              title="Reinicia marcador, rondas Y desmarca todas las preguntas del banco"
            >
              Reiniciar todo
            </button>
          </div>
        </header>

        <section style={{ display: "flex", gap: 14 }}>
          {(["equipoA", "equipoB"] as const).map((id) => (
            <div key={id} className={`pv-team-card${s.equipoEnControl === id ? " en-control" : ""}`}>
              <input
                className="pv-team-name-input"
                value={s.equipos[id].nombre}
                onChange={(e) => setNombreEquipo(id, e.target.value)}
              />
              <p className="pv-team-score marcador-puntaje">{s.equipos[id].puntos}</p>
              {s.equipoEnControl === id && (
                <p style={{ color: "var(--pv-accent)", margin: "6px 0 0", fontSize: 12, fontWeight: 700 }}>EN CONTROL</p>
              )}
            </div>
          ))}
        </section>

        <p className="pv-callout" style={{ margin: 0 }}>
          {s.mensaje}
        </p>

        {s.fase === "configuracion" && (
          <ConfiguracionPartida numeroRondasInicial={s.reglas.numeroRondas} onComenzar={comenzarPartida} />
        )}

        {s.fase === "seleccionPregunta" && <BancoEditor />}

        {s.fase === "faceoff" && s.preguntaActual && (
          <div className="pv-card">
            <p className="pv-card-title">Face-off</p>
            <h3 style={{ margin: "0 0 14px" }}>{s.preguntaActual.texto}</h3>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                className="pv-btn pv-btn-primary"
                style={{ flex: "1 1 180px", minWidth: 0, justifyContent: "center", padding: "14px", whiteSpace: "normal", textAlign: "center" }}
                onClick={() => ganarFaceOff("equipoA")}
              >
                {s.equipos.equipoA.nombre} gana el control
              </button>
              <button
                className="pv-btn pv-btn-primary"
                style={{ flex: "1 1 180px", minWidth: 0, justifyContent: "center", padding: "14px", whiteSpace: "normal", textAlign: "center" }}
                onClick={() => ganarFaceOff("equipoB")}
              >
                {s.equipos.equipoB.nombre} gana el control
              </button>
            </div>
            <VistaPreviaCasillas casillas={s.casillas} />
          </div>
        )}

        {s.fase === "jugando" && (
          <div className="pv-card">
            <p className="pv-card-title">En juego</p>
            <h3 style={{ margin: "0 0 10px" }}>{s.preguntaActual?.texto}</h3>
            <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
              {Array.from({ length: s.strikesMax }).map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    display: "grid",
                    placeItems: "center",
                    fontWeight: 800,
                    fontSize: 14,
                    background: i < s.strikes ? "rgba(239,68,68,0.18)" : "var(--pv-surface-2)",
                    border: `1px solid ${i < s.strikes ? "var(--pv-danger)" : "var(--pv-border)"}`,
                    color: i < s.strikes ? "var(--pv-danger)" : "var(--pv-text-dim)",
                  }}
                >
                  X
                </span>
              ))}
            </div>
            <CasillasPresenter casillas={s.casillas} onRevelar={revelarCasilla} />
            <button className="pv-btn pv-btn-danger pv-btn-block" style={{ marginTop: 14 }} onClick={marcarStrike}>
              Marcar strike
            </button>
          </div>
        )}

        {s.fase === "robo" && (
          <div className="pv-card">
            <p className="pv-card-title">Robo</p>
            <h3 style={{ margin: "0 0 10px" }}>{s.preguntaActual?.texto}</h3>
            <p style={{ color: "var(--pv-text-dim)", fontSize: 13, margin: "0 0 10px" }}>
              Elige la respuesta que dieron, o marca robo fallido:
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {s.casillas.map(
                (c, i) =>
                  !c.revelada && (
                    <button key={i} className="pv-btn" style={{ justifyContent: "space-between" }} onClick={() => resolverRobo(true, i)}>
                      <span>{c.respuesta.texto}</span>
                      <span style={{ color: "var(--pv-accent)" }}>{c.respuesta.puntos}</span>
                    </button>
                  ),
              )}
            </div>
            <button className="pv-btn pv-btn-danger pv-btn-block" style={{ marginTop: 14 }} onClick={() => resolverRobo(false)}>
              Robo fallido
            </button>
          </div>
        )}

        {quedanOcultas && (
          <div className="pv-card">
            <p className="pv-card-title">Revelar respuestas restantes</p>
            <p style={{ color: "var(--pv-text-dim)", fontSize: 13, margin: "0 0 10px" }}>
              La ronda ya terminó — destápalas una por una al ritmo que quieras, para que no quede duda de cuáles eran.
            </p>
            <CasillasPresenter casillas={s.casillas} onRevelar={revelarRestante} />
            <button className="pv-btn pv-btn-block" style={{ marginTop: 10 }} onClick={revelarTodasLasCasillas}>
              Revelar todas de una vez
            </button>
          </div>
        )}

        {s.fase === "finRonda" && (
          <button className="pv-btn pv-btn-primary pv-btn-block" onClick={siguienteRonda}>
            Siguiente ronda →
          </button>
        )}

        {s.fase === "finJuego" && (
          <>
            {s.ganadorRondaPrincipal && (
              <IniciarDineroRapido
                nombreEquipo={s.equipos[s.ganadorRondaPrincipal].nombre}
                jugadoresSugeridos={s.equipos[s.ganadorRondaPrincipal].jugadores.map((j) => j.nombre)}
                onIniciar={irADineroRapido}
              />
            )}
            <div className="pv-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <p className="pv-card-title">Otras opciones</p>
              <button className="pv-btn pv-btn-block" onClick={agregarRondaExtra}>
                ➕ Agregar una ronda más
              </button>
              <button className="pv-btn pv-btn-block" onClick={nuevaPartida}>
                🆕 Nueva partida (conserva el banco de preguntas usadas)
              </button>
            </div>
          </>
        )}

        {(s.fase === "dineroRapidoSetup" || s.fase === "dineroRapidoJugando") && <DineroRapidoPanel />}

        {s.fase === "dineroRapidoResultado" && (
          <div className="pv-card">
            <h2 style={{ margin: "0 0 10px" }}>{s.mensaje}</h2>
            <p style={{ color: "var(--pv-text-dim)", margin: "0 0 4px" }}>
              Jugador 1 ({s.dineroRapido.jugador1}): {s.dineroRapido.respuestasJugador1.reduce((a, r) => a + r.puntos, 0)}
            </p>
            <p style={{ color: "var(--pv-text-dim)", margin: 0 }}>
              Jugador 2 ({s.dineroRapido.jugador2}): {s.dineroRapido.respuestasJugador2.reduce((a, r) => a + r.puntos, 0)}
            </p>
            <p style={{ fontWeight: 700, margin: "10px 0 16px" }}>Total combinado: {totalCombinado(s.dineroRapido)}</p>
            <button className="pv-btn pv-btn-primary pv-btn-block" onClick={nuevaPartida}>
              Nueva partida
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ConfiguracionPartida({
  numeroRondasInicial,
  onComenzar,
}: {
  numeroRondasInicial: number;
  onComenzar: (numeroRondas: number) => void;
}) {
  const [numeroRondas, setNumeroRondas] = useState(numeroRondasInicial);

  return (
    <div className="pv-card">
      <p className="pv-card-title">Configura la partida</p>
      <p style={{ color: "var(--pv-text-dim)", fontSize: 13, margin: "0 0 14px" }}>
        ¿Cuántas rondas se van a jugar? La partida termina cuando se completen, gane quien tenga más puntos — ya no
        hay un puntaje fijo para ganar antes de tiempo.
      </p>
      <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
        <input
          className="pv-input"
          type="number"
          min={1}
          value={numeroRondas}
          onChange={(e) => setNumeroRondas(Number(e.target.value) || 1)}
          style={{ width: 90 }}
        />
        <button
          className="pv-btn pv-btn-primary"
          style={{ flex: "1 1 160px", minWidth: 0 }}
          onClick={() => onComenzar(numeroRondas)}
        >
          Comenzar partida
        </button>
      </div>
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
    <div className="pv-card">
      <h2 style={{ margin: "0 0 4px" }}>🎉 {nombreEquipo} gana la ronda principal</h2>
      <p style={{ color: "var(--pv-text-dim)", margin: "0 0 14px" }}>Elige a los 2 jugadores para Dinero Rápido:</p>
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <input className="pv-input" style={{ flex: 1, minWidth: 0 }} placeholder="Jugador 1 (15s)" value={j1} onChange={(e) => setJ1(e.target.value)} />
        <input className="pv-input" style={{ flex: 1, minWidth: 0 }} placeholder="Jugador 2 (20s)" value={j2} onChange={(e) => setJ2(e.target.value)} />
      </div>
      <button className="pv-btn pv-btn-primary pv-btn-block" onClick={() => onIniciar(j1, j2)} disabled={!j1.trim() || !j2.trim()}>
        Ir a Dinero Rápido
      </button>
    </div>
  );
}

function VistaPreviaCasillas({ casillas }: { casillas: { respuesta: { texto: string; puntos: number } }[] }) {
  return (
    <div style={{ marginTop: 16 }}>
      <p className="pv-card-title">Respuestas (solo tú las ves)</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {casillas.map((c, i) => (
          <div key={i} className="pv-row" style={{ fontSize: 13 }}>
            <span>
              {i + 1}. {c.respuesta.texto}
            </span>
            <span style={{ color: "var(--pv-accent)" }}>{c.respuesta.puntos}</span>
          </div>
        ))}
      </div>
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
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {casillas.map((c, i) => (
        <button
          key={i}
          onClick={() => onRevelar(i)}
          disabled={c.revelada}
          className={`pv-row${c.revelada ? " pv-row-revelada" : ""}`}
          style={{ width: "100%", textAlign: "left", cursor: c.revelada ? "default" : "pointer" }}
        >
          <span>
            {i + 1}. {c.respuesta.texto}
          </span>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: "var(--pv-accent)" }}>{c.respuesta.puntos}</span>
            {c.revelada ? (
              <span style={{ color: "var(--pv-success)", fontSize: 12, fontWeight: 700 }}>✓ REVELADA</span>
            ) : (
              <span style={{ color: "var(--pv-text-dim)", fontSize: 12 }}>Revelar</span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}
