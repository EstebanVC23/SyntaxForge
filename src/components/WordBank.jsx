import React, { useContext } from "react";
import { WordBankContext } from "../context/WordBankContext.jsx";
import { GameContext } from "../context/GameContext.jsx";

export default function WordBank() {
  const { bank, addToInput } = useContext(WordBankContext);
  const { feedback } = useContext(GameContext);

  const isDisabled = feedback && feedback.valid;

  return (
    <div className="bank" style={{ 
      padding: 20,
      opacity: isDisabled ? 0.6 : 1,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 10,
        marginBottom: 16
      }}>
        <span style={{ fontSize: '1.3rem' }}>💼</span>
        <strong style={{ 
          fontSize: "1.2rem",
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Banco de palabras
        </strong>
      </div>
      
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "8px"
      }}>
        {bank.map((w, i) => (
          <button
            key={i}
            className="token"
            disabled={isDisabled}
            style={{
              cursor: isDisabled ? "not-allowed" : "pointer",
              padding: "10px 16px",
              borderRadius: 8,
              border: "none",
              background: isDisabled 
                ? 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)' 
                : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              opacity: isDisabled ? 0.5 : 1,
              color: 'white',
              fontWeight: 500
            }}
            onClick={() => !isDisabled && addToInput(w)}
          >
            {w}
          </button>
        ))}
      </div>
      
      {isDisabled && (
        <div style={{
          marginTop: 12,
          padding: 10,
          background: '#fef3c7',
          borderRadius: 8,
          fontSize: '0.85rem',
          color: '#78350f',
          textAlign: 'center'
        }}>
          ⚠️ Banco bloqueado. Presiona "Siguiente intento" para continuar.
        </div>
      )}
    </div>
  );
}