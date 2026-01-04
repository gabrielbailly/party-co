
import React, { useState } from 'react';
import { ImageGuessChallenge } from '../../types';

interface Props {
  challenge: ImageGuessChallenge;
  onComplete: (success: boolean) => void;
}

const ImageGuess: React.FC<Props> = ({ challenge, onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const options = [...challenge.distractors, challenge.relatedPlayerName].sort(() => Math.random() - 0.5);

  const handleSelect = (name: string) => {
    if (showResult) return;
    setSelected(name);
    setShowResult(true);
    setTimeout(() => {
      onComplete(name === challenge.relatedPlayerName);
    }, 4000);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 rounded-2xl border-4 border-blue-500/50">
      <h3 className="text-xl font-bold mb-4 text-blue-300 text-center">¿A qué participante representa esta imagen?</h3>
      
      <div className="relative aspect-square w-full mb-6 rounded-xl overflow-hidden border-4 border-slate-700">
        {!challenge.imageUrl ? (
          <div className="flex items-center justify-center h-full bg-slate-900 animate-pulse">
            <span className="text-slate-500">Generando obra de arte...</span>
          </div>
        ) : (
          <img src={challenge.imageUrl} alt="AI Generated" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {options.map((name) => (
          <button
            key={name}
            onClick={() => handleSelect(name)}
            className={`p-4 rounded-xl font-bold border-2 transition-all ${
              showResult
                ? name === challenge.relatedPlayerName
                  ? 'bg-emerald-500 border-white text-white scale-105 z-10'
                  : name === selected
                    ? 'bg-rose-500 border-rose-300 text-white opacity-50'
                    : 'bg-slate-700 border-slate-600 opacity-30'
                : 'bg-slate-700 border-slate-600 hover:border-blue-400 hover:bg-slate-600'
            }`}
          >
            {name}
          </button>
        ))}
      </div>

      {showResult && (
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg animate-fade-in text-center">
          <p className="text-blue-300 font-bold mb-1">¡Exacto!</p>
          <p className="text-slate-400 text-sm italic">{challenge.description}</p>
        </div>
      )}
    </div>
  );
};

export default ImageGuess;
