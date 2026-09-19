import { useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useGameStore } from "../store/gameStore";
import { colorDeCategoria } from "../lib/categoriaColor";
import type { Pregunta, Respuesta } from "../types";

const FILA_VACIA: Respuesta = { texto: "", puntos: 0 };
const TAMANO_MUESTRA = 10;
// La muestra siempre reserva un lugar para esta categoría si hay alguna
// disponible, para que nunca falte una pregunta de psicología a la mano.
const CATEGORIA_GARANTIZADA = "Psicología";

function barajar<T>(arr: T[]): T[] {
  const copia = [...arr];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

function idsDisponibles(banco: Pregunta[], usadas: string[]): string[] {
  const usadasSet = new Set(usadas);
  return banco.filter((p) => !usadasSet.has(p.id)).map((p) => p.id);
}

function categoriaDe(p: Pregunta): string {
  return p.categoria ?? "Sin categoría";
}

// Arma la muestra sin repetir categoría entre las 10 (con ~17 categorías en
// el banco, alcanzan de sobra), conservando las que ya se mostraban y siguen
// disponibles — solo se elige al azar lo que hace falta para completar,
// sin volver a barajar lo que ya estaba (ese reshuffle completo solo pasa
// al darle "Re-rollear", que llama a esta misma función con `actual: []`).
function completarMuestra(actual: string[], banco: Pregunta[], usadas: string[]): string[] {
  const usadasSet = new Set(usadas);
  const disponibles = banco.filter((p) => !usadasSet.has(p.id));
  const disponiblesPorId = new Map(disponibles.map((p) => [p.id, p]));

  const conservadas = actual.filter((id) => disponiblesPorId.has(id));
  const categoriasCubiertas = new Set(conservadas.map((id) => categoriaDe(disponiblesPorId.get(id)!)));

  const faltan = TAMANO_MUESTRA - conservadas.length;
  if (faltan <= 0) return conservadas;

  const porCategoria = new Map<string, Pregunta[]>();
  for (const p of disponibles) {
    if (conservadas.includes(p.id)) continue;
    const cat = categoriaDe(p);
    if (categoriasCubiertas.has(cat)) continue;
    if (!porCategoria.has(cat)) porCategoria.set(cat, []);
    porCategoria.get(cat)!.push(p);
  }

  const nuevas: string[] = [];

  const garantizadas = porCategoria.get(CATEGORIA_GARANTIZADA);
  if (!categoriasCubiertas.has(CATEGORIA_GARANTIZADA) && garantizadas) {
    nuevas.push(garantizadas[Math.floor(Math.random() * garantizadas.length)].id);
    porCategoria.delete(CATEGORIA_GARANTIZADA);
  }

  for (const cat of barajar([...porCategoria.keys()])) {
    if (nuevas.length >= faltan) break;
    const opciones = porCategoria.get(cat)!;
    nuevas.push(opciones[Math.floor(Math.random() * opciones.length)].id);
  }

  return [...conservadas, ...nuevas];
}

export default function BancoEditor() {
  const banco = useGameStore((s) => s.estado.banco);
  const usadas = useGameStore((s) => s.estado.preguntasUsadasIds);
  const { agregarPregunta, actualizarPregunta, eliminarPregunta, importarPreguntas, elegirPregunta, elegirPreguntaAleatoria } =
    useGameStore();

  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("");
  const [texto, setTexto] = useState("");
  const [respuestas, setRespuestas] = useState<Respuesta[]>([{ ...FILA_VACIA }, { ...FILA_VACIA }]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [muestraIds, setMuestraIds] = useState<string[]>(() => completarMuestra([], banco, usadas));

  useEffect(() => {
    setMuestraIds((actual) => completarMuestra(actual, banco, usadas));
  }, [banco, usadas]);

  const disponibles = idsDisponibles(banco, usadas);
  const muestra = muestraIds.map((id) => banco.find((p) => p.id === id)).filter((p): p is Pregunta => Boolean(p));

  function reRollear() {
    setMuestraIds(completarMuestra([], banco, usadas));
  }

  function cargarParaEditar(p: Pregunta) {
    setEditandoId(p.id);
    setCategoria(p.categoria ?? "");
    setTexto(p.texto);
    setRespuestas(p.respuestas.map((r) => ({ ...r })));
  }

  function limpiarForm() {
    setEditandoId(null);
    setCategoria("");
    setTexto("");
    setRespuestas([{ ...FILA_VACIA }, { ...FILA_VACIA }]);
  }

  function guardar() {
    const respuestasValidas = respuestas.filter((r) => r.texto.trim());
    if (!texto.trim() || respuestasValidas.length < 2) {
      alert("La pregunta necesita texto y al menos 2 respuestas.");
      return;
    }
    const datos = { categoria: categoria.trim() || undefined, texto: texto.trim(), respuestas: respuestasValidas };
    if (editandoId) actualizarPregunta(editandoId, datos);
    else agregarPregunta(datos);
    limpiarForm();
  }

  function actualizarRespuesta(i: number, campo: "texto" | "puntos", valor: string) {
    setRespuestas((rs) =>
      rs.map((r, idx) => (idx === i ? { ...r, [campo]: campo === "puntos" ? Number(valor) || 0 : valor } : r)),
    );
  }

  function agregarFila() {
    setRespuestas((rs) => (rs.length >= 8 ? rs : [...rs, { ...FILA_VACIA }]));
  }

  function quitarFila(i: number) {
    setRespuestas((rs) => (rs.length <= 2 ? rs : rs.filter((_, idx) => idx !== i)));
  }

  function manejarImport(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(String(reader.result));
        const preguntas: Pregunta[] = Array.isArray(data) ? data : data.preguntas;
        if (!Array.isArray(preguntas)) throw new Error("formato inválido");
        importarPreguntas(preguntas);
      } catch {
        alert("No se pudo importar el JSON: revisa que tenga { \"preguntas\": [...] }.");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="pv-card">
      <p className="pv-card-title">Banco de preguntas</p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <button className="pv-btn pv-btn-primary" onClick={elegirPreguntaAleatoria}>
          🎲 Elegir pregunta aleatoria
        </button>
        <label className="pv-btn" style={{ cursor: "pointer" }}>
          📂 Importar JSON
          <input ref={fileInputRef} type="file" accept="application/json" onChange={manejarImport} hidden />
        </label>
      </div>

      <details className="pv-collapsible" style={{ marginBottom: 16 }}>
        <summary>{editandoId ? "Editar pregunta" : "Crear nueva pregunta"}</summary>
        <div className="pv-collapsible-body" style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 12 }}>
          <input
            className="pv-input"
            placeholder="Categoría (opcional)"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
          />
          <input className="pv-input" placeholder="Texto de la pregunta" value={texto} onChange={(e) => setTexto(e.target.value)} />
          {respuestas.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <input
                className="pv-input"
                placeholder={`Respuesta ${i + 1}`}
                value={r.texto}
                onChange={(e) => actualizarRespuesta(i, "texto", e.target.value)}
                style={{ flex: 1, minWidth: 0 }}
              />
              <input
                className="pv-input"
                type="number"
                placeholder="Pts"
                value={r.puntos}
                onChange={(e) => actualizarRespuesta(i, "puntos", e.target.value)}
                style={{ width: 70 }}
              />
              <button className="pv-btn" onClick={() => quitarFila(i)} disabled={respuestas.length <= 2}>
                ✕
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
            <button className="pv-btn" onClick={agregarFila} disabled={respuestas.length >= 8}>
              + Respuesta
            </button>
            <button className="pv-btn pv-btn-primary" onClick={guardar}>
              {editandoId ? "Guardar cambios" : "Agregar al banco"}
            </button>
            {editandoId && (
              <button className="pv-btn" onClick={limpiarForm}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </details>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <p className="pv-card-title" style={{ margin: 0 }}>
          Preguntas sin usar ({disponibles.length} disponibles)
        </p>
        <button className="pv-btn" onClick={reRollear} disabled={disponibles.length === 0}>
          🔀 Re-rollear
        </button>
      </div>

      {muestra.length === 0 ? (
        <p style={{ color: "var(--pv-text-dim)", fontSize: 13, marginBottom: 16 }}>
          Ya no quedan preguntas sin usar. "Reiniciar partida" las desmarca todas, o crea/importa más.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          {muestra.map((p) => (
            <PreguntaItem
              key={p.id}
              pregunta={p}
              usada={false}
              onLanzar={elegirPregunta}
              onEditar={cargarParaEditar}
              onEliminar={eliminarPregunta}
            />
          ))}
        </div>
      )}

      <details className="pv-collapsible">
        <summary>Ver banco completo ({banco.length} preguntas)</summary>
        <div className="pv-collapsible-body" style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 10 }}>
          {banco.map((p) => (
            <PreguntaItem
              key={p.id}
              pregunta={p}
              usada={usadas.includes(p.id)}
              onLanzar={elegirPregunta}
              onEditar={cargarParaEditar}
              onEliminar={eliminarPregunta}
            />
          ))}
        </div>
      </details>
    </div>
  );
}

function PreguntaItem({
  pregunta,
  usada,
  onLanzar,
  onEditar,
  onEliminar,
}: {
  pregunta: Pregunta;
  usada: boolean;
  onLanzar: (id: string) => void;
  onEditar: (p: Pregunta) => void;
  onEliminar: (id: string) => void;
}) {
  return (
    <details className="pv-collapsible">
      <summary>
        {usada && <span className="pv-badge">usada</span>}
        {pregunta.categoria && (
          <span className="pv-badge" style={colorDeCategoria(pregunta.categoria)}>
            {pregunta.categoria}
          </span>
        )}
        <span>{pregunta.texto}</span>
      </summary>
      <div className="pv-collapsible-body" style={{ paddingTop: 10 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 10 }}>
          {pregunta.respuestas.map((r, i) => (
            <div key={i} className="pv-row" style={{ fontSize: 13 }}>
              <span>{r.texto}</span>
              <span style={{ color: "var(--pv-accent)" }}>{r.puntos}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button className="pv-btn pv-btn-primary" onClick={() => onLanzar(pregunta.id)}>
            Lanzar esta pregunta
          </button>
          <button className="pv-btn" onClick={() => onEditar(pregunta)}>
            Editar
          </button>
          <button className="pv-btn pv-btn-danger" onClick={() => onEliminar(pregunta.id)}>
            Eliminar
          </button>
        </div>
      </div>
    </details>
  );
}
