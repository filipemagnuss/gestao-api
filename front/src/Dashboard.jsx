import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const API_URL = "http://localhost:5241/api/bets";

export default function Dashboard({ session }) {
  const [bets, setBets] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date()); // Data atual do calendário
  const [selectedDay, setSelectedDay] = useState(null);
  
  // Form States
  const [desc, setDesc] = useState("");
  const [val, setVal] = useState("");
  const [status, setStatus] = useState("green");

  useEffect(() => { fetchBets(); }, []);

  const fetchBets = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      const myBets = data.filter(b => b.userId === session.user.id);
      setBets(myBets);
    } catch (error) { console.error("Erro:", error); }
  };

  // --- LÓGICA DO CALENDÁRIO ---
  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1);
    setCurrentDate(newDate);
  };

  // --- LÓGICA DE DADOS ---
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
  
  // Estatísticas Gerais (Para o Gráfico)
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

  // Dias do mês atual para renderizar
  const daysInMonth = getDaysInMonth(currentDate);
  const startDay = getFirstDayOfMonth(currentDate);

  return (
    <div className="flex h-screen overflow-hidden text-gray-100 font-sans">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-72 hidden md:flex flex-col justify-between bg-white/5 backdrop-blur-xl border-r border-white/10 shadow-2xl relative z-20">
        <div>
          <div className="p-8 flex items-center gap-4 border-b border-white/5">
            <div className="p-2 bg-gradient-to-tr from-emerald-500 to-teal-600 rounded-xl shadow-lg ring-1 ring-white/20"><i className="fas fa-chart-pie text-white text-xl"></i></div>
            <h1 className="font-bold text-2xl text-white/90">BetManager</h1>
          </div>
          <nav className="mt-8 px-4">
            <a href="#" className="flex items-center gap-4 px-4 py-3 bg-white/10 rounded-xl text-white border border-white/10 shadow-lg backdrop-blur-md">
              <i className="fas fa-calendar-day w-5 text-emerald-400"></i><span className="font-medium">Dashboard</span>
            </a>
          </nav>
        </div>

        {/* ÁREA INFERIOR: GRÁFICO + BANCA */}
        <div className="p-4 space-y-4">
          
          {/* GRÁFICO CIRCULAR (Donut Chart CSS) */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md flex items-center gap-4 shadow-lg">
             <div className="relative w-16 h-16 rounded-full flex items-center justify-center shadow-inner ring-4 ring-black/20"
                  style={{ background: `conic-gradient(#10b981 ${greenPercentage}%, #ef4444 0)` }}>
                <div className="absolute w-10 h-10 bg-slate-900/90 rounded-full flex items-center justify-center text-[10px] font-bold">
                   {totalBets > 0 ? `${greenPercentage.toFixed(0)}%` : '-'}
                </div>
             </div>
             <div>
                <div className="text-xs text-white/50 uppercase font-bold tracking-wider mb-1">Performance</div>
                <div className="flex gap-3 text-xs font-bold">
                   <span className="text-emerald-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {totalGreens} Wins</span>
                   <span className="text-red-400 flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div> {totalReds} Loss</span>
                </div>
             </div>
          </div>

          {/* Card da Banca */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-md shadow-lg relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div className="flex justify-between items-start mb-2">
               <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Banca Atual</p>
               <button onClick={() => supabase.auth.signOut()} className="text-white/30 hover:text-red-400 transition"><i className="fas fa-sign-out-alt"></i></button>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">R$ {currentBank.toLocaleString('pt-BR', {minimumFractionDigits: 2})}</h2>
            <div className={`inline-flex items-center gap-2 px-2 py-1 rounded-lg text-[10px] font-bold border border-white/5 ${totalPnL >= 0 ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                <i className={`fas fa-arrow-${totalPnL >= 0 ? 'up' : 'down'}`}></i>
                <span>{totalPnL >= 0 ? '+' : ''}{totalPnL.toFixed(2)} Total</span>
            </div>
          </div>
        </div>
      </aside>

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <main className="flex-1 flex flex-col relative h-full bg-radial-gradient">
        
        {/* HEADER / NAVEGAÇÃO DE DATA */}
        <header className="h-20 flex items-center justify-between px-8 border-b border-white/5 bg-white/0 z-10">
          <div className="flex items-center gap-6">
             <div className="flex items-center bg-white/5 rounded-xl border border-white/10 p-1">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"><i className="fas fa-chevron-left"></i></button>
                <div className="px-4 font-bold text-white capitalize w-40 text-center">{currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}</div>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition"><i className="fas fa-chevron-right"></i></button>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <span className="text-sm text-white/40 hidden sm:block">{session.user.email}</span>
             <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 border border-white/10 flex items-center justify-center text-white/80 shadow-inner">
               <i className="fas fa-user"></i>
             </div>
          </div>
        </header>

        {/* GRID DO CALENDÁRIO */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="grid grid-cols-7 gap-4 mb-2 text-center text-white/30 font-bold text-xs uppercase tracking-widest">
             <div>Dom</div><div>Seg</div><div>Ter</div><div>Qua</div><div>Qui</div><div>Sex</div><div>Sáb</div>
          </div>

          <div className="grid grid-cols-7 gap-3 pb-20 auto-rows-[minmax(100px,1fr)]">
            {/* Espaços vazios do início do mês */}
            {[...Array(startDay)].map((_, i) => <div key={`empty-${i}`} className="bg-white/0"></div>)}

            {/* Dias do Mês */}
            {[...Array(daysInMonth)].map((_, i) => {
               const day = i + 1;
               const dayBets = getBetsForDay(day);
               const dayTotal = dayBets.reduce((acc, b) => acc + b.amount, 0);
               const hasBets = dayBets.length > 0;
               const isPositive = dayTotal >= 0;
               const wins = dayBets.filter(b => b.status === 'green').length;
               const losses = dayBets.filter(b => b.status === 'red').length;
               
               // Crescimento % do dia (Baseado na banca atual para simplificar visualização)
               const growth = currentBank > 0 ? ((dayTotal / currentBank) * 100).toFixed(1) : 0;

               let style = "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/20";
               let textColor = "text-white/40";
               
               if(hasBets) {
                   style = isPositive 
                     ? "bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                     : "bg-red-500/10 border-red-500/30 hover:bg-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
                   textColor = isPositive ? "text-emerald-400" : "text-red-400";
               }
               
               return (
                 <div key={day} onClick={() => setSelectedDay(day)} className={`${style} backdrop-blur-xl border rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02] relative group overflow-hidden h-32`}>
                    <div className="flex justify-between items-start z-10">
                      <span className={`text-xl font-bold ${hasBets ? 'text-white' : 'text-white/20'}`}>{day}</span>
                      {hasBets && (
                         <div className="flex gap-1">
                            {wins > 0 && <span className="text-[9px] font-bold bg-emerald-500 text-black px-1.5 rounded-sm">{wins}W</span>}
                            {losses > 0 && <span className="text-[9px] font-bold bg-red-500 text-white px-1.5 rounded-sm">{losses}L</span>}
                         </div>
                      )}
                    </div>
                    
                    <div className="text-right z-10 relative">
                      {hasBets ? (
                        <>
                           <div className="text-[10px] text-white/50 mb-0.5">{growth > 0 ? '+' : ''}{growth}%</div>
                           <div className={`font-bold text-lg leading-tight ${textColor}`}>R$ {Math.abs(dayTotal).toFixed(0)}</div>
                        </>
                      ) : (
                        <i className="fas fa-plus absolute bottom-3 right-3 text-white/20 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"></i>
                      )}
                    </div>
                 </div>
               );
            })}
          </div>
        </div>

        {/* --- SIDE PANEL (GAVETA) --- */}
        {selectedDay && (
           <>
             <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setSelectedDay(null)}></div>
             <div className="absolute top-3 right-3 bottom-3 w-full md:w-96 rounded-3xl bg-slate-900/90 backdrop-blur-2xl border border-white/10 shadow-2xl z-50 flex flex-col animate-slide-in overflow-hidden ring-1 ring-white/5">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                   <div>
                      <h3 className="text-2xl font-bold text-white drop-shadow-md">Dia {selectedDay}</h3>
                      <p className="text-xs text-white/40 uppercase font-bold tracking-widest">{currentDate.toLocaleString('pt-BR', { month: 'long' })}</p>
                   </div>
                   <button onClick={() => setSelectedDay(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 transition"><i className="fas fa-times"></i></button>
                </div>
                
                <div className="flex-1 p-6 overflow-y-auto space-y-3">
                   {getBetsForDay(selectedDay).length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-white/20">
                          <i className="fas fa-ghost text-4xl mb-3 opacity-50"></i><p>Vazio</p>
                      </div>
                   ) : (
                      getBetsForDay(selectedDay).map((bet) => (
                        <div key={bet.id} className="bg-white/5 p-3 rounded-xl border border-white/5 flex justify-between items-center hover:bg-white/10 transition group">
                           <div>
                              <p className="font-medium text-white/90 text-sm">{bet.description}</p>
                              <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded border border-white/5 ${bet.status === 'green' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{bet.status}</span>
                           </div>
                           <span className={`font-mono font-bold ${bet.status === 'green' ? 'text-emerald-400' : 'text-red-400'}`}>R$ {Math.abs(bet.amount).toFixed(2)}</span>
                        </div>
                      ))
                   )}
                </div>

                <div className="p-5 bg-black/30 border-t border-white/10 backdrop-blur-xl space-y-3">
                   <div className="relative group">
                      <i className="fas fa-pen absolute left-4 top-3.5 text-white/30 text-xs"></i>
                      <input type="text" placeholder="Descrição" value={desc} onChange={e => setDesc(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none transition-all"/>
                   </div>
                   <div className="flex gap-2">
                      <div className="relative flex-1">
                         <span className="absolute left-4 top-3.5 text-white/30 text-xs">R$</span>
                         <input type="number" placeholder="0" value={val} onChange={e => setVal(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none font-mono"/>
                      </div>
                      <select value={status} onChange={e => setStatus(e.target.value)} className="bg-black/40 border border-white/10 rounded-xl px-3 py-3 text-sm text-white outline-none cursor-pointer focus:border-emerald-500/50 appearance-none font-bold text-center w-24">
                         <option value="green" className="text-black">Green</option>
                         <option value="red" className="text-black">Red</option>
                      </select>
                   </div>
                   <button onClick={handleSave} className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 py-3 rounded-xl font-bold text-white text-sm shadow-lg transition-all active:scale-95 border border-white/10">Adicionar</button>
                </div>
             </div>
           </>
        )}
      </main>
    </div>
  );
}