import { useState } from "react";
import Tree from "react-d3-tree";
import { tokenize } from "../logic/utils/tokenizer.js";
import { getWordInfo } from "../logic/grammar/gdcRules.js";
import "../styles/SyntaxTreeViewer.css";

function buildSyntaxTree(tokens) {
  let index = 0;

  const PREPOSITIONS = [
    "en","a","de","con","por","para","sin","sobre","bajo",
    "ante","desde","hasta","hacia","según","durante","mediante",
    "entre","contra","tras"
  ];

  function isPreposition(token) {
    return PREPOSITIONS.includes(token.toLowerCase());
  }

  function isVerbToken(token) {
    const info = getWordInfo(token);
    return info.type === "Verb";
  }

  function createNonTerminal(symbol, rule, children) {
    return {
      name: symbol,
      attributes: { regla: rule },
      children: children.filter(c => c !== null)
    };
  }

  function createTerminal(token) {
    const info = getWordInfo(token);
    let detalles = '';

    if (info.type === "Article" || info.type === "Noun") {
      if (info.gender) detalles = `${info.gender}, ${info.plural ? 'pl' : 'sg'}`;
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

  function peek() {
    if (index >= tokens.length) return null;
    const info = getWordInfo(tokens[index]);
    if (info.type === "Other" && isVerbToken(tokens[index])) {
      return { ...info, type: "Verb" };
    }
    return info;
  }

  function consume() {
    if (index >= tokens.length) return null;
    const token = tokens[index];
    index++;
    return token;
  }

  function match(type) {
    const info = peek();
    if (info && info.type === type) return consume();
    return null;
  }

  function parseDet() {
    const token = match("Article");
    if (token) return createNonTerminal("Det", "Det → Art", [createTerminal(token)]);
    return null;
  }

  function parseAdj() {
    const token = match("Adjective");
    if (token) return createNonTerminal("Adj", "Adj → Adjetivo", [createTerminal(token)]);
    return null;
  }

  function parseN() {
    const token = match("Noun");
    if (token) return createNonTerminal("N", "N → Sustantivo", [createTerminal(token)]);
    return null;
  }

  function parseConj() {
    const info = peek();
    if (info && info.type === "Connector" && !isPreposition(tokens[index])) {
      const token = consume();
      return createNonTerminal("Conj", "Conj → Conjunción", [createTerminal(token)]);
    }
    return null;
  }

  function parseV() {
    const token = match("Verb");
    if (token) return createNonTerminal("V", "V → Verbo", [createTerminal(token)]);
    return null;
  }

  function parseSN(allowTrailingAdj = true) {
    const children = [];
    const startIdx = index;

    const det = parseDet();
    if (det) children.push(det);

    let adj = parseAdj();
    while (adj) {
      children.push(adj);
      adj = parseAdj();
    }

    const n = parseN();
    if (!n) { index = startIdx; return null; }
    children.push(n);

    if (allowTrailingAdj) {
      adj = parseAdj();
      while (adj) { children.push(adj); adj = parseAdj(); }
    }

    return createNonTerminal("SN", "SN → (Det) (Adj*) N (Adj*)", children);
  }

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

  function parseSV() {
    const children = [];
    const v = parseV();
    if (!v) return null;
    children.push(v);

    while (index < tokens.length) {
      const sp = parseSP(); if (sp) { children.push(sp); continue; }
      const sn = parseSN(false); if (sn) { children.push(sn); continue; }
      const adj = parseAdj(); if (adj) { children.push(adj); continue; }
      break;
    }

    return createNonTerminal("SV", "SV → V (SN)* (SP)* (Adj)*", children);
  }

  function parseO() {
    const children = [];

    while (index < tokens.length) {
      const info = peek();
      if (!info) break;

      if (info.type === "Punctuation") {
        const token = consume();
        const terminal = createTerminal(token);
        const punctNode = createNonTerminal("Punct", "Punct → Puntuación", [terminal]);
        children.push(punctNode);
        continue;
      }

      if (info.type === "Connector" && !isPreposition(tokens[index])) {
        const conj = parseConj();
        if (conj) { children.push(conj); continue; }
      }

      if (info.type === "Verb") {
        const sv = parseSV();
        if (sv) { children.push(sv); continue; }
      }

      if (info.type === "Connector" && isPreposition(tokens[index])) {
        const sp = parseSP();
        if (sp) { children.push(sp); continue; }
      }

      if (["Article","Noun","Adjective"].includes(info.type)) {
        const sn = parseSN();
        if (sn) { children.push(sn); continue; }
      }

      const token = consume();
      const terminal = createTerminal(token);
      children.push(createNonTerminal("Otro", "Token no estructurado", [terminal]));
    }

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
  if (!text || !text.trim()) return null;
  const tokens = tokenize(text);
  if (tokens.length === 0) return null;
  const treeData = buildSyntaxTree(tokens);

  return (
    <div className="stv-container">
      <div className="stv-header">
        <span>🌳</span>
        <h3>Árbol de Análisis Sintáctico</h3>
      </div>

      <div className="stv-tree">
        <Tree
          data={treeData}
          orientation="vertical"
          translate={translate}
          pathFunc="step"
          separation={{ siblings: 1.5, nonSiblings: 2 }}
          nodeSize={{ x: 200, y: 100 }}
          nodeSvgShape={{ shape: "circle", shapeProps: { r: 6, fill: "#4f46e5" } }}
          nodeLabelComponent={{
            render: <NodeLabel />,
            foreignObjectWrapper: { x: -85, y: 12, width: 170, height: 80 }
          }}
        />
      </div>

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

function NodeLabel({ nodeData }) {
  const isTerminal = nodeData.name.startsWith('"') && nodeData.name.endsWith('"');
  return (
    <div className={isTerminal ? "stv-node-terminal" : "stv-node-nonterminal"}>
      <div className={isTerminal ? "stv-node-terminal-name" : "stv-node-nonterminal-name"}>
        {nodeData.name}
      </div>
      {isTerminal && nodeData.attributes?.categoria && (
        <div className="stv-node-terminal-cat">{nodeData.attributes.categoria}</div>
      )}
      {isTerminal && nodeData.attributes?.detalles && (
        <div className="stv-node-terminal-det">{nodeData.attributes.detalles}</div>
      )}
      {!isTerminal && nodeData.attributes?.regla && (
        <div className="stv-node-nonterminal-rule">{nodeData.attributes.regla}</div>
      )}
    </div>
  );
}
