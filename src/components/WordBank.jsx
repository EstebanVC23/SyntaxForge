import React, { useContext } from "react";
import { WordBankContext } from "../context/WordBankContext.jsx";
import { GameContext } from "../context/GameContext.jsx";

export default function WordBank() {
  const { bank, addToInput } = useContext(WordBankContext);
  const { feedback } = useContext(GameContext);

  const isDisabled = feedback && feedback.valid;

  return (
    <div className="bank" style={{ padding: 10, opacity: isDisabled ? 0.6 : 1 }}>
      <strong style={{ fontSize: "1.1rem" }}>Banco de palabras</strong>
      <div style={{
        marginTop: 10,
        display: "flex",
        flexWrap: "wrap",
        gap: "6px"
      }}>
        {bank.map((w, i) => (
          <button
            key={i}
            className="token"
            disabled={isDisabled}
            style={{
              cursor: isDisabled ? "not-allowed" : "pointer",
              padding: "4px 8px",
              borderRadius: 5,
              border: "1px solid #ccc",
              background: isDisabled ? "#e0e0e0" : "#f7f7f7",
              opacity: isDisabled ? 0.6 : 1
            }}
            onClick={() => !isDisabled && addToInput(w)}
          >
            {w}
          </button>
        ))}
      </div>
    </div>
  );
}
