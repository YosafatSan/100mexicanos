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

React + TypeScript + Vite, Zustand (estado), Framer Motion (animaciones), Web Audio API (sonidos sintetizados, sin archivos externos), BroadcastChannel API (sync entre ventanas, sin server).

## Sonido

La primera vez que abras el Tablero, haz clic en "🔊 Activar sonido" (arriba a la derecha) — es un requisito de los navegadores para poder reproducir audio. Los efectos (ding, buzzer, fanfarria, redoble, aplausos) están sintetizados, no son archivos de audio.
