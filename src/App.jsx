import React from "react";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  // Check for required environment variables
  const checkEnvironmentVariables = () => {
    const missingVars = [];
    
    if (!import.meta.env.VITE_SUPABASE_URL) {
      missingVars.push('VITE_SUPABASE_URL');
    }
    if (!import.meta.env.VITE_SUPABASE_ANON_KEY) {
      missingVars.push('VITE_SUPABASE_ANON_KEY');
    }
    
    return missingVars;
  };

  const missingVariables = checkEnvironmentVariables();

  if (missingVariables.length > 0) {
    return (
      <div style={{ 
        padding: '2rem', 
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '600px',
        margin: '2rem auto',
        border: '2px solid #e53e3e',
        borderRadius: '8px',
        backgroundColor: '#fed7d7'
      }}>
        <h2 style={{ color: '#c53030', marginBottom: '1rem' }}>
          Configuration Error
        </h2>
        <p style={{ color: '#742a2a', marginBottom: '1rem' }}>
          The following required environment variables are missing:
        </p>
        <ul style={{ color: '#742a2a', marginBottom: '1rem' }}>
          {missingVariables.map((variable, index) => (
            <li key={index} style={{ marginBottom: '0.5rem' }}>
              <strong>{variable}</strong>
            </li>
          ))}
        </ul>
        <p style={{ color: '#742a2a', fontSize: '0.9rem' }}>
          Please add these environment variables to your Vercel project settings.
        </p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

export default App;
