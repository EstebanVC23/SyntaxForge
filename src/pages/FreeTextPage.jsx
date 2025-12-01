import React, { useContext, useState } from "react";
import { GameContext } from "../context/GameContext.jsx";
import { WordBankContext } from "../context/WordBankContext.jsx";
import { splitIntoSentences } from "../logic/utils/splitIntoSentences.js";
import { tokenize } from "../logic/utils/tokenizer.js";
import { validateTokens } from "../logic/grammar/validateTokens.js";
import { validateVocabulary } from "../logic/utils/vocabularyValidator.js";
import FeedbackBox from "../components/FeedbackBox.jsx";
import WordBank from "../components/WordBank.jsx";
import SyntaxTreeViewer from "../components/SyntaxTreeViewer.jsx";

export default function FreeTextPage() {
  const { bank } = useContext(WordBankContext);
  const { score, setScore } = useContext(GameContext); // puntuación global
  const [text, setText] = useState('');
  const [report, setReport] = useState(null);
  const [showTree, setShowTree] = useState(false);

  function handleValidate() {
    setReport(null);
    setShowTree(false);

    const sentences = splitIntoSentences(text);

    if (sentences.length === 0) {
      setReport({
        valid: false,
        details: [],
        score: 0,
        error: "No se detectaron oraciones válidas en el texto."
      });
      return;
    }

    const fullReport = [];
    let overallValid = true;
    let totalScore = 0;

    for (const s of sentences) {
      const tokens = tokenize(s);

      const vocabCheck = validateVocabulary(tokens);
      if (!vocabCheck.valid) {
        const invalidList = vocabCheck.invalidWords.map(w => `"${w.word}"`).join(", ");
        fullReport.push({
          sentence: s,
          result: {
            valid: false,
            errors: [{
              rule: "Vocabulario no permitido",
              message: `Palabras no permitidas: ${invalidList}`
            }]
          },
          wordsTotal: tokens.length,
          usedWords: [],
          sentenceScore: 0
        });
        overallValid = false;
        continue;
      }

      const res = validateTokens(tokens);

      const wordsTotal = tokens.length;
      const usedWords = tokens.filter(t => bank.includes(t.toLowerCase()));
      const bankScore = usedWords.length;
      const sentenceScore = wordsTotal + bankScore;

      if (!res.valid) overallValid = false;
      else totalScore += sentenceScore;

      fullReport.push({
        sentence: s,
        result: res,
        wordsTotal,
        usedWords,
        sentenceScore
      });
    }

    // Actualizar puntuación global compartida
    setScore(prev => prev + totalScore);

    setReport({
      valid: overallValid,
      details: fullReport,
      score: score + totalScore
    });
  }

  function handleClear() {
    setText('');
    setReport(null);
    setShowTree(false);
  }

  return (
    <div className="container">
      <h1>📝 Modo Texto Libre — Valida párrafos</h1>

      {/* Mostrar puntuación global */}
      <div style={{
        marginBottom: 20,
        padding: '12px 16px',
        borderRadius: 12,
        background: 'linear-gradient(135deg, #fef9c3 0%, #facc15 100%)',
        color: '#78350f',
        fontWeight: 'bold',
        fontSize: '1.1rem',
        display: 'inline-block'
      }}>
        ⭐ Puntuación acumulada: {score}
      </div>

      <div style={{ 
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
        borderRadius: '12px',
        marginBottom: 20,
        border: '2px solid #c7d2fe',
        color: '#4c1d95',
        lineHeight: '1.8'
      }}>
        <p style={{ margin: 0 }}>
          <strong>💡 Instrucciones:</strong> Usa el banco de palabras para reforzar el vocabulario permitido.
        </p>
        <p style={{ margin: '8px 0 0 0', fontSize: '0.95rem' }}>
          <strong>📊 La puntuación depende de:</strong>
          <br />• Palabras totales escritas (+1 cada una)
          <br />• Palabras del banco utilizadas (+1 cada una)
        </p>
      </div>

      <WordBank />

      <div className="sentence-card">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Pega o escribe un párrafo completo aquí..."
        />

        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={handleValidate}
            disabled={!text.trim()}
          >
            ✅ Validar texto
          </button>

          <button 
            onClick={handleClear}
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
          >
            🗑️ Limpiar
          </button>

          {report && report.valid && text.trim() && (
            <button
              onClick={() => setShowTree(prev => !prev)}
              style={{ background: '#4f46e5', color: 'white' }}
            >
              {showTree ? 'Ocultar árbol' : 'Mostrar árbol sintáctico'}
            </button>
          )}
        </div>
      </div>

      {report && report.error && (
        <div style={{
          marginTop: 20,
          padding: 20,
          background: '#fee2e2',
          border: '2px solid #fca5a5',
          borderRadius: 12,
          color: '#991b1b',
          fontWeight: 500
        }}>
          <strong>❌ Error:</strong> {report.error}
        </div>
      )}

      {report && !report.error && (
        <div style={{ marginTop: 20 }}>
          <h3>📊 Reporte de Validación</h3>

          <div style={{
            padding: 20,
            background: report.valid 
              ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)' 
              : 'linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)',
            borderRadius: 12,
            marginBottom: 20,
            border: `2px solid ${report.valid ? '#6ee7b7' : '#fca5a5'}`,
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: 8 }}>
              <span style={{ fontSize: '1.5rem' }}>
                {report.valid ? '✅' : '❌'}
              </span>{' '}
              {report.valid ? 'Todo correcto' : 'Se encontraron errores'}
            </div>
            <div style={{ fontSize: '0.95rem' }}>
              <strong>⭐ Puntuación total de este intento:</strong> {report.score}
              <br />
              <strong>📝 Oraciones válidas:</strong> {report.details.filter(d => d.result.valid).length} / {report.details.length}
            </div>
          </div>

          <div>
            {report.details.map((d, i) => (
              <div key={i} className={`report-card ${d.result.valid ? 'valid' : 'invalid'}`}>
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: '#4c1d95', fontSize: '1.05rem' }}>
                    Oración {i + 1}:
                  </strong>
                  <div style={{ marginTop: 8, padding: '12px 16px', background: '#f9fafb', borderRadius: 8, fontStyle: 'italic', color: '#374151' }}>
                    "{d.sentence}"
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 12 }}>
                  <div style={{ padding: '10px 14px', background: '#ede9fe', borderRadius: 8, fontSize: '0.9rem' }}>
                    <strong>📝 Palabras totales:</strong> {d.wordsTotal}
                  </div>
                  <div style={{ padding: '10px 14px', background: '#dbeafe', borderRadius: 8, fontSize: '0.9rem' }}>
                    <strong>💼 Del banco:</strong> {d.usedWords.length > 0 ? d.usedWords.join(", ") : "Ninguna"}
                  </div>
                  <div style={{ padding: '10px 14px', background: '#fef3c7', borderRadius: 8, fontSize: '0.9rem' }}>
                    <strong>⭐ Puntos:</strong> {d.sentenceScore}
                  </div>
                </div>

                <FeedbackBox result={d.result} />
              </div>
            ))}
          </div>

          {showTree && <SyntaxTreeViewer text={text} />}
        </div>
      )}
    </div>
  );
}
