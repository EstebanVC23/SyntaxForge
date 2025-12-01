import React, { useState } from "react";
import Tree from "react-d3-tree";
import { tokenize } from "../logic/utils/tokenizer.js";
import { getWordInfo } from "../logic/grammar/gdcRules.js";

// Función auxiliar para parsear preposiciones
function parsePrep(tokens, index, getWordInfo) {
  const info = getWordInfo(tokens[index]);
  if (info.type === "Connector") {
    const token = tokens[index];
    index++;
    return {
      node: {
        name: "Prep",
        attributes: { regla: "Prep → Preposición" },
        children: [{
          name: `"${token}"`,
          attributes: {
            categoria: "Connector",
            detalles: ""
          }
        }]
      },
      newIndex: index
    };
  }
  return null;
}

function buildSyntaxTree(tokens) {
  let index = 0;

  // Lista de preposiciones válidas (NO conjunciones)
  const PREPOSITIONS = [
    "en", "a", "de", "con", "por", "para", "sin", "sobre", "bajo",
    "ante", "desde", "hasta", "hacia", "según", "durante", "mediante",
    "entre", "contra", "tras"
  ];

  // Función para verificar si un token es preposición (no conjunción)
  function isPreposition(token) {
    return PREPOSITIONS.includes(token.toLowerCase());
  }

  // Función mejorada para detectar verbos
  function isVerbToken(token) {
    const info = getWordInfo(token);
    return info.type === "Verb";
  }

  // Crear nodo no-terminal
  function createNonTerminal(symbol, rule, children) {
    return {
      name: symbol,
      attributes: { regla: rule },
      children: children.filter(c => c !== null)
    };
  }

  // Crear nodo terminal
  function createTerminal(token) {
    const info = getWordInfo(token);
    let detalles = '';
    
    if (info.type === "Article" || info.type === "Noun") {
      if (info.gender) {
        detalles = `${info.gender}, ${info.plural ? 'pl' : 'sg'}`;
      }
    } else if (info.type === "Verb") {
      detalles = info.plural ? 'plural' : 'singular';
    }
    
    return {
      name: `"${token}"`,
      attributes: {
        categoria: info.type || "Other",
        detalles: detalles
      }
    };
  }

  // Peek: ver el tipo del siguiente token sin consumirlo
  function peek() {
    if (index >= tokens.length) return null;
    const info = getWordInfo(tokens[index]);
    
    // Si getWordInfo dice "Other" pero nosotros detectamos que es verbo, corregirlo
    if (info.type === "Other" && isVerbToken(tokens[index])) {
      return { ...info, type: "Verb" };
    }
    
    return info;
  }

  // Consume: avanzar el índice
  function consume() {
    if (index >= tokens.length) return null;
    const token = tokens[index];
    index++;
    return token;
  }

  // Match: verificar y consumir si coincide
  function match(type) {
    const info = peek();
    if (info && info.type === type) {
      return consume();
    }
    return null;
  }

  // Det → Article
  function parseDet() {
    const token = match("Article");
    if (token) {
      return createNonTerminal("Det", "Det → Art", [createTerminal(token)]);
    }
    return null;
  }

  // Adj → Adjective
  function parseAdj() {
    const token = match("Adjective");
    if (token) {
      return createNonTerminal("Adj", "Adj → Adjetivo", [createTerminal(token)]);
    }
    return null;
  }

  // N → Noun
  function parseN() {
    const token = match("Noun");
    if (token) {
      return createNonTerminal("N", "N → Sustantivo", [createTerminal(token)]);
    }
    return null;
  }

  // Conj → Conjunción
  function parseConj() {
    const info = peek();
    if (info && info.type === "Connector" && !isPreposition(tokens[index])) {
      const token = consume();
      return createNonTerminal("Conj", "Conj → Conjunción", [createTerminal(token)]);
    }
    return null;
  }

  // V → Verb
  function parseV() {
    const token = match("Verb");
    if (token) {
      return createNonTerminal("V", "V → Verbo", [createTerminal(token)]);
    }
    return null;
  }

  // SN → (Det) (Adj*) N (Adj*)
  function parseSN(allowTrailingAdj = true) {
    const children = [];
    const startIdx = index;

    // 1. Determinante opcional
    const det = parseDet();
    if (det) children.push(det);

    // 2. Adjetivos prenominales
    let adj = parseAdj();
    while (adj) {
      children.push(adj);
      adj = parseAdj();
    }

    // 3. Sustantivo (núcleo) - OBLIGATORIO
    const n = parseN();
    if (!n) {
      // Si no hay sustantivo, esto no es un SN válido
      index = startIdx; // Retroceder
      return null;
    }
    children.push(n);

    // 4. Adjetivos postnominales (solo si se permite)
    if (allowTrailingAdj) {
      adj = parseAdj();
      while (adj) {
        children.push(adj);
        adj = parseAdj();
      }
    }

    return createNonTerminal("SN", "SN → (Det) (Adj*) N (Adj*)", children);
  }

  // SP → Prep SN (Sintagma Preposicional)
  function parseSP() {
    const children = [];
    const startIdx = index;
    
    // Verificar que sea preposición (no conjunción)
    const info = peek();
    if (!info || info.type !== "Connector") return null;
    
    // Verificar que sea una preposición válida
    if (!isPreposition(tokens[index])) {
      return null;
    }
    
    const prep = consume();
    children.push(createNonTerminal("Prep", "Prep → Preposición", [createTerminal(prep)]));

    // SN opcional
    const sn = parseSN();
    if (sn) children.push(sn);

    return createNonTerminal("SP", "SP → Prep (SN)", children);
  }

  // SV → V (SN)* (SP)* (Adj*)
  function parseSV() {
    const children = [];
    
    // 1. Verbo (núcleo) - OBLIGATORIO
    const v = parseV();
    if (!v) return null;
    children.push(v);

    // 2. Complementos: pueden ser SN, SP o Adj (atributo)
    while (index < tokens.length) {
      // Intentar parsear SP (Sintagma Preposicional)
      const sp = parseSP();
      if (sp) {
        children.push(sp);
        continue;
      }

      // Intentar parsear SN (Complemento Directo) - sin adjetivos sueltos al final
      const sn = parseSN(false);
      if (sn) {
        children.push(sn);
        continue;
      }

      // Intentar parsear Adj (Atributo o predicativo)
      const adj = parseAdj();
      if (adj) {
        children.push(adj);
        continue;
      }

      // Si no hay más complementos, salir
      break;
    }

    return createNonTerminal("SV", "SV → V (SN)* (SP)* (Adj)*", children);
  }

  // O → (SN) (SV) (SN) ... - estructura flexible
  function parseO() {
    const children = [];

    while (index < tokens.length) {
      const info = peek();
      if (!info) break;

      // Si es puntuación, agregarla como nodo no-terminal
      if (info.type === "Punctuation") {
        const token = consume();
        const terminal = createTerminal(token);
        const punctNode = createNonTerminal("Punct", "Punct → Puntuación", [terminal]);
        children.push(punctNode);
        continue;
      }

      // Si es conjunción (y, o, pero, que, etc.), agregarla
      if (info.type === "Connector" && !isPreposition(tokens[index])) {
        const conj = parseConj();
        if (conj) {
          children.push(conj);
          continue;
        }
      }

      // PRIMERO: verificar si es verbo
      if (info.type === "Verb") {
        const sv = parseSV();
        if (sv) {
          children.push(sv);
          continue;
        }
      }

      // SEGUNDO: verificar si es preposición (SP)
      if (info.type === "Connector" && isPreposition(tokens[index])) {
        const sp = parseSP();
        if (sp) {
          children.push(sp);
          continue;
        }
      }

      // TERCERO: Si vemos algo que puede iniciar un SN, parsearlo
      if (["Article", "Noun", "Adjective"].includes(info.type)) {
        const sn = parseSN();
        if (sn) {
          children.push(sn);
          continue;
        }
      }

      // Si no pudimos parsear nada, consumir el token como "otro"
      const token = consume();
      const terminal = createTerminal(token);
      children.push(createNonTerminal("Otro", "Token no estructurado", [terminal]));
    }

    // Si no parseamos nada, al menos mostrar los tokens
    if (children.length === 0) {
      for (let i = 0; i < tokens.length; i++) {
        const terminal = createTerminal(tokens[i]);
        children.push(createNonTerminal("?", "No clasificado", [terminal]));
      }
    }

    return createNonTerminal("O", "O → (SN | SV | SP | Conj | Punct)*", children);
  }

  return parseO();
}

export default function SyntaxTreeViewer({ text }) {
  const [translate] = useState({ x: 400, y: 50 });

  if (!text || !text.trim()) {
    return null;
  }

  const tokens = tokenize(text);
  if (tokens.length === 0) {
    return null;
  }

  const treeData = buildSyntaxTree(tokens);

  return (
    <div style={{ marginTop: 20 }}>
      <div style={{
        padding: '16px 20px',
        background: 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)',
        borderRadius: '12px 12px 0 0',
        border: '2px solid #c7d2fe',
        borderBottom: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}>
        <span style={{ fontSize: '1.5rem' }}>🌳</span>
        <h3 style={{ 
          margin: 0, 
          color: '#4c1d95',
          fontSize: '1.2rem'
        }}>
          Árbol de Análisis Sintáctico
        </h3>
      </div>

      <div style={{ 
        width: "100%", 
        height: "600px",
        border: '2px solid #c7d2fe',
        background: '#f9fafb',
        overflow: 'hidden'
      }}>
        <Tree
          data={treeData}
          orientation="vertical"
          translate={translate}
          pathFunc="step"
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          nodeSize={{ x: 200, y: 100 }}
          nodeSvgShape={{ 
            shape: "circle", 
            shapeProps: { r: 6, fill: "#4f46e5" } 
          }}
          nodeLabelComponent={{
            render: <NodeLabel />,
            foreignObjectWrapper: {
              x: -85,
              y: 12,
              width: 170,
              height: 80
            }
          }}
        />
      </div>

      <div style={{
        padding: '14px 18px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        border: '2px solid #fbbf24',
        borderTop: 'none',
        borderRadius: '0 0 12px 12px',
        fontSize: '0.85rem',
        color: '#78350f',
        lineHeight: 1.6
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: 4 }}>📖 Leyenda de símbolos:</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          <div><strong>O</strong> = Oración</div>
          <div><strong>SN</strong> = Sintagma Nominal</div>
          <div><strong>SV</strong> = Sintagma Verbal</div>
          <div><strong>SP</strong> = Sintagma Preposicional</div>
          <div><strong>Det</strong> = Determinante</div>
          <div><strong>N</strong> = Sustantivo (Núcleo)</div>
          <div><strong>V</strong> = Verbo (Núcleo)</div>
          <div><strong>Adj</strong> = Adjetivo</div>
          <div><strong>Prep</strong> = Preposición</div>
          <div><strong>Conj</strong> = Conjunción</div>
          <div><strong>Punct</strong> = Puntuación</div>
        </div>
      </div>
    </div>
  );
}

function NodeLabel({ nodeData }) {
  // Detectar si es terminal (palabra entre comillas)
  const isTerminal = nodeData.name.startsWith('"') && nodeData.name.endsWith('"');
  
  if (isTerminal) {
    // Nodo TERMINAL (palabra)
    return (
      <div style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        border: '2px solid #3b82f6',
        borderRadius: 10,
        padding: "7px 10px",
        textAlign: "center",
        fontFamily: "system-ui, -apple-system, sans-serif",
        fontSize: "13px",
        minHeight: 40,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 3,
        boxShadow: '0 3px 8px rgba(59, 130, 246, 0.25)'
      }}>
        <div style={{ 
          fontWeight: 'bold', 
          color: '#1e40af',
          fontSize: '13px'
        }}>
          {nodeData.name}
        </div>
        {nodeData.attributes?.categoria && (
          <div style={{ fontSize: "9px", color: '#059669', fontWeight: '600' }}>
            {nodeData.attributes.categoria}
          </div>
        )}
        {nodeData.attributes?.detalles && (
          <div style={{ fontSize: "8px", color: '#7c3aed' }}>
            {nodeData.attributes.detalles}
          </div>
        )}
      </div>
    );
  }
  
  // Nodo NO-TERMINAL (símbolo gramatical)
  return (
    <div style={{
      background: 'linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)',
      border: '2px solid #818cf8',
      borderRadius: 10,
      padding: "7px 10px",
      textAlign: "center",
      fontFamily: "system-ui, -apple-system, sans-serif",
      fontSize: "12px",
      minHeight: 40,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 3,
      boxShadow: '0 2px 6px rgba(99, 102, 241, 0.2)'
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        color: '#4338ca',
        fontSize: '14px',
        letterSpacing: '0.5px'
      }}>
        {nodeData.name}
      </div>
      {nodeData.attributes?.regla && (
        <div style={{ 
          fontSize: "8px", 
          color: '#7c3aed',
          fontFamily: 'monospace',
          background: 'rgba(255,255,255,0.7)',
          padding: '2px 5px',
          borderRadius: 4,
          marginTop: 1
        }}>
          {nodeData.attributes.regla}
        </div>
      )}
    </div>
  );
}