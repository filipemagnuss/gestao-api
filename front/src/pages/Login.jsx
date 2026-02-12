import { useState } from 'react';
import { supabase } from '../supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [authError, setAuthError] = useState(null);

  const errorMessages = {
    'Invalid login credentials': 'E-mail ou senha incorretos.',
    'User already registered': 'Este e-mail já está cadastrado.',
    'Password should be at least 6 characters': 'A senha deve ter pelo menos 6 caracteres.',
    'Email not confirmed': 'Verifique seu e-mail para confirmar a conta.',
    'Signup disabled': 'O cadastro de novos usuários está desativado.',
    'Passwords do not match': 'As senhas não coincidem.'
  };

  const handleInputChange = (setter, value) => {
    setter(value);
    if (authError) setAuthError(null);
  };

  const toggleVisibility = () => setShowPassword(prev => !prev);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    if (!isLogin && password !== confirmPassword) {
      setAuthError(errorMessages['Passwords do not match']);
      setLoading(false);
      return;
    }

    try {
      const { error } = isLogin 
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password });

      if (error) {
        const msg = errorMessages[error.message] || error.message;
        setAuthError(msg);
      } else if (!isLogin) {
        alert("Sucesso! Verifique seu e-mail para confirmar o cadastro.");
        setIsLogin(true);
      }
    } catch (err) {
      setAuthError("Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#020617] p-4 font-sans text-gray-100 overflow-hidden">
      <style jsx>{`
        input::-ms-reveal,
        input::-ms-clear {
          display: none;
        }
      `}</style>

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
                onChange={(e) => handleInputChange(setEmail, e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 px-6 text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner placeholder:text-white/20"
                required
              />
            </div>

            <div className="relative space-y-1">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Senha" 
                value={password}
                onChange={(e) => handleInputChange(setPassword, e.target.value)}
                className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 ps-6 pe-12 text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner placeholder:text-white/20"
                required
              />
              <button 
                type="button"
                onClick={toggleVisibility}
                className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-white/40 hover:text-emerald-400 transition-colors z-20 outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff size={20} aria-hidden="true" />
                ) : (
                  <Eye size={20} aria-hidden="true" />
                )}
              </button>
            </div>

            {!isLogin && (
              <div className="relative space-y-1 animate-in slide-in-from-top-2 fade-in duration-300">
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Confirmar Senha" 
                  value={confirmPassword}
                  onChange={(e) => handleInputChange(setConfirmPassword, e.target.value)}
                  className="w-full rounded-2xl border border-white/5 bg-white/5 py-4 ps-6 pe-12 text-white outline-none focus:border-emerald-500/50 transition-all shadow-inner placeholder:text-white/20"
                  required
                />
                <button 
                  type="button"
                  onClick={toggleVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-white/40 hover:text-emerald-400 transition-colors z-20 outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff size={20} aria-hidden="true" />
                  ) : (
                    <Eye size={20} aria-hidden="true" />
                  )}
                </button>
              </div>
            )}

            {authError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold text-center animate-in fade-in zoom-in duration-300 flex items-center justify-center gap-2">
                <i className="fas fa-exclamation-circle"></i>
                <span>{authError}</span>
              </div>
            )}

            <button 
              disabled={loading}
              className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 py-4 font-black text-[#020617] shadow-lg hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-xs mt-4"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <i className="fas fa-circle-notch fa-spin"></i> Processando...
                </span>
              ) : (isLogin ? 'Entrar' : 'Cadastrar')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {
                setIsLogin(!isLogin);
                setAuthError(null);
                setConfirmPassword('');
              }}
              className="text-xs font-black uppercase tracking-widest text-emerald-400/60 hover:text-emerald-400 transition-colors outline-none"
            >
              {isLogin ? 'Criar uma conta nova' : 'Já tenho uma conta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}