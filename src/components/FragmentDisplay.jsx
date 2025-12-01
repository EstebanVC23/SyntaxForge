// Componente para mostrar un fragmento de texto con formato especial
export default function FragmentDisplay({ fragment }) {
  return (
    // Contenedor con margen inferior para separación visual
    <div style={{ marginBottom: 8 }}>
      {/* Etiqueta descriptiva del contenido */}
      <strong>Estructura objetivo:</strong>
      {/* Fragmento de texto con clase CSS para estilización especial */}
      <span className="token">{fragment}</span>
    </div>
  );
}