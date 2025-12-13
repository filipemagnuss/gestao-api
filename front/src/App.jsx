import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './supabase';

// Importando as páginas que criamos
import Home from './Home';
import Dashboard from './Dashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Verifica a sessão inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuta mudanças (Login/Logout) em tempo real
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Tela de carregamento enquanto o Supabase verifica se você existe
  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-950">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* ROTA PÚBLICA (LOGIN) */}
        {/* Se já tiver sessão, manda direto pro Dashboard. Se não, mostra a Home/Login */}
        <Route 
          path="/login" 
          element={!session ? <Home /> : <Navigate to="/" replace />} 
        />

        {/* ROTA PRIVADA (DASHBOARD) */}
        {/* Se tiver sessão, mostra o Dashboard. Se não, manda pro Login */}
        <Route 
          path="/" 
          element={session ? <Dashboard session={session} /> : <Navigate to="/login" replace />} 
        />

        {/* ROTA CORINGA (404) */}
        {/* Qualquer URL maluca redireciona para o início */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}