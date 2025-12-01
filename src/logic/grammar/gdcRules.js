import { ARTICLES, NOUNS, ADJECTIVES, VERBS_DATA, VERBS_CONJUGATIONS, ALLOWED_CONNECTORS, ALLOWED_PUNCTUATION } from "../../data/wordLists.js";

/*
  Funciones Auxiliares para las Reglas
*/

// Función para normalizar comparaciones (maneja codificación)
function normalize(str) {
  return str.toLowerCase().trim();
}

export function getWordInfo(token) {
  const tokenNorm = normalize(token);

  // 1. ARTÍCULOS
  const article = ARTICLES.find(a => normalize(a.word) === tokenNorm);
  if (article) return { type: "Article", ...article };

  // 2. SUSTANTIVOS (singular exacto)
  const nounBase = NOUNS.find(n => normalize(n.word) === tokenNorm);
  if (nounBase) return { type: "Noun", ...nounBase, plural: false };

  // 3. SUSTANTIVOS (plural - calcular todas las formas posibles)
  for (const n of NOUNS) {
    const pluralForms = [];
    const word = n.word;
    const last = word.slice(-1);

    if (last === "z") {
      pluralForms.push(word.slice(0, -1) + "ces");
    } else if ("aeiouáéíóúAEIOUÁÉÍÓÚ".includes(last)) {
      pluralForms.push(word + "s");
    } else {
      pluralForms.push(word + "es");
    }

    if (pluralForms.some(pf => normalize(pf) === tokenNorm)) {
      return { type: "Noun", gender: n.gender, plural: true, features: n.features };
    }
  }

  // 4. VERBOS (forma base en VERBS_DATA)
  const verbBase = VERBS_DATA.find(v => normalize(v.word) === tokenNorm);
  if (verbBase) {
    return { 
      type: "Verb", 
      verbType: verbBase.type,
      restrictions: verbBase.restrictions,
      plural: false 
    };
  }

  // 5. VERBOS (formas conjugadas en VERBS_CONJUGATIONS)
  for (const baseForm in VERBS_CONJUGATIONS) {
    const conjugation = VERBS_CONJUGATIONS[baseForm];
    
    // Si coincide con forma singular
    if (normalize(conjugation.sing) === tokenNorm) {
      const verbData = VERBS_DATA.find(v => normalize(v.word) === normalize(baseForm));
      return {
        type: "Verb",
        verbType: verbData?.type || "i",
        restrictions: verbData?.restrictions || {},
        plural: false
      };
    }
    
    // Si coincide con forma plural
    if (normalize(conjugation.plur) === tokenNorm) {
      const verbData = VERBS_DATA.find(v => normalize(v.word) === normalize(baseForm));
      return {
        type: "Verb",
        verbType: verbData?.type || "i",
        restrictions: verbData?.restrictions || {},
        plural: true
      };
    }
  }

// 6. ADJETIVOS (buscar por base y formas flexionadas + APÓCOPES)
  for (const adj of ADJECTIVES) {
    const base = adj.base;
    const baseNorm = normalize(base);
    
    // Coincidencia exacta con la base
    if (tokenNorm === baseNorm) {
      return { type: "Adjective", base: adj.base, adjType: adj.type };
    }
    
    // Generar variantes flexionadas
    const variants = [base];
    
    // FORMAS APOCOPADAS (singular masculino antes de sustantivo)
    if (base === "bueno") {
      variants.push("buen");
    }
    if (base === "grande") {
      variants.push("gran");
    }
    if (base === "ninguno") {
      variants.push("ningún");
    }
    if (base === "uno") {
      variants.push("un");
    }
    
    if (adj.type === "m") {
      // masculino -> femenino (o -> a)
      if (base.endsWith("o")) {
        variants.push(base.slice(0, -1) + "a");
      }
      // plurales
      variants.push(base + "s"); // masculino plural
      if (base.endsWith("o")) {
        variants.push(base.slice(0, -1) + "as"); // femenino plural
      }
    } else if (adj.type === "f") {
      // femenino -> masculino (a -> o)
      if (base.endsWith("a")) {
        variants.push(base.slice(0, -1) + "o");
      }
      // plurales
      variants.push(base + "s"); // femenino plural
      if (base.endsWith("a")) {
        variants.push(base.slice(0, -1) + "os"); // masculino plural
      }
    } else if (adj.type === "n") {
      // neutro/invariable - solo añadir plural
      const last = base.slice(-1);
      if ("aeiouáéíóúAEIOUÁÉÍÓÚ".includes(last)) {
        variants.push(base + "s");
      } else {
        variants.push(base + "es");
      }
    }
    
    if (variants.some(v => normalize(v) === tokenNorm)) {
      return { type: "Adjective", base: adj.base, adjType: adj.type };
    }
  }

  // 7. CONECTORES Y PREPOSICIONES
  const connector = ALLOWED_CONNECTORS.find(c => normalize(c) === tokenNorm);
  if (connector) {
    return { type: "Connector", word: connector };
  }

  // 8. PUNTUACIÓN
  const punctuation = ALLOWED_PUNCTUATION.find(p => p === token); // No normalizar puntuación
  if (punctuation) {
    return { type: "Punctuation", symbol: punctuation };
  }

  // 9. NO RECONOCIDO
  return { type: "Other", word: token };
}



/*
  Reglas de Gramática Dependiente del Contexto (GDC)
*/

export const GDC_RULES = [
  // 1. Concordancia Sintáctica Artículo-Sustantivo
  {
    name: "Concordancia Artículo-Sustantivo (Género/Número)",
    validate: (tokens) => {
      let valid = true;
      const errors = [];
      for (let i = 0; i < tokens.length - 1; i++) {
        const token1 = getWordInfo(tokens[i]);
        const token2 = getWordInfo(tokens[i + 1]);

        if (token1.type === "Article" && token2.type === "Noun") {
          if (token1.gender !== token2.gender && token2.gender !== "n") { 
            errors.push({ 
              message: `El artículo '${tokens[i]}' (${token1.gender}) no concuerda en género con el sustantivo '${tokens[i + 1]}' (${token2.gender}).`,
              index: i
            });
            valid = false;
          }
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
      
      for (let i = 0; i < tokens.length; i++) {
        const currentInfo = getWordInfo(tokens[i]);
        
        if (currentInfo.type === "Noun") {
          // Buscar adjetivos antes del sustantivo
          if (i > 0) {
            const prevInfo = getWordInfo(tokens[i - 1]);
            if (prevInfo.type === "Adjective") {
              const nounPlural = currentInfo.plural;
              const adjPlural = tokens[i - 1].endsWith('s') || tokens[i - 1].endsWith('es');

              if (nounPlural !== adjPlural) {
                errors.push({
                  message: `El adjetivo '${tokens[i - 1]}' (${adjPlural ? 'plural' : 'singular'}) no concuerda en número con el sustantivo '${tokens[i]}' (${nounPlural ? 'plural' : 'singular'}).`,
                  index: i - 1
                });
                valid = false;
              }
            }
          }
          
          // Buscar adjetivos después del sustantivo
          if (i < tokens.length - 1) {
            const nextInfo = getWordInfo(tokens[i + 1]);
            if (nextInfo.type === "Adjective") {
              const nounPlural = currentInfo.plural;
              const adjPlural = tokens[i + 1].endsWith('s') || tokens[i + 1].endsWith('es');

              if (nounPlural !== adjPlural) {
                errors.push({
                  message: `El sustantivo '${tokens[i]}' (${nounPlural ? 'plural' : 'singular'}) no concuerda en número con el adjetivo '${tokens[i + 1]}' (${adjPlural ? 'plural' : 'singular'}).`,
                  index: i
                });
                valid = false;
              }
              
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
      let subjectPlural = null;
      let verbToken = null;
      let verbIndex = -1;

      for (let i = 0; i < tokens.length; i++) {
        const token = getWordInfo(tokens[i]);
        if (token.type === "Noun") {
          subjectPlural = token.plural;
        } 
        if (token.type === "Verb") {
          verbToken = tokens[i];
          verbIndex = i;
          break; 
        }
      }

      if (verbToken === null || subjectPlural === null) {
        return { valid: true, errors: [] };
      }

      // Buscar el verbo base para obtener la conjugación correcta
      let baseForm = null;
      for (const base in VERBS_CONJUGATIONS) {
        const conj = VERBS_CONJUGATIONS[base];
        if (normalize(conj.sing) === normalize(verbToken) || 
            normalize(conj.plur) === normalize(verbToken)) {
          baseForm = base;
          break;
        }
      }

      if (!baseForm) return { valid: true, errors: [] };
      
      const correctForm = subjectPlural 
        ? VERBS_CONJUGATIONS[baseForm].plur 
        : VERBS_CONJUGATIONS[baseForm].sing;

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
      let subjectNoun = null;
      let verbData = null;
      let objectNoun = null;
      let verbIndex = -1;
      
      for (let i = 0; i < tokens.length; i++) {
        const tokenInfo = getWordInfo(tokens[i]);
        if (tokenInfo.type === "Noun" && verbIndex === -1) {
          subjectNoun = tokenInfo; 
        }
        if (tokenInfo.type === "Verb") {
          verbData = tokenInfo;
          verbIndex = i;
        }
        if (tokenInfo.type === "Noun" && verbIndex !== -1 && i > verbIndex) {
          objectNoun = tokenInfo; 
          break;
        }
      }
      
      if (!verbData || !subjectNoun) {
        return { valid: true, errors: [] }; 
      }
      
      const errors = [];
      const restrictions = verbData.restrictions || {};

      // Validación Semántica del Sujeto
      if (restrictions.subj) {
        const requiredFeatures = restrictions.subj;
        const subjectFeatures = subjectNoun.features || [];
        
        const isSubjectValid = requiredFeatures.some(f => subjectFeatures.includes(f));
        
        if (!isSubjectValid) {
          errors.push({
            message: `Incoherencia semántica (Sujeto): el sujeto no cumple con las restricciones del verbo '${tokens[verbIndex]}'. Requiere: ${requiredFeatures.join(', ')}.`,
            index: verbIndex
          });
        }
      }

      // Validación Semántica del Objeto (solo si existe Objeto)
      if (objectNoun && restrictions.obj) {
        const requiredFeatures = restrictions.obj;
        const objectFeatures = objectNoun.features || [];

        const isObjectValid = requiredFeatures.some(f => objectFeatures.includes(f));
        
        if (!isObjectValid) {
          errors.push({
            message: `Incoherencia semántica (Objeto): el objeto no cumple con las restricciones del verbo '${tokens[verbIndex]}'. Requiere: ${requiredFeatures.join(', ')}.`,
            index: verbIndex + 1
          });
        }
      }

      return { valid: errors.length === 0, errors };
    }
  }
];