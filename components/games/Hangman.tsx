
import React, { useState, useEffect } from 'react';
import { HangmanChallenge } from '../../types';

interface Props {
  challenge: HangmanChallenge;
  onComplete: (success: boolean) => void;
}

const Hangman: React.FC<Props> = ({ challenge, onComplete }) => {
  const [guessed, setGuessed] = useState<string[]>([]);
  const target = challenge.word.toUpperCase();
  const letters = 'ABCDEFGHIJKLMNÑOPQRSTUVWXYZ'.split('');
  
  const wrongGuesses = guessed.filter(l => !target.includes(l)).length;
  const maxErrors = 6;
  
  const isWon = target.split('').every(char => char === ' ' || guessed.includes(char));
  const isLost = wrongGuesses >= maxErrors;

  useEffect(() => {
    if (isWon || isLost) {
      setTimeout(() => onComplete(isWon), 3000);
    }
  }, [isWon, isLost, onComplete]);

  const handleGuess = (letter: string) => {
    if (isWon || isLost || guessed.includes(letter)) return;
    setGuessed(prev => [...prev, letter]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl border-4 border-emerald-500/50">
      <div className="mb-6">
        <span className="bg-emerald-600 text-white text-xs px-3 py-1 rounded-full uppercase font-bold tracking-widest">Pista</span>
        <p className="mt-2 text-xl text-emerald-100 italic">{challenge.hint}</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {target.split('').map((char, i) => (
          <div key={i} className={`w-8 h-12 border-b-4 flex items-center justify-center text-3xl font-bold ${char === ' ' ? 'border-transparent' : 'border-emerald-500'}`}>
            {char === ' ' ? ' ' : guessed.includes(char) ? char : ''}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
        {letters.map(l => (
          <button
            key={l}
            disabled={guessed.includes(l) || isWon || isLost}
            onClick={() => handleGuess(l)}
            className={`h-10 rounded font-bold transition-all ${
              guessed.includes(l)
                ? target.includes(l) ? 'bg-emerald-500 text-white' : 'bg-rose-900 text-slate-400 line-through'
                : 'bg-slate-700 hover:bg-slate-600 text-emerald-400'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="mt-8 flex justify-between items-center text-slate-400 font-bold uppercase tracking-widest">
        <span>Errores: {wrongGuesses} / {maxErrors}</span>
        {isLost && <span className="text-rose-500 animate-pulse">¡Perdiste! Era: {target}</span>}
        {isWon && <span className="text-emerald-400 animate-bounce">¡Correcto!</span>}
      </div>
    </div>
  );
};

export default Hangman;
