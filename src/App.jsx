import React, { useState, useEffect } from "react";
import Routes from "./Routes";
import { AuthProvider } from "./contexts/AuthContext";

function App() {
  const [error, setError] = useState(null);
  const [envVars, setEnvVars] = useState({});

  useEffect(() => {
    // Check for required environment variables
    const checkEnvironmentVariables = () => {
      const vars = {
        VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
        VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
      };
      setEnvVars(vars);

      const missingVars = Object.entries(vars)
        .filter(([_, value]) => !value)
        .map(([key, _]) => key);

      if (missingVars.length > 0) {
        setError(`Missing environment variables: ${missingVars.join(", ")}`);
      }

      // Log for debugging
      console.log("✅ App.jsx initialized");
      console.log("📦 Environment variables check:", {
        VITE_SUPABASE_URL: vars.VITE_SUPABASE_URL ? "✅ SET" : "❌ MISSING",
        VITE_SUPABASE_ANON_KEY: vars.VITE_SUPABASE_ANON_KEY ? "✅ SET" : "❌ MISSING",
      });
    };

    try {
      checkEnvironmentVariables();
    } catch (err) {
      setError(`Error checking environment: ${err.message}`);
      console.error("❌ Error in environment check:", err);
    }
  }, []);

  if (error) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          backgroundColor: "#fef2f2",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "2rem",
        }}
      >
        <div
          style={{
            backgroundColor: "#ffffff",
            border: "3px solid #dc2626",
            borderRadius: "12px",
            padding: "2rem",
            maxWidth: "600px",
            boxShadow: "0 10px 15px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h1
            style={{
              fontSize: "1.875rem",
              fontWeight: "bold",
              color: "#dc2626",
              marginBottom: "1rem",
              margin: 0,
            }}
          >
            ⚠️ Configuration Error
          </h1>
          <p
            style={{
              color: "#7f1d1d",
              marginBottom: "1rem",
              fontSize: "1rem",
              lineHeight: "1.5",
            }}
          >
            {error}
          </p>
          <div
            style={{
              backgroundColor: "#fee2e2",
              border: "1px solid #fca5a5",
              borderRadius: "8px",
              padding: "1rem",
              marginBottom: "1rem",
              fontSize: "0.875rem",
            }}
          >
            <strong style={{ color: "#7f1d1d" }}>
              What to do:
            </strong>
            <ol
              style={{
                color: "#7f1d1d",
                marginTop: "0.5rem",
                paddingLeft: "1.25rem",
              }}
            >
              <li>Go to Vercel Dashboard</li>
              <li>Select "Basic-Intelligence-AI-School" project</li>
              <li>Go to Settings → Environment Variables</li>
              <li>Add the missing variables with their values</li>
              <li>Redeploy the application</li>
            </ol>
          </div>
          <p
            style={{
              color: "#7f1d1d",
              fontSize: "0.875rem",
              marginBottom: 0,
            }}
          >
            For support, contact:{" "}
            <strong>support@basicai.fit</strong>
          </p>
        </div>
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
