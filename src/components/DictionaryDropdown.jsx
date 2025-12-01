import { useState } from "react";
import { ALL_WORDS } from "../data/wordLists.js";
import "../styles/DictionaryDropdown.css";

export default function DictionaryDropdown({ addWord }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = ALL_WORDS.filter(w =>
    w.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="dropdown-container">
      <button 
        className={`dropdown-toggle ${open ? "open" : ""}`}
        onClick={() => setOpen(!open)}
      >
        📚 Diccionario {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="dropdown-menu">
          {/* Header */}
          <div className="dropdown-header">
            <div className="dropdown-title">📖 Diccionario Completo</div>
            <div className="dropdown-subtitle">{ALL_WORDS.length} palabras disponibles</div>
          </div>

          {/* Search */}
          <div className="dropdown-search">
            <input
              type="text"
              placeholder="🔍 Buscar palabra..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Search count */}
          {search && (
            <div className="search-count">
              {filtered.length > 0 
                ? `✨ ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
                : '🔍 Ningún resultado'
              }
            </div>
          )}

          {/* Word list */}
          <div className="dropdown-list">
            {filtered.length > 0 ? (
              filtered.map((w, i) => (
                <button
                  key={i}
                  className="dropdown-item"
                  onClick={() => {
                    addWord(w);
                    setOpen(false);
                    setSearch(""); // opcional: limpiar input al agregar
                  }}
                >
                  <span className="item-word">{w}</span>
                  <span className="item-add">+ Agregar</span>
                </button>
              ))
            ) : (
              <div className="no-results">
                <div className="emoji">😕</div>
                <div className="no-results-title">No se encontraron palabras</div>
                <div className="no-results-subtitle">Intenta con otra búsqueda</div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="dropdown-footer">
            <button onClick={() => setOpen(false)}>✕ Cerrar diccionario</button>
          </div>
        </div>
      )}
    </div>
  );
}
