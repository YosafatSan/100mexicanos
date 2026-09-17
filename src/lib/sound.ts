// Efectos de sonido sintetizados con Web Audio API — sin archivos externos,
// así que no hay ningún tema de licencias. El navegador exige un gesto del
// usuario antes de reproducir audio, por eso `desbloquear()` se llama desde
// un botón en la vista Tablero la primera vez.

let ctx: AudioContext | null = null;

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext();
  return ctx;
}

export function desbloquear() {
  const audioCtx = getCtx();
  if (audioCtx.state === "suspended") audioCtx.resume();
  // Beep inaudible (volumen 0) para terminar de "activar" el contexto en algunos navegadores.
  tono(440, 0.01, "sine", 0);
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
  ding() {
    tono(880, 0.15, "sine", 0.22, 0);
    tono(1320, 0.22, "sine", 0.18, 0.08);
  },
  buzzer() {
    tono(110, 0.5, "sawtooth", 0.28);
    tono(104, 0.5, "sawtooth", 0.18);
  },
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
  victoria() {
    [523, 659, 784, 1046, 1318].forEach((f, i) => tono(f, 0.3, "square", 0.2, i * 0.14));
    ruido(0.6, 0.06, 0);
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
