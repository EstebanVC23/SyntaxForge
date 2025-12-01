// Importa las reglas de Gramática Dependiente del Contexto (GDC)
import { GDC_RULES } from "./gdcRules.js";

/**
 * Valida un conjunto de tokens aplicando todas las reglas GDC.
 * 
 * Esta función principal del validador ejecuta cada regla gramatical
 * secuencialmente y recopila todos los errores encontrados.
 * 
 * @param {Array<string>} tokens - Lista de tokens (palabras) a validar
 * @returns {Object} - Resultado de la validación con estado y errores detallados
 * 
 * @property {boolean} valid - Indica si todos los tokens pasaron todas las reglas
 * @property {Array<Object>} errors - Lista de errores encontrados, cada uno con:
 *   @property {string} rule - Nombre de la regla que falló
 *   @property {Array<Object>} errors - Errores específicos de esa regla
 *   @property {boolean} valid - Estado de validación de esa regla específica
 */
export function validateTokens(tokens) {
  const errors = []; // Almacena todos los errores de todas las reglas

  // Itera sobre cada regla GDC definida en el sistema
  for (const rule of GDC_RULES) {
    // Ejecuta la función de validación específica de la regla
    const res = rule.validate(tokens);
    
    // Si la regla reporta errores (res.valid = false), los agrega a la lista
    if (!res.valid) {
      errors.push({ 
        rule: rule.name, // Nombre descriptivo de la regla
        ...res // Propaga todas las propiedades del resultado (errors, valid)
      });
    }
  }

  // Determina el estado final: válido si no hubo errores en ninguna regla
  return { 
    valid: errors.length === 0, // true si no hay errores, false si hay al menos uno
    errors // Lista completa de errores encontrados (vacía si valid = true)
  };
}