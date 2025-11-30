import { ARTICLES, NOUNS, ADJECTIVES, VERBS_DATA, VERBS_CONJUGATIONS } from "../../data/wordLists.js";

/*
  Funciones Auxiliares para las Reglas
*/

function getWordInfo(token) {
  const tokenLower = token.toLowerCase();

  const article = ARTICLES.find(a => a.word === tokenLower);
  if (article) return { type: "Article", ...article };

  // Buscar sustantivo (singular)
  const nounBase = NOUNS.find(n => n.word === tokenLower);
  if (nounBase) return { type: "Noun", ...nounBase, plural: false, features: nounBase.features };

  // Buscar sustantivo (plural)
  let nounFeatures = null;
  const isPluralNoun = NOUNS.find(n => {
    if (tokenLower.endsWith('s')) {
      const singular = tokenLower.slice(0, -1);
      if (n.word === singular || n.word.endsWith('a') || n.word.endsWith('e') || n.word.endsWith('i') || n.word.endsWith('o')) {
        nounFeatures = n.features;
        return true;
      }
    }
    if (tokenLower.endsWith('es')) {
      const singular1 = tokenLower.slice(0, -2);
      if (n.word === singular1) {
        nounFeatures = n.features;
        return true;
      }
      const singular2 = tokenLower.slice(0, -3) + 'z'; // z -> ces
      if (n.word === singular2) {
        nounFeatures = n.features;
        return true;
      }
    }
    return false;
  });

  if (isPluralNoun) {
    return { type: "Noun", gender: isPluralNoun.gender, plural: true, features: nounFeatures };
  }

  // Buscar Verbo (forma base singular)
  const verbBase = VERBS_DATA.find(v => v.word === tokenLower);
  if (verbBase) return { type: "Verb", ...verbBase, plural: false }; 
  
  // Buscar Verbo (forma plural, usando el mapa de conjugaciones)
  let verbData = null;
  const pluralMatch = Object.keys(VERBS_CONJUGATIONS).find(key => VERBS_CONJUGATIONS[key].plur === tokenLower);
  if (pluralMatch) {
    verbData = VERBS_DATA.find(v => v.word === pluralMatch);
    if (verbData) return { type: "Verb", ...verbData, plural: true };
  }

  // Adjetivos
  const adjective = ADJECTIVES.find(a => tokenLower.includes(a.base) || a.base.includes(tokenLower));
  if (adjective) return { type: "Adjective", ...adjective };

  return { type: "Other", word: tokenLower };
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
      for (let i = 0; i < tokens.length - 1; i++) {
        const token1 = getWordInfo(tokens[i]);
        const token2 = getWordInfo(tokens[i + 1]);

        if (token1.type === "Noun" && token2.type === "Adjective") {
          const nounPlural = token1.plural;
          const adjPlural = tokens[i + 1].endsWith('s') || tokens[i + 1].endsWith('es');

          if (nounPlural !== adjPlural) {
            errors.push({
              message: `El sustantivo '${tokens[i]}' (${nounPlural ? 'plural' : 'singular'}) no concuerda en número con el adjetivo '${tokens[i + 1]}' (${adjPlural ? 'plural' : 'singular'}).`,
              index: i
            });
            valid = false;
          }
          
          const nounGender = token1.gender;
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

      // Buscar la conjugación correcta en el mapa para el Sujeto
      const verbSingularBase = VERBS_DATA.find(v => Object.values(VERBS_CONJUGATIONS[v.word] || {}).includes(verbToken));
      if (!verbSingularBase) return { valid: true, errors: [] };
      
      const correctForm = subjectPlural ? VERBS_CONJUGATIONS[verbSingularBase.word].plur : VERBS_CONJUGATIONS[verbSingularBase.word].sing;

      if (verbToken !== correctForm) {
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

      // 2. Validación Semántica del Sujeto
      if (restrictions.subj) {
        const requiredFeatures = restrictions.subj;
        const subjectFeatures = subjectNoun.features || [];
        
        const isSubjectValid = requiredFeatures.some(f => subjectFeatures.includes(f));
        
        if (!isSubjectValid) {
          errors.push({
            message: `Incoherencia semántica (Sujeto): '${subjectNoun.word}' no cumple con las restricciones de '${verbData.word}'. Requiere: ${requiredFeatures.join(', ')}.`,
            index: verbIndex
          });
        }
      }

      // 3. Validación Semántica del Objeto (solo si existe Objeto)
      if (objectNoun && restrictions.obj) {
        const requiredFeatures = restrictions.obj;
        const objectFeatures = objectNoun.features || [];

        const isObjectValid = requiredFeatures.some(f => objectFeatures.includes(f));
        
        if (!isObjectValid) {
          errors.push({
            message: `Incoherencia semántica (Objeto): '${objectNoun.word}' no cumple con las restricciones de objeto de '${verbData.word}'. Requiere: ${requiredFeatures.join(', ')}.`,
            index: verbIndex + 1
          });
        }
      }

      return { valid: errors.length === 0, errors };
    }
  }
];