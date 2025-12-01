import React, { useState } from "react";
import { GameProvider } from "./context/GameContext.jsx";
import { WordBankProvider, WordBankContext } from "./context/WordBankContext.jsx";

import GamePage from "./pages/GamePage.jsx";
import FreeTextPage from "./pages/FreeTextPage.jsx";
import TheoryPage from "./pages/TheoryPage.jsx";
import DictionaryDropdown from "./components/DictionaryDropdown.jsx";

import "./styles/App.css"; // Importamos el CSS

export default function App() {
  const [route, setRoute] = useState("game"); // ruta inicial
  const [gameModeOpen, setGameModeOpen] = useState(false);

  const handleRouteChange = (newRoute) => {
    console.log("Cambiando ruta a:", newRoute);
    setRoute(newRoute);
    setGameModeOpen(false);
  };

  return (
    <WordBankProvider>
      <GameProvider>
        <div className="app-container">
          <header className="app-header">
            {/* Dropdown Modo de Juego */}
            <div className="dropdown-container">
              <button
                className="dropdown-button"
                onClick={() => setGameModeOpen(!gameModeOpen)}
              >
                🎮 Modo de Juego
              </button>

              {gameModeOpen && (
                <div className="dropdown-menu">
                  <button
                    className={`menu-item ${route === "game" ? "active" : ""}`}
                    onClick={() => handleRouteChange("game")}
                  >
                    🏗️ Modo Construcción
                  </button>

                  <button
                    className={`menu-item ${route === "free" ? "active" : ""}`}
                    onClick={() => handleRouteChange("free")}
                  >
                    📝 Modo Texto Libre
                  </button>
                </div>
              )}
            </div>

            {/* Botón Teoría GDC */}
            <button
              className={`theory-button ${route === "theory" ? "active" : ""}`}
              onClick={() => handleRouteChange("theory")}
            >
              📚 Teoría GDC
            </button>

            {/* Diccionario */}
            <WordBankContext.Consumer>
              {({ addToInput }) => <DictionaryDropdown addWord={addToInput} />}
            </WordBankContext.Consumer>
          </header>

          <main>
            {route === "game" && <GamePage />}
            {route === "free" && <FreeTextPage />}
            {route === "theory" && <TheoryPage />}
          </main>
        </div>
      </GameProvider>
    </WordBankProvider>
  );
}
