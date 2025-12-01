// Importa las listas de palabras y estructuras de datos desde el archivo wordLists.js
import { ARTICLES, NOUNS, ADJECTIVES, VERBS_DATA, VERBS_CONJUGATIONS } from "../../data/wordLists.js";

/* UTILIDADES BÁSICAS */

// Selecciona un elemento aleatorio de un array
const pick = arr => arr[Math.floor(Math.random() * arr.length)];

// Pluraliza un sustantivo en español siguiendo reglas básicas
function pluralize(noun) {
  const last = noun.slice(-1); // Obtiene la última letra del sustantivo
  if (last === "z") return noun.slice(0, -1) + "ces"; // Si termina en 'z', cambia a 'ces'
  if ("aeiou".includes(last)) return noun + "s"; // Si termina en vocal, agrega 's'
  return noun + "es"; // Para otros casos, agrega 'es'
}

/**
 * Aplica concordancia de género y número a un adjetivo, incluyendo APOCÓPE.
 * La apócope (eliminación de sílaba final) se aplica solo en ciertos casos
 * cuando el adjetivo va antes del sustantivo en singular.
 * 
 * @param {Object} adjObj - Objeto del adjetivo con propiedades 'base' y 'type'
 * @param {string} gender - Género objetivo ('m' para masculino, 'f' para femenino)
 * @param {boolean} plural - Si el adjetivo debe estar en plural
 * @param {boolean} isPreNoun - Indica si el adjetivo va antes del sustantivo
 * @returns {string} - Adjetivo con la concordancia y apócope aplicada
 */
function agreeAdjective(adjObj, gender, plural, isPreNoun = false) {
  let word = adjObj.base.toLowerCase(); // Convierte a minúsculas para procesamiento

  /* ---------------------
     REGLAS DE APÓCOPE
     Solo se aplica si:
     - El adjetivo va ANTES del sustantivo (isPreNoun = true)
     - Está en singular (!plural)
     - Para algunos adjetivos, solo en masculino singular
  ---------------------- */
  
  // Aplica apócope cuando el adjetivo está antes del sustantivo y es singular
  if (isPreNoun && !plural) {
    // bueno → buen (solo en masculino singular)
    if (word === "bueno" && gender === "m") {
      return "buen";
    }

    // grande → gran (invariable en género, funciona tanto en singular como plural)
    if (word === "grande") {
      return "gran";
    }

    // ninguno → ningún (solo en masculino singular)
    if (word === "ninguno" && gender === "m") {
      return "ningún";
    }

    // uno → un (solo en masculino singular)
    if (word === "uno" && gender === "m") {
      return "un";
    }
  }

  // Concordancia normal de género (cuando el tipo del adjetivo no coincide con el género objetivo)
  if (adjObj.type === "m" && gender === "f") {
    // Cambia terminación 'o' a 'a' para femenino
    if (word.endsWith("o")) word = word.slice(0, -1) + "a"; 
  }
  if (adjObj.type === "f" && gender === "m") {
    // Cambia terminación 'a' a 'o' para masculino
    if (word.endsWith("a")) word = word.slice(0, -1) + "o";
  }

  // Concordancia de número (plural)
  if (plural) {
    const last = word.slice(-1);
    // Agrega 's' si termina en vocal, 'es' si termina en consonante
    return "aeiou".includes(last) ? word + "s" : word + "es";
  }

  return word; // Retorna el adjetivo sin cambios si no requiere plural
}

/**
 * Conjuga un verbo en tercera persona según el número (singular/plural).
 * Utiliza la tabla de conjugaciones VERBS_CONJUGATIONS.
 * 
 * @param {string} verbSingularBase - Verbo en singular (3ra persona)
 * @param {boolean} plural - Si debe conjugarse en plural
 * @returns {string} - Verbo conjugado
 */
function conjugate(verbSingularBase, plural) {
  const conjugation = VERBS_CONJUGATIONS[verbSingularBase]; // Busca en la tabla de conjugaciones
  if (conjugation) {
    return plural ? conjugation.plur : conjugation.sing; // Retorna plural o singular según corresponda
  }
  return verbSingularBase; // Si no está en la tabla, retorna la forma original
}

/* GENERADORES DE FRASES */

/**
 * Construye un Sintagma Nominal (SN) con artículo, adjetivo y sustantivo.
 * 
 * @param {Array} requiredFeatures - Características semánticas requeridas (ej: ['+human', '+animate'])
 * @param {string} nounToAvoid - Sustantivo a evitar (para prevenir repeticiones)
 * @param {string} adjToAvoid - Adjetivo a evitar (para prevenir repeticiones)
 * @returns {Object} - Objeto con las palabras del SN y metadatos gramaticales
 */
function buildSN(requiredFeatures = [], nounToAvoid = null, adjToAvoid = null) { 
  let availableNouns = NOUNS; // Lista inicial de sustantivos disponibles
  
  // 1. Filtrar por restricciones semánticas si se especifican
  if (requiredFeatures.length > 0) {
    const semanticallyFiltered = NOUNS.filter(noun => 
      // Mantiene sustantivos que tengan al menos una de las características requeridas
      requiredFeatures.some(feature => noun.features.includes(feature))
    );
    if (semanticallyFiltered.length > 0) {
      availableNouns = semanticallyFiltered; // Usa solo los sustantivos que cumplen las restricciones
    }
  }

  // 2. Evitar repetición del sustantivo si se especifica
  if (nounToAvoid) {
    const withoutRepeat = availableNouns.filter(noun => noun.word !== nounToAvoid);
    if (withoutRepeat.length > 0) {
      availableNouns = withoutRepeat; // Excluye el sustantivo a evitar
    }
  }

  // 3. Seleccionar aleatoriamente un sustantivo
  const nounObj = pick(availableNouns);
  
  // Determina género: si es neutro ('n'), elige aleatoriamente masculino o femenino
  const gender = nounObj.gender === "n" ? (Math.random() < 0.5 ? "m" : "f") : nounObj.gender;
  
  // 30% de probabilidad de que sea plural
  const plural = Math.random() < 0.3;
  
  // 4. Seleccionar artículo que concuerde en género y número
  const articleCandidates = ARTICLES.filter(a => a.gender === gender && a.plural === plural);
  const article = pick(articleCandidates);

  // 5. Pluralizar el sustantivo si es necesario
  let noun = nounObj.word;
  if (plural) noun = pluralize(noun);

  // 6. Decidir si agregar adjetivo (40% de probabilidad)
  let addAdj = Math.random() < 0.4;
  let adjWord = null; // Forma final del adjetivo
  let adjBase = null; // Forma base del adjetivo (para evitar repeticiones)
  
  if (addAdj) {
    let adjCandidates = ADJECTIVES; // Lista inicial de adjetivos
    
    // Verifica si el sustantivo se repite (comparando con nounToAvoid)
    const nounRepeated = (nounToAvoid && nounObj.word === nounToAvoid);
    
    if (nounRepeated) {
      // Si el sustantivo se repite, evitar también el adjetivo repetido si se especifica
      if (adjToAvoid) {
        const withoutRepeat = ADJECTIVES.filter(a => a.base !== adjToAvoid);
        if (withoutRepeat.length > 0) {
          adjCandidates = withoutRepeat;
          addAdj = true; // Mantiene la decisión de agregar adjetivo
        } else {
          addAdj = false; // No hay adjetivos alternativos, no agregar
        }
      } else {
        addAdj = true; // No hay adjetivo a evitar, proceder normalmente
      }
    } else {
      // Si el sustantivo no se repite, solo evitar el adjetivo si se especifica
      if (adjToAvoid) {
        const withoutRepeat = ADJECTIVES.filter(a => a.base !== adjToAvoid);
        if (withoutRepeat.length > 0) {
          adjCandidates = withoutRepeat;
        }
      }
    }
    
    // Si después de las verificaciones se debe agregar adjetivo
    if (addAdj) {
      const adjObj = pick(adjCandidates); // Selecciona adjetivo aleatorio
      adjBase = adjObj.base; // Guarda la forma base

      // >>>>> Aplica apócope porque el adjetivo va antes del sustantivo (isPreNoun = true)
      adjWord = agreeAdjective(adjObj, gender, plural, true);
    }
  }

  // Retorna objeto con las palabras y metadatos del SN
  return {
    words: [article.word, adjWord, noun].filter(Boolean), // Filtra elementos null/undefined
    plural: plural,
    gender: gender,
    noun: nounObj.word, // Sustantivo base (sin pluralizar)
    adj: adjBase // Adjetivo base (null si no hay adjetivo)
  };
}

/**
 * Construye un Sintagma Verbal (VP) con un verbo.
 * 
 * @param {boolean} needsObject - Indica si el verbo debe ser transitivo (necesita objeto)
 * @returns {Object} - Objeto con las palabras del VP y metadatos del verbo
 */
function buildVP(needsObject) {
  let availableVerbs = VERBS_DATA;
  
  // Filtra verbos según si necesitan objeto
  if (needsObject) {
    availableVerbs = VERBS_DATA.filter(v => v.type === "t"); // Solo transitivos
  } else {
    availableVerbs = VERBS_DATA.filter(v => v.type === "i" || v.type === "b"); // Intransitivos o copulativos
  }

  const vObj = pick(availableVerbs); // Selecciona verbo aleatorio
  const v = vObj.word; // Palabra del verbo
  
  return {
    words: [v], // Array con el verbo
    isTransitive: vObj.type === "t", // Indica si es transitivo
    restrictions: vObj.restrictions // Restricciones de selección del verbo
  };
}

/* PLANTILLAS DE ESTRUCTURAS SINTÁCTICAS */
const TEMPLATES = [
  { tpl: ["SN", "VP"], requiresObject: false }, // Oración simple: Sujeto + Verbo
  { tpl: ["SN", "VP", "SN"], requiresObject: true }, // Oración transitiva: Sujeto + Verbo + Objeto
];

/* GENERADOR PRINCIPAL DE FRAGMENTOS */
/**
 * Genera una oración aleatoria siguiendo las plantillas definidas.
 * Aplica concordancia gramatical y evita repeticiones innecesarias.
 * 
 * @returns {string} - Fragmento de oración generado
 */
export function generateFragment() {
  const tplObj = pick(TEMPLATES); // Selecciona plantilla aleatoria
  const tpl = tplObj.tpl; // Estructura de la plantilla (ej: ["SN", "VP", "SN"])

  // 1. Generar el sintagma verbal según si la plantilla requiere objeto
  const vpObj = buildVP(tplObj.requiresObject);
  const verbRestrictions = vpObj.restrictions || {}; // Restricciones del verbo seleccionado

  // 2. Generar el sujeto (SN) aplicando restricciones del verbo
  const subjectRestrictions = verbRestrictions.subj || []; // Restricciones para el sujeto
  const subjectObj = buildSN(subjectRestrictions);
  const subjPlural = subjectObj.plural; // Número gramatical del sujeto
  
  const subjectNounBase = subjectObj.noun; // Sustantivo base del sujeto (para evitar repeticiones)
  const subjectAdjBase = subjectObj.adj; // Adjetivo base del sujeto (para evitar repeticiones)

  // 3. Generar el objeto (SN) si la plantilla lo requiere
  let objectObj = null;
  if (tplObj.requiresObject) {
    const objectRestrictions = verbRestrictions.obj || []; // Restricciones para el objeto
    // Evita repetir sustantivo y adjetivo del sujeto
    objectObj = buildSN(objectRestrictions, subjectNounBase, subjectAdjBase);
  }

  // 4. Conjugar el verbo según el número del sujeto
  const verbSingularBase = vpObj.words[0]; // Verbo en singular
  vpObj.words = [conjugate(verbSingularBase, subjPlural)]; // Conjuga según pluralidad del sujeto

  // 5. Construir la oración siguiendo la plantilla
  let snCount = 0; // Contador para distinguir sujeto de objeto
  const result = tpl.flatMap(el => {
    if (el === "SN") {
      snCount++;
      if (snCount === 1) {
        return subjectObj.words; // Primer SN es el sujeto
      } else {
        return objectObj.words; // Segundo SN es el objeto (si existe)
      }
    }
    if (el === "VP") return vpObj.words; // Sintagma verbal
    
    return el; // Para elementos literales (no usados actualmente)
  });

  // 6. Unir las palabras en una cadena y retornar
  return result.join(" ");
}