export type EquipoId = "equipoA" | "equipoB";

export interface Respuesta {
  texto: string;
  puntos: number;
}

export interface Pregunta {
  id: string;
  categoria?: string;
  texto: string;
  respuestas: Respuesta[];
}

export interface BancoPreguntas {
  preguntas: Pregunta[];
}

export interface Jugador {
  nombre: string;
}

export interface Equipo {
  id: EquipoId;
  nombre: string;
  jugadores: Jugador[];
  puntos: number;
}

export interface ReglasPuntaje {
  numeroRondas: number;
  multiplicadoresPorRonda: number[];
  strikesMaximos: number;
  strikesDesempate: number;
  objetivoDineroRapido: number;
}

export type FaseRonda =
  | "configuracion"
  | "seleccionPregunta"
  | "faceoff"
  | "jugando"
  | "robo"
  | "finRonda"
  | "finJuego"
  | "dineroRapidoSetup"
  | "dineroRapidoJugando"
  | "dineroRapidoResultado";

export interface RespuestaCapturada {
  texto: string;
  puntos: number;
}

export interface EstadoDineroRapido {
  equipoId: EquipoId | null;
  jugador1: string;
  jugador2: string;
  jugadorActivo: 1 | 2;
  tiempoRestante: number;
  finEn: number | null;
  corriendo: boolean;
  respuestasJugador1: RespuestaCapturada[];
  respuestasJugador2: RespuestaCapturada[];
}

export interface Casilla {
  respuesta: Respuesta;
  revelada: boolean;
}

export interface EstadoJuego {
  fase: FaseRonda;
  equipos: Record<EquipoId, Equipo>;
  reglas: ReglasPuntaje;
  banco: Pregunta[];
  preguntasUsadasIds: string[];
  numeroRonda: number;
  esDesempate: boolean;
  multiplicadorActual: number;
  strikesMax: number;
  preguntaActual: Pregunta | null;
  casillas: Casilla[];
  equipoEnControl: EquipoId | null;
  strikes: number;
  puntosAcumuladosRonda: number;
  ganadorRondaPrincipal: EquipoId | null;
  dineroRapido: EstadoDineroRapido;
  mensaje: string;
}
