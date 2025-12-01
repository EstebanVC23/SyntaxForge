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

// Página principal para validación de texto libre (párrafos completos)
export default function FreeTextPage() {
  // Contexto del banco de palabras
  const { bank } = useContext(WordBankContext);
  
  // Contexto del juego para puntuación global
  const { score, setScore } = useContext(GameContext);
  
  // Estado local del texto ingresado por el usuario
  const [text, setText] = useState('');
  
  // Estado para almacenar el reporte de validación
  const [report, setReport] = useState(null);
  
  // Estado para controlar la visibilidad del árbol sintáctico
  const [showTree, setShowTree] = useState(false);

  /**
   * Valida el texto completo ingresado por el usuario.
   * Procesa oración por oración, valida vocabulario, gramática y calcula puntuación.
   */
  function handleValidate() {
    setReport(null); // Limpia reporte anterior
    setShowTree(false); // Oculta árbol sintáctico

    // Divide el texto en oraciones individuales
    const sentences = splitIntoSentences(text);

    // Validación: texto vacío o sin oraciones
    if (sentences.length === 0) {
      setReport({
        valid: false,
        details: [],
        score: 0,
        error: "No se detectaron oraciones válidas en el texto."
      });
      return;
    }

    const fullReport = []; // Almacena reporte detallado de cada oración
    let overallValid = true; // Estado global de validación
    let totalScore = 0; // Puntuación acumulada en esta validación

    // Procesa cada oración individualmente
    for (const s of sentences) {
      const tokens = tokenize(s); // Convierte oración en tokens

      // 1. Validación de vocabulario (palabras permitidas)
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
        continue; // Salta a la siguiente oración
      }

      // 2. Validación gramatical (reglas GDC)
      const res = validateTokens(tokens);

      // 3. Cálculo de puntuación para esta oración
      const wordsTotal = tokens.length; // Puntos por total de palabras
      const usedWords = tokens.filter(t => bank.includes(t.toLowerCase())); // Palabras del banco usadas
      const bankScore = usedWords.length; // Puntos por usar palabras del banco
      const sentenceScore = wordsTotal + bankScore; // Puntuación total de la oración

      // Actualiza estado global de validación
      if (!res.valid) overallValid = false;
      else totalScore += sentenceScore; // Solo suma puntuación si la oración es válida

      // Agrega reporte detallado de esta oración
      fullReport.push({
        sentence: s,
        result: res,
        wordsTotal,
        usedWords,
        sentenceScore
      });
    }

    // Actualiza la puntuación global del juego
    setScore(prev => prev + totalScore);

    // Establece el reporte final con todos los resultados
    setReport({
      valid: overallValid,
      details: fullReport,
      score: score + totalScore
    });
  }

  /**
   * Limpia el texto, reporte y oculta el árbol sintáctico.
   */
  function handleClear() {
    setText('');
    setReport(null);
    setShowTree(false);
  }

  return (
    <div className="container">
      {/* Título principal */}
      <h1>📝 Modo Texto Libre — Valida párrafos</h1>

      {/* Mostrar puntuación global acumulada */}
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

      {/* Instrucciones y explicación de puntuación */}
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

      {/* Componente del banco de palabras */}
      <WordBank />

      {/* Área principal para ingresar texto */}
      <div className="sentence-card">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Pega o escribe un párrafo completo aquí..."
        />

        {/* Botones de acción */}
        <div style={{ marginTop: 16, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {/* Botón para validar el texto */}
          <button
            onClick={handleValidate}
            disabled={!text.trim()} // Deshabilitado si no hay texto
          >
            ✅ Validar texto
          </button>

          {/* Botón para limpiar todo */}
          <button 
            onClick={handleClear}
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
          >
            🗑️ Limpiar
          </button>

          {/* Botón para mostrar/ocultar árbol sintáctico (solo si hay reporte válido) */}
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

      {/* Mensaje de error general (si el texto no contiene oraciones) */}
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

      {/* Reporte detallado de validación (si no hay error general) */}
      {report && !report.error && (
        <div style={{ marginTop: 20 }}>
          <h3>📊 Reporte de Validación</h3>

          {/* Resumen general del reporte */}
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

          {/* Reporte detallado por oración */}
          <div>
            {report.details.map((d, i) => (
              <div key={i} className={`report-card ${d.result.valid ? 'valid' : 'invalid'}`}>
                {/* Encabezado de cada oración */}
                <div style={{ marginBottom: 12 }}>
                  <strong style={{ color: '#4c1d95', fontSize: '1.05rem' }}>
                    Oración {i + 1}:
                  </strong>
                  <div style={{ marginTop: 8, padding: '12px 16px', background: '#f9fafb', borderRadius: 8, fontStyle: 'italic', color: '#374151' }}>
                    "{d.sentence}"
                  </div>
                </div>

                {/* Métricas de la oración en formato grid */}
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

                {/* Componente de retroalimentación (errores o éxito) */}
                <FeedbackBox result={d.result} />
              </div>
            ))}
          </div>

          {/* Visualizador de árbol sintáctico (condicional) */}
          {showTree && <SyntaxTreeViewer text={text} />}
        </div>
      )}
    </div>
  );
}