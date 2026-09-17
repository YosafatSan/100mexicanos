# 100 Mexicanos Dijeron — simulador local

Ver [PRD.md](./PRD.md) pa' specs completas.

## Correr local

```bash
npm install
npm run dev
```

Abre 2 ventanas del navegador (una por monitor):
- Presentador: `http://localhost:5173/#/presentador`
- Tablero: `http://localhost:5173/#/tablero`

## Stack

React + TypeScript + Vite, Zustand (estado), Framer Motion (animaciones), Web Audio API + clips reales (sonidos), BroadcastChannel API (sync entre ventanas, sin server).

## Sonido

La primera vez que abras el Tablero, haz clic en "🔊 Activar sonido" (arriba a la derecha) — es un requisito de los navegadores para poder reproducir audio.

`public/sonidos/` tiene 4 clips reales del programa (correcto, incorrecto, triunfo, a-jugar) que puso el usuario — son para uso personal/local, no para redistribuir el repo públicamente. El resto de efectos (campana, tensión, redoble, aplausos, derrota, tick) están sintetizados con Web Audio API por no tener clip real.
