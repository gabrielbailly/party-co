
import React, { useState } from 'react';
import { MultipleChoiceChallenge } from '../../types';

interface Props {
  challenge: MultipleChoiceChallenge;
  onComplete: (success: boolean) => void;
}

const MultipleChoice: React.FC<Props> = ({ challenge, onComplete }) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  const handleSelect = (option: string) => {
    if (showResult) return;
    setSelected(option);
    setShowResult(true);
    setTimeout(() => {
      onComplete(option === challenge.correctAnswer);
    }, 3000);
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-800 rounded-2xl shadow-xl border-4 border-rose-500/50">
      <h3 className="text-2xl font-bold mb-6 text-rose-300">{challenge.question}</h3>
      <div className="grid gap-4">
        {challenge.options.map((opt) => (
          <button
            key={opt}
            onClick={() => handleSelect(opt)}
            className={`p-4 text-left rounded-xl border-2 transition-all ${
              showResult
                ? opt === challenge.correctAnswer
                  ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                  : opt === selected
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 opacity-50'
                  : 'bg-slate-700/50 border-slate-600 opacity-30'
                : 'bg-slate-700 border-slate-600 hover:border-rose-400 hover:bg-slate-600'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
      {showResult && (
        <div className="mt-6 p-4 bg-slate-900/50 rounded-lg animate-bounce">
          <p className="text-slate-300 italic text-sm">"{challenge.explanation}"</p>
        </div>
      )}
    </div>
  );
};

export default MultipleChoice;
