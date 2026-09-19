import ScoreNumber from "./ScoreNumber";

export default function PlacadorLateral({
  nombre,
  puntos,
  enControl,
  atenuado,
}: {
  nombre: string;
  puntos: number;
  enControl: boolean;
  atenuado: boolean;
}) {
  return (
    <div style={{ opacity: atenuado ? 0.45 : 1, textAlign: "center" }}>
      <h2 style={{ margin: "0 0 6px", fontSize: "clamp(14px, 2.6vw, 20px)" }}>{nombre}</h2>
      <div className="placador-lateral">
        <div
          className="marcador-puntaje"
          style={{ fontSize: "clamp(28px, 6vw, 44px)", color: "var(--color-accent)", textShadow: "0 0 8px currentColor" }}
        >
          <ScoreNumber value={puntos} />
        </div>
      </div>
      {enControl && <p style={{ color: "var(--color-accent)", margin: "6px 0 0", fontSize: 13 }}>En control</p>}
    </div>
  );
}
