import "../styles/TheoryPage.css";

// Página de teoría que explica las Gramáticas Dependientes del Contexto (GDC)
export default function TheoryPage() {
  return (
    <div className="container">
      {/* Título principal de la página de teoría */}
      <h1>📚 Teoría Completa: Gramáticas Dependientes del Contexto (GDC)</h1>

      {/* Sección 1: Introducción a las GDC */}
      <section id="introduccion-gdc" className="theory-section">
        <h2>1. ¿Qué son las Gramáticas Dependientes del Contexto?</h2>
        
        {/* Definición formal de GDC */}
        <div className="definition-box">
          <h3>Definición Formal</h3>
          <p>Una <strong>Gramática Dependiente del Contexto (GDC)</strong> es una 4-tupla (V, Σ, R, S) donde:</p>
          <ul className="formal-definition">
            <li><strong>V</strong> es un conjunto finito de <em>símbolos no terminales</em> (variables)</li>
            <li><strong>Σ</strong> es un conjunto finito de <em>símbolos terminales</em>, con V ∩ Σ = ∅</li>
            <li><strong>R</strong> es un conjunto finito de <em>reglas de producción</em> de la forma: αAβ → αγβ</li>
            <li><strong>S</strong> es el <em>símbolo inicial</em>, S ∈ V</li>
          </ul>
          <p>Donde A ∈ V, α, β ∈ (V ∪ Σ)*, y γ ∈ (V ∪ Σ)+</p>
        </div>

        {/* Concepto clave: dependencia contextual */}
        <div className="key-concept">
          <h3>Característica Fundamental</h3>
          <p>La regla <strong>αAβ → αγβ</strong> significa que el no terminal A puede ser reemplazado por γ 
          <em>solo cuando está rodeado por el contexto α a la izquierda y β a la derecha</em>.</p>
          <p>Esta dependencia contextual es lo que diferencia las GDC de las gramáticas independientes del contexto (GIC).</p>
        </div>
      </section>

      {/* Sección 2: Jerarquía de Chomsky - Posición de las GDC */}
      <section id="jerarquia-chomsky" className="theory-section">
        <h2>2. Jerarquía de Chomsky: Posición de las GDC</h2>
        
        {/* Diagrama de la jerarquía de Chomsky */}
        <div className="chomsky-hierarchy">
          {/* Nivel 0: Gramáticas Irrestrictas */}
          <div className="hierarchy-level">
            <h4>Tipo 0: Gramáticas Irrestrictas</h4>
            <p>α → β (sin restricciones)</p>
            <p><strong>Máquina equivalente:</strong> Máquina de Turing</p>
            <p><strong>Lenguajes:</strong> Recursivamente enumerables</p>
          </div>
          
          {/* Nivel 1: GDC (enfoque del proyecto) */}
          <div className="hierarchy-level gdc-level">
            <h4>Tipo 1: Gramáticas Sensibles al Contexto (GDC)</h4>
            <p>αAβ → αγβ, donde |γ| ≥ 1</p>
            <p><strong>Máquina equivalente:</strong> Autómata linealmente acotado</p>
            <p><strong>Lenguajes:</strong> Sensibles al contexto</p>
            <p className="highlight">Enfoque de nuestro proyecto</p>
          </div>
          
          {/* Nivel 2: Gramáticas Independientes del Contexto */}
          <div className="hierarchy-level">
            <h4>Tipo 2: Gramáticas Independientes del Contexto (GIC)</h4>
            <p>A → γ (sin contexto)</p>
            <p><strong>Máquina equivalente:</strong> Autómata con pila</p>
            <p><strong>Lenguajes:</strong> Independientes del contexto</p>
          </div>
          
          {/* Nivel 3: Gramáticas Regulares */}
          <div className="hierarchy-level">
            <h4>Tipo 3: Gramáticas Regulares</h4>
            <p>A → aB o A → a</p>
            <p><strong>Máquina equivalente:</strong> Autómata finito</p>
            <p><strong>Lenguajes:</strong> Regulares</p>
          </div>
        </div>
      </section>

      {/* Sección 3: Propiedades matemáticas de las GDC */}
      <section id="propiedades-gdc" className="theory-section">
        <h2>3. Propiedades Matemáticas de las GDC</h2>
        
        {/* Grid de propiedades con tarjetas */}
        <div className="properties-grid">
          {/* Propiedad 1: No contracción */}
          <div className="property-card">
            <h4>No Contración</h4>
            <p>En GDC, |γ| ≥ |A|, lo que significa que las derivaciones nunca acortan la cadena.</p>
            <p>Esto asegura que el lenguaje sea <strong>creciente</strong>.</p>
          </div>
          
          {/* Propiedad 2: Clausura bajo operaciones */}
          <div className="property-card">
            <h4>Clausura</h4>
            <p>Los lenguajes sensibles al contexto son cerrados bajo:</p>
            <ul>
              <li>Unión ✓</li>
              <li>Concatenación ✓</li>
              <li>Intersección ✓</li>
              <li>Complemento ✓</li>
            </ul>
          </div>
          
          {/* Propiedad 3: Decidibilidad */}
          <div className="property-card">
            <h4>Decidibilidad</h4>
            <p>Para GDC:</p>
            <ul>
              <li>Problema de pertenencia: Decidible (en PSPACE)</li>
              <li>Problema de vacío: Indecidible</li>
              <li>Problema de infinitud: Indecidible</li>
            </ul>
          </div>
          
          {/* Propiedad 4: Complejidad computacional */}
          <div className="property-card">
            <h4>Complejidad Computacional</h4>
            <p>El problema de pertenencia para GDC está en:</p>
            <ul>
              <li>PSPACE-completo en general</li>
              <li>P para formas normales especiales</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Sección 4: Ejemplos lingüísticos de GDC */}
      <section id="ejemplos-linguisticos" className="theory-section">
        <h2>4. Ejemplos Lingüísticos de GDC</h2>
        
        {/* Ejemplo 1: Lenguaje aⁿbⁿcⁿ */}
        <h3>4.1 Lenguaje aⁿbⁿcⁿ</h3>
        <div className="language-example">
          <p>L = {"{aⁿbⁿcⁿ | n ≥ 1}"}</p>
          <p>Este lenguaje <strong>no puede ser generado por GIC</strong> pero sí por GDC:</p>
          
          {/* Reglas de producción para aⁿbⁿcⁿ */}
          <div className="production-rules">
            <h4>Reglas de Producción:</h4>
            <pre>
{`S → aSBC | aBC
CB → BC
aB → ab
bB → bb
bC → bc
cC → cc`}
            </pre>
          </div>
          
          {/* Ejemplo de derivación */}
          <div className="derivation-example">
            <h4>Derivación para n=2 (aabbcc):</h4>
            <p>S ⇒ aSBC ⇒ aaBCBC ⇒ aabCBC ⇒ aabBCC ⇒ aabbCC ⇒ aabbcC ⇒ aabbcc</p>
          </div>
        </div>
        
        {/* Ejemplo 2: Concordancia en lenguaje natural */}
        <h3>4.2 Concordancia en Lenguaje Natural</h3>
        <div className="natural-language-example">
          <p>En español, la concordancia sujeto-verbo es un fenómeno dependiente del contexto:</p>
          
          {/* Reglas de concordancia en español */}
          <div className="rule-example">
            <h4>Regla GDC para concordancia:</h4>
            <p>[SN<sub>singular</sub>] + [V] → [SN<sub>singular</sub>] + [V<sub>singular</sub>]</p>
            <p>[SN<sub>plural</sub>] + [V] → [SN<sub>plural</sub>] + [V<sub>plural</sub>]</p>
          </div>
          
          {/* Ejemplo de aplicación */}
          <div className="application-example">
            <p><strong>Aplicación:</strong> "El gato come" vs "Los gatos comen"</p>
            <p>La forma verbal <em>depende del número gramatical del sujeto</em>, que está a su izquierda.</p>
          </div>
        </div>
      </section>

      {/* Sección 5: Aplicaciones reales de las GDC */}
      <section id="aplicaciones-reales" className="theory-section">
        <h2>5. Aplicaciones Reales de las GDC</h2>
        
        {/* Lista de aplicaciones en diferentes campos */}
        <div className="applications-list">
          {/* Aplicación 1: Procesamiento de lenguaje natural */}
          <div className="application-item">
            <h4>Procesamiento de Lenguaje Natural</h4>
            <ul>
              <li>Análisis sintáctico de lenguajes con concordancia compleja</li>
              <li>Traducción automática para pares de lenguajes con estructuras diferentes</li>
              <li>Corrección gramatical avanzada</li>
            </ul>
          </div>
          
          {/* Aplicación 2: Compiladores y análisis de código */}
          <div className="application-item">
            <h4>Compiladores y Análisis de Código</h4>
            <ul>
              <li>Verificación de tipos dependiente del contexto</li>
              <li>Análisis de alcance de variables</li>
              <li>Validación de reglas de visibilidad</li>
            </ul>
          </div>
          
          {/* Aplicación 3: Bioinformática */}
          <div className="application-item">
            <h4>Bioinformática</h4>
            <ul>
              <li>Modelado de estructuras de ARN</li>
              <li>Análisis de secuencias genéticas con restricciones contextuales</li>
              <li>Predicción de plegamiento de proteínas</li>
            </ul>
          </div>
          
          {/* Aplicación 4: Verificación formal */}
          <div className="application-item">
            <h4>Verificación Formal</h4>
            <ul>
              <li>Especificación de protocolos de comunicación</li>
              <li>Verificación de sistemas concurrentes</li>
              <li>Análisis de seguridad con dependencias contextuales</li>
            </ul>
          </div>
        </div>
      </section>

      {/* SECCIÓN 6: Implementación - Estructuración de frases con GDC (NUEVA) */}
      <section id="estructuracion-frase" className="theory-section">
        <h2>6. Implementación: Estructuración de Frases con GDC</h2>
        
        {/* Subsección 6.1: Arquitectura del sistema */}
        <div className="implementation-overview">
          <h3>6.1 Arquitectura del Sistema</h3>
          <p>Nuestro sistema implementa GDC mediante cuatro componentes principales:</p>
          
          {/* Diagrama de arquitectura con 4 componentes */}
          <div className="architecture-diagram">
            {/* Componente 1: Base léxica */}
            <div className="arch-component">
              <h4>Base Léxica (wordLists.js)</h4>
              <p>Contiene todas las palabras clasificadas con:</p>
              <ul>
                <li>Categoría gramatical</li>
                <li>Género y número</li>
                <li>Restricciones semánticas</li>
                <li>Formas conjugadas</li>
              </ul>
            </div>
            
            {/* Componente 2: Generador de fragmentos */}
            <div className="arch-component">
              <h4>Generador (generateFragment.js)</h4>
              <p>Responsable de:</p>
              <ul>
                <li>Selección de plantillas estructurales</li>
                <li>Aplicación de reglas de concordancia</li>
                <li>Gestión de apócopes</li>
                <li>Generación aleatoria controlada</li>
              </ul>
            </div>
            
            {/* Componente 3: Reglas GDC */}
            <div className="arch-component">
              <h4>Reglas GDC (gdcRules.js)</h4>
              <p>Implementa las reglas contextuales:</p>
              <ul>
                <li>Concordancia artículo-sustantivo</li>
                <li>Concordancia sustantivo-adjetivo</li>
                <li>Concordancia sujeto-verbo</li>
                <li>Restricciones semánticas</li>
              </ul>
            </div>
            
            {/* Componente 4: Validador */}
            <div className="arch-component">
              <h4>Validación (validateTokens.js)</h4>
              <p>Aplica todas las reglas GDC:</p>
              <ul>
                <li>Tokenización de frases</li>
                <li>Análisis contextual</li>
                <li>Detección de errores</li>
                <li>Generación de retroalimentación</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Subsección 6.2: Reglas GDC implementadas con detalle */}
        <div className="detailed-explanation">
          <h3>6.2 Reglas GDC Implementadas</h3>
          
          {/* Regla 1: Concordancia artículo-sustantivo */}
          <div className="rule-detail">
            <h4>Regla 1: Concordancia Artículo-Sustantivo</h4>
            <div className="rule-code">
              <pre>
{`// Contexto: Artículo inmediatamente seguido de sustantivo
// Regla: α [Art] [Sust] β → α [Art_concordante] [Sust] β

validate: (tokens) => {
  for (cada artículo seguido de sustantivo) {
    if (artículo.género ≠ sustantivo.género) → ERROR
    if (artículo.número ≠ sustantivo.número) → ERROR
  }
}`}
              </pre>
            </div>
            <p><strong>Ejemplo de aplicación:</strong> "La gato" → Error: artículo femenino con sustantivo masculino</p>
          </div>
          
          {/* Regla 2: Apócope (transformación contextual especial) */}
          <div className="rule-detail">
            <h4>Regla 2: Apócope (Transformación Contextual Especial)</h4>
            <div className="rule-code">
              <pre>
{`// Contexto específico: Adjetivo ANTES de sustantivo singular
// Regla: α [Adj] [Sust_sing] β → α [Adj_apocopado] [Sust_sing] β

function agreeAdjective(adj, género, plural, isPreNoun) {
  if (isPreNoun && !plural) {  // CONTEXTO CRÍTICO
    if (adj.base === "bueno" && género === "m") return "buen";
    if (adj.base === "grande") return "gran";
    if (adj.base === "ninguno" && género === "m") return "ningún";
  }
  // Si no está en contexto de apócope, mantener forma normal
}`}
              </pre>
            </div>
            <p><strong>Casos:</strong></p>
            <ul>
              <li><strong>Contexto correcto:</strong> "Un buen día" (antes de sustantivo masc. sing.)</li>
              <li><strong>Contexto incorrecto:</strong> "El día es bueno" (después de sustantivo)</li>
              <li><strong>Contexto incorrecto:</strong> "Unos buenos días" (plural, no aplica apócope)</li>
            </ul>
          </div>
          
          {/* Regla 3: Concordancia sujeto-verbo */}
          <div className="rule-detail">
            <h4>Regla 3: Concordancia Sujeto-Verbo</h4>
            <div className="rule-code">
              <pre>
{`// Contexto: Sustantivo (sujeto) en algún lugar antes del verbo
// Regla: α [Sust] β [Verbo] γ → α [Sust] β [Verbo_concordante] γ

validate: (tokens) => {
  encontrar primer sustantivo → determinar número (singular/plural)
  encontrar primer verbo → conjugarlo según número del sujeto
  
  if (sujeto.plural && verbo.singular) → ERROR
  if (sujeto.singular && verbo.plural) → ERROR
}`}
              </pre>
            </div>
            <p><strong>Característica importante:</strong> El sujeto y el verbo no necesitan ser adyacentes, 
            pero la concordancia debe mantenerse a distancia.</p>
          </div>
          
          {/* Regla 4: Restricciones semánticas */}
          <div className="rule-detail">
            <h4>Regla 4: Restricciones Semánticas</h4>
            <div className="rule-code">
              <pre>
{`// Contexto: Verbo con restricciones semánticas
// Regla: α [Sust] [Verbo_con_restricción] β → 
//        α [Sust_cumple_restricción] [Verbo_con_restricción] β

validate: (tokens) => {
  // Ejemplo: verbo "ladrar" requiere sujeto [+animal, +perro]
  if (verbo.restricciones.subj.includes("animal")) {
    if (!sujeto.características.includes("animal")) → ERROR
  }
}`}
              </pre>
            </div>
            <p><strong>Ejemplos semánticos:</strong></p>
            <ul>
              <li>"El libro ladra" → Error semántico: libros no pueden ladrar</li>
              <li>"El perro ladra" → Correcto: perros pueden ladrar</li>
              <li>"El agua fluye" → Correcto: agua puede fluir</li>
            </ul>
          </div>
        </div>

        {/* Subsección 6.3: Proceso de generación de frases aleatorias */}
        <div className="generation-process">
          <h3>6.3 Proceso de Generación de Frases Aleatorias</h3>
          
          {/* Paso 1: Selección de estructura */}
          <div className="process-step">
            <h4>Paso 1: Selección de Estructura</h4>
            <p>El sistema elige aleatoriamente una de las plantillas predefinidas:</p>
            <ul>
              <li><strong>Estructura 1:</strong> [Sujeto] + [Verbo] → "El gato duerme"</li>
              <li><strong>Estructura 2:</strong> [Sujeto] + [Verbo] + [Objeto] → "El gato come pescado"</li>
              <li><strong>Estructura 3:</strong> [Sujeto] + [Verbo] + [Complemento] → "El libro está en la mesa"</li>
            </ul>
          </div>
          
          {/* Paso 2: Expansión de constituyentes */}
          <div className="process-step">
            <h4>Paso 2: Expansión de Constituyentes</h4>
            <p>Cada elemento de la plantilla se expande según reglas GDC:</p>
            <div className="expansion-example">
              <p><strong>Para [Sujeto]:</strong></p>
              <ol>
                <li>Seleccionar sustantivo de la base léxica</li>
                <li>Determinar género y número aleatoriamente (con probabilidades controladas)</li>
                <li>Seleccionar artículo concordante</li>
                <li>Decidir si añadir adjetivo (40% de probabilidad)</li>
                <li>Si hay adjetivo, aplicar apócope si el contexto lo requiere</li>
              </ol>
            </div>
          </div>
          
          {/* Paso 3: Aplicación de reglas contextuales */}
          <div className="process-step">
            <h4>Paso 3: Aplicación de Reglas Contextuales</h4>
            <p>Se aplican todas las reglas GDC en cascada:</p>
            <div className="rule-application">
              <p><strong>Ejemplo para "El gran gato come pescado":</strong></p>
              <ol>
                <li><strong>Artículo-Sustantivo:</strong> "El" (masc. sing.) concuerda con "gato" (masc. sing.) ✓</li>
                <li><strong>Apócope:</strong> "grande" → "gran" (antes de sustantivo masc. sing.) ✓</li>
                <li><strong>Sujeto-Verbo:</strong> "gato" (sing.) → "come" (3ra pers. sing.) ✓</li>
                <li><strong>Verbo-Objeto:</strong> "come" (transitivo) requiere objeto ✓</li>
                <li><strong>Semántica:</strong> Gatos pueden comer, pescado es comestible ✓</li>
              </ol>
            </div>
          </div>
          
          {/* Paso 4: Validación final */}
          <div className="process-step">
            <h4>Paso 4: Validación Final</h4>
            <p>Antes de mostrar la frase, se valida con todas las reglas GDC:</p>
            <div className="validation-process">
              <pre>
{`function validateTokens(tokens) {
  const errors = [];
  
  // Aplicar cada regla GDC
  for (const rule of GDC_RULES) {
    const result = rule.validate(tokens);
    if (!result.valid) {
      errors.push({
        rule: rule.name,
        details: result.errors
      });
    }
  }
  
  // Si hay errores, se puede:
  // 1. Corregir automáticamente
  // 2. Generar una nueva frase
  // 3. Mostrar errores al usuario
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Subsección 6.4: Algoritmos clave implementados */}
        <div className="algorithms-used">
          <h3>6.4 Algoritmos Clave Implementados</h3>
          
          {/* Algoritmo 1: Búsqueda en contexto */}
          <div className="algorithm">
            <h4>Algoritmo de Búsqueda en Contexto</h4>
            <p>Para verificar reglas donde el contexto puede estar a distancia:</p>
            <div className="algorithm-code">
              <pre>
{`function findContext(pattern, tokens, maxDistance = 5) {
  // Busca patrones de tokens dentro de una ventana contextual
  const windows = [];
  
  for (let i = 0; i <= tokens.length - pattern.length; i++) {
    const windowTokens = tokens.slice(i, i + pattern.length);
    if (matchPattern(windowTokens, pattern)) {
      windows.push({
        start: i,
        tokens: windowTokens,
        distance: calculateDistance(windowTokens, pattern)
      });
    }
  }
  
  // Ordenar por distancia contextual
  return windows.sort((a, b) => a.distance - b.distance);
}`}
              </pre>
            </div>
          </div>
          
          {/* Algoritmo 2: Generación con retroceso */}
          <div className="algorithm">
            <h4>Algoritmo de Generación con Retroceso (Backtracking)</h4>
            <p>Para generar frases que cumplan todas las restricciones:</p>
            <div className="algorithm-code">
              <pre>
{`function generateWithBacktracking(template, constraints, depth = 0) {
  if (depth >= template.length) {
    return validateTokens(template) ? template : null;
  }
  
  const currentSlot = template[depth];
  const candidates = getCandidates(currentSlot, constraints);
  
  for (const candidate of candidates) {
    const newTemplate = [...template];
    newTemplate[depth] = candidate;
    
    // Aplicar nuevas restricciones del candidato
    const newConstraints = updateConstraints(constraints, candidate);
    
    const result = generateWithBacktracking(
      newTemplate, 
      newConstraints, 
      depth + 1
    );
    
    if (result) return result;
  }
  
  return null; // No se encontró solución
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Subsección 6.5: Análisis de complejidad */}
        <div className="complexity-analysis">
          <h3>6.5 Análisis de Complejidad</h3>
          
          {/* Tabla de complejidades */}
          <table className="complexity-table">
            <thead>
              <tr>
                <th>Operación</th>
                <th>Complejidad Temporal</th>
                <th>Complejidad Espacial</th>
                <th>Justificación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Validación GDC simple</td>
                <td>O(n)</td>
                <td>O(1)</td>
                <td>Recorrido lineal de tokens</td>
              </tr>
              <tr>
                <td>Validación GDC con contexto</td>
                <td>O(n²)</td>
                <td>O(n)</td>
                <td>Comparación de pares de tokens</td>
              </tr>
              <tr>
                <td>Generación con backtracking</td>
                <td>O(bᵈ)</td>
                <td>O(d)</td>
                <td>b: ramificación, d: profundidad</td>
              </tr>
              <tr>
                <td>Búsqueda de patrones</td>
                <td>O(n·m)</td>
                <td>O(m)</td>
                <td>n: tokens, m: longitud patrón</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Sección 7: Conclusión y aplicaciones futuras */}
      <section id="conclusion" className="theory-section">
        <h2>7. Conclusión y Aplicaciones Futuras</h2>
        
        <div className="conclusion-content">
          {/* Subsección 7.1: Logros del sistema actual */}
          <h3>7.1 Logros del Sistema Actual</h3>
          <ul>
            <li>Implementación completa de 4 tipos de reglas GDC</li>
            <li>Integración de restricciones semánticas y sintácticas</li>
            <li>Manejo de fenómenos lingüísticos complejos (apócope)</li>
            <li>Sistema de validación en tiempo real</li>
            <li>Generación controlada por contexto</li>
          </ul>
          
          {/* Subsección 7.2: Limitaciones actuales */}
          <h3>7.2 Limitaciones Actuales</h3>
          <ul>
            <li>Vocabulario limitado a la base léxica definida</li>
            <li>Estructuras sintácticas predefinidas</li>
            <li>No maneja oraciones subordinadas complejas</li>
            <li>Contexto limitado a ventanas pequeñas</li>
          </ul>
          
          {/* Subsección 7.3: Extensiones futuras */}
          <h3>7.3 Extensiones Futuras</h3>
          <ul>
            <li><strong>Gramáticas de Unificación:</strong> Incorporar rasgos y restricciones más complejas</li>
            <li><strong>Parsing Chart:</strong> Implementar algoritmos de parsing más eficientes</li>
            <li><strong>Aprendizaje Automático:</strong> Aprender reglas GDC desde corpus reales</li>
            <li><strong>Contexto Ampliado:</strong> Considerar contexto discursivo más amplio</li>
            <li><strong>Multilingüismo:</strong> Extender a otros idiomas con reglas GDC diferentes</li>
          </ul>
          
          {/* Nota final sobre importancia teórica y práctica */}
          <div className="final-note">
            <h3>Importancia Teórica y Práctica</h3>
            <p>Este proyecto demuestra que las Gramáticas Dependientes del Contexto, aunque teóricamente complejas, 
            son completamente implementables en sistemas prácticos de procesamiento de lenguaje natural.</p>
            <p>La capacidad de modelar dependencias contextuales permite crear sistemas más robustos y lingüísticamente 
            adecuados que los basados únicamente en gramáticas independientes del contexto.</p>
          </div>
        </div>
      </section>

      {/* Bibliografía de referencias teóricas */}
      <div className="bibliography">
        <h3>Referencias Teóricas</h3>
        <ul>
          <li>Chomsky, N. (1959). "On certain formal properties of grammars"</li>
          <li>Hopcroft, J.E., & Ullman, J.D. (1979). "Introduction to Automata Theory, Languages, and Computation"</li>
          <li>Joshi, A.K. (1985). "Tree adjoining grammars: How much context-sensitivity is required?"</li>
          <li>Gazdar, G., & Mellish, C. (1989). "Natural Language Processing in Prolog"</li>
          <li>Jurafsky, D., & Martin, J.H. (2020). "Speech and Language Processing"</li>
        </ul>
      </div>
    </div>
  );
}