import React from "react";
import { splitIntoSentences } from "../logic/utils/splitIntoSentences.js";
import { tokenize } from "../logic/utils/tokenizer.js";
import { validateTokens } from "../logic/grammar/validateTokens.js";
import { validateVocabulary } from "../logic/utils/vocabularyValidator.js";
import { useState } from "react";
import FeedbackBox from "../components/FeedbackBox.jsx";

export default function FreeTextPage() {
  const [text, setText] = useState('');
  const [report, setReport] = useState(null);

  function handleValidate() {
    // Limpiar reporte anterior
    setReport(null);

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
    let score = 0;

    for (const s of sentences) {
      const tokens = tokenize(s);
      
      // Primero validar vocabulario
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
          }
        });
        overallValid = false;
        continue;
      }
      
      // Luego validar reglas GDC
      const res = validateTokens(tokens);
      fullReport.push({ sentence: s, result: res });
      if (!res.valid) overallValid = false; 
      else score++;
    }

    setReport({ valid: overallValid, details: fullReport, score });
  }

  function handleClear() {
    setText('');
    setReport(null);
  }

  return (
    <div className="container">
      <h1>Modo Texto Libre — Valida párrafos</h1>
      <p style={{ color: '#666', fontSize: '0.95rem' }}>
        Solo puedes usar palabras del diccionario permitido (disponibles en el banco de palabras del Modo Juego).
      </p>
      <textarea 
        value={text} 
        onChange={(e) => setText(e.target.value)} 
        rows={8} 
        style={{ 
          width: '100%', 
          padding: 8,
          background: '#fff'
        }} 
        placeholder="Pega o escribe un párrafo completo aquí..." 
      />
      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
        <button 
          onClick={handleValidate}
          disabled={!text.trim()}
          style={{
            opacity: !text.trim() ? 0.5 : 1,
            cursor: !text.trim() ? 'not-allowed' : 'pointer'
          }}
        >
          Validar texto
        </button>
        <button onClick={handleClear}>
          Limpiar
        </button>
      </div>

      {report && report.error && (
        <div style={{ 
          marginTop: 12, 
          padding: 12, 
          background: '#fee', 
          border: '1px solid #fcc',
          borderRadius: 4 
        }}>
          <strong>Error:</strong> {report.error}
        </div>
      )}

      {report && !report.error && (
        <div style={{ marginTop: 12 }}>
          <h3>Reporte</h3>
          <div style={{ 
            padding: 12, 
            background: report.valid ? '#e8f5e9' : '#ffebee',
            borderRadius: 4,
            marginBottom: 12
          }}>
            <strong>Oraciones válidas:</strong> {report.score} / {report.details.length}
            <br />
            <strong>Estado general:</strong> {report.valid ? '✔ Todo correcto' : '❌ Se encontraron errores'}
          </div>
          <div>
            {report.details.map((d, i) => (
              <div 
                key={i} 
                style={{ 
                  marginTop: 8, 
                  padding: 12, 
                  background: '#fff', 
                  border: '1px solid #eee',
                  borderRadius: 4,
                  borderLeft: `4px solid ${d.result.valid ? '#4caf50' : '#f44336'}`
                }}
              >
                <strong>Oración {i + 1}:</strong> {d.sentence}
                <FeedbackBox result={d.result} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}