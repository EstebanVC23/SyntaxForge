import React from "react";
import { ALL_WORDS } from "../data/wordLists.js";

// Crea el contexto para el banco de palabras
export const WordBankContext = React.createContext();

// Función para seleccionar 'n' palabras aleatorias de la lista completa
function randomWords(n = 30) {
  // Crea una copia del array, lo desordena aleatoriamente y toma los primeros 'n' elementos
  const arr = [...ALL_WORDS].sort(() => Math.random() - 0.5);
  return arr.slice(0, n);
}

// Proveedor que gestiona el estado del banco de palabras
export function WordBankProvider({ children }) {
  // Estado para almacenar las palabras actuales del banco (inicializadas aleatoriamente)
  const [bank, setBank] = React.useState(() => randomWords());
  
  // Estado para llevar la cuenta de puntos obtenidos por usar palabras del banco
  const [wordPoints, setWordPoints] = React.useState(0);

  // Función para refrescar el banco con nuevas palabras aleatorias
  function refreshBank() {
    setBank(randomWords()); // Genera un nuevo conjunto de palabras
    setWordPoints(0); // Reinicia los puntos acumulados al refrescar
  }

  // Función específica para reiniciar solo los puntos de palabras
  function resetWordPoints() {
    setWordPoints(0);
  }

  // Función para añadir una palabra al input y registrar puntos
  function addToInput(word) {
    // Crea y dispara un evento personalizado para notificar a otros componentes
    // (específicamente SentenceInput) que se ha agregado una palabra
    const evt = new CustomEvent('GDC_ADD_WORD', { detail: word });
    window.dispatchEvent(evt);

    // Incrementa los puntos por usar una palabra del banco
    // Actualmente suma 1 punto por palabra, pero se puede ajustar con multiplicadores
    setWordPoints(prev => prev + 1);
  }

  // Provee el estado y funciones a los componentes hijos
  return (
    <WordBankContext.Provider
      value={{
        bank,               // Array de palabras actuales en el banco
        refreshBank,        // Función para refrescar el banco
        addToInput,         // Función para añadir palabra al input
        wordPoints,         // Puntos acumulados por uso de palabras del banco
        resetWordPoints     // Función para reiniciar los puntos
      }}
    >
      {children} {/* Renderiza los componentes hijos */}
    </WordBankContext.Provider>
  );
}