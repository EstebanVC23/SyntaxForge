import React from "react";
import { ALL_WORDS } from "../data/wordLists.js";

export const WordBankContext = React.createContext();

function randomWords(n = 30) {
  const arr = [...ALL_WORDS].sort(() => Math.random() - 0.5);
  return arr.slice(0, n);
}

export function WordBankProvider({ children }) {
  const [bank, setBank] = React.useState(() => randomWords());
  const [wordPoints, setWordPoints] = React.useState(0);

  function refreshBank() {
    setBank(randomWords());
    setWordPoints(0); // Reiniciar puntos al refrescar
  }

  function resetWordPoints() {
    setWordPoints(0);
  }

  function addToInput(word) {
    // Disparar evento para SentenceInput
    const evt = new CustomEvent('GDC_ADD_WORD', { detail: word });
    window.dispatchEvent(evt);

    // Sumar puntos por usar palabra del banco
    setWordPoints(prev => prev + 1); // +1 punto por palabra usada, puedes multiplicar si quieres más
  }

  return (
    <WordBankContext.Provider value={{ bank, refreshBank, addToInput, wordPoints, resetWordPoints }}>
      {children}
    </WordBankContext.Provider>
  );
}
