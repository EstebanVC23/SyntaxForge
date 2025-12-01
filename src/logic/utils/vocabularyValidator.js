
// Importa todas las listas de palabras desde el archivo de datos
import { NOUNS, VERBS_CONJUGATIONS, ARTICLES, ADJECTIVES, ALLOWED_CONNECTORS, ALLOWED_PUNCTUATION } from "../../data/wordLists.js";

/**
 * Genera un conjunto (Set) con todas las formas válidas de palabras en español
 * que el sistema reconoce, incluyendo variaciones de género, número y conjugaciones.
 * 
 * @returns {Set<string>} - Conjunto de palabras válidas en minúsculas
 */
function getAllWordForms() {
  const validWords = new Set(); // Usa Set para búsquedas eficientes O(1)
  
  // 1. ARTÍCULOS: agrega todas las formas de artículos
  ARTICLES.forEach(a => validWords.add(a.word.toLowerCase()));
  
  // 2. SUSTANTIVOS: agrega formas singulares y plurales
  NOUNS.forEach(n => {
    // Forma singular
    validWords.add(n.word.toLowerCase());
    
    // Genera y agrega forma plural
    const word = n.word;
    const last = word.slice(-1); // Última letra del sustantivo
    
    // Reglas de pluralización en español:
    if (last === "z") {
      // Sustantivos terminados en 'z' → 'ces' (luz → luces)
      validWords.add((word.slice(0, -1) + "ces").toLowerCase());
    } else if ("aeiou".includes(last)) {
      // Sustantivos terminados en vocal → +'s' (casa → casas)
      validWords.add((word + "s").toLowerCase());
    } else {
      // Sustantivos terminados en consonante → +'es' (árbol → árboles)
      validWords.add((word + "es").toLowerCase());
    }
  });
  
  // 3. VERBOS: agrega todas las conjugaciones (3ra persona singular y plural)
  Object.values(VERBS_CONJUGATIONS).forEach(conj => {
    validWords.add(conj.sing.toLowerCase()); // Forma singular (ej: "come")
    validWords.add(conj.plur.toLowerCase()); // Forma plural (ej: "comen")
  });
  
  // 4. ADJETIVOS: agrega todas las variaciones de género y número
  ADJECTIVES.forEach(adj => {
    const base = adj.base;
    // Forma base del adjetivo
    validWords.add(base.toLowerCase());
    
    // Genera variaciones según el tipo de adjetivo
    if (adj.type === "m") {
      // Adjetivos masculinos por defecto (ej: "rojo")
      if (base.endsWith("o")) {
        // Masculino singular → Femenino singular (rojo → roja)
        validWords.add((base.slice(0, -1) + "a").toLowerCase());
        // Masculino plural (rojos)
        validWords.add((base + "s").toLowerCase());
        // Femenino plural (rojas)
        validWords.add((base.slice(0, -1) + "as").toLowerCase());
      } else {
        // Adjetivos masculinos sin terminación 'o' (ej: "azul" - es neutro realmente)
        validWords.add((base + "s").toLowerCase()); // Plural
      }
    } else if (adj.type === "f") {
      // Adjetivos femeninos por defecto (ej: "grande" - es neutro realmente)
      if (base.endsWith("a")) {
        // Femenino singular → Masculino singular (roja → rojo)
        validWords.add((base.slice(0, -1) + "o").toLowerCase());
        // Femenino plural (rojas)
        validWords.add((base + "s").toLowerCase());
        // Masculino plural (rojos)
        validWords.add((base.slice(0, -1) + "os").toLowerCase());
      } else {
        validWords.add((base + "s").toLowerCase()); // Plural
      }
    } else {
      // Adjetivos neutros/invariables (ej: "verde", "grande")
      const last = base.slice(-1);
      if ("aeiou".includes(last)) {
        // Terminación vocal → +'s' (grande → grandes)
        validWords.add((base + "s").toLowerCase());
      } else {
        // Terminación consonante → +'es' (fácil → fáciles)
        validWords.add((base + "es").toLowerCase());
      }
    }
  });
  
  // 5. CONECTORES: agrega todas las conjunciones y preposiciones permitidas
  ALLOWED_CONNECTORS.forEach(c => validWords.add(c.toLowerCase()));
  
  // 6. PUNTUACIÓN: agrega todos los signos de puntuación permitidos
  // No se convierten a minúsculas ya que los signos de puntuación son case-sensitive
  ALLOWED_PUNCTUATION.forEach(p => validWords.add(p));
  
  return validWords; // Retorna el conjunto completo de palabras válidas
}

// Conjunto precomputado de vocabulario válido para validaciones eficientes
const VALID_VOCABULARY = getAllWordForms();

/**
 * Valida que todos los tokens de un texto estén en el diccionario reconocido por el sistema.
 * 
 * @param {Array<string>} tokens - Lista de tokens (palabras) a validar
 * @returns {Object} - Resultado de la validación del vocabulario
 * 
 * @property {boolean} valid - true si todos los tokens son válidos, false si hay palabras no reconocidas
 * @property {Array<Object>} invalidWords - Lista de palabras no reconocidas con sus posiciones
 *   @property {string} word - La palabra no reconocida
 *   @property {number} index - Índice de la palabra en el array original
 */
export function validateVocabulary(tokens) {
  const invalidWords = []; // Almacena las palabras no reconocidas
  
  // Itera sobre cada token en la lista
  tokens.forEach((token, index) => {
    const normalized = token.toLowerCase().trim(); // Normaliza para comparación
    
    // Ignora tokens vacíos (podrían resultar de espacios múltiples)
    if (!normalized) return;
    
    // Verifica si el token normalizado existe en el vocabulario válido
    if (!VALID_VOCABULARY.has(normalized)) {
      // Si no está en el vocabulario, la agrega a la lista de inválidas
      invalidWords.push({ word: token, index });
    }
  });
  
  // Retorna el resultado de la validación
  return {
    valid: invalidWords.length === 0, // true si no hay palabras inválidas
    invalidWords // Lista de palabras no reconocidas (vacía si valid = true)
  };
}