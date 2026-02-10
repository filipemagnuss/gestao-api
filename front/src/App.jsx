import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import Login from './Login'; // Certifique-se de que o caminho está correto
import Dashboard from './Dashboard';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca a sessão inicial ao carregar o app
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Escuta mudanças na autenticação (Login/Logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#020617]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <>
      {!session ? <Login /> : <Dashboard session={session} />}
    </>
  );
}