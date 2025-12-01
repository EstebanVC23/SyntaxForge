import "../styles/FeedbackBox.css";

// Componente que muestra retroalimentación al usuario sobre la validación de texto
export default function FeedbackBox({ result }) {
  // Si no hay resultado (result es null/undefined), no renderiza nada
  if (!result) return null;

  // Caso: texto válido según las reglas GDC
  if (result.valid) {
    return (
      <div className="feedback-ok">
        {/* Mensaje de éxito con indicador visual */}
        <strong>✔ Texto válido según reglas GDC.</strong>
        {/* Muestra la puntuación obtenida, con valor por defecto de 0 si no existe */}
        <div>Puntuación: {result.score ?? 0}</div>
      </div>
    );
  }

  // Caso: texto inválido - muestra lista de errores
  return (
    <div className="feedback-error">
      {/* Encabezado de errores con indicador visual */}
      <strong>❌ Se encontraron errores:</strong>
      {/* Lista no ordenada de errores */}
      <ul>
        {result.errors.map((e, i) => (
          // Cada error muestra el mensaje y la regla asociada
          <li key={i}>
            {e.message} (Regla: {e.rule})
          </li>
        ))}
      </ul>
    </div>
  );
}