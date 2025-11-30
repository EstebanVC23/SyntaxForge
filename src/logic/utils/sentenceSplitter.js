export function splitIntoSentences(text) {
if (!text) return [];
// split by period, exclamation, question
const parts = text.split(/[\.\!\?]+/).map(s=>s.trim()).filter(s=>s.length>0);
return parts;
}