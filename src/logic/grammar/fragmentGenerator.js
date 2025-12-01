import { ARTICLES, NOUNS, ADJECTIVES, VERBS_DATA, VERBS_CONJUGATIONS } from "../../data/wordLists.js";

/* UTILIDADES */
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

function pluralize(noun) {
  const last = noun.slice(-1);
  if (last === "z") return noun.slice(0, -1) + "ces";
  if ("aeiou".includes(last)) return noun + "s";
  return noun + "es";
}

/**
 * Aplica concordancia + APOCÓPE (bueno→buen, grande→gran, etc.)
 * Se añadió parámetro isPreNoun para saber si va antes del sustantivo.
 */
function agreeAdjective(adjObj, gender, plural, isPreNoun = false) {
  let word = adjObj.base.toLowerCase();

  /* ---------------------
     REGLAS DE APÓCOPE
     Solo si:
     - va ANTES del sustantivo
     - es singular (salvo "gran", que también funciona así)
  ---------------------- */
  
  if (isPreNoun && !plural) {
    // bueno → buen (solo masc. sing.)
    if (word === "bueno" && gender === "m") {
      return "buen";
    }

    // grande → gran (invariable en género)
    if (word === "grande") {
      return "gran";
    }

    // ninguno → ningún
    if (word === "ninguno" && gender === "m") {
      return "ningún";
    }

    // uno → un
    if (word === "uno" && gender === "m") {
      return "un";
    }
  }

  // Concordancia normal
  if (adjObj.type === "m" && gender === "f") {
    if (word.endsWith("o")) word = word.slice(0, -1) + "a"; 
  }
  if (adjObj.type === "f" && gender === "m") {
    if (word.endsWith("a")) word = word.slice(0, -1) + "o";
  }

  if (plural) {
    const last = word.slice(-1);
    return "aeiou".includes(last) ? word + "s" : word + "es";
  }

  return word;
}

function conjugate(verbSingularBase, plural) {
  const conjugation = VERBS_CONJUGATIONS[verbSingularBase];
  if (conjugation) {
    return plural ? conjugation.plur : conjugation.sing;
  }
  return verbSingularBase; 
}


/* GENERADORES DE FRASES */

/**
 * Construye un Sintagma Nominal (SN). 
 */
function buildSN(requiredFeatures = [], nounToAvoid = null, adjToAvoid = null) { 
  let availableNouns = NOUNS;
  
  // 1. Filtrar por restricciones semánticas
  if (requiredFeatures.length > 0) {
    const semanticallyFiltered = NOUNS.filter(noun => 
      requiredFeatures.some(feature => noun.features.includes(feature))
    );
    if (semanticallyFiltered.length > 0) {
      availableNouns = semanticallyFiltered;
    }
  }

  // 2. Evitar repetición de sustantivo
  if (nounToAvoid) {
    const withoutRepeat = availableNouns.filter(noun => noun.word !== nounToAvoid);
    if (withoutRepeat.length > 0) {
      availableNouns = withoutRepeat;
    }
  }

  // 3. Seleccionar sustantivo
  const nounObj = pick(availableNouns);
  const gender = nounObj.gender === "n" ? (Math.random() < 0.5 ? "m" : "f") : nounObj.gender;
  const plural = Math.random() < 0.3;
  
  // 4. Seleccionar artículo
  const articleCandidates = ARTICLES.filter(a => a.gender === gender && a.plural === plural);
  const article = pick(articleCandidates);

  // 5. Pluralizar sustantivo
  let noun = nounObj.word;
  if (plural) noun = pluralize(noun);

  // 6. Adjetivo
  let addAdj = Math.random() < 0.4;
  let adjWord = null;
  let adjBase = null;
  
  if (addAdj) {
    let adjCandidates = ADJECTIVES;
    
    const nounRepeated = (nounToAvoid && nounObj.word === nounToAvoid);
    
    if (nounRepeated) {
      if (adjToAvoid) {
        const withoutRepeat = ADJECTIVES.filter(a => a.base !== adjToAvoid);
        if (withoutRepeat.length > 0) {
          adjCandidates = withoutRepeat;
          addAdj = true;
        } else {
          addAdj = false;
        }
      } else {
        addAdj = true;
      }
    } else {
      if (adjToAvoid) {
        const withoutRepeat = ADJECTIVES.filter(a => a.base !== adjToAvoid);
        if (withoutRepeat.length > 0) {
          adjCandidates = withoutRepeat;
        }
      }
    }
    
    if (addAdj) {
      const adjObj = pick(adjCandidates);
      adjBase = adjObj.base;

      // >>>>> AQUÍ se activa el apócope porque el adjetivo va antes del sustantivo
      adjWord = agreeAdjective(adjObj, gender, plural, true);
    }
  }

  return {
    words: [article.word, adjWord, noun].filter(Boolean),
    plural: plural,
    gender: gender,
    noun: nounObj.word, 
    adj: adjBase 
  };
}

function buildVP(needsObject) {
  let availableVerbs = VERBS_DATA;
  
  if (needsObject) {
    availableVerbs = VERBS_DATA.filter(v => v.type === "t");
  } else {
    availableVerbs = VERBS_DATA.filter(v => v.type === "i" || v.type === "b");
  }

  const vObj = pick(availableVerbs);
  const v = vObj.word; 
  
  return {
    words: [v], 
    isTransitive: vObj.type === "t",
    restrictions: vObj.restrictions
  };
}

/* PLANTILLAS */
const TEMPLATES = [
  { tpl: ["SN", "VP"], requiresObject: false }, 
  { tpl: ["SN", "VP", "SN"], requiresObject: true },
];

/* GENERADOR PRINCIPAL */
export function generateFragment() {
  const tplObj = pick(TEMPLATES);
  const tpl = tplObj.tpl;

  const vpObj = buildVP(tplObj.requiresObject);
  const verbRestrictions = vpObj.restrictions || {};

  const subjectRestrictions = verbRestrictions.subj || [];
  const subjectObj = buildSN(subjectRestrictions);
  const subjPlural = subjectObj.plural; 
  
  const subjectNounBase = subjectObj.noun; 
  const subjectAdjBase = subjectObj.adj;

  let objectObj = null;
  if (tplObj.requiresObject) {
    const objectRestrictions = verbRestrictions.obj || [];
    objectObj = buildSN(objectRestrictions, subjectNounBase, subjectAdjBase);
  }

  const verbSingularBase = vpObj.words[0];
  vpObj.words = [conjugate(verbSingularBase, subjPlural)]; 

  let snCount = 0;
  const result = tpl.flatMap(el => {
    if (el === "SN") {
      snCount++;
      if (snCount === 1) {
        return subjectObj.words;
      } else {
        return objectObj.words;
      }
    }
    if (el === "VP") return vpObj.words;
    
    return el;
  });

  return result.join(" ");
}
