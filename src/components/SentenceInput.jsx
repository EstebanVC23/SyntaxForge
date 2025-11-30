import React from "react";
import { useContext, useEffect, useRef } from "react";
import { GameContext } from "../context/GameContext.jsx";

export default function SentenceInput({ onValidate }) {
  const { currentText, setCurrentText, feedback } = useContext(GameContext);
  const textareaRef = useRef();

  // Bloquear edición si la respuesta fue válida
  const isLocked = feedback && feedback.valid;

  useEffect(() => {
    function handler(e) {
      // No permitir agregar palabras si está bloqueado
      if (isLocked) return;
      
      const word = e.detail;
      setCurrentText(prev => (prev ? prev + ' ' + word : word));
      textareaRef.current?.focus();
    }
    window.addEventListener('GDC_ADD_WORD', handler);
    return () => window.removeEventListener('GDC_ADD_WORD', handler);
  }, [setCurrentText, isLocked]);

  function handleTextChange(e) {
    // Si está bloqueado, no permitir cambios
    if (isLocked) return;
    setCurrentText(e.target.value);
  }

  return (
    <div style={{ marginTop: 12 }}>
      <textarea
        ref={textareaRef}
        value={currentText}
        onChange={handleTextChange}
        id="sentenceInput"
        placeholder={isLocked ? "¡Correcto! Presiona 'Siguiente intento' para continuar." : "Incluye la estructura objetivo en tu oración..."}
        rows={4}
        style={{ 
          width: '100%', 
          padding: 8,
          background: isLocked ? '#e8f5e9' : '#fff',
          cursor: isLocked ? 'not-allowed' : 'text'
        }}
        disabled={isLocked}
      />

      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button 
          onClick={onValidate}
          disabled={!currentText.trim() || isLocked}
          style={{
            opacity: (!currentText.trim() || isLocked) ? 0.5 : 1,
            cursor: (!currentText.trim() || isLocked) ? 'not-allowed' : 'pointer'
          }}
        >
          Validar
        </button>
      </div>
    </div>
  );
}