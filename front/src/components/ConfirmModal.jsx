// src/components/ConfirmModal.jsx
import { Trash2 } from 'lucide-react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-[#020617]/80 backdrop-blur-sm animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      
      {/* Card */}
      <div className="relative bg-[#0b1221] border border-white/10 p-8 rounded-[35px] shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-200">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-4 border border-red-500/20">
            <Trash2 size={28} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-white/50 leading-relaxed mb-8">{message}</p>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="flex-1 py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 text-white/60 font-bold text-xs uppercase tracking-widest transition-all">
              Cancelar
            </button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-3 px-4 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-500/20">
              Apagar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}