import React, { useContext, useEffect, useRef } from "react";
import { GameContext } from "../context/GameContext.jsx";
import "../styles/SentenceInput.css";

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
      <div className="sentence-label">
        <span>✍️</span>
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
        className={isLocked ? "locked" : ""}
        disabled={isLocked}
      />

      <div className="sentence-button">
        <button 
          onClick={onValidate}
          disabled={!currentText.trim() || isLocked}
        >
          {isLocked ? '✅ Validado correctamente' : '🚀 Validar mi oración'}
        </button>
      </div>
    </div>
  );
}
