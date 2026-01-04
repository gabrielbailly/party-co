
import React, { useState, useEffect } from 'react';
import { MatchPairsChallenge } from '../../types';

interface Props {
  challenge: MatchPairsChallenge;
  onComplete: (success: boolean) => void;
}

const MatchPairs: React.FC<Props> = ({ challenge, onComplete }) => {
  const [leftItems, setLeftItems] = useState<{val: string, id: string}[]>([]);
  const [rightItems, setRightItems] = useState<{val: string, id: string}[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [selectedRight, setSelectedRight] = useState<string | null>(null);
  const [matches, setMatches] = useState<string[]>([]); // Array of IDs that are matched

  useEffect(() => {
    const lefts = challenge.pairs.map((p, i) => ({ val: p.left, id: `p-${i}` }));
    const rights = challenge.pairs.map((p, i) => ({ val: p.right, id: `p-${i}` }));
    setLeftItems([...lefts].sort(() => Math.random() - 0.5));
    setRightItems([...rights].sort(() => Math.random() - 0.5));
  }, [challenge]);

  useEffect(() => {
    if (selectedLeft && selectedRight) {
      if (selectedLeft === selectedRight) {
        setMatches(prev => [...prev, selectedLeft]);
        setSelectedLeft(null);
        setSelectedRight(null);
      } else {
        const timer = setTimeout(() => {
          setSelectedLeft(null);
          setSelectedRight(null);
        }, 800);
        return () => clearTimeout(timer);
      }
    }
  }, [selectedLeft, selectedRight]);

  useEffect(() => {
    if (matches.length === challenge.pairs.length && matches.length > 0) {
      setTimeout(() => onComplete(true), 1500);
    }
  }, [matches, challenge, onComplete]);

  return (
    <div className="max-w-3xl mx-auto p-6 bg-slate-800 rounded-2xl border-4 border-amber-500/50">
      <h3 className="text-xl font-bold mb-8 text-amber-300 text-center uppercase tracking-widest">Une las parejas correctas</h3>
      
      <div className="grid grid-cols-2 gap-8">
        <div className="space-y-4">
          {leftItems.map(item => (
            <button
              key={item.id + '-L'}
              disabled={matches.includes(item.id)}
              onClick={() => setSelectedLeft(item.id)}
              className={`w-full p-4 rounded-xl text-sm sm:text-base border-2 transition-all ${
                matches.includes(item.id) 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-500 opacity-50 line-through'
                  : selectedLeft === item.id 
                    ? 'bg-amber-500 text-white border-amber-300' 
                    : 'bg-slate-700 border-slate-600 hover:border-amber-400'
              }`}
            >
              {item.val}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {rightItems.map(item => (
            <button
              key={item.id + '-R'}
              disabled={matches.includes(item.id)}
              onClick={() => setSelectedRight(item.id)}
              className={`w-full p-4 rounded-xl text-sm sm:text-base border-2 transition-all ${
                matches.includes(item.id) 
                  ? 'bg-amber-500/20 border-amber-500 text-amber-500 opacity-50 line-through'
                  : selectedRight === item.id 
                    ? 'bg-amber-500 text-white border-amber-300' 
                    : 'bg-slate-700 border-slate-600 hover:border-amber-400'
              }`}
            >
              {item.val}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MatchPairs;
