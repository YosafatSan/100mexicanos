// Colores fijos y repartidos parejo en el círculo de tono (hue) para las
// categorías que ya conocemos, así se ven lo más distintas posible entre sí.
// Cualquier categoría nueva que el usuario escriba en el editor (no está en
// esta lista) cae en el hash de abajo, que igual le da un color consistente
// aunque no esté garantizado que no choque con otro.
const HUES_CONOCIDAS: Record<string, number> = {
  Comida: 0,
  Casa: 21,
  Cuerpo: 42,
  Transporte: 64,
  Trabajo: 85,
  Animales: 106,
  Vacaciones: 127,
  Escuela: 148,
  Hogar: 169,
  Fiestas: 190,
  Familia: 212,
  Dinero: 233,
  Tecnología: 254,
  Deportes: 275,
  Entretenimiento: 296,
  Clima: 317,
  Psicología: 339,
};

function hueDesdeTexto(texto: string): number {
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) % 360;
  }
  return hash;
}

export function colorDeCategoria(categoria: string): { background: string; borderColor: string; color: string } {
  const hue = HUES_CONOCIDAS[categoria] ?? hueDesdeTexto(categoria);
  return {
    background: `hsla(${hue}, 70%, 55%, 0.16)`,
    borderColor: `hsla(${hue}, 70%, 55%, 0.45)`,
    color: `hsl(${hue}, 80%, 72%)`,
  };
}
