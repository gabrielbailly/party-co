
import React, { useState, useRef, useEffect } from 'react';
import { ChallengeType } from '../types';
import { sounds } from '../services/soundService';

interface WheelProps {
  onSpinEnd: (type: ChallengeType) => void;
  isSpinning: boolean;
}

export const CATEGORY_LABELS: Record<ChallengeType, string> = {
  [ChallengeType.MULTIPLE_CHOICE]: 'CULTURA',
  [ChallengeType.HANGMAN]: 'AHORCADO',
  [ChallengeType.MATCH_PAIRS]: 'PAREJAS',
  [ChallengeType.IMAGE_GUESS]: 'RETO VISUAL',
  [ChallengeType.PLAYER_TRIVIA]: 'COTILLEOS',
};

const BASE_CATEGORIES = [
  { type: ChallengeType.MULTIPLE_CHOICE, color: 'bg-rose-500' },
  { type: ChallengeType.HANGMAN, color: 'bg-emerald-500' },
  { type: ChallengeType.MATCH_PAIRS, color: 'bg-amber-500' },
  { type: ChallengeType.IMAGE_GUESS, color: 'bg-blue-500' },
  { type: ChallengeType.PLAYER_TRIVIA, color: 'bg-purple-500' },
];

// Double each category to get 10 interleaved slices
const FULL_CATEGORIES = [...BASE_CATEGORIES, ...BASE_CATEGORIES];

const Wheel: React.FC<WheelProps> = ({ onSpinEnd, isSpinning }) => {
  const [rotation, setRotation] = useState(0);
  const spinInterval = useRef<any>(null);

  const spin = () => {
    if (isSpinning) return;
    const newRotation = rotation + 1800 + Math.random() * 360;
    setRotation(newRotation);

    // Procedural sound while spinning
    let lastTick = 0;
    const startTime = Date.now();
    const duration = 3000;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed < duration) {
        // Linear increase in interval between ticks to simulate friction
        const progress = elapsed / duration;
        const currentInterval = 50 + progress * 400; 
        if (Date.now() - lastTick > currentInterval) {
          sounds.playSpin();
          lastTick = Date.now();
        }
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
    
    setTimeout(() => {
      const normalized = (360 - (newRotation % 360)) % 360;
      const sliceSize = 360 / FULL_CATEGORIES.length;
      const index = Math.floor(normalized / sliceSize);
      onSpinEnd(FULL_CATEGORIES[index].type);
    }, duration);
  };

  const sliceAngle = 360 / FULL_CATEGORIES.length;

  return (
    <div className="flex flex-col items-center gap-8 py-10">
      <div className="relative">
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-30 w-0 h-0 border-l-[15px] border-l-transparent border-r-[15px] border-r-transparent border-t-[25px] border-t-white drop-shadow-lg"></div>
        
        <div 
          className="w-72 h-72 sm:w-96 sm:h-96 rounded-full border-8 border-slate-700 shadow-2xl relative overflow-hidden transition-transform duration-[3000ms] cubic-bezier(0.15, 0, 0.15, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {FULL_CATEGORIES.map((cat, i) => (
            <div 
              key={`${cat.type}-${i}`}
              className={`absolute top-0 left-1/2 w-1/2 h-full origin-left flex items-start justify-center ${cat.color} border-l border-white/20`}
              style={{ 
                transform: `rotate(${i * sliceAngle}deg)`,
                clipPath: `polygon(0 0, 100% 0, 100% ${Math.tan((sliceAngle * Math.PI) / 180) * 100}%, 0 0)`
              }}
            >
              <div 
                className="text-white font-bold text-[10px] sm:text-xs uppercase tracking-widest text-center mt-12 w-24"
                style={{ transform: `rotate(${(sliceAngle / 2)}deg)` }}
              >
                {CATEGORY_LABELS[cat.type]}
              </div>
            </div>
          ))}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-slate-800 rounded-full border-4 border-white z-20 flex items-center justify-center">
             <div className="w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
          </div>
        </div>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning}
        className={`px-12 py-5 bg-yellow-400 hover:bg-yellow-300 disabled:bg-slate-600 text-slate-900 font-party text-4xl rounded-full shadow-[0_8px_0_rgb(161,98,7)] active:shadow-none active:translate-y-2 transition-all uppercase tracking-widest`}
      >
        {isSpinning ? 'Girando...' : '¡A JUGAR!'}
      </button>
    </div>
  );
};

export default Wheel;
