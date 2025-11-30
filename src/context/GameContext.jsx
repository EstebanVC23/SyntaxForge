import React from "react";
import { generateFragment } from "../logic/grammar/fragmentGenerator.js";


export const GameContext = React.createContext();


export function GameProvider({ children }) {
const [fragment, setFragment] = React.useState(generateFragment());
const [currentText, setCurrentText] = React.useState("");
const [feedback, setFeedback] = React.useState(null);
const [round, setRound] = React.useState(1);
const [score, setScore] = React.useState(0);


function nextRound() {
setRound(r => r + 1);
setFragment(generateFragment());
setCurrentText("");
setFeedback(null);
}


function resetGame() {
setRound(1);
setScore(0);
setFragment(generateFragment());
setCurrentText("");
setFeedback(null);
}


return (
<GameContext.Provider value={{ fragment, currentText, setCurrentText, feedback, setFeedback, nextRound, resetGame, round, score, setScore }}>
{children}
</GameContext.Provider>
);
}