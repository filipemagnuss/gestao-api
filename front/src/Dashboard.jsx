import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';

// Usa a variável de ambiente do Vite ou cai para o localhost padrão
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5241/api/bets";

export default function Dashboard({ session }) {
  const [bets, setBets] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState(null);
  
  const [desc, setDesc] = useState("");
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("green");

  // FUNÇÃO DE LOGOUT
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchBets = useCallback(async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const myBets = data.filter(b => b.userId === session.user.id);
      setBets(myBets);
    } catch (error) { console.error("Erro:", error); }
  }, [session.user.id]);

  useEffect(() => { fetchBets(); }, [fetchBets]);

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  const getBetsForDay = (day) => {
    return bets.filter(bet => {
      const bDate = new Date(bet.createdAt);
      return bDate.getDate() === day && 
             bDate.getMonth() === currentDate.getMonth() && 
             bDate.getFullYear() === currentDate.getFullYear();
    });
  };

  const startBank = 1000;
  const totalPnL = bets.reduce((acc, b) => acc + b.amount, 0);
  const currentBank = startBank + totalPnL;
  
  const totalGreens = bets.filter(b => b.status === 'green').length;
  const totalReds = bets.filter(b => b.status === 'red').length;
  const totalBets = totalGreens + totalReds;
  const greenPercentage = totalBets > 0 ? (totalGreens / totalBets) * 100 : 0;

  const handleSave = async () => {
    if (!val || !desc) return alert("Preencha tudo!");
    let amount = parseFloat(val);
    if (status === 'red' && amount > 0) amount = -amount;
    if (status === 'green' && amount < 0) amount = Math.abs(amount);

    const specificDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay, 12, 0, 0);

    const newBet = {
      userId: session.user.id,
      description: desc,
      amount: amount,
      status: status,
      createdAt: specificDate.toISOString()
    };

    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newBet)
    });
    setDesc(""); setVal(""); fetchBets();
  };

  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);

  return (
    <div className="flex h-screen overflow-hidden text-gray-100 font-sans bg-[#020617]">
      
      {/* --- SIDEBAR (Visível apenas em Desktop) --- */}
      <aside className="w-72 hidden md:flex flex-col justify-between bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl relative z-20">
        <div>
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl shadow-lg ring-1 ring-white/20">
              <i className="fas fa-chart-pie text-white text-xl"></i>
            </div>
            <h1 className="font-bold text-2xl text-white/90">BetManager</h1>
          </div>
          <nav className="mt-8 px-4">
            <div className="flex items-center gap-4 px-4 py-3 bg-white/10 rounded-xl text-white border border-white/10 shadow-lg backdrop-blur-md">
              <i className="fas fa-calendar-day w-5 text-emerald-400"></i>
              <span className="font-medium">Dashboard</span>
            </div>
          </nav>
        </div>

        <div className="p-4 space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-lg">
             <div className="relative w-16 h-16 rounded-full flex items-center justify-center ring-4 ring-black/20"
                  style={{ background: `conic-gradient(#10b981 ${greenPercentage}%, #ef4444 0)` }}>
                <div className="absolute w-10 h-10 bg-slate-900/90 rounded-full flex items-center justify-center text-[10px] font-bold">
                   {totalBets > 0 ? `${greenPercentage.toFixed(0)}%` : '-'}
                </div>
             </div>
             <div>
                <div className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1">Win Rate</div>
                <div className="flex gap-3 text-xs font-bold text-emerald-400"> {totalGreens}W <span className="text-red-400">{totalReds}L</span></div>
             </div>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex justify-between items-start mb-2">
               <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Banca Atual</p>
               <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition cursor-pointer">
                 <i className="fas fa-sign-out-alt"></i>
               </button>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">R$ {currentBank.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
          </div>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col relative h-full">
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-white/0 z-10">
          <div className="flex items-center gap-6">
             <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 transition"><i className="fas fa-chevron-left"></i></button>
                <div className="px-4 font-bold text-white capitalize w-48 text-center">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</div>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 transition"><i className="fas fa-chevron-right"></i></button>
             </div>
          </div>
          
          <div className="flex items-center gap-4">
             <span className="text-sm text-white/40 hidden sm:block">{session.user.email}</span>
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-white/10 flex items-center justify-center text-white/80">
                  <i className="fas fa-user"></i>
                </div>
                {/* BOTÃO DE SAIR NO HEADER (Sempre Visível) */}
                <button 
                  onClick={handleLogout} 
                  className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                  title="Sair"
                >
                  <i className="fas fa-sign-out-alt"></i>
                </button>
             </div>
          </div>
        </header>

        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-7 gap-4 mb-2 text-center text-white/30 font-bold text-xs uppercase tracking-widest">
             <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          <div className="grid grid-cols-7 gap-3 pb-20 auto-rows-[minmax(110px,1fr)]">
            {[...Array(startDay)].map((_, i) => <div key={`empty-${i}`} className="bg-transparent"></div>)}

            {[...Array(daysInMonth)].map((_, i) => {
               const day = i + 1;
               const dayBets = getBetsForDay(day);
               const dayTotal = dayBets.reduce((acc, b) => acc + b.amount, 0);
               const hasBets = dayBets.length > 0;
               const isPositive = dayTotal >= 0;
               
               let style = "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20";
               if(hasBets) {
                   style = isPositive 
                     ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20" 
                     : "bg-red-500/10 border-red-500/30 hover:bg-red-500/20";
               }
               
               return (
                 <div key={day} onClick={() => setSelectedDay(day)} className={`${style} backdrop-blur-xl border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] relative h-32`}>
                    <span className={`text-xl font-bold ${hasBets ? 'text-white' : 'text-white/20'}`}>{day}</span>
                    <div className="text-right">
                      {hasBets ? (
                         <div className={`font-bold text-lg ${isPositive ? "text-emerald-400" : "text-red-400"}`}>R$ {Math.abs(dayTotal).toFixed(0)}</div>
                      ) : (
                        <i className="fas fa-plus text-white/5"></i>
                      )}
                    </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* --- MODAL / GAVETA --- */}
        {selectedDay && (
           <>
             <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setSelectedDay(null)}></div>
             <div className="fixed top-0 right-0 bottom-0 w-full md:w-96 bg-[#0f172a] border-l border-white/10 shadow-2xl z-50 flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center">
                   <div>
                      <h3 className="text-2xl font-bold text-white">Dia {selectedDay}</h3>
                      <p className="text-xs text-white/40 uppercase font-bold">{currentDate.toLocaleString('pt-BR', { month: 'long' })}</p>
                   </div>
                   <button onClick={() => setSelectedDay(null)} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/60"><i className="fas fa-times"></i></button>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-3">
                   {getBetsForDay(selectedDay).map((bet) => (
                      <div key={bet.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center">
                         <div>
                            <p className="font-medium text-white/90 text-sm">{bet.description}</p>
                            <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded ${bet.status === 'green' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{bet.status}</span>
                         </div>
                         <span className={`font-mono font-bold ${bet.status === 'green' ? 'text-emerald-400' : 'text-red-400'}`}>R$ {Math.abs(bet.amount).toFixed(2)}</span>
                      </div>
                   ))}
                </div>

                <div className="p-5 bg-black/30 border-t border-white/10 space-y-3">
                   <input type="text" placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"/>
                   <div className="flex gap-2">
                      <input type="number" placeholder="Valor" value={val} onChange={e => setVal(e.target.value)} className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500 outline-none"/>
                      <select value={status} onChange={e => setStatus(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 text-sm text-white font-bold">
                         <option value="green">Green</option>
                         <option value="red">Red</option>
                      </select>
                   </div>
                   <button onClick={handleSave} className="w-full bg-emerald-500 hover:bg-emerald-400 py-3 rounded-xl font-bold text-white shadow-lg">Adicionar</button>
                </div>
             </div>
           </>
        )}
      </main>
    </div>
  );
}