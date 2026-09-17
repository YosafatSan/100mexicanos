# PRD: Simulador local de "100 Mexicanos Dijeron"

## Contexto

El usuario quiere un juego que simule fielmente el programa de TV "100 Mexicanos Dijeron" para jugarlo localmente (sin servidor remoto), con dos vistas sincronizadas en tiempo real: una de **Presentador** (control del juego) y una de **Tablero** (lo que ve el público/jugadores). El pedido explícito fue no inferir nada: por eso este documento se construyó primero investigando el formato real del programa (reglas, rondas, tablero, dinero rápido) y luego resolviendo cada decisión de producto directamente con el usuario, pregunta por pregunta.

## Investigación realizada (fuentes)

- Formato clásico 2001-2006 (Marco Antonio Regil, Televisa/Las Estrellas), versión Family Feud mexicana. [Wikipedia - 100 mexicanos dijeron](https://en.wikipedia.org/wiki/100_mexicanos_dijeron)
- Mecánica base confirmada: 2 equipos, face-off por pregunta, 3 strikes para perder el control, robo de puntos del equipo contrario. [asisejuega.com](https://asisejuega.com/juegos-de-mesa/cien-mexicanos-dijeron/)
- Estructura de puntaje: preguntas de valor simple, una de valor doble y una de valor triple; 300 puntos para ganar la ronda principal; si nadie llega a 300 tras las rondas normales, hay una ronda de desempate donde solo se permite 1 strike.
- Ronda de Dinero Rápido: 2 jugadores del equipo ganador — jugador 1 responde 5 preguntas en 15s, jugador 2 las mismas 5 en 20s (respuestas repetidas no cuentan, debe dar otra distinta). Se suman ambos puntajes; con 200+ puntos el equipo gana el premio mayor.
- Referencia visual (búsqueda de imágenes de la época): tablero estilo "flip panel" digital, strikes mostrados como una gran X roja en un display tipo LED sobre fondo negro, marcador de puntos en números rojos estilo digital, set con acentos multicolor tipo arcoíris. **Esto es una referencia inicial, no definitiva** — no encontré capturas en alta fidelidad ni video navegable en esta sesión (YouTube no fue accesible), así que los colores/tipografía/logo exactos se deben afinar cuando el usuario comparta sus propias capturas/video de referencia, tal como se acordó.

> Nota importante: la estructura exacta de "qué ronda vale doble y cuál vale triple" no está 100% confirmada por las fuentes (hay inconsistencias entre resúmenes). Se implementará como **configurable** con un valor por defecto razonable, así no bloquea el desarrollo y se ajusta fácilmente si el usuario confirma el orden exacto viendo un episodio.

## Decisiones de producto (acordadas con el usuario, sin inferencias)

| Tema | Decisión |
|---|---|
| Época de referencia | Clásico Televisa 2001-2006 (Marco Antonio Regil) |
| Plataforma | Web app en navegador, sin backend/servidor |
| Pantallas | Dos monitores/proyector: presentador en uno, tablero en otro |
| Alcance de segmentos | Rondas normales con robo + Ronda final de Dinero Rápido + Face-off |
| Face-off (quién contesta primero) | El presentador lo decide manualmente (sin buzzers ni teclado) |
| Contenido/preguntas | Editor dentro de la app + set de ejemplo + importar banco vía JSON + vista previa de la pregunta antes de lanzarla al tablero |
| Equipos | 2 equipos, con nombre de equipo y nombres de jugadores individuales |
| Fidelidad visual | Total, basada en referencias reales (el usuario las compartirá; mientras tanto se usa la investigación inicial de arriba) |
| Sonidos | Actualizado en Fase 5/6: 4 clips reales del programa (correcto, incorrecto, triunfo, "a jugar") provistos por el usuario, en `public/sonidos/`. El resto (campana, tensión, redoble, aplausos, derrota, tick) sigue sintetizado con Web Audio API por no haber clip real disponible |
| Reglas de puntaje | Configurables antes de cada partida, con el formato clásico como valores por defecto (300 pts para ganar, 3 simples + 1 doble + 1 triple, ronda de desempate a 1 strike) |
| Persistencia | Ninguna entre sesiones: cada partida inicia de cero al abrir la app |
| Cronómetro en rondas normales | No hay; el ritmo lo marca el presentador. Solo hay cronómetro en Dinero Rápido (15s / 20s) |
| Selección de siguiente pregunta | Sugerencia aleatoria (sin repetir) con opción de cambiarla manualmente tras verla en preview |
| Corrección de errores en vivo | Imprescindible un botón "deshacer última acción" |
| Framework | Elegido por Claude (ver Arquitectura) |
| Ubicación del proyecto | `dev/Proyectos/100-mexicanos-dijeron` |
| Formato del PRD | Este archivo (`PRD.md`) |

## Alcance funcional

### Incluido en esta primera versión
- Vista **Presentador**: pantalla de control completa.
- Vista **Tablero**: pantalla de solo lectura para el público, sincronizada en vivo.
- Configuración de partida: nombres de equipos, roster de jugadores por equipo, reglas de puntaje (editable, con defaults clásicos).
- Editor de banco de preguntas (crear/editar/eliminar), importación de un archivo JSON con preguntas, vista previa de cualquier pregunta antes de lanzarla.
- Rondas normales completas: face-off manual, tablero de respuestas (hasta 8 casillas, según cuántas respuestas tenga la pregunta), revelado casilla por casilla, 3 strikes, robo de turno, multiplicador de puntos por ronda (x1/x2/x3 configurable).
- Ronda de desempate (si nadie llega al puntaje objetivo tras las rondas normales): 1 solo strike permitido.
- Ronda de Dinero Rápido: selección de los 2 jugadores, cronómetro de 15s y 20s, entrada de respuestas con detección de duplicados, cálculo de puntaje final contra el objetivo (default 200).
- Botón de "deshacer última acción" (strike, revelación o punto asignado).
- Animaciones: flip/revelado de cada casilla, "bang" de strike, contador de puntos animado, transición entre rondas, intro animada.
- Sonidos: ding de acierto, buzzer de error, redoble de tambor al revelar, aplausos, tema de entrada/fondo — sourced de librerías de efectos genéricos libres de uso (a definir en implementación, ej. Mixkit/Freesound con licencia adecuada para uso personal).
- Sincronización en vivo entre las dos ventanas sin backend (ver Arquitectura).

### Explícitamente fuera de alcance (por ahora)
- Canasta de tentación / bonus especiales de otras épocas.
- Buzzers físicos o input por teclado para el face-off.
- Cualquier tipo de servidor remoto, backend o multijugador en red.
- Guardado/recuperación de partidas entre sesiones distintas de la app.

## Arquitectura técnica propuesta

- **Stack**: React + TypeScript + Vite. Justificación: el proyecto necesita una UI con estado complejo compartido (editor de preguntas, dos vistas), buenas animaciones y mantenibilidad — React da estructura de componentes clara y Vite permite correrlo localmente sin fricción (`npm run dev`), sigue siendo 100% cliente, sin backend.
- **Estado**: un store central (Zustand) vive en la ventana del **Presentador**, que es la única fuente de verdad. La vista **Tablero** es un renderer puro del último estado recibido.
- **Sincronización entre ventanas**: `BroadcastChannel` API del navegador (mismo origen, sin servidor). Cada cambio de estado en el Presentador se transmite al Tablero. Si la ventana del Tablero se recarga, pide un "resync" y el Presentador reenvía el estado completo — esto es solo robustez de sincronización en vivo, no persistencia entre partidas (que fue descartada).
- **Animaciones**: Framer Motion (o CSS transitions donde baste) para flips de casillas, strikes y transiciones.
- **Audio**: Howler.js para reproducir efectos con control preciso (timing, superposición de sonidos).
- **Sin backend/API**: toda la lógica corre en el cliente; "correr local" significa `npm run dev` (o un build estático sencillo) abierto en dos ventanas del mismo navegador.

## Modelo de datos (preguntas)

Formato JSON importable por el editor:

```json
{
  "preguntas": [
    {
      "id": "p001",
      "categoria": "Comida",
      "texto": "Nombra algo que la gente le pone al café",
      "respuestas": [
        { "texto": "Azúcar", "puntos": 42 },
        { "texto": "Leche", "puntos": 30 },
        { "texto": "Crema", "puntos": 15 },
        { "texto": "Canela", "puntos": 8 },
        { "texto": "Miel", "puntos": 5 }
      ]
    }
  ]
}
```

- `respuestas` se ordena por `puntos` descendente para el tablero.
- El editor permite crear preguntas nuevas con esta misma estructura, y previsualizar el tablero resultante antes de lanzarla.

## Vista Presentador — controles

- Pantalla de configuración inicial: nombres de equipos, jugadores, reglas de puntaje (objetivo para ganar, multiplicadores por ronda, objetivo de Dinero Rápido).
- Banco de preguntas: lista, búsqueda, importar JSON, crear/editar, botón "previsualizar" y botón "lanzar al tablero".
- Control de ronda en curso: marcar qué equipo ganó el face-off, revelar cada respuesta (clic por casilla), marcar strike, decidir resultado del robo, ver el multiplicador activo y el puntaje en vivo de ambos equipos.
- Botón "deshacer última acción".
- Botón "siguiente ronda" / avanzar a ronda de desempate / avanzar a Dinero Rápido.
- Modo Dinero Rápido: elegir jugador 1 y 2, iniciar cronómetro de cada uno, capturar sus respuestas y puntos asignados manualmente (con aviso de respuesta duplicada), ver el total combinado contra el objetivo.
- Control de audio manual (reproducir aplausos/redoble bajo demanda) además de los sonidos automáticos ligados a acciones.

## Vista Tablero — comportamiento

- Solo muestra lo que el presentador ya reveló (nunca respuestas ocultas).
- Tablero de casillas (hasta 8) con animación de flip al revelarse cada una, mostrando texto y puntos.
- Marcador de ambos equipos, nombre de equipo/jugadores, indicador de ronda actual y multiplicador (x1/x2/x3).
- Strikes visibles como X grandes (hasta 3) con animación y sonido al aparecer.
- Pantalla dedicada para Dinero Rápido: cronómetro grande, respuestas del jugador actual apareciendo una a una, contador de puntos acumulado.
- Pantalla de resultado final (equipo ganador, puntaje de Dinero Rápido vs. objetivo).

## Plan de fases sugerido

1. **Fase 0 — Setup** ✅: proyecto Vite + React + TS en esta carpeta, estructura de carpetas, este `PRD.md`.
2. **Fase 1 — Esqueleto y sync** ✅: las dos vistas renderizando un estado de ejemplo, comunicación por `BroadcastChannel` funcionando (cambios en Presentador se reflejan en Tablero).
3. **Fase 2 — Lógica de juego** ✅: rondas normales completas (face-off manual, strikes, robo, multiplicadores, undo), con el set de preguntas de ejemplo.
4. **Fase 3 — Editor de preguntas** ✅: crear/editar, importar JSON, preview, selección aleatoria con override manual.
5. **Fase 4 — Dinero Rápido** ✅: cronómetros (a prueba de drift, basados en timestamp), captura de respuestas, cálculo de puntaje final.
6. **Fase 5 — Pulido** ✅: animaciones (flip 3D, spring en banner de ganador, flash de strike), sonidos sintetizados con Web Audio API integrados.
7. **Fase 6 — Fidelidad visual y sonora** ✅: el usuario compartió los 4 clips de audio reales del programa (correcto, incorrecto, triunfo, "a jugar") en `public/sonidos/`, ya integrados reemplazando sus equivalentes sintetizados. Para lo visual no se compartieron capturas/video, así que se aplicó la investigación de imágenes ya documentada arriba: tipografía "Baloo 2" (redondeada, estilo concurso) para textos del Tablero, "Orbitron" con glow para marcador/strikes/timer (look LED), acentos arcoíris en el borde de las casillas y marco superior/inferior del Tablero, wordmark con degradado de colores en vez del logo oficial (no se cuenta con el asset real). El panel del Presentador se mantiene con la fuente del sistema por ser una herramienta de control, no lo que ve el público. **Pendiente si el usuario comparte capturas reales**: afinar colores exactos, tipografía exacta y logo pixel-perfect.

## Verificación

- Al final de cada fase, jugar una partida de prueba abriendo las dos ventanas (Presentador + Tablero) lado a lado (simulando el dual-monitor) y confirmar visual y sonoramente que la mecánica de esa fase funciona: robo de puntos, strikes, undo, Dinero Rápido, face-off.
- Antes de dar el proyecto por "listo para jugar en serio", hacer una partida completa de principio a fin con el set de ejemplo.
