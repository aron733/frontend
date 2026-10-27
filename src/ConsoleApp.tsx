import { useState, useEffect } from 'react';
import ConsoleLogin from './pages/ConsoleLogin';
import ConsoleDashboard from './pages/ConsoleDashboard';

export default function ConsoleApp() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('console_token'));

  useEffect(() => {
    const handleStorage = () => {
      setToken(localStorage.getItem('console_token'));
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  if (!token) {
    return <ConsoleLogin onLogin={(t) => { localStorage.setItem('console_token', t); setToken(t); }} />;
  }

  return <ConsoleDashboard token={token} onLogout={() => { localStorage.removeItem('console_token'); setToken(null); }} />;
}
