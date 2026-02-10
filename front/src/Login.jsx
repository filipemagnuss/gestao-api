import { useState } from 'react';
import { supabase } from './supabase';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const { error } = isLogin 
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    if (error) {
      setAuthError(error.message);
    } else if (!isLogin) {
      alert("Verifique seu e-mail para confirmar o cadastro!");
    }
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#020617] p-4 font-sans text-gray-100 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[40px] border border-white/10 bg-white/5 p-10 shadow-2xl backdrop-blur-3xl">
          
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <i className="fas fa-check text-3xl text-[#020617]"></i>
              </div>
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-white">BetManager</h1>
            <p className="text-xs text-white/40 font-bold uppercase tracking-widest mt-2">Gestão de Banca</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-1">
              <input 
                type="email" 
                placeholder="E-mail" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-6 text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                required
              />
            </div>

            <div className="space-y-1">
              <input 
                type="password" 
                placeholder="Senha" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-6 text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner"
                required
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-in fade-in zoom-in duration-300">
                {authError}
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 font-black text-[#020617] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 uppercase tracking-widest text-xs mt-4"
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs font-black uppercase tracking-widest text-emerald-400/60 hover:text-emerald-400 transition-colors"
            >
              {isLogin ? 'Criar uma conta nova' : 'Já tenho uma conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}