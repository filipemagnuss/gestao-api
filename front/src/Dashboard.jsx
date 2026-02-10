import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from './supabase';

export default function Dashboard({ session }) {
  // Impede o erro: Cannot read properties of undefined (reading 'user')
  if (!session || !session.user) return null;

  const [bets, setBets] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [desc, setDesc] = useState("");
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("green");

  const carouselRef = useRef(null);
  const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

  const handleLogout = async () => { await supabase.auth.signOut(); };

  const fetchBets = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('user_id', session.user.id);
      
      if (error) throw error;
      setBets(data || []);
    } catch (error) { 
      console.error("Erro ao carregar dados:", error.message); 
    }
  }, [session.user.id]);

  useEffect(() => { fetchBets(); }, [fetchBets]);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const selectMonth = (monthIndex) => {
    const newDate = new Date(currentDate.getFullYear(), monthIndex, 1);
    setCurrentDate(newDate);
  };

  const getBetsForDay = (day) => {
    return bets.filter(bet => {
      const bDate = new Date(bet.created_at);
      return bDate.getDate() === day && 
             bDate.getMonth() === currentDate.getMonth() && 
             bDate.getFullYear() === currentDate.getFullYear();
    });
  };

  // Cálculos de Banca
  const totalPnL = bets.reduce((acc, b) => acc + b.amount, 0);
  const currentBank = 1000 + totalPnL;
  const totalGreens = bets.filter(b => b.status === 'green').length;
  const totalReds = bets.filter(b => b.status === 'red').length;
  const totalBets = totalGreens + totalReds;
  const winRate = totalBets > 0 ? (totalGreens / totalBets) * 100 : 0;

  const handleSave = async () => {
    if (!val || !desc) return alert("Preencha descrição e valor!");
    let amount = parseFloat(val);
    if (status === 'red' && amount > 0) amount = -amount;
    if (status === 'green' && amount < 0) amount = Math.abs(amount);

    const specificDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay, 12, 0, 0);

    const { error } = await supabase
      .from('bets')
      .insert([{ 
        user_id: session.user.id, 
        description: desc, 
        amount: amount, 
        status: status, 
        created_at: specificDate.toISOString() 
      }]);

    if (error) {
      alert("Erro de banco: " + error.message);
    } else {
      setDesc(""); setVal(""); fetchBets();
    }
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);

  return (
    <div className="relative flex h-screen overflow-hidden bg-[#020617] font-sans text-gray-100">
      
      {/* Background Liquid FX */}
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="absolute top-[-15%] left-[-10%] h-[600px] w-[600px] rounded-full bg-emerald-500/15 blur-[120px] z-0" />
      <div className="absolute bottom-[-15%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-600/15 blur-[120px] z-0" />

      {/* Sidebar Liquid Glass */}
      <aside className={`relative z-20 hidden md:flex flex-col justify-between bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-2xl transition-all duration-500 ${isSidebarOpen ? 'w-72' : 'w-24'}`}>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="absolute -right-3 top-24 bg-emerald-500 text-white w-6 h-6 rounded-full flex items-center justify-center border border-white/20 z-30 shadow-lg">
          <i className={`fas ${isSidebarOpen ? 'fa-chevron-left' : 'fa-chevron-right'} text-[10px]`}></i>
        </button>

        <div className="p-8 flex items-center gap-4 border-b border-white/5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg">
            <i className="fas fa-check text-xl text-[#020617]"></i>
          </div>
          {isSidebarOpen && <h1 className="font-bold text-xl tracking-tight text-white animate-in fade-in duration-500">BetManager</h1>}
        </div>

        <div className="p-5 space-y-6">
          <div className="bg-white/[0.03] border border-white/10 rounded-[32px] p-5 flex items-center gap-4 backdrop-blur-md">
            <div className="relative w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                 style={{ background: `conic-gradient(#10b981 ${winRate}%, #ef4444 0)` }}>
              <div className="absolute w-10 h-10 bg-[#070b1d] rounded-full flex items-center justify-center text-[10px] font-black">
                {totalBets > 0 ? `${winRate.toFixed(0)}%` : '0%'}
              </div>
            </div>
            {isSidebarOpen && (
              <div className="animate-in fade-in duration-500 text-xs font-bold text-emerald-400">
                {totalGreens}W <span className="text-red-400">{totalReds}L</span>
              </div>
            )}
          </div>

          <div className="space-y-3">
            <div className="p-6 rounded-[32px] bg-gradient-to-br from-white/10 to-transparent border border-white/10 shadow-2xl relative overflow-hidden group">
               {isSidebarOpen && <p className="text-[10px] text-white/40 font-black uppercase tracking-tighter mb-1">Banca Total</p>}
               <h2 className={`font-bold text-white tracking-tighter ${isSidebarOpen ? 'text-2xl' : 'text-[10px]'}`}>
                 R$ {currentBank.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
               </h2>
            </div>
            <button onClick={handleLogout} className={`w-full flex items-center gap-3 p-4 rounded-2xl border border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 text-white/40 transition-all ${!isSidebarOpen && 'justify-center'}`}>
              <i className="fas fa-sign-out-alt"></i>
              {isSidebarOpen && <span className="text-xs font-black uppercase tracking-widest">Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      <main className="relative z-10 flex-1 flex flex-col h-full overflow-hidden">
        <header className="h-32 flex flex-col justify-center px-10 bg-transparent">
          <div ref={carouselRef} className="flex overflow-x-auto gap-4 scrollbar-hide py-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {months.map((month, index) => (
              <button key={month} onClick={() => selectMonth(index)}
                className={`flex-none px-8 py-3 rounded-[24px] font-bold transition-all border ${currentDate.getMonth() === index ? "bg-emerald-500 border-white/20 text-[#020617] shadow-lg scale-105" : "bg-white/5 border-white/5 text-white/30 hover:text-white"}`}>
                {month}
              </button>
            ))}
          </div>
        </header>

        <div className="flex-1 px-10 pb-10 overflow-y-auto">
          <div className="grid grid-cols-7 gap-6 mb-6 text-center text-white/20 font-black text-[11px] uppercase tracking-[0.3em]">
              <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>
          <div className="grid grid-cols-7 gap-4 auto-rows-[minmax(120px,1fr)]">
            {[...Array(startDay)].map((_, i) => <div key={`empty-${i}`}></div>)}
            {[...Array(daysInMonth)].map((_, i) => {
               const day = i + 1;
               const dayBets = getBetsForDay(day);
               const dayTotal = dayBets.reduce((acc, b) => acc + b.amount, 0);
               const hasBets = dayBets.length > 0;
               const isPositive = dayTotal >= 0;

               return (
                 <div key={day} onClick={() => setSelectedDay(day)} 
                      className={`backdrop-blur-xl border rounded-[35px] p-5 flex flex-col justify-between cursor-pointer transition-all duration-500 hover:scale-[1.05] relative overflow-hidden ${hasBets ? (isPositive ? "bg-emerald-500/10 border-emerald-500/30 shadow-lg" : "bg-red-500/10 border-red-500/30 shadow-lg") : "bg-white/[0.03] border-white/5 hover:border-white/20"}`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-2xl font-black ${hasBets ? 'text-white' : 'text-white/10'}`}>{day}</span>
                      {hasBets && (
                        <span className={`text-[8px] font-black px-2 py-1 rounded-full border ${isPositive ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>
                          {isPositive ? 'PROFIT' : 'LOSS'}
                        </span>
                      )}
                    </div>
                    {hasBets && (
                      <div className="text-right">
                        <span className="text-[9px] text-white/30 font-bold uppercase tracking-tighter">Lucro Diário</span>
                        <div className={`font-black text-xl ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                          {isPositive ? '+' : '-'} R$ {Math.abs(dayTotal).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    )}
                    <div className={`absolute -bottom-10 -right-10 h-20 w-20 rounded-full blur-[40px] opacity-20 ${hasBets ? (isPositive ? 'bg-emerald-400' : 'bg-red-400') : 'bg-white/5'}`} />
                 </div>
               );
            })}
          </div>
        </div>

        {/* Modal Liquid Glass */}
        {selectedDay && (
           <>
             <div className="fixed inset-0 bg-[#020617]/90 backdrop-blur-md z-40" onClick={() => setSelectedDay(null)}></div>
             <div className="fixed top-4 right-4 bottom-4 w-full md:w-[450px] bg-white/[0.07] backdrop-blur-[50px] border border-white/20 rounded-[45px] shadow-2xl z-50 flex flex-col overflow-hidden animate-in slide-in-from-right-10">
                <div className="p-10 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div>
                      <h3 className="text-4xl font-black text-white tracking-tighter">Dia {selectedDay}</h3>
                      <p className="text-xs text-emerald-400 uppercase font-black">{months[currentDate.getMonth()]}</p>
                    </div>
                    <button onClick={() => setSelectedDay(null)} className="w-12 h-12 rounded-full bg-white/5 border border-white/10 text-white/40 hover:text-red-400 transition-all"><i className="fas fa-times text-xl"></i></button>
                </div>
                <div className="flex-1 p-8 overflow-y-auto space-y-4">
                   {getBetsForDay(selectedDay).map((bet) => (
                      <div key={bet.id} className="bg-white/5 p-5 rounded-[28px] border border-white/10 flex justify-between items-center shadow-inner hover:bg-white/[0.08] transition-colors">
                         <div>
                            <p className="font-bold text-white/90 text-sm tracking-tight">{bet.description}</p>
                            <span className={`text-[9px] uppercase font-black px-2.5 py-1 rounded-full mt-2 inline-block ${bet.status === 'green' ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20' : 'bg-red-500/20 text-red-400 border-red-500/20'}`}>{bet.status}</span>
                         </div>
                         <span className={`font-mono font-black text-lg ${bet.status === 'green' ? 'text-emerald-400' : 'text-red-400'}`}>R$ {Math.abs(bet.amount).toFixed(2)}</span>
                      </div>
                   ))}
                </div>
                <div className="p-10 bg-black/40 border-t border-white/10 space-y-5">
                   <input type="text" placeholder="Qual foi a aposta?" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-[#020617]/50 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-emerald-500/50 outline-none shadow-inner"/>
                   <div className="flex gap-4">
                      <input type="number" placeholder="Valor" value={val} onChange={e => setVal(e.target.value)} className="flex-1 bg-[#020617]/50 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white focus:border-emerald-500/50 outline-none shadow-inner"/>
                      <select value={status} onChange={e => setStatus(e.target.value)} className="bg-[#020617]/50 border border-white/10 rounded-2xl px-4 text-xs text-white font-black uppercase outline-none cursor-pointer">
                         <option value="green" className="bg-[#0f172a]">Green</option>
                         <option value="red" className="bg-[#0f172a]">Red</option>
                      </select>
                   </div>
                   <button onClick={handleSave} className="w-full bg-gradient-to-r from-emerald-400 to-teal-500 py-5 rounded-[22px] font-black text-[#020617] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-widest text-xs">Salvar Resultado</button>
                </div>
             </div>
           </>
        )}
      </main>
    </div>
  );
}