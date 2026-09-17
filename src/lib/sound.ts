// Efectos de sonido: los 4 clips reales del programa (correcto, incorrecto,
// triunfo, a-jugar) viven en public/sonidos/ y se reproducen con
// HTMLAudioElement. El resto (sin clip real disponible) sigue sintetizado
// con Web Audio API — cero archivos externos, cero temas de licencia.
// El navegador exige un gesto del usuario antes de reproducir audio, por
// eso `desbloquear()` se llama desde un botón en la vista Tablero.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

const NOMBRES_CLIP = ["correcto", "incorrecto", "triunfo", "ajugar"] as const;
type NombreClip = (typeof NOMBRES_CLIP)[number];

const clips = new Map<NombreClip, HTMLAudioElement>();

function clip(nombre: NombreClip): HTMLAudioElement {
  let audio = clips.get(nombre);
  if (!audio) {
    audio = new Audio(`/sonidos/${nombre}.mp3`);
    audio.preload = "auto";
    clips.set(nombre, audio);
  }
  return audio;
}

function reproducirClip(nombre: NombreClip, volumen = 1) {
  const audio = clip(nombre).cloneNode(true) as HTMLAudioElement;
  audio.volume = volumen;
  audio.play().catch(() => {});
}

export function desbloquear() {
  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") audioCtx.resume();
  tono(440, 0.01, "sine", 0);
  NOMBRES_CLIP.forEach((nombre) => {
    const audio = clip(nombre);
    audio.volume = 0;
    audio
      .play()
      .then(() => {
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 1;
      })
      .catch(() => {});
  });
}

function tono(frecuencia: number, duracion: number, tipo: OscillatorType = "sine", volumen = 0.25, t0 = 0) {
  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") return;
  const inicio = audioCtx.currentTime + t0;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = tipo;
  osc.frequency.value = frecuencia;
  gain.gain.setValueAtTime(volumen, inicio);
  gain.gain.exponentialRampToValueAtTime(0.001, inicio + duracion);
  osc.connect(gain).connect(audioCtx.destination);
  osc.start(inicio);
  osc.stop(inicio + duracion);
}

function ruido(duracion: number, volumen = 0.2, t0 = 0) {
  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") return;
  const bufferSize = Math.max(1, Math.floor(audioCtx.sampleRate * duracion));
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const src = audioCtx.createBufferSource();
  src.buffer = buffer;
  const gain = audioCtx.createGain();
  gain.gain.value = volumen;
  src.connect(gain).connect(audioCtx.destination);
  src.start(audioCtx.currentTime + t0);
}

export const sonidos = {
  // Clips reales del programa
  ding() {
    reproducirClip("correcto");
  },
  buzzer() {
    reproducirClip("incorrecto");
  },
  empezar() {
    reproducirClip("ajugar");
  },
  victoria() {
    reproducirClip("triunfo");
  },

  // Sintetizados (sin clip real disponible)
  campana() {
    tono(660, 0.3, "triangle", 0.22);
  },
  tension() {
    tono(220, 0.4, "sawtooth", 0.18, 0);
    tono(196, 0.4, "sawtooth", 0.14, 0.12);
  },
  fanfarria() {
    [523, 659, 784, 1046].forEach((f, i) => tono(f, 0.25, "square", 0.18, i * 0.12));
  },
  derrota() {
    [392, 349, 311, 262].forEach((f, i) => tono(f, 0.35, "sawtooth", 0.18, i * 0.2));
  },
  tick() {
    tono(1000, 0.08, "square", 0.14);
  },
  redoble() {
    for (let i = 0; i < 16; i++) ruido(0.06, 0.1, i * 0.07);
  },
  aplausos() {
    for (let i = 0; i < 10; i++) ruido(0.18, 0.09, i * 0.07);
  },
};

export type SonidoManual = "redoble" | "aplausos";
