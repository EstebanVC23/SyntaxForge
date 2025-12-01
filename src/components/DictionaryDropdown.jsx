import React, { useState } from "react";
import { ALL_WORDS } from "../data/wordLists.js";

export default function DictionaryDropdown({ addWord }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Filtrar palabras según búsqueda
  const filtered = ALL_WORDS.filter(w =>
    w.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: "relative" }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: open 
            ? 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)' 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        }}
      >
        📚 Diccionario {open ? '▲' : '▼'}
      </button>

      {open && (
        <div className="dropdown-menu" style={{
          width: 380,
          maxHeight: 550,
          left: 0,
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          {/* Header del diccionario */}
          <div style={{
            padding: '12px 16px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '8px 8px 0 0',
            color: 'white',
            flexShrink: 0
          }}>
            <div style={{ 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              marginBottom: 4,
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              📖 Diccionario Completo
            </div>
            <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>
              {ALL_WORDS.length} palabras disponibles
            </div>
          </div>

          {/* Buscador mejorado */}
          <div style={{ 
            padding: '12px',
            position: 'relative',
            flexShrink: 0
          }}>
            <div style={{
              position: 'absolute',
              left: 24,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '1.2rem',
              pointerEvents: 'none'
            }}>
              🔍
            </div>
            <input
              type="text"
              placeholder="Buscar palabra..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ 
                width: "100%",
                padding: "12px 12px 12px 40px",
                fontSize: '0.95rem',
                border: '2px solid #e0e7ff',
                borderRadius: 10,
                background: '#f9fafb',
                transition: 'all 0.3s ease',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = 'white';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e7ff';
                e.target.style.background = '#f9fafb';
              }}
            />
          </div>

          {/* Contador de resultados */}
          {search && (
            <div style={{
              padding: '8px 12px',
              margin: '0 12px',
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: 8,
              fontSize: '0.85rem',
              color: '#78350f',
              fontWeight: 600,
              textAlign: 'center',
              flexShrink: 0
            }}>
              {filtered.length > 0 
                ? `✨ ${filtered.length} resultado${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}`
                : '🔍 Ningún resultado'
              }
            </div>
          )}
          
          {/* Lista de palabras con scroll mejorado */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px',
            minHeight: 0,
            scrollbarWidth: 'thin',
            scrollbarColor: '#667eea #f0f0f0'
          }}>
            {filtered.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {filtered.map((w, i) => (
                  <button
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      textAlign: "left",
                      padding: "12px 16px",
                      border: "2px solid transparent",
                      background: "#f9fafb",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontSize: '0.95rem',
                      fontWeight: 500,
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)';
                      e.currentTarget.style.borderColor = '#c7d2fe';
                      e.currentTarget.style.transform = 'translateX(6px)';
                      e.currentTarget.style.paddingLeft = '20px';
                      const span = e.currentTarget.querySelector('span:last-child');
                      if (span) span.style.opacity = '1';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = 'transparent';
                      e.currentTarget.style.transform = 'translateX(0)';
                      e.currentTarget.style.paddingLeft = '16px';
                      const span = e.currentTarget.querySelector('span:last-child');
                      if (span) span.style.opacity = '0';
                    }}
                    onClick={() => {
                      addWord(w);
                      setOpen(false);
                    }}
                  >
                    <span style={{ color: '#4c1d95' }}>{w}</span>
                    <span style={{ 
                      fontSize: '0.75rem',
                      opacity: 0,
                      transition: 'opacity 0.2s ease',
                      color: '#667eea',
                      fontWeight: 600
                    }}>
                      + Agregar
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#6b7280'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>😕</div>
                <div style={{ 
                  fontSize: '1.05rem', 
                  fontWeight: 600,
                  marginBottom: 8,
                  color: '#374151'
                }}>
                  No se encontraron palabras
                </div>
                <div style={{ fontSize: '0.9rem', fontStyle: 'italic' }}>
                  Intenta con otra búsqueda
                </div>
              </div>
            )}
          </div>

          {/* Footer con botón cerrar */}
          <div style={{
            padding: '12px',
            borderTop: '2px solid #e5e7eb',
            flexShrink: 0
          }}>
            <button
              onClick={() => setOpen(false)}
              style={{
                width: '100%',
                padding: '10px',
                background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                fontSize: '0.9rem'
              }}
            >
              ✕ Cerrar diccionario
            </button>
          </div>
        </div>
      )}

      {/* CSS personalizado para scrollbar en navegadores webkit */}
      <style>{`
        .dropdown-menu > div::-webkit-scrollbar {
          width: 8px;
        }
        .dropdown-menu > div::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 10px;
        }
        .dropdown-menu > div::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
        }
        .dropdown-menu > div::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }
      `}</style>
    </div>
  );
}