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

React + TypeScript + Vite, Zustand (estado), Framer Motion (animaciones), Howler (audio), BroadcastChannel API (sync entre ventanas, sin server).
