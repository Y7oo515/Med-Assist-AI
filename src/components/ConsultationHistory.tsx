import { Clock, Trash2, ChevronRight } from "lucide-react";
import { useLang } from "../hooks/useLang";
import { t } from "../i18n";
import type { Consultation } from "../types";

interface ConsultationHistoryProps {
  consultations: Consultation[];
  loading: boolean;
  onSelect: (consultation: Consultation) => void;
  onDelete: (id: string) => void;
}

const severityBadge = {
  low: "bg-emerald-50 text-emerald-700",
  moderate: "bg-amber-50 text-amber-700",
  high: "bg-orange-50 text-orange-700",
  emergency: "bg-red-50 text-red-700",
};

export default function ConsultationHistory({
  consultations,
  loading,
  onSelect,
  onDelete,
}: ConsultationHistoryProps) {
  const { lang } = useLang();

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (consultations.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <p className="text-slate-500 font-medium">{t(lang, "noConsultations")}</p>
        <p className="text-sm text-slate-400 mt-1">{t(lang, "historyWillAppear")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {consultations.map((consultation) => (
        <div
          key={consultation.id}
          className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-teal-200 hover:shadow-md transition-all duration-200 cursor-pointer"
          onClick={() => onSelect(consultation)}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  severityBadge[consultation.severity as keyof typeof severityBadge] || severityBadge.moderate
                }`}>
                  {consultation.severity}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(consultation.created_at).toLocaleDateString(
                    lang === "ar" ? "ar-SA" : undefined,
                    { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" }
                  )}
                </span>
              </div>
              <p className="text-sm text-slate-700 line-clamp-2">{consultation.symptoms}</p>
              {consultation.ai_response?.possible_conditions?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {consultation.ai_response.possible_conditions.slice(0, 3).map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded text-xs bg-slate-50 text-slate-500">
                      {c.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(consultation.id); }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <ChevronRight className="w-4 h-4 text-slate-300" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
