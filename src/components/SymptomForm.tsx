import { useState } from "react";
import {
  Stethoscope,
  User,
  Clock,
  FileText,
  Send,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useLang } from "../hooks/useLang";
import { t } from "../i18n";
import type { ConsultationFormData } from "../types";

interface SymptomFormProps {
  onSubmit: (data: ConsultationFormData) => void;
  loading: boolean;
}

export default function SymptomForm({ onSubmit, loading }: SymptomFormProps) {
  const { lang, isRTL } = useLang();
  const [formData, setFormData] = useState<ConsultationFormData>({
    symptoms: "",
    age: "",
    gender: "",
    duration: "",
    additional_details: "",
    lang: lang,
  });
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.symptoms.trim()) return;
    onSubmit({ ...formData, lang });
  };

  const update = (field: keyof ConsultationFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
          <Stethoscope className="w-4 h-4 text-teal-600" />
          {t(lang, "symptomsLabel")}
          <span className="text-red-400">*</span>
        </label>
        <textarea
          value={formData.symptoms}
          onChange={(e) => update("symptoms", e.target.value)}
          required
          rows={4}
          maxLength={2000}
          className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none"
          placeholder={t(lang, "symptomsPlaceholder")}
        />
        <p className="text-xs text-slate-400 mt-1 text-right">
          {formData.symptoms.length}/2000
        </p>
      </div>

      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-1.5 text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
      >
        {showDetails ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
        {showDetails ? t(lang, "hide") : t(lang, "addMoreDetails")}
      </button>

      {showDetails && (
        <div className="space-y-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-1.5">
                <User className="w-3.5 h-3.5" />
                {t(lang, "age")}
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => update("age", e.target.value)}
                min={0}
                max={150}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                placeholder={t(lang, "agePlaceholder")}
              />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-1.5">
                <User className="w-3.5 h-3.5" />
                {t(lang, "gender")}
              </label>
              <select
                value={formData.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
              >
                <option value="">{t(lang, "preferNotToSay")}</option>
                <option value="male">{t(lang, "male")}</option>
                <option value="female">{t(lang, "female")}</option>
                <option value="other">{t(lang, "other")}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-1.5">
              <Clock className="w-3.5 h-3.5" />
              {t(lang, "duration")}
            </label>
            <select
              value={formData.duration}
              onChange={(e) => update("duration", e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
            >
              <option value="">{t(lang, "selectDuration")}</option>
              <option value={t(lang, "lessThan24h")}>{t(lang, "lessThan24h")}</option>
              <option value={t(lang, "oneTo3Days")}>{t(lang, "oneTo3Days")}</option>
              <option value={t(lang, "fourTo7Days")}>{t(lang, "fourTo7Days")}</option>
              <option value={t(lang, "oneTo2Weeks")}>{t(lang, "oneTo2Weeks")}</option>
              <option value={t(lang, "twoTo4Weeks")}>{t(lang, "twoTo4Weeks")}</option>
              <option value={t(lang, "moreThanMonth")}>{t(lang, "moreThanMonth")}</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600 mb-1.5">
              <FileText className="w-3.5 h-3.5" />
              {t(lang, "additionalDetails")}
            </label>
            <textarea
              value={formData.additional_details}
              onChange={(e) => update("additional_details", e.target.value)}
              rows={2}
              maxLength={500}
              className="w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all resize-none text-sm"
              placeholder={t(lang, "additionalDetailsPlaceholder")}
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !formData.symptoms.trim()}
        className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-semibold shadow-lg shadow-teal-500/25 hover:shadow-teal-500/40 hover:from-teal-500 hover:to-cyan-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-teal-500/25"
      >
        {loading ? (
          <>
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            {t(lang, "analyzing")}
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t(lang, "getHealthInfo")}
          </>
        )}
      </button>
    </form>
  );
}
