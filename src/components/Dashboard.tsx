import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "../hooks/useAuth";
import { useLang } from "../hooks/useLang";
import { t } from "../i18n";
import Header from "./Header";
import SymptomForm from "./SymptomForm";
import ResultsDisplay from "./ResultsDisplay";
import ConsultationHistory from "./ConsultationHistory";
import type { ConsultationFormData, MedicalResponse, Consultation } from "../types";
import { AlertCircle, RotateCcw, Shield } from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const { lang, isRTL } = useLang();
  const [currentView, setCurrentView] = useState<"consult" | "history">("consult");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MedicalResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState<Consultation | null>(null);
  const lastFormData = useRef<ConsultationFormData | null>(null);
  const prevLang = useRef(lang);

  const fetchConsultations = useCallback(async () => {
    if (!user) return;
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("consultations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (!error && data) {
      setConsultations(data as Consultation[]);
    }
    setHistoryLoading(false);
  }, [user]);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  // Re-fetch AI response when language changes and there's an active result
  useEffect(() => {
    if (prevLang.current !== lang && lastFormData.current && result) {
      const formData = { ...lastFormData.current, lang };
      handleSubmit(formData);
    }
    prevLang.current = lang;
  }, [lang]);

  const handleSubmit = async (formData: ConsultationFormData) => {
    setLoading(true);
    setError(null);
    setResult(null);
    setSelectedConsultation(null);
    lastFormData.current = formData;

    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/medical-consult`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Request failed with status ${response.status}`);
      }

      const medicalResponse: MedicalResponse = await response.json();
      setResult(medicalResponse);

      if (user) {
        await supabase.from("consultations").insert({
          user_id: user.id,
          symptoms: formData.symptoms,
          ai_response: medicalResponse,
          severity: medicalResponse.severity || "moderate",
        });
        fetchConsultations();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("consultations").delete().eq("id", id);
    if (!error) {
      setConsultations((prev) => prev.filter((c) => c.id !== id));
      if (selectedConsultation?.id === id) {
        setSelectedConsultation(null);
      }
    }
  };

  const handleSelectConsultation = (consultation: Consultation) => {
    setSelectedConsultation(consultation);
    setResult(consultation.ai_response);
    lastFormData.current = {
      symptoms: consultation.symptoms,
      age: "",
      gender: "",
      duration: "",
      additional_details: "",
      lang,
    };
    setCurrentView("consult");
  };

  const handleNewConsultation = () => {
    setResult(null);
    setSelectedConsultation(null);
    setError(null);
    lastFormData.current = null;
    setCurrentView("consult");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-cyan-50/30" dir={isRTL ? "rtl" : "ltr"}>
      <Header currentView={currentView} onViewChange={setCurrentView} />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mobile tab bar */}
        <div className="flex sm:hidden bg-white rounded-xl p-1 mb-6 border border-slate-200 shadow-sm">
          <button
            onClick={() => setCurrentView("consult")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentView === "consult" ? "bg-teal-50 text-teal-700" : "text-slate-500"
            }`}
          >
            {t(lang, "newConsultation")}
          </button>
          <button
            onClick={() => setCurrentView("history")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
              currentView === "history" ? "bg-teal-50 text-teal-700" : "text-slate-500"
            }`}
          >
            {t(lang, "history")} ({consultations.length})
          </button>
        </div>

        {currentView === "consult" ? (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Left: Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sticky top-24">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-lg font-bold text-slate-900">
                    {selectedConsultation ? t(lang, "consultationDetails") : t(lang, "describeSymptoms")}
                  </h2>
                  {(result || selectedConsultation) && (
                    <button
                      onClick={handleNewConsultation}
                      className="flex items-center gap-1 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {t(lang, "new")}
                    </button>
                  )}
                </div>

                {selectedConsultation ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">{t(lang, "symptoms")}</p>
                      <p className="text-sm text-slate-700">{selectedConsultation.symptoms}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                      <p className="text-xs text-slate-400 mb-1">{t(lang, "date")}</p>
                      <p className="text-sm text-slate-700">
                        {new Date(selectedConsultation.created_at).toLocaleString(
                          lang === "ar" ? "ar-SA" : undefined
                        )}
                      </p>
                    </div>
                  </div>
                ) : (
                  <SymptomForm onSubmit={handleSubmit} loading={loading} />
                )}

                {/* Privacy notice */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-start gap-2">
                    <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      {t(lang, "privacyNote")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Results */}
            <div className="lg:col-span-3">
              {error && (
                <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-red-50 border border-red-100">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-red-700 text-sm">{t(lang, "somethingWentWrong")}</p>
                    <p className="text-sm text-red-600 mt-0.5">{error}</p>
                  </div>
                </div>
              )}

              {result ? (
                <ResultsDisplay result={result} />
              ) : !loading && !error ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 flex items-center justify-center mb-5">
                    <svg className="w-10 h-10 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714a2.25 2.25 0 0 0 .659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.591.659H9.061a2.25 2.25 0 0 1-1.591-.659L5 14.5m14 0V17a2.25 2.25 0 0 1-2.25 2.25H7.25A2.25 2.25 0 0 1 5 17v-2.5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{t(lang, "howItWorks")}</h3>
                  <p className="text-slate-500 max-w-sm text-sm leading-relaxed">
                    {t(lang, "howItWorksDesc")}
                  </p>
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-lg">
                    {[
                      { step: "1", title: t(lang, "step1Title"), desc: t(lang, "step1Desc") },
                      { step: "2", title: t(lang, "step2Title"), desc: t(lang, "step2Desc") },
                      { step: "3", title: t(lang, "step3Title"), desc: t(lang, "step3Desc") },
                    ].map((item) => (
                      <div key={item.step} className="p-3 rounded-xl bg-white border border-slate-100">
                        <div className="w-6 h-6 rounded-full bg-teal-50 text-teal-600 text-xs font-bold flex items-center justify-center mb-2">
                          {item.step}
                        </div>
                        <p className="text-sm font-medium text-slate-900">{item.title}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-4 border-teal-100 border-t-teal-500 rounded-full animate-spin mb-4" />
                  <p className="text-slate-600 font-medium">{t(lang, "analyzingMsg")}</p>
                  <p className="text-sm text-slate-400 mt-1">{t(lang, "analyzingSub")}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900">{t(lang, "consultationHistory")}</h2>
              <span className="text-sm text-slate-400">
                {consultations.length} {t(lang, "consultation")}
                {consultations.length !== 1 ? (lang === "ar" ? "" : "s") : ""}
              </span>
            </div>
            <ConsultationHistory
              consultations={consultations}
              loading={historyLoading}
              onSelect={handleSelectConsultation}
              onDelete={handleDelete}
            />
          </div>
        )}
      </main>

      {/* Footer disclaimer */}
      <footer className="border-t border-slate-200 bg-white/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-start gap-2.5 max-w-2xl mx-auto text-center sm:text-left">
            <Shield className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              {t(lang, "footerDisclaimer")}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
