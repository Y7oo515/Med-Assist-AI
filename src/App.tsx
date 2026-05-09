import { AuthProvider } from "./hooks/useAuth";
import { LangProvider } from "./hooks/useLang";
import AuthForm from "./components/AuthForm";
import Dashboard from "./components/Dashboard";
import { useAuth } from "./hooks/useAuth";

function AppContent() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return <Dashboard />;
}

function App() {
  return (
    <AuthProvider>
      <LangProvider>
        <AppContent />
      </LangProvider>
    </AuthProvider>
  );
}

export default App;
