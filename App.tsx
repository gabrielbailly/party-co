
import React, { useState } from 'react';
import { Player, ChallengeType, ChallengeData, GameState, MultipleChoiceChallenge, HangmanChallenge, MatchPairsChallenge, ImageGuessChallenge } from './types';
import { generateChallenge, extractPlayers } from './services/geminiService';
import Wheel, { CATEGORY_LABELS } from './components/Wheel';
import MultipleChoice from './components/games/MultipleChoice';
import Hangman from './components/games/Hangman';
import MatchPairs from './components/games/MatchPairs';
import ImageGuess from './components/games/ImageGuess';
import Podium from './components/Podium';
import { sounds } from './services/soundService';

const App: React.FC = () => {
  const [state, setState] = useState<GameState & { isFinished: boolean, isTransitioning: boolean, showConfirmFinish: boolean }>({
    players: [],
    contextData: '',
    currentTurn: 0,
    currentChallengeType: null,
    currentChallenge: null,
    isSpinning: false,
    gameStarted: false,
    history: [],
    isFinished: false,
    isTransitioning: false,
    showConfirmFinish: false
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
    setState(prev => ({ ...prev, gameStarted: true, isFinished: false, isTransitioning: false }));
  };

  const toggleConfirmFinish = () => {
    setState(prev => ({ ...prev, showConfirmFinish: !prev.showConfirmFinish }));
  };

  const finalizeGame = () => {
    setState(prev => ({ ...prev, isFinished: true, showConfirmFinish: false }));
  };

  const handleSpinEnd = async (type: ChallengeType) => {
    setState(prev => ({ ...prev, isSpinning: false, currentChallengeType: type, isTransitioning: false }));
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
      console.error(error);
      alert("Error de la IA. Gira de nuevo.");
      setState(prev => ({ ...prev, currentChallengeType: null }));
    } finally {
      setLoadingChallenge(false);
    }
  };

  const onChallengeComplete = (success: boolean) => {
    if (state.isTransitioning) return;

    if (success) sounds.playSuccess();
    else sounds.playFailure();

    setState(prev => {
      const turnOfPlayer = prev.currentTurn;
      const newPlayers = [...prev.players];
      if (success) {
        newPlayers[turnOfPlayer].score += 10;
      }
      return { ...prev, players: newPlayers, isTransitioning: true };
    });

    setTimeout(() => {
      setState(prev => {
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
          currentChallenge: null,
          currentChallengeType: null,
          currentTurn: (prev.currentTurn + 1) % prev.players.length,
          history: historyItem ? [...prev.history, historyItem] : prev.history,
          isTransitioning: false
        };
      });
    }, 2000);
  };

  if (state.isFinished) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col p-6 animate-fade-in">
        <Podium players={state.players} onRestart={() => window.location.reload()} />
      </div>
    );
  }

  const currentPlayer = state.players[state.currentTurn];

  if (!state.gameStarted) {
    return (
      <div className="min-h-screen p-4 sm:p-8 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900">
        <div className="max-w-3xl w-full bg-slate-800/50 backdrop-blur-lg p-8 rounded-3xl border border-white/10 shadow-2xl">
          <h1 className="text-6xl sm:text-7xl font-party text-center mb-4 text-yellow-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.5)] uppercase tracking-tighter">PARTY & CO. AI</h1>
          <p className="text-slate-400 text-center mb-10 text-lg italic tracking-widest uppercase opacity-80">Edición Especial</p>
          <div className="space-y-8">
            {!showPlayerConfirmation ? (
              <section className="animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">1</span>
                  Información sobre los jugadores
                </h2>
                <textarea 
                  value={state.contextData}
                  onChange={(e) => setState(prev => ({ ...prev, contextData: e.target.value }))}
                  placeholder="Introduce historias, curiosidades o chats de los participantes..."
                  className="w-full h-48 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-sm mb-4"
                />
                <button 
                  onClick={handleExtractPlayers}
                  disabled={extractingPlayers}
                  className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white rounded-2xl font-bold text-xl transition-all shadow-[0_6px_0_rgb(67,56,202)] active:shadow-none active:translate-y-1"
                >
                  {extractingPlayers ? 'Analizando con IA...' : 'Generar Jugadores'}
                </button>
              </section>
            ) : (
              <section className="animate-fade-in">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="bg-indigo-500 w-8 h-8 rounded-full flex items-center justify-center text-sm">2</span>
                  Lista de Jugadores
                </h2>
                <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-700 mb-6">
                  <div className="flex flex-wrap gap-3 mb-6">
                    {state.players.map(p => (
                      <span key={p.id} className="bg-indigo-600/30 text-indigo-100 px-4 py-2 rounded-full text-base border border-indigo-500/30 flex items-center gap-2">
                        {p.name}
                        <button onClick={() => setState(prev => ({ ...prev, players: prev.players.filter(pl => pl.id !== p.id) }))} className="text-rose-400 hover:text-rose-300 ml-2">×</button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setShowPlayerConfirmation(false)} className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all">Editar Texto</button>
                  <button onClick={startGame} className="flex-[2] py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-party text-4xl shadow-[0_6px_0_rgb(5,150,105)] active:shadow-none active:translate-y-1 transition-all uppercase">¡Jugar!</button>
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-inter relative">
      {/* Modal de Confirmación de Finalización */}
      {state.showConfirmFinish && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6">
          <div className="bg-slate-900 border-2 border-rose-500 p-8 rounded-3xl max-w-sm w-full text-center shadow-[0_0_50px_rgba(244,63,94,0.3)] animate-pop-in">
            <h3 className="text-2xl font-party text-white mb-4 uppercase tracking-wider">¿Finalizar Partida?</h3>
            <p className="text-slate-400 mb-8 text-sm">Se mostrará la clasificación final con las puntuaciones actuales.</p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={finalizeGame}
                className="w-full py-4 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl font-bold text-lg shadow-[0_4px_0_rgb(159,18,57)] active:translate-y-1 active:shadow-none transition-all"
              >
                SÍ, FINALIZAR
              </button>
              <button 
                onClick={toggleConfirmFinish}
                className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-2xl font-bold"
              >
                VOLVER AL JUEGO
              </button>
            </div>
          </div>
        </div>
      )}

      <header className="p-4 bg-slate-900/95 backdrop-blur-lg border-b border-white/5 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
        <div className="flex flex-col">
          <h1 className="text-2xl font-party text-yellow-400 tracking-wider uppercase">PARTY & CO AI</h1>
          <button 
            onClick={toggleConfirmFinish} 
            className="text-xs font-black bg-rose-600 hover:bg-rose-500 text-white px-3 py-1.5 rounded-lg border border-rose-400/50 transition-all uppercase tracking-widest mt-1 shadow-lg active:scale-95"
          >
            FINALIZAR JUEGO
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar max-w-[50%] px-2">
          {state.players.map((p, i) => (
            <div key={p.id} className={`flex flex-col items-center px-4 py-1.5 rounded-2xl border transition-all duration-300 ${i === state.currentTurn ? 'bg-indigo-600 border-indigo-400 scale-105 shadow-[0_0_20px_rgba(79,70,229,0.4)]' : 'bg-slate-800 border-slate-700 opacity-40'}`}>
              <span className="font-bold text-xs whitespace-nowrap">{p.name}</span>
              <span className="text-[10px] text-yellow-400 font-black">{p.score} PTS</span>
            </div>
          ))}
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-hidden">
        {!state.currentChallengeType ? (
          <div className="text-center animate-fade-in relative z-10">
            <h2 className="text-5xl font-party text-white mb-2 uppercase tracking-tight">
              Turno de <span className="text-yellow-400 underline decoration-indigo-500 underline-offset-8">{currentPlayer.name}</span>
            </h2>
            <Wheel onSpinEnd={handleSpinEnd} isSpinning={state.isSpinning} />
          </div>
        ) : (
          <div className="w-full max-w-4xl relative z-10">
            {loadingChallenge ? (
              <div className="flex flex-col items-center justify-center space-y-6 py-24 bg-slate-900/40 rounded-3xl border border-white/5 backdrop-blur-sm">
                <div className="w-20 h-20 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-indigo-300 font-party text-3xl animate-pulse uppercase">Preparando el Reto...</p>
              </div>
            ) : state.currentChallenge ? (
              <div className="animate-fade-in">
                <div className="text-center mb-8">
                   <div className="inline-block bg-slate-800/80 backdrop-blur-md px-12 py-5 rounded-[2rem] border-2 border-indigo-400 shadow-2xl mb-6">
                      <span className="text-indigo-400 text-xs font-black uppercase tracking-[0.5em] block mb-2">Categoría</span>
                      <h4 className="text-4xl font-party text-white uppercase tracking-wider">{CATEGORY_LABELS[state.currentChallengeType]}</h4>
                   </div>
                   <p className="text-slate-500 font-black uppercase text-xs tracking-[0.3em]">Jugador: {currentPlayer.name}</p>
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

      <footer className="p-4 bg-slate-900 border-t border-white/5 text-center text-slate-500 text-[9px] font-black uppercase tracking-[0.3em]">
        Party & Co AI Edition • Español de España
      </footer>
    </div>
  );
};

export default App;
