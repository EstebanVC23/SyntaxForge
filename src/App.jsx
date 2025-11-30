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
        <div style={{ padding: 20 }}>
          <header style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            {/* Modo de juego */}
            <div style={{ position: "relative" }}>
              <button onClick={() => setGameModeOpen(!gameModeOpen)}>
                Modo de Juego
              </button>
              {gameModeOpen && (
                <div style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  background: "#fff",
                  border: "1px solid #ccc",
                  borderRadius: 4,
                  padding: 4,
                  zIndex: 10
                }}>
                  <button 
                    style={{ display: "block", width: "100%", margin: 2 }}
                    onClick={() => { setRoute("game"); setGameModeOpen(false); }}
                  >
                    Modo Construcción
                  </button>
                  <button 
                    style={{ display: "block", width: "100%", margin: 2 }}
                    onClick={() => { setRoute("free"); setGameModeOpen(false); }}
                  >
                    Modo Texto Libre
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
