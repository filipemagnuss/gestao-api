import { useState } from 'react';
import { supabase } from './supabase';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    let error;
    if (isLogin) {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      error = signInError;
    } else {
      const { error: signUpError } = await supabase.auth.signUp({ email, password });
      error = signUpError;
      if (!error) alert("Conta criada! Verifique seu email.");
    }
    if (error) alert(error.message);
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden font-sans text-gray-100">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-600/30 blur-[120px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 translate-x-1/2 rounded-full bg-blue-600/20 blur-[120px] animate-pulse"></div>
      
      {/* Glass Card */}
      <div className="relative z-10 w-full max-w-md p-8 mx-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 relative overflow-hidden">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-lg ring-1 ring-white/20">
              <i className="fas fa-chart-line text-2xl text-white"></i>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">BetManager</h1>
            <p className="text-white/40 text-sm">Gerencie sua banca com estilo</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="relative group">
              <i className="fas fa-envelope absolute left-4 top-4 text-white/30 text-sm group-focus-within:text-emerald-400 transition-colors"></i>
              <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-10 pr-4 text-white outline-none focus:border-emerald-500/50 focus:bg-black/30 transition-all" />
            </div>
            <div className="relative group">
              <i className="fas fa-lock absolute left-4 top-4 text-white/30 text-sm group-focus-within:text-emerald-400 transition-colors"></i>
              <input type="password" required placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-10 pr-4 text-white outline-none focus:border-emerald-500/50 focus:bg-black/30 transition-all" />
            </div>
            <button disabled={loading} className="w-full rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 py-3.5 font-bold text-white shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all">
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Criar Conta')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button onClick={() => setIsLogin(!isLogin)} className="text-sm text-emerald-400 hover:text-emerald-300 font-semibold hover:underline">
              {isLogin ? 'Criar uma conta nova' : 'Já tenho conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}