import { useState } from "react";
import { ALL_WORDS } from "../data/wordLists.js";
import "../styles/DictionaryDropdown.css";

// Componente desplegable para seleccionar palabras desde un diccionario predefinido
export default function DictionaryDropdown({ addWord }) {
  // Estado para controlar si el dropdown está abierto o cerrado
  const [open, setOpen] = useState(false);
  // Estado para almacenar el texto de búsqueda
  const [search, setSearch] = useState("");

  // Filtra las palabras basándose en el término de búsqueda (case-insensitive)
  const filtered = ALL_WORDS.filter(w =>
    w.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dropdown-container">
      {/* Botón principal que alterna la visibilidad del dropdown */}
      <button 
        className={`dropdown-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        📚 Diccionario {open ? '▲' : '▼'}
      </button>

      {/* Contenido desplegable que se muestra cuando open es true */}
      {open && (
        <div className="dropdown-menu">
          {/* Encabezado con título y contador de palabras */}
          <div className="dropdown-header">
            <div className="dropdown-title">📖 Diccionario Completo</div>
            <div className="dropdown-subtitle">{ALL_WORDS.length} palabras disponibles</div>
          </div>

          {/* Campo de búsqueda para filtrar palabras */}
          <div className="dropdown-search">
            <input
              type="text"
              placeholder="🔍 Buscar palabra..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Muestra el número de resultados de búsqueda (solo cuando hay búsqueda activa) */}
          {search && (
            <div className="search-count">
              {filtered.length > 0 
                ? `✨ ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
                : '🔍 Ningún resultado'
              }
            </div>
          )}

          {/* Lista de palabras filtradas */}
          <div className="dropdown-list">
            {filtered.length > 0 ? (
              // Mapea cada palabra filtrada a un botón clickeable
              filtered.map((w, i) => (
                <button
                  key={i}
                  className="dropdown-item"
                  onClick={() => {
                    // Ejecuta la función addWord pasada como prop
                    addWord(w);
                    // Cierra el dropdown después de agregar
                    setOpen(false);
                    // Opcional: limpia el campo de búsqueda
                    setSearch("");
                  }}
                >
                  <span className="item-word">{w}</span>
                  <span className="item-add">+ Agregar</span>
                </button>
              ))
            ) : (
              // Mensaje que se muestra cuando no hay resultados
              <div className="no-results">
                <div className="emoji">😕</div>
                <div className="no-results-title">No se encontraron palabras</div>
                <div className="no-results-subtitle">Intenta con otra búsqueda</div>
              </div>
            )}
          </div>

          {/* Pie del dropdown con botón para cerrar */}
          <div className="dropdown-footer">
            <button onClick={() => setOpen(false)}>✕ Cerrar diccionario</button>
          </div>
        </div>
      )}
    </div>
  );
}