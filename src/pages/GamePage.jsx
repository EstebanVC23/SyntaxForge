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

export default function GamePage() {
  const { fragment, currentText, setCurrentText, feedback, setFeedback, nextRound, round, score, setScore } = useContext(GameContext);
  const { bank, refreshBank, resetWordPoints } = useContext(WordBankContext);
  const [showTree, setShowTree] = useState(false);

  function handleValidate() {
    setFeedback(null);
    setShowTree(false);

    const userInput = currentText.trim();
    if (!userInput) {
      setFeedback({ valid: false, errors: [{ rule: "Validación", message: "Debes escribir algo antes de validar." }] });
      return;
    }

    const tokens = tokenize(userInput);
    const vocabCheck = validateVocabulary(tokens);
    if (!vocabCheck.valid) {
      const invalidList = vocabCheck.invalidWords.map(w => `"${w.word}"`).join(", ");
      setFeedback({ valid: false, errors: [{ rule: "Vocabulario no permitido", message: `Palabras no permitidas: ${invalidList}` }] });
      return;
    }

    const fragmentNormalized = fragment.toLowerCase().replace(/\s+/g, ' ').trim();
    const userNormalized = userInput.toLowerCase().replace(/\s+/g, ' ').trim();
    if (fragmentNormalized === userNormalized) {
      setFeedback({ valid: false, errors: [{ rule: "Anti-trampa", message: "No puedes copiar exactamente la estructura objetivo." }] });
      return;
    }
    if (!userNormalized.includes(fragmentNormalized)) {
      setFeedback({ valid: false, errors: [{ rule: "Estructura requerida", message: `Debes incluir: "${fragment}"` }] });
      return;
    }

    const res = validateTokens(tokens);
    const totalWords = tokens.length;
    const usedWords = tokens.filter(t => bank.includes(t.toLowerCase()));
    const bankWordScore = usedWords.length;
    const attemptScore = totalWords + bankWordScore;

    if (res.valid) setScore(prev => prev + attemptScore);

    setFeedback({
      ...res,
      score: res.valid ? score + attemptScore : score,
      usedWords,
      totalWords,
      bankWordScore,
      attemptScore
    });
  }

  function handleNextRound() {
    nextRound();
    refreshBank();
    resetWordPoints();
    setCurrentText('');
    setFeedback(null);
    setShowTree(false);
  }

  function handleClearText() {
    setCurrentText('');
    setFeedback(null);
    setShowTree(false);
  }

  return (
    <div className="container game-page">
      <h1>🎯 GDC Game — Modo Construcción</h1>
      
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

      <div className="main-content">
        <div className="game-area">
          <div className="objective-box">
            <div className="objective-title">🎯 Tu objetivo:</div>
            <div className="objective-fragment">{fragment}</div>
            <div className="objective-description">
              💡 Debes incluir esta estructura en tu oración y agregar más contenido.
              Solo puedes usar palabras del banco de palabras.
            </div>
          </div>
          
          <SentenceInput onValidate={handleValidate} />

          <div className="action-buttons">
            <button onClick={handleNextRound}>⏭️ Siguiente intento</button>
            <button 
              onClick={handleClearText}
              disabled={feedback && feedback.valid}
              className={feedback && feedback.valid ? "disabled-btn" : ""}
            >
              🗑️ Borrar texto
            </button>
            {feedback?.valid && currentText.trim() && (
              <button
                onClick={() => setShowTree(prev => !prev)}
                className="tree-btn"
              >
                {showTree ? 'Ocultar árbol' : 'Mostrar árbol sintáctico'}
              </button>
            )}
          </div>

          <FeedbackBox result={feedback} />

          {feedback?.usedWords?.length > 0 && (
            <div className="used-words">
              <strong>💼 Palabras del banco usadas:</strong> {feedback.usedWords.join(", ")}
            </div>
          )}

          {showTree && <SyntaxTreeViewer text={currentText} />}
        </div>

        <div className="bank-area">
          <WordBank />
        </div>
      </div>
    </div>
  );
}
