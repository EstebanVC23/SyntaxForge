import React from "react";
import { useContext, useEffect, useRef } from "react";
import { GameContext } from "../context/GameContext.jsx";

export default function SentenceInput({ onValidate }) {
  const { currentText, setCurrentText, feedback } = useContext(GameContext);
  const textareaRef = useRef();

  const isLocked = feedback && feedback.valid;

  useEffect(() => {
    function handler(e) {
      if (isLocked) return;
      
      const word = e.detail;
      setCurrentText(prev => (prev ? prev + ' ' + word : word));
      textareaRef.current?.focus();
    }
    window.addEventListener('GDC_ADD_WORD', handler);
    return () => window.removeEventListener('GDC_ADD_WORD', handler);
  }, [setCurrentText, isLocked]);

  function handleTextChange(e) {
    if (isLocked) return;
    setCurrentText(e.target.value);
  }

  return (
    <div className="sentence-card">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
        color: '#4c1d95',
        fontWeight: 600
      }}>
        <span style={{ fontSize: '1.2rem' }}>✍️</span>
        <span>Escribe tu oración:</span>
      </div>
      
      <textarea
        ref={textareaRef}
        value={currentText}
        onChange={handleTextChange}
        id="sentenceInput"
        placeholder={isLocked 
          ? "¡Correcto! Presiona 'Siguiente intento' para continuar." 
          : "Incluye la estructura objetivo en tu oración..."
        }
        rows={5}
        style={{ 
          background: isLocked ? '#d1fae5' : 'white',
          cursor: isLocked ? 'not-allowed' : 'text',
          border: isLocked ? '2px solid #10b981' : '2px solid #e0e7ff'
        }}
        disabled={isLocked}
      />

      <div style={{ marginTop: 12 }}>
        <button 
          onClick={onValidate}
          disabled={!currentText.trim() || isLocked}
          style={{
            width: '100%',
            padding: '14px',
            fontSize: '1.05rem',
            fontWeight: 'bold'
          }}
        >
          {isLocked ? '✅ Validado correctamente' : '🚀 Validar mi oración'}
        </button>
      </div>
    </div>
  );
}