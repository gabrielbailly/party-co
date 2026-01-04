
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

  // Función para eliminar tildes y diéresis
  const normalize = (str: string) => 
    str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();

  const targetNormalized = normalize(target);
  
  // Una letra adivinada es incorrecta si su versión normalizada no está en la palabra normalizada
  const wrongGuesses = guessed.filter(l => !targetNormalized.includes(normalize(l))).length;
  const maxErrors = 6;
  
  // Se gana si todos los caracteres de la palabra (normalizados) están en la lista de intentos (normalizados)
  const isWon = target.split('').every(char => 
    char === ' ' || guessed.some(g => normalize(g) === normalize(char))
  );
  const isLost = wrongGuesses >= maxErrors;

  useEffect(() => {
    if (isWon || isLost) {
      const timer = setTimeout(() => onComplete(isWon), 2500);
      return () => clearTimeout(timer);
    }
  }, [isWon, isLost, onComplete]);

  const handleGuess = (letter: string) => {
    if (isWon || isLost || guessed.includes(letter)) return;
    setGuessed(prev => [...prev, letter]);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-3xl border-4 border-emerald-500/50 shadow-2xl">
      <div className="mb-6 flex flex-col items-center">
        <span className="bg-emerald-600 text-white text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest mb-2">Pista del Reto</span>
        <p className="text-xl text-emerald-100 italic text-center font-medium">"{challenge.hint}"</p>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10 min-h-[60px]">
        {target.split('').map((char, i) => (
          <div 
            key={i} 
            className={`w-8 h-12 border-b-4 flex items-center justify-center text-3xl font-party ${
              char === ' ' ? 'border-transparent' : 'border-emerald-500'
            }`}
          >
            {char === ' ' 
              ? ' ' 
              : guessed.some(g => normalize(g) === normalize(char)) ? char : ''
            }
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 sm:grid-cols-9 gap-2">
        {letters.map(l => {
          const isGuessed = guessed.includes(l);
          const isCorrect = isGuessed && targetNormalized.includes(normalize(l));
          
          return (
            <button
              key={l}
              disabled={isGuessed || isWon || isLost}
              onClick={() => handleGuess(l)}
              className={`h-11 rounded-xl font-bold transition-all text-lg ${
                isGuessed
                  ? isCorrect 
                    ? 'bg-emerald-500 text-white shadow-inner scale-95' 
                    : 'bg-rose-900/50 text-slate-500 line-through opacity-50'
                  : 'bg-slate-700 hover:bg-slate-600 text-emerald-400 border-b-4 border-slate-900 active:border-b-0 active:translate-y-1'
              }`}
            >
              {l}
            </button>
          );
        })}
      </div>

      <div className="mt-8 flex justify-between items-center px-2">
        <div className="flex flex-col">
          <span className="text-slate-500 text-[10px] font-black uppercase tracking-tighter">Intentos Fallidos</span>
          <span className={`text-xl font-black ${wrongGuesses >= 4 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {wrongGuesses} / {maxErrors}
          </span>
        </div>
        
        <div className="text-right">
          {isLost && (
            <div className="animate-pulse">
              <span className="text-rose-500 font-party text-xl block uppercase">¡Oh no!</span>
              <span className="text-slate-400 text-xs font-bold">Era: {target}</span>
            </div>
          )}
          {isWon && (
            <div className="animate-bounce">
              <span className="text-emerald-400 font-party text-3xl uppercase tracking-widest">¡CONSEGUIDO!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hangman;
