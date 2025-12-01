# 🎯 GDC Game - Gramáticas Dependientes del Contexto

Un juego educativo interactivo para aprender sobre **Gramáticas Dependientes del Contexto (GDC)** mediante la construcción y validación de oraciones en español.

## 🌐 Demo en Vivo

**[🚀 Jugar Ahora](https://gdc-game.vercel.app)**

## 📋 Descripción

GDC Game es una aplicación web educativa que implementa un sistema completo de **Gramáticas Dependientes del Contexto** para el español. El proyecto combina teoría de lenguajes formales con procesamiento de lenguaje natural, permitiendo a los usuarios:

- 🏗️ **Construir oraciones** siguiendo estructuras objetivo
- ✅ **Validar reglas gramaticales** en tiempo real
- 🌳 **Visualizar árboles sintácticos** de sus construcciones
- 📚 **Aprender teoría** sobre GDC y la Jerarquía de Chomsky

tener en cuenta que el diccionario de las palabras es limitado porque las palabras tienen relaciones y demas, asi que hay que ingresar palabra por palabra al diccionario siguiendo una estructura logica.

ademas tener en cuenta que no todas las oraciones generadas son completamente coherentes

## ✨ Características Principales

### 🎮 Modos de Juego

1. **Modo Construcción**
   - Genera estructuras objetivo aleatorias
   - Banco de palabras categorizado
   - Sistema de puntuación basado en complejidad
   - Validación inmediata con retroalimentación

2. **Modo Texto Libre**
   - Valida párrafos completos
   - Análisis oración por oración
   - Reporte detallado de errores
   - Puntuación acumulativa

### 🔍 Sistema de Validación

Implementa **4 tipos de reglas GDC**:

1. **Concordancia Artículo-Sustantivo** (género y número)
2. **Concordancia Sustantivo-Adjetivo** (incluye apócope)
3. **Concordancia Sujeto-Verbo** (número gramatical)
4. **Restricciones Semánticas** (coherencia conceptual)

### 🌳 Visualización Sintáctica

- Árbol de análisis sintáctico interactivo
- Etiquetado morfológico automático
- Identificación de constituyentes (SN, SV, SP)
- Leyenda explicativa de símbolos

### 📖 Recursos Educativos

- Teoría completa sobre GDC
- Jerarquía de Chomsky explicada
- Ejemplos lingüísticos detallados
- Análisis de complejidad computacional

## 🛠️ Tecnologías Utilizadas

- **React 18** - Framework principal
- **React D3 Tree** - Visualización de árboles sintácticos
- **Context API** - Gestión de estado global
- **CSS3** - Estilos y animaciones
- **Vite** - Build tool y desarrollo

## 📂 Estructura del Proyecto
```
src/
├── components/          # Componentes reutilizables
│   ├── DictionaryDropdown.jsx
│   ├── FeedbackBox.jsx
│   ├── FragmentDisplay.jsx
│   ├── SentenceInput.jsx
│   ├── SyntaxTreeViewer.jsx
│   └── WordBank.jsx
├── context/            # Gestión de estado
│   ├── GameContext.jsx
│   └── WordBankContext.jsx
├── data/               # Base léxica
│   └── wordLists.js
├── logic/              # Lógica del juego
│   ├── grammar/
│   │   ├── fragmentGenerator.js
│   │   ├── gdcRules.js
│   │   └── validateTokens.js
│   └── utils/
│       ├── tokenizer.js
│       ├── sentenceSplitter.js
│       └── vocabularyValidator.js
├── pages/              # Páginas principales
│   ├── GamePage.jsx
│   ├── FreeTextPage.jsx
│   └── TheoryPage.jsx
├── styles/             # Estilos CSS
└── App.jsx             # Componente raíz
```

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 16+ 
- npm o yarn

### Instalación Local
```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/gdc-game.git

# Entrar al directorio
cd gdc-game

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La aplicación estará disponible en `http://localhost:5173`

### Build para Producción
```bash
npm run build
npm run preview
```

## 🎓 Fundamentos Teóricos

### Gramáticas Dependientes del Contexto

Una GDC es una 4-tupla (V, Σ, R, S) donde las reglas de producción tienen la forma:
```
αAβ → αγβ
```

Donde:
- **A** ∈ V (símbolo no terminal)
- **α, β** ∈ (V ∪ Σ)* (contexto izquierdo y derecho)
- **γ** ∈ (V ∪ Σ)+ (reemplazo)

### Posición en la Jerarquía de Chomsky
```
Tipo 0: Irrestrictas
    ↓
Tipo 1: Sensibles al Contexto (GDC) ← Este proyecto
    ↓
Tipo 2: Independientes del Contexto
    ↓
Tipo 3: Regulares
```

## 📊 Ejemplos de Reglas Implementadas

### 1. Apócope Contextual
```javascript
// Contexto: Adjetivo ANTES de sustantivo masculino singular
"bueno" + [contexto_pre_nominal] + "día" → "buen día"
"grande" + [contexto_pre_nominal] + "casa" → "gran casa"
```

### 2. Concordancia Sujeto-Verbo
```javascript
[Sust_singular] + [Verbo] → [Sust_singular] + [Verbo_singular]
[Sust_plural] + [Verbo] → [Sust_plural] + [Verbo_plural]

Ejemplo:
"El gato" + "comer" → "El gato come" ✅
"Los gatos" + "comer" → "Los gatos comen" ✅
```

### 3. Restricciones Semánticas
```javascript
// Verbo "ladrar" requiere sujeto [+animal, +canino]
"El perro ladra" ✅
"El libro ladra" ❌ (incoherencia semántica)
```

## 🎯 Sistema de Puntuación

La puntuación se calcula como:
```
Puntos = Palabras_Totales + Palabras_Del_Banco_Usadas
```

Donde:
- **Palabras Totales**: +1 punto por cada palabra escrita
- **Palabras del Banco**: +1 punto adicional por cada palabra del banco utilizada

## 🧩 Características Avanzadas

### Generación Aleatoria con Backtracking

El sistema genera estructuras objetivo usando un algoritmo de backtracking que garantiza:
- Concordancia gramatical perfecta
- Coherencia semántica
- Diversidad estructural
- Complejidad progresiva

### Análisis Sintáctico

Implementa un parser descendente recursivo que identifica:
- **Sintagmas Nominales (SN)**: Det + (Adj*) + N + (Adj*)
- **Sintagmas Verbales (SV)**: V + (SN)* + (SP)*
- **Sintagmas Preposicionales (SP)**: Prep + SN
- **Oración (O)**: Composición de constituyentes

## 📈 Complejidad Computacional

| Operación | Temporal | Espacial |
|-----------|----------|----------|
| Validación GDC simple | O(n) | O(1) |
| Validación con contexto | O(n²) | O(n) |
| Generación con backtracking | O(b^d) | O(d) |
| Búsqueda de patrones | O(n·m) | O(m) |

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 👥 Autores

- **Tu Nombre** - *Desarrollo inicial* - [GitHub](https://github.com/tu-usuario)

## 🙏 Agradecimientos

- Teoría basada en los trabajos de Noam Chomsky
- Inspirado en aplicaciones educativas de lingüística computacional
- Implementación de GDC para español según principios de la RAE

## 📚 Referencias

- Chomsky, N. (1959). "On certain formal properties of grammars"
- Hopcroft, J.E., & Ullman, J.D. (1979). "Introduction to Automata Theory"
- Jurafsky, D., & Martin, J.H. (2020). "Speech and Language Processing"

---
