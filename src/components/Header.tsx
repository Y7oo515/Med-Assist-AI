import { Heart, LogOut, History, Plus, Globe } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useLang } from "../hooks/useLang";
import { t } from "../i18n";

interface HeaderProps {
  currentView: "consult" | "history";
  onViewChange: (view: "consult" | "history") => void;
}

export default function Header({ currentView, onViewChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const { lang, toggleLang, isRTL } = useLang();

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-sm">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                {t(lang, "appName")}
              </h1>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">
                {t(lang, "appSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm text-slate-500 hover:text-teal-600 hover:bg-teal-50 transition-all"
              title={t(lang, "language")}
            >
              <Globe className="w-4 h-4" />
              <span className="hidden sm:inline text-xs font-medium">
                {lang === "en" ? "عربي" : "EN"}
              </span>
            </button>

            <div className="hidden sm:flex bg-slate-100 rounded-lg p-0.5 mx-1">
              <button
                onClick={() => onViewChange("consult")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentView === "consult"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                {t(lang, "new")}
              </button>
              <button
                onClick={() => onViewChange("history")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  currentView === "history"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                <History className="w-3.5 h-3.5" />
                {t(lang, "history")}
              </button>
            </div>

            <div className="hidden sm:block text-xs text-slate-400 mx-1 max-w-[150px] truncate">
              {user?.email}
            </div>
            <button
              onClick={signOut}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-all"
              title={t(lang, "signOut")}
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t(lang, "signOut")}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
