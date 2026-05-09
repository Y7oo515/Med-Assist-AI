export interface PossibleCondition {
  name: string;
  likelihood: "common" | "possible" | "rare";
  description: string;
  matching_symptoms: string[];
}

export interface RecommendedAction {
  action: string;
  urgency: "immediate" | "soon" | "routine";
  details: string;
}

export interface OTCOption {
  name: string;
  purpose: string;
  note: string;
}

export interface LifestyleChange {
  change: string;
  details: string;
}

export interface MedicalResponse {
  disclaimer: string;
  severity: "low" | "moderate" | "high" | "emergency";
  possible_conditions: PossibleCondition[];
  recommended_actions: RecommendedAction[];
  over_the_counter_options: OTCOption[];
  lifestyle_changes: LifestyleChange[];
  when_to_see_doctor: string[];
  questions_to_ask_doctor: string[];
  raw_response?: string;
}

export interface Consultation {
  id: string;
  user_id: string;
  symptoms: string;
  ai_response: MedicalResponse;
  severity: string;
  created_at: string;
}

export interface ConsultationFormData {
  symptoms: string;
  age: string;
  gender: string;
  duration: string;
  additional_details: string;
  lang: "ar" | "en";
}
