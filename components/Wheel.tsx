
import React, { useState, useRef } from 'react';
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
  [ChallengeType.IMAGE_GUESS]: 'IMAGEN',
  [ChallengeType.PLAYER_TRIVIA]: 'COTILLEOS',
};

const CATEGORY_COLORS: Record<ChallengeType, string> = {
  [ChallengeType.MULTIPLE_CHOICE]: '#ef4444', // Rojo
  [ChallengeType.HANGMAN]: '#facc15',        // Amarillo
  [ChallengeType.MATCH_PAIRS]: '#93c5fd',     // Celeste
  [ChallengeType.IMAGE_GUESS]: '#3b82f6',     // Azul
  [ChallengeType.PLAYER_TRIVIA]: '#f8fafc',   // Blanco/Hueso
};

const BASE_CATEGORIES = [
  ChallengeType.MULTIPLE_CHOICE,
  ChallengeType.HANGMAN,
  ChallengeType.MATCH_PAIRS,
  ChallengeType.IMAGE_GUESS,
  ChallengeType.PLAYER_TRIVIA,
];

// 10 sectores
const FULL_CATEGORIES = [...BASE_CATEGORIES, ...BASE_CATEGORIES];

const Wheel: React.FC<WheelProps> = ({ onSpinEnd, isSpinning }) => {
  const [rotation, setRotation] = useState(0);

  const spin = () => {
    if (isSpinning) return;
    const extraTurns = 5 + Math.floor(Math.random() * 5);
    const extraDegrees = Math.random() * 360;
    const totalRotation = rotation + (extraTurns * 360) + extraDegrees;
    
    setRotation(totalRotation);

    const duration = 4000;
    const startTime = Date.now();
    let lastSoundProgress = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;
      
      if (progress < 1) {
        // Sonido de "click" basado en la velocidad de rotación
        const currentRotation = rotation + (totalRotation - rotation) * (1 - Math.pow(1 - progress, 3));
        const sliceProgress = (currentRotation % 36) / 36;
        
        if (sliceProgress < lastSoundProgress) {
          sounds.playSpin();
        }
        lastSoundProgress = sliceProgress;
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
    
    setTimeout(() => {
      const finalAngle = totalRotation % 360;
      // En SVG el 0 está a la derecha, queremos el 0 arriba (270 grados en sentido horario)
      // Ajuste para encontrar qué slice está arriba
      const normalizedAngle = (360 - finalAngle + 270) % 360;
      const sliceSize = 360 / FULL_CATEGORIES.length;
      const index = Math.floor(normalizedAngle / sliceSize);
      onSpinEnd(FULL_CATEGORIES[index]);
    }, duration);
  };

  const sliceAngle = 360 / FULL_CATEGORIES.length;

  return (
    <div className="flex flex-col items-center gap-10 py-6">
      <div className="relative w-80 h-80 sm:w-[450px] sm:h-[450px]">
        {/* Puntero Superior */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-50">
          <svg width="40" height="50" viewBox="0 0 40 50">
            <path d="M20 50 L5 15 A15 15 0 1 1 35 15 Z" fill="#ef4444" stroke="#ffffff" strokeWidth="2" />
            <circle cx="20" cy="15" r="5" fill="#ffffff" />
          </svg>
        </div>

        {/* Ruleta SVG */}
        <svg 
          viewBox="0 0 100 100" 
          className="w-full h-full drop-shadow-2xl transition-transform duration-[4000ms] cubic-bezier(0.15, 0, 0.15, 1)"
          style={{ transform: `rotate(${rotation}deg)` }}
        >
          {/* Anillo Exterior Azul con Puntos */}
          <circle cx="50" cy="50" r="48" fill="#1e3a8a" stroke="#1e40af" strokeWidth="2" />
          {[...Array(20)].map((_, i) => (
            <circle 
              key={i}
              cx={50 + 45 * Math.cos((i * 18 * Math.PI) / 180)}
              cy={50 + 45 * Math.sin((i * 18 * Math.PI) / 180)}
              r="1.2"
              fill={i % 2 === 0 ? "#facc15" : "#ef4444"}
            />
          ))}

          {/* Sectores */}
          {FULL_CATEGORIES.map((type, i) => {
            const startAngle = i * sliceAngle;
            const endAngle = (i + 1) * sliceAngle;
            const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
            const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
            const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
            const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
            
            return (
              <g key={i}>
                <path 
                  d={`M 50 50 L ${x1} ${y1} A 40 40 0 0 1 ${x2} ${y2} Z`}
                  fill={CATEGORY_COLORS[type]}
                  stroke="#1e3a8a"
                  strokeWidth="0.5"
                />
                <text
                  x="72"
                  y="50"
                  fill={type === ChallengeType.PLAYER_TRIVIA ? "#1e3a8a" : "#ffffff"}
                  fontSize="3"
                  fontWeight="bold"
                  textAnchor="middle"
                  transform={`rotate(${startAngle + sliceAngle / 2}, 50, 50)`}
                  className="font-party tracking-tighter"
                  style={{ textShadow: type === ChallengeType.PLAYER_TRIVIA ? 'none' : '0.5px 0.5px 0px rgba(0,0,0,0.5)' }}
                >
                  {CATEGORY_LABELS[type]}
                </text>
              </g>
            );
          })}

          {/* Centro con Estrella */}
          <circle cx="50" cy="50" r="10" fill="#1e40af" stroke="#ffffff" strokeWidth="1" />
          <path 
            d="M 50 43 L 52 47 L 57 47 L 53 50 L 55 55 L 50 52 L 45 55 L 47 50 L 43 47 L 48 47 Z"
            fill="#ffffff"
          />
        </svg>
      </div>

      <button
        onClick={spin}
        disabled={isSpinning}
        className="group relative inline-flex items-center justify-center px-16 py-6 font-party text-4xl text-slate-900 transition-all duration-200 bg-yellow-400 rounded-full shadow-[0_10px_0_rgb(161,98,7)] hover:bg-yellow-300 active:shadow-none active:translate-y-2 disabled:bg-slate-600 disabled:shadow-none"
      >
        <span className="relative uppercase tracking-widest">{isSpinning ? 'Girando...' : '¡GIRAR!'}</span>
      </button>
    </div>
  );
};

export default Wheel;
