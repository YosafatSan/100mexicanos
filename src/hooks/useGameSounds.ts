import { useEffect, useRef } from "react";
import type { EstadoJuego } from "../types";
import { sonidos } from "../lib/sound";
import { totalCombinado } from "../lib/dineroRapido";

// Compara cada snapshot nuevo contra el anterior y decide qué sonido
// corresponde. El Board es la "pantalla de TV" — por eso los sonidos
// automáticos viven aquí y no en el Presentador (evita audio duplicado
// si ambas ventanas comparten bocinas).
export function useGameSounds(estado: EstadoJuego | null, activo: boolean) {
  const prevRef = useRef<EstadoJuego | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = estado;
    if (!activo || !estado || !prev) return;

    const reveladasPrev = prev.casillas.filter((c) => c.revelada).length;
    const reveladasAhora = estado.casillas.filter((c) => c.revelada).length;
    if (reveladasAhora > reveladasPrev) sonidos.ding();

    if (estado.strikes > prev.strikes) sonidos.buzzer();

    if (estado.fase === "jugando" && prev.fase === "faceoff") sonidos.campana();
    if (estado.fase === "robo" && prev.fase !== "robo") sonidos.tension();
    if ((estado.fase === "finRonda" || estado.fase === "finJuego") && prev.fase !== estado.fase) {
      sonidos.fanfarria();
    }

    const dr = estado.dineroRapido;
    const drPrev = prev.dineroRapido;
    if (dr.corriendo && dr.tiempoRestante !== drPrev.tiempoRestante && dr.tiempoRestante > 0 && dr.tiempoRestante <= 5) {
      sonidos.tick();
    }
    if (drPrev.corriendo && !dr.corriendo && dr.tiempoRestante === 0) {
      sonidos.buzzer();
    }
    if (estado.fase === "dineroRapidoResultado" && prev.fase !== "dineroRapidoResultado") {
      const gano = totalCombinado(dr) >= estado.reglas.objetivoDineroRapido;
      if (gano) sonidos.victoria();
      else sonidos.derrota();
    }
  }, [estado, activo]);
}
