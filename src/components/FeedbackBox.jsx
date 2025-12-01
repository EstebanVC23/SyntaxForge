import React from "react";
import "../styles/FeedbackBox.css";

export default function FeedbackBox({ result }) {
  if (!result) return null;

  if (result.valid) {
    return (
      <div className="feedback-ok">
        <strong>✔ Texto válido según reglas GDC.</strong>
        <div>Puntuación: {result.score ?? 0}</div>
      </div>
    );
  }

  return (
    <div className="feedback-error">
      <strong>❌ Se encontraron errores:</strong>
      <ul>
        {result.errors.map((e, i) => (
          <li key={i}>{e.message} (Regla: {e.rule})</li>
        ))}
      </ul>
    </div>
  );
}
