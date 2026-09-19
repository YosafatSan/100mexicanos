import { create } from "zustand";
import type { EquipoId, EstadoJuego, Pregunta, ReglasPuntaje } from "../types";
import { broadcast, onMessage } from "../lib/channel";
import { respuestasVaciasIniciales, totalCombinado } from "../lib/dineroRapido";
import bancoEjemplo from "../data/preguntas.ejemplo.json";

const REGLAS_CLASICAS: ReglasPuntaje = {
  numeroRondas: 5,
  multiplicadoresPorRonda: [1, 1, 1, 2, 3],
  strikesMaximos: 3,
  strikesDesempate: 1,
  objetivoDineroRapido: 200,
};

function estadoInicial(): EstadoJuego {
  return {
    fase: "configuracion",
    equipos: {
      equipoA: { id: "equipoA", nombre: "Equipo A", jugadores: [], puntos: 0 },
      equipoB: { id: "equipoB", nombre: "Equipo B", jugadores: [], puntos: 0 },
    },
    reglas: REGLAS_CLASICAS,
    banco: (bancoEjemplo as { preguntas: Pregunta[] }).preguntas,
    preguntasUsadasIds: [],
    numeroRonda: 1,
    esDesempate: false,
    multiplicadorActual: REGLAS_CLASICAS.multiplicadoresPorRonda[0],
    strikesMax: REGLAS_CLASICAS.strikesMaximos,
    preguntaActual: null,
    casillas: [],
    equipoEnControl: null,
    strikes: 0,
    puntosAcumuladosRonda: 0,
    ganadorRondaPrincipal: null,
    dineroRapido: {
      equipoId: null,
      jugador1: "",
      jugador2: "",
      jugadorActivo: 1,
      tiempoRestante: 15,
      finEn: null,
      corriendo: false,
      respuestasJugador1: respuestasVaciasIniciales(),
      respuestasJugador2: respuestasVaciasIniciales(),
    },
    mensaje: "Define cuántas rondas se van a jugar y presiona Comenzar",
  };
}

function otroEquipo(id: EquipoId): EquipoId {
  return id === "equipoA" ? "equipoB" : "equipoA";
}

function determinarGanador(estado: EstadoJuego): EquipoId | null {
  const { equipoA, equipoB } = estado.equipos;
  if (equipoA.puntos === equipoB.puntos) return null;
  return equipoA.puntos > equipoB.puntos ? "equipoA" : "equipoB";
}

function idUnico(): string {
  return `p_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

interface GameStore {
  estado: EstadoJuego;
  historial: EstadoJuego[];
  deshacer: () => void;
  reiniciarPartida: () => void;
  nuevaPartida: () => void;
  comenzarPartida: (numeroRondas: number) => void;
  agregarRondaExtra: () => void;

  // Config (sin historial: no son "acciones de juego" a deshacer)
  setNombreEquipo: (equipo: EquipoId, nombre: string) => void;
  setJugadores: (equipo: EquipoId, nombres: string[]) => void;
  setReglas: (reglas: Partial<ReglasPuntaje>) => void;

  // Editor de banco (sin historial)
  agregarPregunta: (pregunta: Omit<Pregunta, "id"> & { id?: string }) => void;
  actualizarPregunta: (id: string, datos: Partial<Pregunta>) => void;
  eliminarPregunta: (id: string) => void;
  importarPreguntas: (preguntas: Pregunta[]) => void;

  // Juego principal (con historial / undo)
  elegirPreguntaAleatoria: () => void;
  elegirPregunta: (id: string) => void;
  ganarFaceOff: (equipo: EquipoId) => void;
  revelarCasilla: (index: number) => void;
  marcarStrike: () => void;
  resolverRobo: (exitoso: boolean, indexRespuesta?: number) => void;
  revelarRestante: (index: number) => void;
  revelarTodasLasCasillas: () => void;
  siguienteRonda: () => void;

  // Dinero Rápido
  irADineroRapido: (jugador1: string, jugador2: string) => void;
  iniciarTurnoDineroRapido: () => void;
  descontarSegundoDineroRapido: () => void;
  pararTiempoDineroRapido: () => void;
  setRespuestaDineroRapido: (
    jugador: 1 | 2,
    index: number,
    campo: "texto" | "puntos",
    valor: string | number,
  ) => void;
  terminarTurnoDineroRapido: () => void;
}

export const useGameStore = create<GameStore>((set, get) => {
  function conHistorial(mutar: (s: EstadoJuego) => EstadoJuego) {
    set((s) => ({
      historial: [...s.historial, s.estado].slice(-50),
      estado: mutar(s.estado),
    }));
  }

  function sinHistorial(mutar: (s: EstadoJuego) => EstadoJuego) {
    set((s) => ({ estado: mutar(s.estado) }));
  }

  function iniciarPregunta(estado: EstadoJuego, pregunta: Pregunta): EstadoJuego {
    const casillas = [...pregunta.respuestas]
      .sort((a, b) => b.puntos - a.puntos)
      .slice(0, 8)
      .map((respuesta) => ({ respuesta, revelada: false }));
    return {
      ...estado,
      fase: "faceoff",
      preguntaActual: pregunta,
      casillas,
      equipoEnControl: null,
      strikes: 0,
      puntosAcumuladosRonda: 0,
      preguntasUsadasIds: [...estado.preguntasUsadasIds, pregunta.id],
      mensaje: `¿Quién gana el control? — "${pregunta.texto}"`,
    };
  }

  function otorgarPuntos(estado: EstadoJuego, equipo: EquipoId): EstadoJuego {
    const puntos = estado.puntosAcumuladosRonda;
    const equipos = {
      ...estado.equipos,
      [equipo]: { ...estado.equipos[equipo], puntos: estado.equipos[equipo].puntos + puntos },
    };
    return {
      ...estado,
      equipos,
      // Las casillas que hayan quedado ocultas (p. ej. tras un robo) NO se
      // revelan automáticamente: el presentador las destapa una por una (o
      // todas de un tirón) con revelarRestante/revelarTodasLasCasillas,
      // para controlar el ritmo del show.
      fase: "finRonda",
      mensaje: `${equipos[equipo].nombre} se lleva ${puntos} puntos`,
    };
  }

  return {
    estado: estadoInicial(),
    historial: [],
    deshacer: () =>
      set((s) => {
        if (s.historial.length === 0) return s;
        const historial = [...s.historial];
        const estado = historial.pop()!;
        return { estado, historial };
      }),
    reiniciarPartida: () => set({ estado: estadoInicial(), historial: [] }),

    // A diferencia de "reiniciarPartida", conserva el banco de preguntas y
    // cuáles ya se usaron, para que una noche de varias partidas seguidas no
    // repita preguntas hasta agotar el banco completo.
    nuevaPartida: () =>
      set((s) => ({
        estado: {
          ...estadoInicial(),
          banco: s.estado.banco,
          preguntasUsadasIds: s.estado.preguntasUsadasIds,
          reglas: { ...REGLAS_CLASICAS, numeroRondas: s.estado.reglas.numeroRondas },
        },
        historial: [],
      })),

    comenzarPartida: (numeroRondas) =>
      conHistorial((s) => {
        const reglas = { ...s.reglas, numeroRondas: Math.max(1, Math.round(numeroRondas) || 1) };
        return {
          ...s,
          reglas,
          fase: "seleccionPregunta",
          numeroRonda: 1,
          esDesempate: false,
          multiplicadorActual: reglas.multiplicadoresPorRonda[0] ?? 1,
          strikesMax: reglas.strikesMaximos,
          mensaje: "Elige la pregunta de la ronda 1",
        };
      }),

    // El presentador la usa desde la pantalla de fin de partida cuando el
    // marcador queda empatado (o simplemente quiere alargar el juego):
    // agrega una ronda más con la regla clásica de desempate (1 solo strike).
    agregarRondaExtra: () =>
      conHistorial((s) => {
        const reglas = { ...s.reglas, numeroRondas: s.reglas.numeroRondas + 1 };
        return {
          ...s,
          reglas,
          esDesempate: true,
          multiplicadorActual: 1,
          strikesMax: reglas.strikesDesempate,
          fase: "seleccionPregunta",
          equipoEnControl: null,
          strikes: 0,
          puntosAcumuladosRonda: 0,
          mensaje: "Ronda extra de desempate — elige la pregunta",
        };
      }),

    setNombreEquipo: (equipo, nombre) =>
      sinHistorial((s) => ({
        ...s,
        equipos: { ...s.equipos, [equipo]: { ...s.equipos[equipo], nombre } },
      })),
    setJugadores: (equipo, nombres) =>
      sinHistorial((s) => ({
        ...s,
        equipos: {
          ...s.equipos,
          [equipo]: { ...s.equipos[equipo], jugadores: nombres.map((nombre) => ({ nombre })) },
        },
      })),
    setReglas: (reglas) => sinHistorial((s) => ({ ...s, reglas: { ...s.reglas, ...reglas } })),

    agregarPregunta: (pregunta) =>
      sinHistorial((s) => ({
        ...s,
        banco: [...s.banco, { ...pregunta, id: pregunta.id || idUnico() }],
      })),
    actualizarPregunta: (id, datos) =>
      sinHistorial((s) => ({
        ...s,
        banco: s.banco.map((p) => (p.id === id ? { ...p, ...datos } : p)),
      })),
    eliminarPregunta: (id) =>
      sinHistorial((s) => ({
        ...s,
        banco: s.banco.filter((p) => p.id !== id),
        preguntasUsadasIds: s.preguntasUsadasIds.filter((usada) => usada !== id),
      })),
    importarPreguntas: (preguntas) =>
      sinHistorial((s) => {
        const conId = preguntas.map((p) => ({ ...p, id: p.id || idUnico() }));
        const idsNuevos = new Set(conId.map((p) => p.id));
        const resto = s.banco.filter((p) => !idsNuevos.has(p.id));
        return { ...s, banco: [...resto, ...conId] };
      }),

    elegirPreguntaAleatoria: () => {
      const s = get().estado;
      const disponibles = s.banco.filter((p) => !s.preguntasUsadasIds.includes(p.id));
      const pool = disponibles.length > 0 ? disponibles : s.banco;
      const pregunta = pool[Math.floor(Math.random() * pool.length)];
      conHistorial((estado) => iniciarPregunta(estado, pregunta));
    },
    elegirPregunta: (id) => {
      const pregunta = get().estado.banco.find((p) => p.id === id);
      if (!pregunta) return;
      conHistorial((estado) => iniciarPregunta(estado, pregunta));
    },

    ganarFaceOff: (equipo) =>
      conHistorial((s) => ({
        ...s,
        fase: "jugando",
        equipoEnControl: equipo,
        mensaje: `${s.equipos[equipo].nombre} tiene el control`,
      })),

    revelarCasilla: (index) =>
      conHistorial((s) => {
        const casilla = s.casillas[index];
        if (!casilla || casilla.revelada) return s;
        const casillas = s.casillas.map((c, i) => (i === index ? { ...c, revelada: true } : c));
        const puntosGanados = casilla.respuesta.puntos * s.multiplicadorActual;
        const puntosAcumuladosRonda = s.puntosAcumuladosRonda + puntosGanados;
        const todasReveladas = casillas.every((c) => c.revelada);
        const intermedio: EstadoJuego = { ...s, casillas, puntosAcumuladosRonda };
        if (todasReveladas && s.equipoEnControl) {
          return otorgarPuntos(intermedio, s.equipoEnControl);
        }
        return intermedio;
      }),

    marcarStrike: () =>
      conHistorial((s) => {
        if (!s.equipoEnControl) return s;
        const strikes = s.strikes + 1;
        if (strikes >= s.strikesMax) {
          return {
            ...s,
            strikes,
            fase: "robo",
            mensaje: `${s.equipos[otroEquipo(s.equipoEnControl)].nombre} puede robar`,
          };
        }
        return { ...s, strikes };
      }),

    resolverRobo: (exitoso, indexRespuesta) =>
      conHistorial((s) => {
        if (!s.equipoEnControl) return s;
        const equipoRobador = otroEquipo(s.equipoEnControl);
        if (exitoso && typeof indexRespuesta === "number") {
          const casilla = s.casillas[indexRespuesta];
          if (!casilla || casilla.revelada) return s;
          const casillas = s.casillas.map((c, i) => (i === indexRespuesta ? { ...c, revelada: true } : c));
          const puntosGanados = casilla.respuesta.puntos * s.multiplicadorActual;
          const intermedio: EstadoJuego = {
            ...s,
            casillas,
            puntosAcumuladosRonda: s.puntosAcumuladosRonda + puntosGanados,
          };
          return otorgarPuntos(intermedio, equipoRobador);
        }
        return otorgarPuntos(s, s.equipoEnControl);
      }),

    // Para destapar, una por una, las respuestas que quedaron ocultas al
    // terminar la ronda (no afectan el puntaje: eso ya se calculó).
    revelarRestante: (index) =>
      conHistorial((s) => {
        const casilla = s.casillas[index];
        if (!casilla || casilla.revelada) return s;
        const casillas = s.casillas.map((c, i) => (i === index ? { ...c, revelada: true } : c));
        return { ...s, casillas };
      }),

    revelarTodasLasCasillas: () =>
      conHistorial((s) => ({ ...s, casillas: s.casillas.map((c) => ({ ...c, revelada: true })) })),

    siguienteRonda: () =>
      conHistorial((s) => {
        const numeroRonda = s.numeroRonda + 1;
        if (numeroRonda > s.reglas.numeroRondas) {
          const ganador = determinarGanador(s);
          return {
            ...s,
            numeroRonda,
            fase: "finJuego",
            ganadorRondaPrincipal: ganador,
            mensaje: ganador
              ? `${s.equipos[ganador].nombre} gana la partida con ${s.equipos[ganador].puntos} puntos`
              : `Empate a ${s.equipos.equipoA.puntos} puntos — ¿qué quieres hacer?`,
          };
        }
        return {
          ...s,
          numeroRonda,
          multiplicadorActual: s.reglas.multiplicadoresPorRonda[numeroRonda - 1] ?? 1,
          fase: "seleccionPregunta",
          // preguntaActual y casillas NO se limpian aquí a propósito: el
          // tablero se queda mostrando la pregunta anterior (ya toda
          // revelada) hasta que se elija la siguiente, en vez de saltar a
          // una pantalla de marcadores vacía de por medio.
          equipoEnControl: null,
          strikes: 0,
          puntosAcumuladosRonda: 0,
          mensaje: `Elige la pregunta de la ronda ${numeroRonda}`,
        };
      }),

    irADineroRapido: (jugador1, jugador2) =>
      conHistorial((s) => ({
        ...s,
        fase: "dineroRapidoSetup",
        dineroRapido: {
          equipoId: s.ganadorRondaPrincipal,
          jugador1,
          jugador2,
          jugadorActivo: 1,
          tiempoRestante: 15,
          finEn: null,
          corriendo: false,
          respuestasJugador1: respuestasVaciasIniciales(),
          respuestasJugador2: respuestasVaciasIniciales(),
        },
        mensaje: `Dinero Rápido — turno de ${jugador1}`,
      })),

    iniciarTurnoDineroRapido: () =>
      conHistorial((s) => {
        const tiempo = s.dineroRapido.jugadorActivo === 1 ? 15 : 20;
        return {
          ...s,
          fase: "dineroRapidoJugando",
          dineroRapido: {
            ...s.dineroRapido,
            tiempoRestante: tiempo,
            finEn: Date.now() + tiempo * 1000,
            corriendo: true,
          },
        };
      }),

    // Basado en timestamp (no en -1 por tick): inmune a que el navegador
    // retrase o agrupe los intervals cuando la pestaña pierde foco.
    descontarSegundoDineroRapido: () =>
      sinHistorial((s) => {
        const dr = s.dineroRapido;
        if (!dr.corriendo || dr.finEn === null) return s;
        const tiempoRestante = Math.max(0, Math.ceil((dr.finEn - Date.now()) / 1000));
        return {
          ...s,
          dineroRapido: { ...dr, tiempoRestante, corriendo: tiempoRestante > 0 },
        };
      }),

    pararTiempoDineroRapido: () =>
      sinHistorial((s) => ({ ...s, dineroRapido: { ...s.dineroRapido, corriendo: false } })),

    setRespuestaDineroRapido: (jugador, index, campo, valor) =>
      sinHistorial((s) => {
        const clave = jugador === 1 ? "respuestasJugador1" : "respuestasJugador2";
        const respuestas = s.dineroRapido[clave].map((r, i) =>
          i === index ? { ...r, [campo]: valor } : r,
        );
        return { ...s, dineroRapido: { ...s.dineroRapido, [clave]: respuestas } };
      }),

    terminarTurnoDineroRapido: () =>
      conHistorial((s) => {
        if (s.dineroRapido.jugadorActivo === 1) {
          return {
            ...s,
            fase: "dineroRapidoSetup",
            dineroRapido: { ...s.dineroRapido, jugadorActivo: 2, tiempoRestante: 20, finEn: null, corriendo: false },
            mensaje: `Dinero Rápido — turno de ${s.dineroRapido.jugador2}`,
          };
        }
        const total = totalCombinado(s.dineroRapido);
        const gano = total >= s.reglas.objetivoDineroRapido;
        return {
          ...s,
          fase: "dineroRapidoResultado",
          dineroRapido: { ...s.dineroRapido, corriendo: false },
          mensaje: gano
            ? `¡Ganaron el premio mayor con ${total} puntos!`
            : `No alcanzaron el objetivo: ${total}/${s.reglas.objetivoDineroRapido} puntos`,
        };
      }),
  };
});

let prevEstado = useGameStore.getState().estado;
useGameStore.subscribe((state) => {
  if (state.estado !== prevEstado) {
    prevEstado = state.estado;
    broadcast({ type: "state", payload: state.estado });
  }
});

onMessage((message) => {
  if (message.type === "requestSync") {
    broadcast({ type: "state", payload: useGameStore.getState().estado });
  }
});

if (import.meta.env.DEV) {
  (window as unknown as { __gameStore: typeof useGameStore }).__gameStore = useGameStore;
}
