import React, { useContext } from "react";
import { GameContext } from "../context/GameContext.jsx";
import { WordBankContext } from "../context/WordBankContext.jsx";
import FragmentDisplay from "../components/FragmentDisplay.jsx";
import WordBank from "../components/WordBank.jsx";
import SentenceInput from "../components/SentenceInput.jsx";
import FeedbackBox from "../components/FeedbackBox.jsx";
import { tokenize } from "../logic/utils/tokenizer.js";
import { validateTokens } from "../logic/grammar/validateTokens.js";
import { validateVocabulary } from "../logic/utils/vocabularyValidator.js";

export default function GamePage() {
  const { 
    fragment, currentText, setCurrentText, feedback, setFeedback, 
    nextRound, round, score, setScore 
  } = useContext(GameContext);

  const { bank, addToInput, refreshBank, wordPoints, resetWordPoints } = useContext(WordBankContext);

  function handleValidate() {
    setFeedback(null);
    const userInput = currentText.trim();
    if (!userInput) {
      setFeedback({ valid: false, errors: [{ rule: "Validación", message: "Debes escribir algo antes de validar." }] });
      return;
    }

    const tokens = tokenize(userInput);

    // Validar vocabulario
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

    // Contar palabras del banco usadas
    const usedWords = tokens.filter(t => bank.includes(t.toLowerCase()));
    const wordScore = usedWords.length;
    
    if (res.valid) {
      setScore(prev => prev + wordScore);
      setFeedback({ ...res, score: score + wordScore, usedWords });
    } else {
      setFeedback({ ...res, score, usedWords });
    }
  }

  function handleNextRound() {
    nextRound();
    refreshBank();      // refrescar banco al siguiente intento
    resetWordPoints();  // reiniciar puntos del banco
    setCurrentText('');
    setFeedback(null);
  }

  function handleClearText() {
    setCurrentText('');
    setFeedback(null);
  }

  return (
    <div className="container">
      <h1>GDC Game — Modo Construcción</h1>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ padding: 12, background: '#e3f2fd', borderRadius: 8, marginBottom: 12, border: '2px solid #2196f3' }}>
            <strong style={{ fontSize: '1.1rem' }}>📝 Tu objetivo:</strong>
            <div style={{ marginTop: 8, fontSize: '1.2rem', fontWeight: 'bold', color: '#1565c0' }}>
              {fragment}
            </div>
            <div style={{ marginTop: 8, fontSize: '0.9rem', color: '#555', fontStyle: 'italic' }}>
              Debes incluir esta estructura en tu oración y agregar más contenido.
              Solo puedes usar palabras del banco de palabras.
            </div>
          </div>
          
          <SentenceInput onValidate={handleValidate} />

          <div style={{ marginTop: 8 }}>
            <button onClick={handleNextRound} style={{ marginRight: 8 }}>Siguiente intento</button>
            <button 
              onClick={handleClearText}
              disabled={feedback && feedback.valid}
              style={{
                opacity: (feedback && feedback.valid) ? 0.5 : 1,
                cursor: (feedback && feedback.valid) ? 'not-allowed' : 'pointer'
              }}
            >
              Borrar texto
            </button>
          </div>

          <FeedbackBox result={feedback} />
          {feedback?.usedWords && feedback.usedWords.length > 0 && (
            <div style={{ marginTop: 8, fontStyle: 'italic' }}>
              Palabras del banco usadas: {feedback.usedWords.join(", ")}
            </div>
          )}
        </div>

        <div style={{ width: 320 }}>
          <WordBank />
        </div>
      </div>

      <div style={{ marginTop: 16 }}>
        <strong>Ronda:</strong> {round} &nbsp; <strong>Puntuación:</strong> {score}
      </div>
    </div>
  );
}
