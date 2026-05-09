import {
  AlertTriangle,
  Shield,
  Activity,
  Pill,
  Leaf,
  Stethoscope,
  HelpCircle,
  ChevronRight,
  Clock,
  Zap,
  Calendar,
} from "lucide-react";
import { useLang } from "../hooks/useLang";
import { t } from "../i18n";
import type { MedicalResponse } from "../types";

interface ResultsDisplayProps {
  result: MedicalResponse;
}

const severityConfig = {
  low: { key: "severityLow", color: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: Shield, iconColor: "text-emerald-500" },
  moderate: { key: "severityModerate", color: "bg-amber-50 text-amber-700 border-amber-200", icon: AlertTriangle, iconColor: "text-amber-500" },
  high: { key: "severityHigh", color: "bg-orange-50 text-orange-700 border-orange-200", icon: AlertTriangle, iconColor: "text-orange-500" },
  emergency: { key: "severityEmergency", color: "bg-red-50 text-red-700 border-red-200", icon: AlertTriangle, iconColor: "text-red-500" },
};

const urgencyConfig = {
  immediate: { key: "immediate", color: "text-red-600 bg-red-50", icon: Zap },
  soon: { key: "soon", color: "text-amber-600 bg-amber-50", icon: Clock },
  routine: { key: "routine", color: "text-emerald-600 bg-emerald-50", icon: Calendar },
};

const likelihoodConfig = {
  common: "bg-teal-50 text-teal-700",
  possible: "bg-amber-50 text-amber-700",
  rare: "bg-slate-50 text-slate-600",
};

export default function ResultsDisplay({ result }: ResultsDisplayProps) {
  const { lang } = useLang();
  const severity = severityConfig[result.severity] || severityConfig.moderate;
  const SeverityIcon = severity.icon;

  return (
    <div className="space-y-5 animate-in fade-in duration-500">
      {/* Disclaimer */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
        <Shield className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <p className="text-sm text-slate-600 leading-relaxed">
          {result.disclaimer}
        </p>
      </div>

      {/* Severity Badge */}
      <div className={`flex items-center gap-2.5 p-4 rounded-xl border ${severity.color}`}>
        <SeverityIcon className={`w-5 h-5 ${severity.iconColor} shrink-0`} />
        <span className="font-semibold">{t(lang, severity.key as keyof typeof t)}</span>
      </div>

      {/* Emergency Warning */}
      {result.severity === "emergency" && (
        <div className="p-4 rounded-xl bg-red-600 text-white">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-bold text-lg">{t(lang, "emergencyTitle")}</span>
          </div>
          <p className="text-red-100 text-sm">{t(lang, "emergencyDesc")}</p>
        </div>
      )}

      {/* Possible Conditions with specific medications */}
      {result.possible_conditions?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <Activity className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-slate-900">{t(lang, "possibleConditions")}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {result.possible_conditions.map((condition, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <h4 className="font-medium text-slate-900">{condition.name}</h4>
                  <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    likelihoodConfig[condition.likelihood as keyof typeof likelihoodConfig] || likelihoodConfig.possible
                  }`}>
                    {t(lang, condition.likelihood as keyof typeof t) || condition.likelihood}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mb-2">{condition.description}</p>
                {condition.matching_symptoms?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {condition.matching_symptoms.map((symptom, j) => (
                      <span key={j} className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 text-xs">
                        {symptom}
                      </span>
                    ))}
                  </div>
                )}
                {/* Disease-specific medications */}
                {(condition as any).specific_medications?.length > 0 && (
                  <div className="mt-3 p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                    <div className="flex items-center gap-1.5 mb-2">
                      <Pill className="w-3.5 h-3.5 text-blue-600" />
                      <span className="text-xs font-semibold text-blue-700">
                        {lang === "ar" ? "أدوية خاصة بهذه الحالة" : "Medications for this condition"}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {(condition as any).specific_medications.map((med: any, j: number) => (
                        <div key={j} className="p-2.5 rounded-md bg-white border border-blue-100">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <ChevronRight className="w-3 h-3 text-blue-500" />
                            <span className="text-sm font-medium text-slate-900">{med.name}</span>
                          </div>
                          <p className="text-xs text-slate-600 ml-4.5">{med.purpose}</p>
                          {med.dosage && (
                            <p className="text-xs text-teal-600 ml-4.5 mt-0.5">
                              {lang === "ar" ? "الجرعة: " : "Dosage: "}{med.dosage}
                            </p>
                          )}
                          {med.note && (
                            <p className="text-xs text-amber-600 ml-4.5 mt-0.5 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3 shrink-0" />
                              {med.note}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Actions */}
      {result.recommended_actions?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-slate-900">{t(lang, "recommendedActions")}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {result.recommended_actions.map((action, i) => {
              const urgency = urgencyConfig[action.urgency as keyof typeof urgencyConfig] || urgencyConfig.routine;
              const UrgencyIcon = urgency.icon;
              return (
                <div key={i} className="px-5 py-4 flex items-start gap-3">
                  <div className={`shrink-0 mt-0.5 p-1 rounded-md ${urgency.color}`}>
                    <UrgencyIcon className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">{action.action}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${urgency.color}`}>
                        {t(lang, urgency.key as keyof typeof t)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600">{action.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* OTC Options (legacy - kept for backward compat) */}
      {result.over_the_counter_options?.length > 0 && !(result.possible_conditions?.some((c: any) => (c as any).specific_medications?.length > 0)) && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <Pill className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-slate-900">{t(lang, "otcOptions")}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {result.over_the_counter_options.map((option, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-center gap-2 mb-1">
                  <ChevronRight className="w-3.5 h-3.5 text-teal-500" />
                  <span className="font-medium text-slate-900">{option.name}</span>
                </div>
                <p className="text-sm text-slate-600 ml-5.5 mb-1">{option.purpose}</p>
                {option.note && (
                  <p className="text-xs text-amber-600 ml-5.5 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {option.note}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lifestyle Changes */}
      {result.lifestyle_changes?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <Leaf className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-slate-900">{t(lang, "lifestyleChanges")}</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {result.lifestyle_changes.map((change, i) => (
              <div key={i} className="px-5 py-4">
                <h4 className="font-medium text-slate-900 mb-1">{change.change}</h4>
                <p className="text-sm text-slate-600">{change.details}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* When to See a Doctor */}
      {result.when_to_see_doctor?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-slate-900">{t(lang, "whenToSeeDoctor")}</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {result.when_to_see_doctor.map((item, i) => (
              <li key={i} className="px-5 py-3 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Questions to Ask Doctor */}
      {result.questions_to_ask_doctor?.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 bg-slate-50 border-b border-slate-200">
            <HelpCircle className="w-4 h-4 text-teal-600" />
            <h3 className="font-semibold text-slate-900">{t(lang, "questionsToAskDoctor")}</h3>
          </div>
          <ul className="divide-y divide-slate-100">
            {result.questions_to_ask_doctor.map((q, i) => (
              <li key={i} className="px-5 py-3 flex items-start gap-2.5">
                <ChevronRight className="w-4 h-4 text-teal-500 shrink-0 mt-0.5" />
                <span className="text-sm text-slate-700">{q}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
