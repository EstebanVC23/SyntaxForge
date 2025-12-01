import React, { useContext, useEffect, useRef } from "react";
import { GameContext } from "../context/GameContext.jsx";
import "../styles/SentenceInput.css";

// Componente para entrada de texto con validación y manejo de contexto del juego
export default function SentenceInput({ onValidate }) {
  // Accede al estado global del juego a través del contexto
  const { currentText, setCurrentText, feedback } = useContext(GameContext);
  
  // Referencia para manipular directamente el textarea
  const textareaRef = useRef();
  
  // Determina si el input está bloqueado (cuando ya hay feedback válido)
  const isLocked = feedback && feedback.valid;

  // Efecto para escuchar eventos personalizados de agregar palabras
  useEffect(() => {
    function handler(e) {
      // No hacer nada si el input está bloqueado
      if (isLocked) return;
      
      // Obtiene la palabra del evento y la añade al texto actual
      const word = e.detail;
      setCurrentText(prev => (prev ? prev + ' ' + word : word));
      
      // Enfoca el textarea después de agregar la palabra
      textareaRef.current?.focus();
    }
    
    // Suscribe el componente al evento personalizado
    window.addEventListener('GDC_ADD_WORD', handler);
    
    // Limpieza: elimina el event listener al desmontar el componente
    return () => window.removeEventListener('GDC_ADD_WORD', handler);
  }, [setCurrentText, isLocked]); // Dependencias del efecto

  // Maneja cambios en el textarea
  function handleTextChange(e) {
    // No permite cambios si el input está bloqueado
    if (isLocked) return;
    setCurrentText(e.target.value);
  }

  return (
    <div className="sentence-card">
      {/* Encabezado con icono y etiqueta */}
      <div className="sentence-label">
        <span>✍️</span>
        <span>Escribe tu oración:</span>
      </div>
      
      {/* Textarea principal para entrada de texto */}
      <textarea
        ref={textareaRef} // Asigna la referencia para acceso directo
        value={currentText} // Texto controlado por el estado
        onChange={handleTextChange} // Maneja cambios de texto
        id="sentenceInput" // ID para accesibilidad y estilos
        placeholder={isLocked 
          ? "¡Correcto! Presiona 'Siguiente intento' para continuar." 
          : "Incluye la estructura objetivo en tu oración..."
        } // Placeholder dinámico según estado
        rows={5} // Número de filas visibles
        className={isLocked ? "locked" : ""} // Clase condicional para estado bloqueado
        disabled={isLocked} // Deshabilita textarea cuando está bloqueado
      />

      {/* Contenedor del botón de validación */}
      <div className="sentence-button">
        <button 
          onClick={onValidate} // Ejecuta la función de validación pasada como prop
          disabled={!currentText.trim() || isLocked} // Deshabilita si no hay texto o está bloqueado
        >
          {isLocked ? '✅ Validado correctamente' : '🚀 Validar mi oración'}
        </button>
      </div>
    </div>
  );
}