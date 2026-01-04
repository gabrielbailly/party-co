
import React, { useEffect } from 'react';
import { Player } from '../types';
import { sounds } from '../services/soundService';

interface Props {
  players: Player[];
  onRestart: () => void;
}

const Podium: React.FC<Props> = ({ players, onRestart }) => {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  const first = sorted[0];
  const second = sorted[1];
  const third = sorted[2];

  useEffect(() => {
    sounds.playFinale();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in py-10">
      <h2 className="text-6xl font-party text-yellow-400 mb-12 uppercase tracking-widest drop-shadow-xl animate-bounce">
        ¡CLASIFICACIÓN FINAL!
      </h2>

      <div className="flex items-end justify-center gap-4 sm:gap-8 h-80 mb-12">
        {/* Segundo Puesto */}
        {second && (
          <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="mb-4 text-center">
              <p className="font-bold text-slate-300 text-lg">{second.name}</p>
              <p className="text-sm text-indigo-400 font-black">{second.score} PTS</p>
            </div>
            <div className="w-24 sm:w-32 bg-slate-500 h-32 rounded-t-2xl shadow-lg border-x-4 border-t-4 border-slate-400 flex items-center justify-center">
              <span className="text-4xl font-party text-slate-200">2º</span>
            </div>
          </div>
        )}

        {/* Primer Puesto */}
        {first && (
          <div className="flex flex-col items-center animate-slide-up">
            <div className="mb-4 text-center">
              <div className="text-4xl mb-2">👑</div>
              <p className="font-bold text-yellow-400 text-2xl">{first.name}</p>
              <p className="text-md text-indigo-300 font-black">{first.score} PTS</p>
            </div>
            <div className="w-28 sm:w-40 bg-yellow-500 h-48 rounded-t-2xl shadow-[0_0_30px_rgba(234,179,8,0.3)] border-x-4 border-t-4 border-yellow-300 flex items-center justify-center">
              <span className="text-6xl font-party text-yellow-900">1º</span>
            </div>
          </div>
        )}

        {/* Tercer Puesto */}
        {third && (
          <div className="flex flex-col items-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="mb-4 text-center">
              <p className="font-bold text-amber-700 text-lg">{third.name}</p>
              <p className="text-sm text-indigo-400 font-black">{third.score} PTS</p>
            </div>
            <div className="w-24 sm:w-32 bg-amber-700 h-24 rounded-t-2xl shadow-lg border-x-4 border-t-4 border-amber-600 flex items-center justify-center">
              <span className="text-4xl font-party text-amber-200">3º</span>
            </div>
          </div>
        )}
      </div>

      <div className="w-full max-w-md bg-slate-900/50 rounded-3xl p-6 mb-10 border border-white/5">
        <h3 className="text-slate-500 text-xs font-black uppercase tracking-[0.3em] mb-4 text-center">Resto de jugadores</h3>
        <div className="space-y-2">
          {sorted.slice(3).map((p, i) => (
            <div key={p.id} className="flex justify-between items-center px-4 py-2 bg-slate-800/50 rounded-xl">
              <span className="text-slate-400 font-bold">{i + 4}º {p.name}</span>
              <span className="text-indigo-400 font-black text-xs">{p.score} PTS</span>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={onRestart}
        className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-party text-2xl shadow-[0_6px_0_rgb(67,56,202)] active:shadow-none active:translate-y-1 transition-all"
      >
        NUEVA PARTIDA
      </button>
    </div>
  );
};

export default Podium;
