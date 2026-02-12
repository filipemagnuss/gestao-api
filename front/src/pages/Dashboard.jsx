import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabase';
import ConfirmModal from '../components/ConfirmModal';
import { 
  Check, ChevronLeft, ChevronRight, LogOut, 
  TrendingUp, TrendingDown, X, Wallet, Activity, Trash2 
} from 'lucide-react';

export default function Dashboard({ session }) {
  if (!session || !session.user) return null;

  // --- Estados ---
  const [bets, setBets] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Estados de Edição/Inserção
  const [val, setVal] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialBank, setInitialBank] = useState(1000);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [newBankVal, setNewBankVal] = useState("");
  
  const [confirmConfig, setConfirmConfig] = useState({ 
    isOpen: false, title: '', message: '', onConfirm: () => {} 
  });

  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  // --- Buscas e Cálculos ---
  const fetchBets = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('bets').select('*').eq('user_id', session.user.id);
      if (error) throw error;
      setBets(data || []);
    } catch (error) { console.error(error.message); }
  }, [session.user.id]);

  useEffect(() => { fetchBets(); }, [fetchBets]);

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const currentMonthBets = bets.filter(bet => {
    const d = new Date(bet.date);
    return d.getMonth() === currentDate.getMonth() && d.getFullYear() === currentDate.getFullYear();
  });

  const monthGreens = currentMonthBets.filter(b => Number(b.amount) >= 0).length;
  const monthReds = currentMonthBets.filter(b => Number(b.amount) < 0).length;
  const monthWinRate = (monthGreens + monthReds) > 0 ? (monthGreens / (monthGreens + monthReds)) * 100 : 0;
  
  const currentBank = initialBank + bets.reduce((acc, b) => acc + (Number(b.amount) || 0), 0);

  const handleDeleteBet = (id) => {
    setConfirmConfig({
      isOpen: true, title: "Apagar Operação?", message: "Esta ação removerá o registro permanentemente.",
      onConfirm: async () => { await supabase.from('bets').delete().eq('id', id); fetchBets(); }
    });
  };

  const handleClearMonth = () => {
    if (currentMonthBets.length === 0) return;
    setConfirmConfig({
      isOpen: true, title: `Limpar ${months[currentDate.getMonth()]}?`, message: `Apagar todas as operações deste mês?`,
      onConfirm: async () => {
        const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).toISOString();
        const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59).toISOString();
        await supabase.from('bets').delete().eq('user_id', session.user.id).gte('date', start).lte('date', end);
        fetchBets();
      }
    });
  };

  const handleSave = async () => {
    if (!val || !selectedDay) return;
    setLoading(true);
    try {
      const amount = parseFloat(val.replace(',', '.'));
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay, 12, 0, 0);
      await supabase.from('bets').insert([{ 
        user_id: session.user.id, 
        description: "Entrada", 
        amount, 
        status: amount >= 0 ? 'green' : 'red', 
        date: date.toISOString() 
      }]);
      setVal(""); fetchBets();
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#020617] font-sans text-gray-100">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="absolute top-1/4 -left-20 h-[500px] w-[500px] rounded-full bg-emerald-500/20 blur-[120px] animate-pulse z-0 pointer-events-none" />

      {/* Sidebar */}
      <aside className={`relative z-20 hidden md:flex flex-col justify-between bg-white/5 backdrop-blur-3xl border-r border-white/10 transition-all duration-500 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-24 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center z-30 shadow-lg hover:scale-110 transition-transform">
          {isSidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>

        {/* Topo Sidebar (Logo Ajustado) */}
        {/* CORREÇÃO AQUI: padding reduzido de p-8 para p-6 ou responsivo para evitar espremer o ícone */}
        <div className={`flex items-center border-b border-white/5 transition-all ${isSidebarOpen ? 'p-8 gap-4' : 'p-4 justify-center h-24'}`}>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 hover:rotate-6 transition-transform shadow-lg shadow-emerald-500/20">
            <Check className="text-[#020617]" size={28} strokeWidth={3} />
          </div>
          {isSidebarOpen && <h1 className="font-bold text-xl text-white animate-in fade-in slide-in-from-left-2">BetManager</h1>}
        </div>

        {/* Base Sidebar */}
        <div className="p-4 space-y-4">
          {/* Performance Chart */}
          <div className={`bg-white/[0.03] border border-white/10 rounded-[32px] p-3 flex items-center ${isSidebarOpen ? 'gap-4' : 'justify-center'}`}>
            <div className="relative w-12 h-12 shrink-0 rounded-full flex items-center justify-center hover:scale-110 transition-transform" style={{ background: `conic-gradient(#10b981 ${monthWinRate}%, #ef4444 0)` }}>
              <div className="absolute w-9 h-9 bg-[#070b1d] rounded-full flex items-center justify-center text-[9px] font-black">
                {monthGreens + monthReds > 0 ? `${monthWinRate.toFixed(0)}%` : '-'}
              </div>
            </div>
            {isSidebarOpen && <div className="animate-in fade-in"><p className="text-[10px] text-white/30 font-bold uppercase">Performance</p></div>}
          </div>

          {/* Card da Banca - CORREÇÃO DE TAMANHO */}
          <div onClick={() => isSidebarOpen && setIsEditingBank(true)} className={`rounded-[32px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 relative overflow-hidden group cursor-pointer hover:border-emerald-500/30 transition-all ${isSidebarOpen ? 'p-6' : 'p-4 flex justify-center items-center h-24'}`}>
             {isSidebarOpen ? (
               <div className="relative z-10">
                 <p className="text-[10px] text-white/40 font-black uppercase mb-1">Banca (clique p/ editar)</p>
                 {isEditingBank ? (
                   <input 
                    autoFocus 
                    value={newBankVal} 
                    onChange={e => setNewBankVal(e.target.value)} 
                    onBlur={() => { if(newBankVal) setInitialBank(parseFloat(newBankVal)); setIsEditingBank(false); }} 
                    onKeyDown={e => e.key === 'Enter' && (setInitialBank(parseFloat(newBankVal)) || setIsEditingBank(false))} 
                    className="bg-transparent border-b border-emerald-500 text-white text-2xl font-bold w-full outline-none" 
                    placeholder={initialBank.toString()} 
                   />
                 ) : (
                   <h2 className="font-bold text-white text-2xl tracking-tighter">R$ {currentBank.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
                 )}
               </div>
             ) : (
                // ÍCONE AUMENTADO E CENTRALIZADO
                <Wallet size={36} className="text-emerald-400 animate-pulse transition-transform group-hover:scale-125" />
             )}
             {isSidebarOpen && <div className="absolute -bottom-6 -right-6 text-white/5 transform rotate-12 group-hover:rotate-0 transition-transform"><Wallet size={80} /></div>}
          </div>
          
          {/* Botões de Ação */}
          <div className="grid gap-2">
            <button onClick={handleClearMonth} className={`group w-full flex items-center rounded-2xl border border-red-500/20 bg-red-500/5 text-red-400/60 transition-all ${isSidebarOpen ? 'p-4 gap-3' : 'p-3 justify-center h-14'}`}>
              <Trash2 size={22} className="shrink-0 group-hover:scale-110 group-hover:rotate-12 transition-all" />
              {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Limpar Mês</span>}
            </button>
            <button onClick={handleLogout} className={`group w-full flex items-center rounded-2xl border border-white/10 bg-white/5 text-white/40 transition-all ${isSidebarOpen ? 'p-4 gap-3' : 'p-3 justify-center h-14'}`}>
              <LogOut size={22} className="shrink-0 group-hover:translate-x-1 transition-all" />
              {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        {/* Header Carrossel */}
        <header className="h-32 flex flex-col justify-center px-10">
          <div className="flex overflow-x-auto gap-4 scrollbar-hide py-4 items-center">
            {months.map((m, i) => {
              const monthBetsTotal = bets
                .filter(b => new Date(b.date).getMonth() === i && new Date(b.date).getFullYear() === currentDate.getFullYear())
                .reduce((acc, b) => acc + (Number(b.amount) || 0), 0);
              
              const isSelected = currentDate.getMonth() === i;
              const hasValue = monthBetsTotal !== 0;
              <button>
                <a href="https://www.w3schools.com">Visit W3Schools</a>
              </button>

              return (
                <button key={m} onClick={() => { setCurrentDate(new Date(currentDate.getFullYear(), i, 1)); setSelectedDay(null); }} className={`flex-none w-28 h-16 rounded-[24px] border flex flex-col items-center justify-center transition-all duration-300 ${isSelected ? "bg-emerald-500 border-white/20 text-[#020617] scale-105 shadow-lg shadow-emerald-500/20" : "bg-white/5 border-white/5 text-white/30 hover:bg-white/10"}`}>
                  <span className="font-bold text-sm leading-none">{m}</span>
                  <div className="h-4 flex items-center mt-1">
                    {(hasValue || isSelected) && (
                      <span className={`text-[10px] font-black ${isSelected ? 'text-[#020617]/70' : (monthBetsTotal >= 0 ? 'text-emerald-400' : 'text-red-400')}`}>
                         {monthBetsTotal >= 0 ? (isSelected ? '' : '+') : ''}R$ {monthBetsTotal.toLocaleString('pt-BR', {minimumFractionDigits: 0})}
                      </span>
                    )}
                  </div>
                </button>
                
              );
            })}
          </div>
        </header>

        {/* Grid do Calendário */}
        <div className="flex-1 px-10 pb-10 overflow-y-auto">
          <div className="grid grid-cols-7 gap-4 text-center text-white/20 font-black text-[11px] uppercase tracking-[0.3em] mb-4">
            <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          <div className="grid grid-cols-7 gap-4 auto-rows-[minmax(130px,1fr)]">
            {[...Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay())].map((_, i) => <div key={i} />)}
            {[...Array(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate())].map((_, i) => {
               const day = i + 1;
               const dayBets = currentMonthBets.filter(b => new Date(b.date).getDate() === day);
               const total = dayBets.reduce((acc, b) => acc + Number(b.amount), 0);
               const has = dayBets.length > 0;
               return (
                 <div key={day} onClick={() => setSelectedDay(day)} className={`backdrop-blur-xl border rounded-[28px] p-4 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:scale-[1.03] relative overflow-hidden ${has ? (total >= 0 ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg" : "bg-red-500/10 border-red-500/30 shadow-lg") : "bg-white/[0.03] border-white/5 hover:border-white/20"}`}>
                    <div className="flex justify-between items-start z-10">
                      <span className={`text-2xl font-black ${has ? 'text-white' : 'text-white/10'}`}>{day}</span>
                      {has && <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border ${total >= 0 ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>{total >= 0 ? 'WIN' : 'LOSS'}</span>}
                    </div>
                    {has && (
                      <div className="text-right z-10 mt-auto">
                        <div className="flex items-center justify-end gap-1 text-[10px] text-white/50 font-bold mb-1"><Activity size={12} />{dayBets.length} ops</div>
                        <div className={`font-black text-lg ${total >= 0 ? "text-emerald-400" : "text-red-400"}`}>{total >= 0 ? '+' : ''}{total.toLocaleString('pt-BR')}</div>
                      </div>
                    )}
                    <div className={`absolute -bottom-10 -right-10 h-24 w-24 rounded-full blur-[50px] opacity-20 ${has ? (total >= 0 ? 'bg-emerald-400' : 'bg-red-400') : 'bg-white/5'}`} />
                 </div>
               );
            })}
          </div>
        </div>

        {selectedDay && (
           <>
             <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-40" onClick={() => setSelectedDay(null)}></div>
             <div className="fixed top-4 right-4 bottom-4 w-full md:w-[450px] bg-[#0b1221] border border-white/20 rounded-[45px] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-10">
                <div className="p-10 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div><h3 className="text-4xl font-black text-white">Dia {selectedDay}</h3><p className="text-xs text-emerald-400 uppercase font-black">{months[currentDate.getMonth()]}</p></div>
                    <button onClick={() => setSelectedDay(null)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-red-400 flex items-center justify-center transition-all"><X size={20} /></button>
                </div>
                
                <div className="flex-1 p-8 overflow-y-auto space-y-4">
                   {currentMonthBets.filter(b => new Date(b.date).getDate() === selectedDay).map((bet) => (
                      <div key={bet.id} className="group bg-white/5 p-5 rounded-[28px] border border-white/10 flex justify-between items-center hover:bg-white/[0.08] transition-all relative">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-full ${Number(bet.amount) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}><TrendingUp size={16} /></div>
                            <div className="font-bold text-white/90 text-sm">Operação</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`font-mono font-black text-lg ${Number(bet.amount) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{Number(bet.amount) >= 0 ? '+' : ''} R$ {Number(bet.amount).toFixed(2)}</span>
                          <button onClick={() => handleDeleteBet(bet.id)} className="opacity-30 group-hover:opacity-100 hover:text-red-400 text-white p-2 transition-all"><Trash2 size={16} /></button>
                        </div>
                      </div>
                   ))}
                </div>
                
                <div className="p-8 bg-black/40 border-t border-white/10 space-y-4">
                   <div className="relative">
                      <span className="absolute left-6 top-1/2 -translate-y-1/2 text-white/30 text-lg font-bold">R$</span>
                      <input type="text" placeholder="Ex: 50 ou -50" value={val} onChange={e => setVal(e.target.value)} className="w-full bg-[#020617]/50 border border-white/10 rounded-[24px] px-6 py-5 text-xl font-bold text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner" />
                   </div>
                   <button onClick={handleSave} disabled={loading} className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 py-5 rounded-[24px] font-black text-[#020617] uppercase text-xs active:scale-95 transition-all shadow-lg hover:brightness-110">Confirmar</button>
                </div>
             </div>
           </>
        )}

        <ConfirmModal 
          isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm}
          onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        />
      </main>
    </div>
  );
}