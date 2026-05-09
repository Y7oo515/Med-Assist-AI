import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useLang } from "../hooks/useLang";
import { t } from "../i18n";
import { Heart, Mail, Lock, ArrowRight, AlertCircle, Globe } from "lucide-react";

export default function AuthForm() {
  const { signIn, signUp } = useAuth();
  const { lang, toggleLang, isRTL } = useLang();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = isLogin
      ? await signIn(email, password)
      : await signUp(email, password);

    if (result.error) {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/40 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Language Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLang}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <Globe className="w-4 h-4" />
            {lang === "en" ? "العربية" : "English"}
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/25 mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {t(lang, "appName")}
          </h1>
          <p className="text-slate-500 mt-2">
            {t(lang, "appSubtitle")}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8">
          <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setIsLogin(true); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                isLogin
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t(lang, "signIn")}
            </button>
            <button
              onClick={() => { setIsLogin(false); setError(null); }}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                !isLogin
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t(lang, "createAccount")}
            </button>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 mb-4 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t(lang, "email")}
              </label>
              <div className="relative">
                <Mail className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? "right-3" : "left-3"}`} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                  placeholder={t(lang, "emailPlaceholder")}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                {t(lang, "password")}
              </label>
              <div className="relative">
                <Lock className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 ${isRTL ? "right-3" : "left-3"}`} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className={`w-full ${isRTL ? "pr-10 pl-4" : "pl-10 pr-4"} py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all`}
                  placeholder={t(lang, "passwordPlaceholder")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-medium shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:from-teal-500 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {isLogin ? t(lang, "signIn") : t(lang, "createAccount")}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          {t(lang, "authDisclaimer")}
        </p>
      </div>
    </div>
  );
}
