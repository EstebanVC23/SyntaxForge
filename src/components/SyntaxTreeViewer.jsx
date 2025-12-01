import { useState } from "react";
import Tree from "react-d3-tree";
import { tokenize } from "../logic/utils/tokenizer.js";
import { getWordInfo } from "../logic/grammar/gdcRules.js";
import "../styles/SyntaxTreeViewer.css";

// Construye un árbol de sintaxis a partir de una lista de tokens
function buildSyntaxTree(tokens) {
  let index = 0; // Índice para recorrer los tokens

  // Lista de preposiciones comunes en español para identificación
  const PREPOSITIONS = [
    "en", "a", "de", "con", "por", "para", "sin", "sobre", "bajo",
    "ante", "desde", "hasta", "hacia", "según", "durante", "mediante",
    "entre", "contra", "tras"
  ];

  // Verifica si un token es una preposición
  function isPreposition(token) {
    return PREPOSITIONS.includes(token.toLowerCase());
  }

  // Determina si un token es un verbo según las reglas GDC
  function isVerbToken(token) {
    const info = getWordInfo(token);
    return info.type === "Verb";
  }

  // Crea un nodo no terminal (estructura sintáctica)
  function createNonTerminal(symbol, rule, children) {
    return {
      name: symbol, // Símbolo sintáctico (ej: SN, SV)
      attributes: { regla: rule }, // Regla gramatical aplicada
      children: children.filter(c => c !== null) // Filtra hijos nulos
    };
  }

  // Crea un nodo terminal (palabra concreta)
  function createTerminal(token) {
    const info = getWordInfo(token); // Obtiene información gramatical de la palabra
    let detalles = '';

    // Construye detalles específicos según el tipo de palabra
    if (info.type === "Article" || info.type === "Noun") {
      if (info.gender) detalles = `${info.gender}, ${info.plural ? 'pl' : 'sg'}`;
    } else if (info.type === "Verb") {
      detalles = info.plural ? 'plural' : 'singular';
    }

    return {
      name: `"${token}"`, // Nombre entre comillas para indicar token literal
      attributes: {
        categoria: info.type || "Other", // Categoría gramatical
        detalles: detalles // Detalles específicos (género, número, etc.)
      }
    };
  }

  // Observa el siguiente token sin consumirlo (lookahead)
  function peek() {
    if (index >= tokens.length) return null;
    const info = getWordInfo(tokens[index]);
    // Corrige posibles verbos mal etiquetados como "Other"
    if (info.type === "Other" && isVerbToken(tokens[index])) {
      return { ...info, type: "Verb" };
    }
    return info;
  }

  // Consume y retorna el token actual, avanzando el índice
  function consume() {
    if (index >= tokens.length) return null;
    const token = tokens[index];
    index++;
    return token;
  }

  // Intenta hacer match con un tipo específico de token
  function match(type) {
    const info = peek();
    if (info && info.type === type) return consume();
    return null;
  }

  // Parseador para determinantes (artículos)
  function parseDet() {
    const token = match("Article");
    if (token) return createNonTerminal("Det", "Det → Art", [createTerminal(token)]);
    return null;
  }

  // Parseador para adjetivos
  function parseAdj() {
    const token = match("Adjective");
    if (token) return createNonTerminal("Adj", "Adj → Adjetivo", [createTerminal(token)]);
    return null;
  }

  // Parseador para sustantivos
  function parseN() {
    const token = match("Noun");
    if (token) return createNonTerminal("N", "N → Sustantivo", [createTerminal(token)]);
    return null;
  }

  // Parseador para conjunciones (excluye preposiciones)
  function parseConj() {
    const info = peek();
    if (info && info.type === "Connector" && !isPreposition(tokens[index])) {
      const token = consume();
      return createNonTerminal("Conj", "Conj → Conjunción", [createTerminal(token)]);
    }
    return null;
  }

  // Parseador para verbos
  function parseV() {
    const token = match("Verb");
    if (token) return createNonTerminal("V", "V → Verbo", [createTerminal(token)]);
    return null;
  }

  // Parseador para sintagma nominal (SN)
  function parseSN(allowTrailingAdj = true) {
    const children = [];
    const startIdx = index; // Guarda posición para backtracking si falla

    const det = parseDet();
    if (det) children.push(det);

    // Admite cero o más adjetivos antes del sustantivo
    let adj = parseAdj();
    while (adj) {
      children.push(adj);
      adj = parseAdj();
    }

    const n = parseN();
    if (!n) { index = startIdx; return null; } // Backtrack si no hay sustantivo
    children.push(n);

    // Admite cero o más adjetivos después del sustantivo (opcional)
    if (allowTrailingAdj) {
      adj = parseAdj();
      while (adj) { children.push(adj); adj = parseAdj(); }
    }

    return createNonTerminal("SN", "SN → (Det) (Adj*) N (Adj*)", children);
  }

  // Parseador para sintagma preposicional (SP)
  function parseSP() {
    const children = [];
    const startIdx = index;
    const info = peek();
    if (!info || info.type !== "Connector") return null;
    if (!isPreposition(tokens[index])) return null;
    const prep = consume();
    children.push(createNonTerminal("Prep", "Prep → Preposición", [createTerminal(prep)]));
    const sn = parseSN();
    if (sn) children.push(sn);
    return createNonTerminal("SP", "SP → Prep (SN)", children);
  }

  // Parseador para sintagma verbal (SV)
  function parseSV() {
    const children = [];
    const v = parseV();
    if (!v) return null; // Requiere verbo obligatorio
    children.push(v);

    // Admite múltiples complementos después del verbo
    while (index < tokens.length) {
      const sp = parseSP(); if (sp) { children.push(sp); continue; }
      const sn = parseSN(false); if (sn) { children.push(sn); continue; }
      const adj = parseAdj(); if (adj) { children.push(adj); continue; }
      break;
    }

    return createNonTerminal("SV", "SV → V (SN)* (SP)* (Adj)*", children);
  }

  // Parseador principal para oraciones completas
  function parseO() {
    const children = [];

    // Procesa todos los tokens restantes
    while (index < tokens.length) {
      const info = peek();
      if (!info) break;

      // Manejo de puntuación
      if (info.type === "Punctuation") {
        const token = consume();
        const terminal = createTerminal(token);
        const punctNode = createNonTerminal("Punct", "Punct → Puntuación", [terminal]);
        children.push(punctNode);
        continue;
      }

      // Manejo de conjunciones (no preposiciones)
      if (info.type === "Connector" && !isPreposition(tokens[index])) {
        const conj = parseConj();
        if (conj) { children.push(conj); continue; }
      }

      // Manejo de sintagmas verbales
      if (info.type === "Verb") {
        const sv = parseSV();
        if (sv) { children.push(sv); continue; }
      }

      // Manejo de sintagmas preposicionales
      if (info.type === "Connector" && isPreposition(tokens[index])) {
        const sp = parseSP();
        if (sp) { children.push(sp); continue; }
      }

      // Manejo de elementos nominales (SN)
      if (["Article", "Noun", "Adjective"].includes(info.type)) {
        const sn = parseSN();
        if (sn) { children.push(sn); continue; }
      }

      // Token no clasificable - se agrega como "Otro"
      const token = consume();
      const terminal = createTerminal(token);
      children.push(createNonTerminal("Otro", "Token no estructurado", [terminal]));
    }

    // Fallback: si no se pudo parsear nada, muestra todos los tokens como no clasificados
    if (children.length === 0) {
      for (let i = 0; i < tokens.length; i++) {
        const terminal = createTerminal(tokens[i]);
        children.push(createNonTerminal("?", "No clasificado", [terminal]));
      }
    }

    return createNonTerminal("O", "O → (SN | SV | SP | Conj | Punct)*", children);
  }

  return parseO(); // Retorna el árbol de sintaxis completo
}

// Componente principal que visualiza el árbol de sintaxis
export default function SyntaxTreeViewer({ text }) {
  const [translate] = useState({ x: 400, y: 50 }); // Posición inicial del árbol

  // Validaciones iniciales: texto vacío o sin tokens
  if (!text || !text.trim()) return null;
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;

  // Construye los datos del árbol a partir de los tokens
  const treeData = buildSyntaxTree(tokens);

  return (
    <div className="stv-container">
      {/* Encabezado del visualizador */}
      <div className="stv-header">
        <span>🌳</span>
        <h3>Árbol de Análisis Sintáctico</h3>
      </div>

      {/* Contenedor del árbol visual */}
      <div className="stv-tree">
        <Tree
          data={treeData} // Datos del árbol a renderizar
          orientation="vertical" // Orientación vertical del árbol
          translate={translate} // Posición de traslación
          pathFunc="step" // Estilo de las líneas de conexión
          separation={{ siblings: 1.5, nonSiblings: 2 }} // Separación entre nodos
          nodeSize={{ x: 200, y: 100 }} // Tamaño de cada nodo
          nodeSvgShape={{ shape: "circle", shapeProps: { r: 6, fill: "#4f46e5" } }} // Forma de los nodos
          nodeLabelComponent={{
            render: <NodeLabel />, // Componente personalizado para etiquetas
            foreignObjectWrapper: { x: -85, y: 12, width: 170, height: 80 } // Contenedor para etiquetas
          }}
        />
      </div>

      {/* Leyenda de símbolos sintácticos */}
      <div className="stv-legend">
        <div>📖 Leyenda de símbolos:</div>
        <div className="stv-legend-grid">
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

// Componente personalizado para renderizar etiquetas de nodos
function NodeLabel({ nodeData }) {
  // Determina si es un nodo terminal (token literal entre comillas)
  const isTerminal = nodeData.name.startsWith('"') && nodeData.name.endsWith('"');
  
  return (
    <div className={isTerminal ? "stv-node-terminal" : "stv-node-nonterminal"}>
      {/* Nombre del nodo */}
      <div className={isTerminal ? "stv-node-terminal-name" : "stv-node-nonterminal-name"}>
        {nodeData.name}
      </div>
      
      {/* Información adicional para nodos terminales */}
      {isTerminal && nodeData.attributes?.categoria && (
        <div className="stv-node-terminal-cat">{nodeData.attributes.categoria}</div>
      )}
      {isTerminal && nodeData.attributes?.detalles && (
        <div className="stv-node-terminal-det">{nodeData.attributes.detalles}</div>
      )}
      
      {/* Regla gramatical para nodos no terminales */}
      {!isTerminal && nodeData.attributes?.regla && (
        <div className="stv-node-nonterminal-rule">{nodeData.attributes.regla}</div>
      )}
    </div>
  );
}