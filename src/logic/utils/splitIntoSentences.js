export function splitIntoSentences(text) {
  if (!text || typeof text !== "string") return [];
  // dividir por ., !, ? — conservando frases limpias
  return text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim().replace(/^[\s]+|[\s]+$/g, ""))
    .filter(s => s.length > 0);
}