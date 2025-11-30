// src/utils/tokenize.js
// Tokenizador sencillo: mantiene palabras, quita puntuación básica
export function tokenize(sentence) {
  if (!sentence || typeof sentence !== "string") return [];
  // separar signos de puntuación .,!? y comas como tokens separados
  const cleaned = sentence
    .replace(/([.,!?;:()«»"¿¡])/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return [];
  return cleaned.split(" ").filter(s => s.length > 0);
}
