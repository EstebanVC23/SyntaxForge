import React, { useContext } from "react";
import { WordBankContext } from "../context/WordBankContext.jsx";
import { GameContext } from "../context/GameContext.jsx";

// Componente que muestra un banco de palabras interactivo
export default function WordBank() {
  // Obtiene el estado del banco de palabras y función para añadir palabras
  const { bank, addToInput } = useContext(WordBankContext);
  
  // Obtiene el estado de retroalimentación del juego
  const { feedback } = useContext(GameContext);

  // Determina si el banco está deshabilitado (cuando ya hay una validación exitosa)
  const isDisabled = feedback && feedback.valid;

  return (
    <div 
      className="bank" 
      style={{ 
        padding: 20,
        opacity: isDisabled ? 0.6 : 1, // Reduce opacidad cuando está deshabilitado
        transition: 'all 0.3s ease' // Transición suave para cambios de estado
      }}
    >
      {/* Encabezado del banco de palabras con icono y título estilizado */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10,
        marginBottom: 16
      }}>
        <span style={{ fontSize: '1.3rem' }}>💼</span>
        <strong style={{ 
          fontSize: "1.2rem",
          // Gradiente de color para el texto del título
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text', // Compatibilidad con WebKit
          WebkitTextFillColor: 'transparent', // Hace el texto transparente para mostrar el gradiente
          backgroundClip: 'text' // Estándar moderno para clip de fondo
        }}>
          Banco de palabras
        </strong>
      </div>
      
      {/* Contenedor de botones de palabras con diseño flexible */}
      <div style={{
        display: "flex",
        flexWrap: "wrap", // Permite que los botones se ajusten en múltiples líneas
        gap: "8px" // Espaciado entre botones
      }}>
        {/* Mapea cada palabra del banco a un botón interactivo */}
        {bank.map((w, i) => (
          <button
            key={i}
            className="token"
            disabled={isDisabled} // Deshabilita el botón según el estado
            style={{
              cursor: isDisabled ? "not-allowed" : "pointer", // Cambia cursor según estado
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              // Gradiente condicional: gris cuando está deshabilitado, color cuando activo
              background: isDisabled 
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: isDisabled ? 0.5 : 1, // Reduce opacidad cuando está deshabilitado
              color: 'white',
              fontWeight: 500
            }}
            // Solo ejecuta onClick si no está deshabilitado
            onClick={() => !isDisabled && addToInput(w)}
          >
            {w} {/* Texto de la palabra */}
          </button>
        ))}
      </div>
      
      {/* Mensaje de advertencia que se muestra cuando el banco está deshabilitado */}
      {isDisabled && (
        <div style={{
          marginTop: 12,
          padding: 10,
          background: '#fef3c7', // Color de fondo amarillo suave
          borderRadius: 8,
          fontSize: '0.85rem',
          color: '#78350f', // Color de texto marrón/ámbar
          textAlign: 'center'
        }}>
          ⚠️ Banco bloqueado. Presiona "Siguiente intento" para continuar.
        </div>
      )}
    </div>
  );
}