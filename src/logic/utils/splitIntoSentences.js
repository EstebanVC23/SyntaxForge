/**
 * Divide un texto en oraciones individuales utilizando signos de puntuación como delimitadores.
 * 
 * Esta versión mejorada de la función utiliza lookbehind positivo en la expresión regular
 * para dividir el texto manteniendo los signos de puntuación finales en cada oración.
 * 
 * @param {string} text - Texto de entrada a dividir en oraciones.
 *                        Puede ser null, undefined o cualquier tipo.
 * @returns {Array<string>} - Array de oraciones extraídas del texto.
 *                           Retorna array vacío si:
 *                           - text es null/undefined
 *                           - text no es string
 *                           - text está vacío después de limpiar
 * 
 * @example
 * // Retorna: ["Hola mundo.", "¿Cómo estás?", "¡Bien, gracias!"]
 * splitIntoSentences("Hola mundo. ¿Cómo estás? ¡Bien, gracias!");
 */
export function splitIntoSentences(text) {
  // Validación robusta del parámetro de entrada
  // Verifica que text no sea null/undefined, que sea tipo string y que no esté vacío
  if (!text || typeof text !== "string") return [];

  // Divide el texto utilizando una expresión regular sofisticada
  return text
    // Patrón regex: (?<=[.!?])\s+
    // - (?<=[.!?]): Lookbehind positivo - busca pero no consume: punto, exclamación o interrogación
    // - \s+: Uno o más espacios en blanco (tabulador, espacio, nueva línea, etc.)
    // Esto divide después de los signos de puntuación seguidos de espacios
    .split(/(?<=[.!?])\s+/)
    
    // Limpia cada oración resultante:
    .map(s => s.trim().replace(/^[\s]+|[\s]+$/g, ""))
    // - .trim(): Elimina espacios al inicio y final (incluye espacios regulares)
    // - .replace(/^[\s]+|[\s]+$/g, ""): Elimina cualquier espacio en blanco (más completo que trim)
    
    // Filtra oraciones vacías resultantes de divisiones múltiples o texto mal formado
    .filter(s => s.length > 0);
}