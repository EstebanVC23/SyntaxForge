// Importa todas las listas de palabras y estructuras de datos desde el archivo wordLists.js
import { ARTICLES, NOUNS, ADJECTIVES, VERBS_DATA, VERBS_CONJUGATIONS, ALLOWED_CONNECTORS, ALLOWED_PUNCTUATION } from "../../data/wordLists.js";

/*
  FUNCIONES AUXILIARES PARA LAS REGLAS
*/

// Normaliza cadenas para comparaciones insensibles a mayúsculas/minúsculas y espacios
function normalize(str) {
  return str.toLowerCase().trim();
}

/**
 * Analiza un token (palabra) y determina su información gramatical completa.
 * Esta función es el núcleo del analizador léxico del sistema.
 * 
 * @param {string} token - La palabra o símbolo a analizar
 * @returns {Object} - Información gramatical detallada del token
 */
export function getWordInfo(token) {
  const tokenNorm = normalize(token); // Normaliza para comparaciones

  // 1. IDENTIFICACIÓN DE ARTÍCULOS
  const article = ARTICLES.find(a => normalize(a.word) === tokenNorm);
  if (article) return { type: "Article", ...article };

  // 2. IDENTIFICACIÓN DE SUSTANTIVOS EN SINGULAR (coincidencia exacta)
  const nounBase = NOUNS.find(n => normalize(n.word) === tokenNorm);
  if (nounBase) return { type: "Noun", ...nounBase, plural: false };

  // 3. IDENTIFICACIÓN DE SUSTANTIVOS EN PLURAL (generando todas las formas posibles)
  for (const n of NOUNS) {
    const pluralForms = []; // Almacena todas las formas plurales posibles del sustantivo
    const word = n.word;
    const last = word.slice(-1); // Última letra del sustantivo

    // Reglas de pluralización en español:
    if (last === "z") {
      // Sustantivos terminados en 'z' cambian a 'ces' (luz → luces)
      pluralForms.push(word.slice(0, -1) + "ces");
    } else if ("aeiouáéíóúAEIOUÁÉÍÓÚ".includes(last)) {
      // Sustantivos terminados en vocal agregan 's' (casa → casas)
      pluralForms.push(word + "s");
    } else {
      // Sustantivos terminados en consonante agregan 'es' (árbol → árboles)
      pluralForms.push(word + "es");
    }

    // Verifica si el token coincide con alguna forma plural generada
    if (pluralForms.some(pf => normalize(pf) === tokenNorm)) {
      return { type: "Noun", gender: n.gender, plural: true, features: n.features };
    }
  }

  // 4. IDENTIFICACIÓN DE VERBOS (forma base en VERBS_DATA)
  const verbBase = VERBS_DATA.find(v => normalize(v.word) === tokenNorm);
  if (verbBase) {
    return { 
      type: "Verb", 
      verbType: verbBase.type, // 'b' (copulativo), 'i' (intransitivo), 't' (transitivo)
      restrictions: verbBase.restrictions, // Restricciones semánticas
      plural: false // Por defecto singular, se ajustará después si es necesario
    };
  }

  // 5. IDENTIFICACIÓN DE VERBOS (formas conjugadas en VERBS_CONJUGATIONS)
  for (const baseForm in VERBS_CONJUGATIONS) {
    const conjugation = VERBS_CONJUGATIONS[baseForm];
    
    // Verifica coincidencia con forma singular (3ra persona singular)
    if (normalize(conjugation.sing) === tokenNorm) {
      const verbData = VERBS_DATA.find(v => normalize(v.word) === normalize(baseForm));
      return {
        type: "Verb",
        verbType: verbData?.type || "i", // Tipo por defecto 'i' si no se encuentra
        restrictions: verbData?.restrictions || {},
        plural: false // Singular
      };
    }
    
    // Verifica coincidencia con forma plural (3ra persona plural)
    if (normalize(conjugation.plur) === tokenNorm) {
      const verbData = VERBS_DATA.find(v => normalize(v.word) === normalize(baseForm));
      return {
        type: "Verb",
        verbType: verbData?.type || "i", // Tipo por defecto 'i' si no se encuentra
        restrictions: verbData?.restrictions || {},
        plural: true // Plural
      };
    }
  }

  // 6. IDENTIFICACIÓN DE ADJETIVOS (incluye formas flexionadas y apócopes)
  for (const adj of ADJECTIVES) {
    const base = adj.base;
    const baseNorm = normalize(base);
    
    // Coincidencia exacta con la forma base del adjetivo
    if (tokenNorm === baseNorm) {
      return { type: "Adjective", base: adj.base, adjType: adj.type };
    }
    
    // Generar todas las variantes posibles del adjetivo
    const variants = [base]; // Comienza con la forma base
    
    // FORMAS APOCOPADAS (eliminación de sílaba final en posición prenominal)
    if (base === "bueno") {
      variants.push("buen"); // bueno → buen (masculino singular)
    }
    if (base === "grande") {
      variants.push("gran"); // grande → gran (invariable en género)
    }
    if (base === "ninguno") {
      variants.push("ningún"); // ninguno → ningún (masculino singular)
    }
    if (base === "uno") {
      variants.push("un"); // uno → un (masculino singular)
    }
    
    // Generación de formas flexionadas según el tipo del adjetivo
    if (adj.type === "m") {
      // Adjetivo masculino por defecto
      if (base.endsWith("o")) {
        variants.push(base.slice(0, -1) + "a"); // masculino → femenino (rojo → roja)
      }
      // Formas plurales
      variants.push(base + "s"); // masculino plural (rojos)
      if (base.endsWith("o")) {
        variants.push(base.slice(0, -1) + "as"); // femenino plural (rojas)
      }
    } else if (adj.type === "f") {
      // Adjetivo femenino por defecto
      if (base.endsWith("a")) {
        variants.push(base.slice(0, -1) + "o"); // femenino → masculino (roja → rojo)
      }
      // Formas plurales
      variants.push(base + "s"); // femenino plural (rojas)
      if (base.endsWith("a")) {
        variants.push(base.slice(0, -1) + "os"); // masculino plural (rojos)
      }
    } else if (adj.type === "n") {
      // Adjetivo neutro/invariable
      const last = base.slice(-1);
      if ("aeiouáéíóúAEIOUÁÉÍÓÚ".includes(last)) {
        variants.push(base + "s"); // Plural para terminación vocal (grandes)
      } else {
        variants.push(base + "es"); // Plural para terminación consonante (fáciles)
      }
    }
    
    // Verifica si el token coincide con alguna variante generada
    if (variants.some(v => normalize(v) === tokenNorm)) {
      return { type: "Adjective", base: adj.base, adjType: adj.type };
    }
  }

  // 7. IDENTIFICACIÓN DE CONECTORES Y PREPOSICIONES
  const connector = ALLOWED_CONNECTORS.find(c => normalize(c) === tokenNorm);
  if (connector) {
    return { type: "Connector", word: connector };
  }

  // 8. IDENTIFICACIÓN DE PUNTUACIÓN (no se normaliza)
  const punctuation = ALLOWED_PUNCTUATION.find(p => p === token);
  if (punctuation) {
    return { type: "Punctuation", symbol: punctuation };
  }

  // 9. TOKEN NO RECONOCIDO (categoría residual)
  return { type: "Other", word: token };
}

/*
  REGLAS DE GRAMÁTICA DEPENDIENTE DEL CONTEXTO (GDC)
  Cada regla es un objeto con nombre y función de validación
*/

export const GDC_RULES = [
  // 1. Concordancia Sintáctica Artículo-Sustantivo
  {
    name: "Concordancia Artículo-Sustantivo (Género/Número)",
    validate: (tokens) => {
      let valid = true;
      const errors = [];
      
      // Itera sobre pares adyacentes de tokens
      for (let i = 0; i < tokens.length - 1; i++) {
        const token1 = getWordInfo(tokens[i]);
        const token2 = getWordInfo(tokens[i + 1]);

        // Detecta secuencia Artículo + Sustantivo
        if (token1.type === "Article" && token2.type === "Noun") {
          // Validación de género (excepto para sustantivos neutros 'n')
          if (token1.gender !== token2.gender && token2.gender !== "n") { 
            errors.push({ 
              message: `El artículo '${tokens[i]}' (${token1.gender}) no concuerda en género con el sustantivo '${tokens[i + 1]}' (${token2.gender}).`,
              index: i
            });
            valid = false;
          }
          // Validación de número (singular/plural)
          if (token1.plural !== token2.plural) {
            errors.push({ 
              message: `El artículo '${tokens[i]}' (${token1.plural ? 'plural' : 'singular'}) no concuerda en número con el sustantivo '${tokens[i + 1]}' (${token2.plural ? 'plural' : 'singular'}).`,
              index: i
            });
            valid = false;
          }
        }
      }
      return { valid, errors };
    }
  },
  
  // 2. Concordancia Sintáctica Sustantivo-Adjetivo
  {
    name: "Concordancia Sustantivo-Adjetivo (Género/Número)",
    validate: (tokens) => {
      let valid = true;
      const errors = [];
      
      // Itera sobre todos los tokens
      for (let i = 0; i < tokens.length; i++) {
        const currentInfo = getWordInfo(tokens[i]);
        
        // Cuando encuentra un sustantivo
        if (currentInfo.type === "Noun") {
          // Busca adjetivo ANTES del sustantivo (posición prenominal)
          if (i > 0) {
            const prevInfo = getWordInfo(tokens[i - 1]);
            if (prevInfo.type === "Adjective") {
              // Determina número del adjetivo por terminación
              const nounPlural = currentInfo.plural;
              const adjPlural = tokens[i - 1].endsWith('s') || tokens[i - 1].endsWith('es');

              // Validación de concordancia numérica
              if (nounPlural !== adjPlural) {
                errors.push({
                  message: `El adjetivo '${tokens[i - 1]}' (${adjPlural ? 'plural' : 'singular'}) no concuerda en número con el sustantivo '${tokens[i]}' (${nounPlural ? 'plural' : 'singular'}).`,
                  index: i - 1
                });
                valid = false;
              }
            }
          }
          
          // Busca adjetivo DESPUÉS del sustantivo (posición posnominal)
          if (i < tokens.length - 1) {
            const nextInfo = getWordInfo(tokens[i + 1]);
            if (nextInfo.type === "Adjective") {
              const nounPlural = currentInfo.plural;
              const adjPlural = tokens[i + 1].endsWith('s') || tokens[i + 1].endsWith('es');

              // Validación de concordancia numérica
              if (nounPlural !== adjPlural) {
                errors.push({
                  message: `El sustantivo '${tokens[i]}' (${nounPlural ? 'plural' : 'singular'}) no concuerda en número con el adjetivo '${tokens[i + 1]}' (${adjPlural ? 'plural' : 'singular'}).`,
                  index: i
                });
                valid = false;
              }
              
              // Validación de concordancia de género
              const nounGender = currentInfo.gender;
              const adjWord = tokens[i + 1];
              const isAdjMasculine = adjWord.endsWith('o') || adjWord.endsWith('os');
              const isAdjFeminine = adjWord.endsWith('a') || adjWord.endsWith('as');

              if (nounGender === 'm' && isAdjFeminine) {
                errors.push({
                  message: `El sustantivo '${tokens[i]}' (m) no concuerda en género con el adjetivo femenino '${tokens[i + 1]}'.`,
                  index: i
                });
                valid = false;
              }
              if (nounGender === 'f' && isAdjMasculine) {
                errors.push({
                  message: `El sustantivo '${tokens[i]}' (f) no concuerda en género con el adjetivo masculino '${tokens[i + 1]}'.`,
                  index: i
                });
                valid = false;
              }
            }
          }
        }
      }
      return { valid, errors };
    }
  },
  
  // 3. Concordancia Sintáctica Sujeto-Verbo
  {
    name: "Concordancia Sujeto-Verbo (Número)",
    validate: (tokens) => {
      let subjectPlural = null; // Número gramatical del sujeto (true=plural, false=singular)
      let verbToken = null; // Token del verbo encontrado
      let verbIndex = -1; // Índice del verbo en el array de tokens

      // Identifica el primer sustantivo (sujeto) y el primer verbo
      for (let i = 0; i < tokens.length; i++) {
        const token = getWordInfo(tokens[i]);
        if (token.type === "Noun") {
          subjectPlural = token.plural; // Captura número del sujeto
        } 
        if (token.type === "Verb") {
          verbToken = tokens[i];
          verbIndex = i;
          break; // Solo considera el primer verbo encontrado
        }
      }

      // Si no se encuentra sujeto o verbo, la regla no aplica
      if (verbToken === null || subjectPlural === null) {
        return { valid: true, errors: [] };
      }

      // Busca el verbo base para obtener sus conjugaciones
      let baseForm = null;
      for (const base in VERBS_CONJUGATIONS) {
        const conj = VERBS_CONJUGATIONS[base];
        if (normalize(conj.sing) === normalize(verbToken) || 
            normalize(conj.plur) === normalize(verbToken)) {
          baseForm = base;
          break;
        }
      }

      // Si no se encuentra el verbo en las conjugaciones, no se aplica la regla
      if (!baseForm) return { valid: true, errors: [] };
      
      // Determina la forma correcta según el número del sujeto
      const correctForm = subjectPlural 
        ? VERBS_CONJUGATIONS[baseForm].plur 
        : VERBS_CONJUGATIONS[baseForm].sing;

      // Valida si el verbo usado coincide con la forma correcta
      if (normalize(verbToken) !== normalize(correctForm)) {
        return {
          valid: false,
          errors: [{ 
            message: `El Verbo '${verbToken}' no concuerda en número con el Sujeto (${subjectPlural ? 'plural' : 'singular'}). Debería ser '${correctForm}'.`,
            index: verbIndex
          }]
        };
      }

      return { valid: true, errors: [] };
    }
  },
  
  // 4. Concordancia Semántica (Sujeto-Verbo-Objeto)
  {
    name: "Concordancia Semántica (Sujeto-Verbo-Objeto)",
    validate: (tokens) => {
      let subjectNoun = null; // Información del sustantivo sujeto
      let verbData = null; // Información del verbo
      let objectNoun = null; // Información del sustantivo objeto
      let verbIndex = -1; // Índice del verbo
      
      // Itera para identificar sujeto, verbo y objeto en secuencia
      for (let i = 0; i < tokens.length; i++) {
        const tokenInfo = getWordInfo(tokens[i]);
        if (tokenInfo.type === "Noun" && verbIndex === -1) {
          subjectNoun = tokenInfo; // Sustantivo antes del verbo es el sujeto
        }
        if (tokenInfo.type === "Verb") {
          verbData = tokenInfo;
          verbIndex = i;
        }
        if (tokenInfo.type === "Noun" && verbIndex !== -1 && i > verbIndex) {
          objectNoun = tokenInfo; // Sustantivo después del verbo es el objeto
          break;
        }
      }
      
      // Si no hay verbo o sujeto, la regla no aplica
      if (!verbData || !subjectNoun) {
        return { valid: true, errors: [] }; 
      }
      
      const errors = [];
      const restrictions = verbData.restrictions || {};

      // VALIDACIÓN SEMÁNTICA DEL SUJETO
      if (restrictions.subj) {
        const requiredFeatures = restrictions.subj; // Características requeridas
        const subjectFeatures = subjectNoun.features || []; // Características del sujeto
        
        // Verifica si el sujeto tiene al menos una característica requerida
        const isSubjectValid = requiredFeatures.some(f => subjectFeatures.includes(f));
        
        if (!isSubjectValid) {
          errors.push({
            message: `Incoherencia semántica (Sujeto): el sujeto no cumple con las restricciones del verbo '${tokens[verbIndex]}'. Requiere: ${requiredFeatures.join(', ')}.`,
            index: verbIndex
          });
        }
      }

      // VALIDACIÓN SEMÁNTICA DEL OBJETO (solo si existe objeto)
      if (objectNoun && restrictions.obj) {
        const requiredFeatures = restrictions.obj;
        const objectFeatures = objectNoun.features || [];

        // Verifica si el objeto tiene al menos una característica requerida
        const isObjectValid = requiredFeatures.some(f => objectFeatures.includes(f));
        
        if (!isObjectValid) {
          errors.push({
            message: `Incoherencia semántica (Objeto): el objeto no cumple con las restricciones del verbo '${tokens[verbIndex]}'. Requiere: ${requiredFeatures.join(', ')}.`,
            index: verbIndex + 1 // Error asociado al objeto
          });
        }
      }

      return { valid: errors.length === 0, errors };
    }
  }
];