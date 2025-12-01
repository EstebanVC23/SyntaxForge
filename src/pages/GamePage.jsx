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

export default function GamePage() {
  const { fragment, currentText, setCurrentText, feedback, setFeedback, nextRound, round, score, setScore } = useContext(GameContext);
  const { bank, refreshBank, resetWordPoints } = useContext(WordBankContext);
  const [showTree, setShowTree] = useState(false); // <--- Estado para mostrar/ocultar árbol

  function handleValidate() {
    setFeedback(null);
    setShowTree(false); // ocultar el árbol al validar nuevamente

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
    <div className="container">
      <h1>🎯 GDC Game — Modo Construcción</h1>
      
      <div style={{ display: 'flex', gap: 20, marginBottom: 20, justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div className="score-display">
          <span>🏆 Ronda:</span>
          <span style={{ fontSize: '1.2rem' }}>{round}</span>
        </div>
        <div className="score-display">
          <span>⭐ Puntuación:</span>
          <span style={{ fontSize: '1.2rem' }}>{score}</span>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 500px', minWidth: 0 }}>
          <div className="objective-box">
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#4c1d95', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
              🎯 Tu objetivo:
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#5b21b6', padding: '12px 16px', background: 'white', borderRadius: '10px', marginBottom: 12, boxShadow: '0 2px 8px rgba(102, 126, 234, 0.15)' }}>
              {fragment}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#6b7280', fontStyle: 'italic', lineHeight: '1.6' }}>
              💡 Debes incluir esta estructura en tu oración y agregar más contenido.
              Solo puedes usar palabras del banco de palabras.
            </div>
          </div>
          
          <SentenceInput onValidate={handleValidate} />

          <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={handleNextRound}>⏭️ Siguiente intento</button>
            <button 
              onClick={handleClearText}
              disabled={feedback && feedback.valid}
              style={{ background: feedback && feedback.valid ? '#9ca3af' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
            >
              🗑️ Borrar texto
            </button>
            {feedback?.valid && currentText.trim() && (
              <button
                onClick={() => setShowTree(prev => !prev)}
                style={{ background: '#4f46e5', color: 'white' }}
              >
                {showTree ? 'Ocultar árbol' : 'Mostrar árbol sintáctico'}
              </button>
            )}
          </div>

          <FeedbackBox result={feedback} />

          {feedback?.usedWords && feedback.usedWords.length > 0 && (
            <div style={{ marginTop: 12, padding: '12px 16px', background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)', borderRadius: '10px', fontSize: '0.95rem', color: '#78350f', boxShadow: '0 2px 8px rgba(251, 191, 36, 0.2)' }}>
              <strong>💼 Palabras del banco usadas:</strong> {feedback.usedWords.join(", ")}
            </div>
          )}

          {showTree && <SyntaxTreeViewer text={currentText} />}
        </div>

        <div style={{ flex: '0 1 350px', minWidth: 280 }}>
          <WordBank />
        </div>
      </div>
    </div>
  );
}
