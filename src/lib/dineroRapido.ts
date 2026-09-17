import type { EstadoDineroRapido } from "../types";

export function esDuplicado(dr: EstadoDineroRapido, index: number): boolean {
  const r1 = dr.respuestasJugador1[index]?.texto.trim().toLowerCase();
  const r2 = dr.respuestasJugador2[index]?.texto.trim().toLowerCase();
  return Boolean(r1 && r2 && r1 === r2);
}

export function totalJugador1(dr: EstadoDineroRapido): number {
  return dr.respuestasJugador1.reduce((acc, r) => acc + (r.texto.trim() ? r.puntos : 0), 0);
}

export function totalJugador2(dr: EstadoDineroRapido): number {
  return dr.respuestasJugador2.reduce((acc, r, i) => {
    if (!r.texto.trim() || esDuplicado(dr, i)) return acc;
    return acc + r.puntos;
  }, 0);
}

export function totalCombinado(dr: EstadoDineroRapido): number {
  return totalJugador1(dr) + totalJugador2(dr);
}

export function respuestasVaciasIniciales(): EstadoDineroRapido["respuestasJugador1"] {
  return Array.from({ length: 5 }, () => ({ texto: "", puntos: 0 }));
}
