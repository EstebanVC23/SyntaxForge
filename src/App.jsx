import React from "react";
import { GameProvider } from "./context/GameContext.jsx";
import { WordBankProvider, WordBankContext } from "./context/WordBankContext.jsx";
import GamePage from "./pages/GamePage.jsx";
import FreeTextPage from "./pages/FreeTextPage.jsx";
import DictionaryDropdown from "./components/DictionaryDropdown.jsx";

export default function App() {
  const [route, setRoute] = React.useState("game");
  const [gameModeOpen, setGameModeOpen] = React.useState(false);

  return (
    <WordBankProvider>
      <GameProvider>
        <div style={{ padding: 20, minHeight: '100vh' }}>
          <header style={{ 
            display: "flex", 
            gap: 12, 
            marginBottom: 20,
            justifyContent: "center",
            flexWrap: "wrap"
          }}>
            {/* Modo de juego */}
            <div style={{ position: "relative" }}>
              <button 
                onClick={() => setGameModeOpen(!gameModeOpen)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8
                }}
              >
                🎮 Modo de Juego
              </button>
              {gameModeOpen && (
                <div className="dropdown-menu" style={{ minWidth: 200 }}>
                  <button 
                    style={{ 
                      display: "block", 
                      width: "100%", 
                      margin: "4px 0",
                      background: route === "game" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f3f4f6",
                      color: route === "game" ? "white" : "#374151"
                    }}
                    onClick={() => { setRoute("game"); setGameModeOpen(false); }}
                  >
                    🏗️ Modo Construcción
                  </button>
                  <button 
                    style={{ 
                      display: "block", 
                      width: "100%", 
                      margin: "4px 0",
                      background: route === "free" ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f3f4f6",
                      color: route === "free" ? "white" : "#374151"
                    }}
                    onClick={() => { setRoute("free"); setGameModeOpen(false); }}
                  >
                    📝 Modo Texto Libre
                  </button>
                </div>
              )}
            </div>

            {/* Diccionario desplegable */}
            <WordBankContext.Consumer>
              {({ addToInput }) => <DictionaryDropdown addWord={addToInput} />}
            </WordBankContext.Consumer>
          </header>

          {/* Render según ruta */}
          {route === "game" && <GamePage />}
          {route === "free" && <FreeTextPage />}
        </div>
      </GameProvider>
    </WordBankProvider>
  );
}