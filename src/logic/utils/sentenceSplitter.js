/**
 * Divide un texto en oraciones basándose en signos de puntuación finales.
 * 
 * Esta función separa el texto de entrada en oraciones individuales
 * utilizando los signos de puntuación que marcan el final de una oración:
 * punto (.), signo de exclamación (!) y signo de interrogación (?).
 * 
 * @param {string} text - El texto de entrada a dividir en oraciones.
 *                        Puede ser una cadena vacía, null o undefined.
 * @returns {Array<string>} - Un array de oraciones, cada una como string.
 *                             Retorna array vacío si el texto es null, undefined o vacío.
 * 
 * @example
 * // Retorna: ["Hola mundo", "¿Cómo estás", "Bien gracias"]
 * splitIntoSentences("Hola mundo. ¿Cómo estás? Bien gracias!");
 */
export function splitIntoSentences(text) {
  // Caso borde: si el texto es null, undefined o cadena vacía, retorna array vacío
  if (!text) return [];

  // Divide el texto usando una expresión regular que busca:
  // - Punto literal (.) 
  // - Signo de exclamación (!)
  // - Signo de interrogación (?)
  // El patrón /[\.\!\?]+/ significa "uno o más de estos caracteres"
  const parts = text
    .split(/[\.\!\?]+/) // Divide por los delimitadores
    .map(s => s.trim())  // Elimina espacios en blanco al inicio y final de cada parte
    .filter(s => s.length > 0); // Filtra cadenas vacías resultantes

  return parts;
}