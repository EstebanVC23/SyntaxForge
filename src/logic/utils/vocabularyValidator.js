// src/logic/utils/vocabularyValidator.js

import { NOUNS, VERBS_CONJUGATIONS, ARTICLES, ADJECTIVES, ALLOWED_CONNECTORS, ALLOWED_PUNCTUATION } from "../../data/wordLists.js";

/**
 * Genera todas las formas válidas de una palabra
 */
function getAllWordForms() {
  const validWords = new Set();
  
  // Artículos
  ARTICLES.forEach(a => validWords.add(a.word.toLowerCase()));
  
  // Sustantivos (singular y plural)
  NOUNS.forEach(n => {
    validWords.add(n.word.toLowerCase());
    // Plurales
    const word = n.word;
    const last = word.slice(-1);
    if (last === "z") {
      validWords.add((word.slice(0, -1) + "ces").toLowerCase());
    } else if ("aeiou".includes(last)) {
      validWords.add((word + "s").toLowerCase());
    } else {
      validWords.add((word + "es").toLowerCase());
    }
  });
  
  // Verbos (todas las conjugaciones)
  Object.values(VERBS_CONJUGATIONS).forEach(conj => {
    validWords.add(conj.sing.toLowerCase());
    validWords.add(conj.plur.toLowerCase());
  });
  
  // Adjetivos (todas las variaciones de género y número)
  ADJECTIVES.forEach(adj => {
    const base = adj.base;
    validWords.add(base.toLowerCase());
    
    // Variaciones según tipo
    if (adj.type === "m") {
      // masculino -> femenino
      if (base.endsWith("o")) {
        validWords.add((base.slice(0, -1) + "a").toLowerCase());
        validWords.add((base + "s").toLowerCase());
        validWords.add((base.slice(0, -1) + "as").toLowerCase());
      } else {
        validWords.add((base + "s").toLowerCase());
      }
    } else if (adj.type === "f") {
      // femenino -> masculino
      if (base.endsWith("a")) {
        validWords.add((base.slice(0, -1) + "o").toLowerCase());
        validWords.add((base + "s").toLowerCase());
        validWords.add((base.slice(0, -1) + "os").toLowerCase());
      } else {
        validWords.add((base + "s").toLowerCase());
      }
    } else {
      // neutro (no cambia por género)
      const last = base.slice(-1);
      if ("aeiou".includes(last)) {
        validWords.add((base + "s").toLowerCase());
      } else {
        validWords.add((base + "es").toLowerCase());
      }
    }
  });
  
  // Conectores
  ALLOWED_CONNECTORS.forEach(c => validWords.add(c.toLowerCase()));
  
  // Puntuación
  ALLOWED_PUNCTUATION.forEach(p => validWords.add(p));
  
  return validWords;
}

const VALID_VOCABULARY = getAllWordForms();

/**
 * Valida que todas las palabras del texto estén en el diccionario
 */
export function validateVocabulary(tokens) {
  const invalidWords = [];
  
  tokens.forEach((token, index) => {
    const normalized = token.toLowerCase().trim();
    
    // Ignorar tokens vacíos
    if (!normalized) return;
    
    // Verificar si está en el vocabulario válido
    if (!VALID_VOCABULARY.has(normalized)) {
      invalidWords.push({ word: token, index });
    }
  });
  
  return {
    valid: invalidWords.length === 0,
    invalidWords
  };
}