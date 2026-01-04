
import React, { useState, useEffect } from 'react';
import { Player, ChallengeType, ChallengeData, GameState, MultipleChoiceChallenge, HangmanChallenge, MatchPairsChallenge, ImageGuessChallenge } from './types';
import { generateChallenge, extractPlayers } from './services/geminiService';
import Wheel, { CATEGORY_LABELS } from './components/Wheel';
import MultipleChoice from './components/games/MultipleChoice';
import Hangman from './components/games/Hangman';
import MatchPairs from './components/games/MatchPairs';
import ImageGuess from './components/games/ImageGuess';
import { sounds } from './services/soundService';

const App: React.FC = () => {
  const [state, setState] = useState<GameState>({
    players: [],
    contextData: '',
    currentTurn: 0,
    currentChallengeType: null,
    currentChallenge: null,
    isSpinning: false,
    gameStarted: false,
    history: [],
  });

  const [loadingChallenge, setLoadingChallenge] = useState(false);
  const [extractingPlayers, setExtractingPlayers] = useState(false);
  const [showPlayerConfirmation, setShowPlayerConfirmation] = useState(false);

  const handleExtractPlayers = async () => {
    if (!state.contextData.trim()) {
      alert("¡Pega primero el texto con la información de los participantes!");
      return;
    }
    setExtractingPlayers(true);
    try {
      const names = await extractPlayers(state.contextData);
      if (names.length === 0) {
        alert("No he podido encontrar nombres en el texto. Prueba con algo más descriptivo.");
      } else {
        const newPlayers: Player[] = names.map((name, i) => ({
          id: i.toString() + Date.now(),
          name,
          score: 0
        }));
        setState(prev => ({ ...prev, players: newPlayers }));
        setShowPlayerConfirmation(true);
      }
    } catch (error) {
      console.error(error);
      alert("Error al extraer jugadores.");
    } finally {
      setExtractingPlayers(false);
    }
  };

  const startGame = () => {
    if (state.players.length < 2) {
      alert("¡Mínimo 2 jugadores para la fiesta!");
      return;
    }
    setState(prev => ({ ...prev, gameStarted: true }));
  };

  const handleSpinEnd = async (type: ChallengeType) => {
    setState(prev => ({ ...prev, isSpinning: false, currentChallengeType: type }));
    setLoadingChallenge(true);
    
    try {
      const challenge = await generateChallenge(
        type, 
        state.contextData, 
        state.players.map(p => p.name),
        state.history
      );
      setState(prev => ({ ...prev, currentChallenge: challenge }));
    } catch (error) {
      console.error("Error generating challenge:", error);
      alert("La IA está cansada. Gira de nuevo.");
      setState(prev => ({ ...prev, currentChallengeType: null }));
    } finally {
      setLoadingChallenge(false);
    }
  };

  const onChallengeComplete = (success: boolean) => {
    if (success) sounds.playSuccess();
    else sounds.playFailure();

    setState(prev => {
      const newPlayers = [...prev.players];
      if (success) {
        newPlayers[prev.currentTurn].score += 10;
      }

      let historyItem = "";
      const challenge = prev.currentChallenge;
      if (challenge) {
        if (prev.currentChallengeType === ChallengeType.MULTIPLE_CHOICE || prev.currentChallengeType === ChallengeType.PLAYER_TRIVIA) {
          historyItem = (challenge as MultipleChoiceChallenge).question;
        } else if (prev.currentChallengeType === ChallengeType.HANGMAN) {
          historyItem = (challenge as HangmanChallenge).word;
        } else if (prev.currentChallengeType === ChallengeType.MATCH_PAIRS) {
          historyItem = (challenge as MatchPairsChallenge).pairs.map(p => p.left).join(', ');
        } else if (prev.currentChallengeType === ChallengeType.IMAGE_GUESS) {
          historyItem = (challenge as ImageGuessChallenge).description;
        }
      }

      return {
        ...prev,
        players: newPlayers,
        currentChallenge: null,
        currentChallengeType: null,
        currentTurn: (prev.currentTurn + 1) % prev.players.length,
        history: historyItem ? [...prev.history, historyItem] : prev.history
      };
    });
  };

  const currentPlayer = state.players[state.currentTurn];

  if (!state.gameStarted) {
    return (
      <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="max-w-3xl w-full bg-slate-800/50 backdrop-blur-lg p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="text-6xl sm:text-7xl font-party text-center mb-4 text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] uppercase tracking-tighter">PARTY & CO. AI</h1>
          <p className="text-slate-400 text-center mb-10 text-lg">Pega una biografía o chat y deja que la IA cree el juego.</p>
          
          <div className="space-y-8">
            {!showPlayerConfirmation ? (
              <section className="animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Texto sobre los participantes
                </h2>
                <textarea 
                  value={state.contextData}
                  onChange={(e) => setState(prev => ({ ...prev, contextData: e.target.value }))}
                  placeholder="Ej: David es informático y le encanta el sushi. Elena es de Sevilla y toca el piano..."
                  className="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm mb-4"
                />
                <button 
                  onClick={handleExtractPlayers}
                  disabled={extractingPlayers}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_4px_0_rgb(67,56,202)] active:shadow-none active:translate-y-1"
                >
                  {extractingPlayers ? 'Detectando jugadores...' : 'Continuar'}
                </button>
              </section>
            ) : (
              <section className="animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Jugadores Detectados
                </h2>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 mb-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    {state.players.map(p => (
                      <span key={p.id} className="bg-indigo-600/30 text-indigo-100 px-4 py-2 rounded-full text-base border border-indigo-500/30 flex items-center gap-2">
                        {p.name}
                        <button 
                          onClick={() => setState(prev => ({ ...prev, players: prev.players.filter(pl => pl.id !== p.id) }))} 
                          className="text-rose-400 hover:text-rose-300 font-bold ml-2"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <p className="text-slate-400 text-sm italic">Confirma los nombres para empezar.</p>
                </div>
                
                <div className="flex gap-4">
                  <button onClick={() => setShowPlayerConfirmation(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all">Atrás</button>
                  <button onClick={startGame} className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-party text-3xl shadow-[0_4px_0_rgb(5,150,105)] active:shadow-none active:translate-y-1 transition-all">¡EMPEZAR!</button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <header className="p-4 bg-slate-900/80 backdrop-blur-md border-b border-white/5 flex justify-between items-center sticky top-0 z-50">
        <h1 className="text-2xl font-party text-yellow-400 tracking-wider uppercase">PARTY & CO AI</h1>
        <div className="flex gap-4 overflow-x-auto pb-1 no-scrollbar">
          {state.players.map((p, i) => (
            <div key={p.id} className={`flex flex-col items-center px-4 py-1 rounded-xl border transition-all ${i === state.currentTurn ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-lg' : 'bg-slate-800 border-slate-700 opacity-60'}`}>
              <span className="text-[10px] uppercase font-bold text-white/50">Turno de</span>
              <span className="font-bold text-sm whitespace-nowrap">{p.name}</span>
              <span className="text-xs text-yellow-400 font-bold">{p.score} pts</span>
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {!state.currentChallengeType ? (
          <div className="text-center animate-fade-in">
            <h2 className="text-4xl font-party text-white mb-2 uppercase tracking-tighter">
              Turno de <span className="text-yellow-400">{currentPlayer.name}</span>
            </h2>
            <p className="text-slate-400 mb-8 italic">Gira la ruleta</p>
            <Wheel onSpinEnd={handleSpinEnd} isSpinning={state.isSpinning} />
          </div>
        ) : (
          <div className="w-full max-w-4xl">
            {loadingChallenge ? (
              <div className="flex flex-col items-center justify-center space-y-4 py-20">
                <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-300 font-party text-2xl animate-pulse">La IA está preparando tu reto...</p>
              </div>
            ) : state.currentChallenge ? (
              <div className="animate-fade-in">
                <div className="text-center mb-6">
                   <div className="inline-block bg-slate-800 px-10 py-4 rounded-3xl border-2 border-indigo-400 shadow-xl mb-4">
                      <span className="text-indigo-400 text-sm font-bold uppercase tracking-widest block mb-1">Categoría</span>
                      <h4 className="text-3xl font-party text-white uppercase">{CATEGORY_LABELS[state.currentChallengeType]}</h4>
                   </div>
                   <p className="text-slate-400 font-bold uppercase text-xs tracking-[0.4em]">Jugador: {currentPlayer.name}</p>
                </div>
                
                {(state.currentChallengeType === ChallengeType.MULTIPLE_CHOICE || state.currentChallengeType === ChallengeType.PLAYER_TRIVIA) && (
                  <MultipleChoice challenge={state.currentChallenge as any} onComplete={onChallengeComplete} />
                )}
                {state.currentChallengeType === ChallengeType.HANGMAN && (
                  <Hangman challenge={state.currentChallenge as any} onComplete={onChallengeComplete} />
                )}
                {state.currentChallengeType === ChallengeType.MATCH_PAIRS && (
                  <MatchPairs challenge={state.currentChallenge as any} onComplete={onChallengeComplete} />
                )}
                {state.currentChallengeType === ChallengeType.IMAGE_GUESS && (
                  <ImageGuess challenge={state.currentChallenge as any} onComplete={onChallengeComplete} />
                )}
              </div>
            ) : null}
          </div>
        )}
      </main>

      <footer className="p-4 bg-slate-900 border-t border-white/5 text-center text-slate-500 text-xs uppercase tracking-widest">
        Party & Co AI - Español (España)
      </footer>
    </div>
  );
};

export default App;
