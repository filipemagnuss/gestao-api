import { useState } from 'react';
import { supabase } from './supabase';

export default function Home() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  

  const [authError, setAuthError] = useState(null);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError(null); 

    if (!isLogin && password !== confirmPassword) {
      setAuthError("As senhas não coincidem!");
      return;
    }

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

    if (error) {
      const message = isLogin && error.message === "Invalid login credentials" 
        ? "E-mail ou senha incorretos" 
        : error.message;
      setAuthError(message);
    }
    
    setLoading(false);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#020617] p-4 font-sans text-gray-100">
      <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <style>{`
          input::-ms-reveal,
          input::-ms-clear {
            display: none;
          }
        `}</style>

        <div className="rounded-[40px] border border-white/20 bg-[#0f172a]/90 p-10 shadow-2xl backdrop-blur-3xl">
          
          <div className="mb-8 text-center">
            <div className="mb-6 flex justify-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-b from-emerald-400 to-emerald-600 shadow-[0_0_30px_rgba(16,185,129,0.5)]">
                <i className="fas fa-check text-3xl text-[#020617]"></i>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">BetManager</h1>
            <p className="text-xs text-white/40 font-medium">Gerenciador de bancas</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <input 
                type="email" 
                required 
                placeholder="Email" 
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className={`w-full rounded-2xl border ${authError ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} bg-[#1e293b]/50 py-4 px-6 text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner`} 
              />
            </div>

            <div className="relative group">
              <input 
                type={showPassword ? "text" : "password"} 
                required 
                placeholder="Senha" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className={`w-full rounded-2xl border ${authError ? 'border-red-500/50 bg-red-500/5' : 'border-white/10'} bg-[#1e293b]/50 py-4 pl-6 pr-14 text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner`} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 h-10 w-10 flex items-center justify-center text-white/30 hover:text-emerald-400 transition-colors"
              >
                <svg className="shrink-0 w-5 h-5" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {showPassword ? (
                    <>
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </>
                  ) : (
                    <>
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                      <line x1="2" x2="22" y1="2" y2="22" />
                    </>
                  )}
                </svg>
              </button>
            </div>

            {!isLogin && (
              <div className="relative group animate-in fade-in slide-in-from-top-2 duration-300">
                <input 
                  type={showPassword ? "text" : "password"} 
                  required 
                  placeholder="Confirmar Senha" 
                  value={confirmPassword} 
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-[#1e293b]/50 py-4 pl-6 pr-14 text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner" 
                />
              </div>
            )}

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl animate-in fade-in zoom-in duration-200">
                <svg className="w-5 h-5 text-red-500 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <span className="text-red-400 text-sm font-medium">
                  {authError}
                </span>
              </div>
            )}

            <button 
              disabled={loading} 
              className="mt-4 w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 font-bold text-white shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Processando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => { 
                setIsLogin(!isLogin); 
                setConfirmPassword(''); 
                setShowPassword(false); 
                setAuthError(null); 
              }} 
              className="text-sm font-medium text-emerald-400/80 hover:text-emerald-300 transition-colors"
            >
              {isLogin ? 'Criar uma conta nova' : 'Já tenho uma conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}