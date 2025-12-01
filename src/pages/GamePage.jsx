import React, { useContext, useState } from "react";
import { GameContext } from "../context/GameContext.jsx";
import { WordBankContext } from "../context/WordBankContext.jsx";
import FragmentDisplay from "../components/FragmentDisplay.jsx";
import WordBank from "../components/WordBank.jsx";
import SentenceInput from "../components/SentenceInput.jsx";
import FeedbackBox from "../components/FeedbackBox.jsx";
import SyntaxTreeViewer from "../components/SyntaxTreeViewer.jsx";
import { tokenize } from "../logic/utils/tokenizer.js";
import { validateTokens } from "../logic/grammar/validateTokens.js";
import { validateVocabulary } from "../logic/utils/vocabularyValidator.js";

import "../styles/GamePage.css";

// Página principal del juego de construcción de oraciones
export default function GamePage() {
  // Contexto del juego: estado global del jugador
  const { fragment, currentText, setCurrentText, feedback, setFeedback, nextRound, round, score, setScore } = useContext(GameContext);
  
  // Contexto del banco de palabras: palabras disponibles y funciones
  const { bank, refreshBank, resetWordPoints } = useContext(WordBankContext);
  
  // Estado local para controlar la visualización del árbol sintáctico
  const [showTree, setShowTree] = useState(false);

  /**
   * Valida la oración ingresada por el usuario.
   * Realiza múltiples verificaciones: vacío, vocabulario, estructura objetivo y gramática.
   * Calcula puntuación basada en palabras totales y uso del banco.
   */
  function handleValidate() {
    setFeedback(null); // Limpia retroalimentación anterior
    setShowTree(false); // Oculta árbol sintáctico

    const userInput = currentText.trim();
    
    // Validación 1: Entrada vacía
    if (!userInput) {
      setFeedback({ valid: false, errors: [{ rule: "Validación", message: "Debes escribir algo antes de validar." }] });
      return;
    }

    const tokens = tokenize(userInput); // Convierte texto en tokens
    
    // Validación 2: Vocabulario permitido
    const vocabCheck = validateVocabulary(tokens);
    if (!vocabCheck.valid) {
      const invalidList = vocabCheck.invalidWords.map(w => `"${w.word}"`).join(", ");
      setFeedback({ valid: false, errors: [{ rule: "Vocabulario no permitido", message: `Palabras no permitidas: ${invalidList}` }] });
      return;
    }

    // Normalización para comparaciones insensibles a mayúsculas/minúsculas y espacios múltiples
    const fragmentNormalized = fragment.toLowerCase().replace(/\s+/g, ' ').trim();
    const userNormalized = userInput.toLowerCase().replace(/\s+/g, ' ').trim();
    
    // Validación 3: Anti-trampa (no copiar exactamente la estructura objetivo)
    if (fragmentNormalized === userNormalized) {
      setFeedback({ valid: false, errors: [{ rule: "Anti-trampa", message: "No puedes copiar exactamente la estructura objetivo." }] });
      return;
    }
    
    // Validación 4: Inclusión de la estructura objetivo
    if (!userNormalized.includes(fragmentNormalized)) {
      setFeedback({ valid: false, errors: [{ rule: "Estructura requerida", message: `Debes incluir: "${fragment}"` }] });
      return;
    }

    // Validación 5: Reglas gramaticales GDC
    const res = validateTokens(tokens);
    
    // Cálculo de puntuación
    const totalWords = tokens.length; // Puntos por total de palabras
    const usedWords = tokens.filter(t => bank.includes(t.toLowerCase())); // Palabras del banco usadas
    const bankWordScore = usedWords.length; // Puntos por uso del banco
    const attemptScore = totalWords + bankWordScore; // Puntuación total del intento

    // Actualiza puntuación global solo si la oración es válida
    if (res.valid) setScore(prev => prev + attemptScore);

    // Establece retroalimentación detallada
    setFeedback({
      ...res, // Propaga resultado de validación (valid, errors)
      score: res.valid ? score + attemptScore : score, // Puntuación actualizada o mantenida
      usedWords, // Palabras del banco utilizadas
      totalWords, // Total de palabras en la oración
      bankWordScore, // Puntos por palabras del banco
      attemptScore // Puntuación total del intento
    });
  }

  /**
   * Avanza a la siguiente ronda del juego.
   * Reinicia estados relacionados con la ronda actual.
   */
  function handleNextRound() {
    nextRound(); // Incrementa ronda y genera nuevo fragmento
    refreshBank(); // Actualiza banco de palabras con nuevas palabras
    resetWordPoints(); // Reinicia puntos específicos del banco
    setCurrentText(''); // Limpia texto del usuario
    setFeedback(null); // Limpia retroalimentación
    setShowTree(false); // Oculta árbol sintáctico
  }

  /**
   * Limpia el texto ingresado y estados relacionados.
   */
  function handleClearText() {
    setCurrentText(''); // Limpia campo de texto
    setFeedback(null); // Limpia retroalimentación
    setShowTree(false); // Oculta árbol sintáctico
  }

  return (
    <div className="container game-page">
      {/* Título principal */}
      <h1>🎯 GDC Game — Modo Construcción</h1>
      
      {/* Panel de puntuación y ronda */}
      <div className="score-container">
        <div className="score-display">
          <span>🏆 Ronda:</span>
          <span>{round}</span>
        </div>
        <div className="score-display">
          <span>⭐ Puntuación:</span>
          <span>{score}</span>
        </div>
      </div>

      {/* Contenido principal organizado en dos columnas */}
      <div className="main-content">
        {/* Columna izquierda: Área de juego */}
        <div className="game-area">
          {/* Sección de objetivo estructural */}
          <div className="objective-box">
            <div className="objective-title">🎯 Tu objetivo:</div>
            <div className="objective-fragment">{fragment}</div>
            <div className="objective-description">
              💡 Debes incluir esta estructura en tu oración y agregar más contenido.
              Solo puedes usar palabras del banco de palabras.
            </div>
          </div>
          
          {/* Componente de entrada de texto con validación */}
          <SentenceInput onValidate={handleValidate} />

          {/* Botones de acción principales */}
          <div className="action-buttons">
            <button onClick={handleNextRound}>⏭️ Siguiente intento</button>
            <button 
              onClick={handleClearText}
              disabled={feedback && feedback.valid} // Deshabilitado cuando ya hay validación exitosa
              className={feedback && feedback.valid ? "disabled-btn" : ""}
            >
              🗑️ Borrar texto
            </button>
            {/* Botón para mostrar árbol sintáctico (solo cuando hay validación exitosa) */}
            {feedback?.valid && currentText.trim() && (
              <button
                onClick={() => setShowTree(prev => !prev)}
                className="tree-btn"
              >
                {showTree ? 'Ocultar árbol' : 'Mostrar árbol sintáctico'}
              </button>
            )}
          </div>

          {/* Componente de retroalimentación (muestra errores o éxito) */}
          <FeedbackBox result={feedback} />

          {/* Muestra palabras del banco utilizadas (si las hay) */}
          {feedback?.usedWords?.length > 0 && (
            <div className="used-words">
              <strong>💼 Palabras del banco usadas:</strong> {feedback.usedWords.join(", ")}
            </div>
          )}

          {/* Visualizador de árbol sintáctico (condicional) */}
          {showTree && <SyntaxTreeViewer text={currentText} />}
        </div>

        {/* Columna derecha: Banco de palabras */}
        <div className="bank-area">
          <WordBank />
        </div>
      </div>
    </div>
  );
}