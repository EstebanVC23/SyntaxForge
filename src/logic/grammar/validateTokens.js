import { GDC_RULES } from "./gdcRules.js";

export function validateTokens(tokens) {
  const errors = [];
  for (const rule of GDC_RULES) {
    const res = rule.validate(tokens);
    if (!res.valid) {
      errors.push({ rule: rule.name, ...res });
    }
  }
  return { valid: errors.length === 0, errors };
}