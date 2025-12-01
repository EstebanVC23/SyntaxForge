
/**
 * Tokenizador de oraciones en español.
 * 
 * Convierte una oración en un array de tokens (palabras y signos de puntuación),
 * separando adecuadamente los signos de puntuación de las palabras.
 * 
 * @param {string} sentence - La oración a tokenizar.
 *                            Puede ser null, undefined o cualquier tipo.
 * @returns {Array<string>} - Array de tokens (palabras y signos de puntuación).
 *                            Retorna array vacío si:
 *                            - sentence es null/undefined
 *                            - sentence no es string
 *                            - sentence está vacío o solo contiene espacios
 * 
 * @example
 * // Retorna: ["Hola", ",", "mundo", "!"]
 * tokenize("Hola, mundo!");
 */
// Tokenizador sencillo: mantiene palabras, quita puntuación básica
export function tokenize(sentence) {
  // Validación inicial del parámetro de entrada
  // Verifica que sentence no sea falsy, que sea de tipo string
  if (!sentence || typeof sentence !== "string") return [];

  // Proceso de limpieza y separación de tokens en dos pasos:
  const cleaned = sentence
    // PASO 1: Separar signos de puntuación de las palabras
    // Expresión regular: /([.,!?;:()«»"¿¡])/g
    // - Captura cualquier signo de puntuación común en español
    // - Los signos son: . , ! ? ; : ( ) « » " ¿ ¡
    // - Reemplaza cada signo por " $1 " (espacio + signo + espacio)
    // - Esto asegura que los signos se conviertan en tokens independientes
    .replace(/([.,!?;:()«»"¿¡])/g, " $1 ")
    
    // PASO 2: Normalizar espacios en blanco
    // Expresión regular: /\s+/g
    // - Reemplaza uno o más espacios consecutivos por un solo espacio
    // - Esto limpia espacios extra creados en el paso anterior
    .replace(/\s+/g, " ")
    
    // Elimina espacios al inicio y final de la cadena resultante
    .trim();

  // Verifica que la cadena limpiada no esté vacía
  if (!cleaned) return [];

  // Divide la cadena por espacios para obtener los tokens individuales
  // y filtra cualquier token vacío que pueda resultar
  return cleaned.split(" ").filter(s => s.length > 0);
}