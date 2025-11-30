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
      <button onClick={() => setOpen(!open)}>
        Diccionario
      </button>

      {open && (
        <div style={{
          position: "absolute",
          top: "100%",
          left: 0,
          width: 300,
          maxHeight: 400,
          overflowY: "auto",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: 6,
          padding: 8,
          zIndex: 10
        }}>
          <input
            type="text"
            placeholder="Buscar palabra..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: "100%", padding: 6, marginBottom: 8 }}
          />
          {filtered.length > 0 ? (
            filtered.map((w, i) => (
              <button
                key={i}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: 4,
                  border: "none",
                  background: "#f7f7f7",
                  marginBottom: 2,
                  borderRadius: 4,
                  cursor: "pointer"
                }}
                onClick={() => {
                  addWord(w);
                  setOpen(false); // opcional: cerrar desplegable al seleccionar
                }}
              >
                {w}
              </button>
            ))
          ) : (
            <div>No se encontraron palabras.</div>
          )}
        </div>
      )}
    </div>
  );
}
