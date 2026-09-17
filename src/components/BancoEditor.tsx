import { useRef, useState } from "react";
import type { ChangeEvent } from "react";
import { useGameStore } from "../store/gameStore";
import type { Pregunta, Respuesta } from "../types";

const FILA_VACIA: Respuesta = { texto: "", puntos: 0 };

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
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <button onClick={elegirPreguntaAleatoria}>🎲 Elegir pregunta aleatoria</button>
        <label style={{ border: "1px solid #333", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>
          Importar JSON
          <input ref={fileInputRef} type="file" accept="application/json" onChange={manejarImport} hidden />
        </label>
      </div>

      <details style={{ border: "1px solid #333", borderRadius: 8, padding: 12, marginBottom: 16 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>
          {editandoId ? "Editar pregunta" : "Crear nueva pregunta"}
        </summary>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
          <input placeholder="Categoría (opcional)" value={categoria} onChange={(e) => setCategoria(e.target.value)} />
          <input placeholder="Texto de la pregunta" value={texto} onChange={(e) => setTexto(e.target.value)} />
          {respuestas.map((r, i) => (
            <div key={i} style={{ display: "flex", gap: 8 }}>
              <input
                placeholder={`Respuesta ${i + 1}`}
                value={r.texto}
                onChange={(e) => actualizarRespuesta(i, "texto", e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="number"
                placeholder="Pts"
                value={r.puntos}
                onChange={(e) => actualizarRespuesta(i, "puntos", e.target.value)}
                style={{ width: 70 }}
              />
              <button onClick={() => quitarFila(i)} disabled={respuestas.length <= 2}>
                ✕
              </button>
            </div>
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={agregarFila} disabled={respuestas.length >= 8}>
              + Respuesta
            </button>
            <button onClick={guardar}>{editandoId ? "Guardar cambios" : "Agregar al banco"}</button>
            {editandoId && <button onClick={limpiarForm}>Cancelar</button>}
          </div>
        </div>
      </details>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {banco.map((p) => (
          <details key={p.id} style={{ border: "1px solid #333", borderRadius: 6, padding: 8 }}>
            <summary style={{ cursor: "pointer" }}>
              {usadas.includes(p.id) ? "✓ " : ""}
              {p.categoria ? `[${p.categoria}] ` : ""}
              {p.texto}
            </summary>
            <ul>
              {p.respuestas.map((r, i) => (
                <li key={i}>
                  {r.texto} — {r.puntos}
                </li>
              ))}
            </ul>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => elegirPregunta(p.id)}>Lanzar esta pregunta</button>
              <button onClick={() => cargarParaEditar(p)}>Editar</button>
              <button onClick={() => eliminarPregunta(p.id)}>Eliminar</button>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
