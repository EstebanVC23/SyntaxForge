import React from "react";
import { generateFragment } from "../logic/grammar/fragmentGenerator.js";

// Crea el contexto del juego para compartir estado entre componentes
export const GameContext = React.createContext();

// Proveedor que envuelve la aplicación y gestiona el estado global del juego
export function GameProvider({ children }) {
  // Estado para el fragmento estructural objetivo actual
  const [fragment, setFragment] = React.useState(generateFragment());
  
  // Estado para el texto ingresado por el usuario
  const [currentText, setCurrentText] = React.useState("");
  
  // Estado para la retroalimentación de validación (null, válido o con errores)
  const [feedback, setFeedback] = React.useState(null);
  
  // Estado para el número de ronda actual
  const [round, setRound] = React.useState(1);
  
  // Estado para la puntuación acumulada del jugador
  const [score, setScore] = React.useState(0);

  // Función para avanzar a la siguiente ronda del juego
  function nextRound() {
    setRound(r => r + 1); // Incrementa el contador de ronda
    setFragment(generateFragment()); // Genera un nuevo fragmento estructural
    setCurrentText(""); // Limpia el texto del usuario
    setFeedback(null); // Limpia la retroalimentación anterior
  }

  // Función para reiniciar completamente el juego
  function resetGame() {
    setRound(1); // Reinicia a la primera ronda
    setScore(0); // Reinicia la puntuación a cero
    setFragment(generateFragment()); // Genera un nuevo fragmento inicial
    setCurrentText(""); // Limpia cualquier texto ingresado
    setFeedback(null); // Limpia la retroalimentación
  }

  // Provee el estado y funciones a todos los componentes hijos
  return (
    <GameContext.Provider
      value={{
        // Estado actual del juego
        fragment,           // Fragmento estructural objetivo
        currentText,        // Texto ingresado por el usuario
        setCurrentText,     // Función para actualizar el texto
        feedback,           // Retroalimentación de validación
        setFeedback,        // Función para establecer retroalimentación
        nextRound,          // Función para avanzar de ronda
        resetGame,          // Función para reiniciar el juego
        round,              // Número de ronda actual
        score,              // Puntuación acumulada
        setScore            // Función para actualizar la puntuación
      }}
    >
      {children} {/* Renderiza los componentes hijos */}
    </GameContext.Provider>
  );
}