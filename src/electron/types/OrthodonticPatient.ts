export interface OrthodonticPatient {
  ortho_patient_id: number;
  name: string;
  birthdate?: string; // ISO date string
  parents_guardians_name?: string;
  parents_occupation?: string;
  address?: string;
  home_phone?: string;
  business_phone?: string;
  cellphone?: string;
  email?: string;
  chart_number?: string;
  sex?: "Male" | "Female" | "Other";
  age_years?: number;
  age_months?: number;
  age_days?: number;
  created_at?: string; // ISO timestamp
}

export interface OrthodonticHistory {
  ortho_history_id: number;
  ortho_patient_id: number;
  exam_date?: string; // ISO date string
  chief_complaint?: string;
  past_medical_dental_history?: string;
  prior_orthodontic_history?: string;
  under_treatment_or_medication?: boolean;
  congenital_abnormalities?: boolean;
  tmj_problems?: boolean;
  oral_hygiene?: "Excellent" | "Fair" | "Poor";
  gingival_tissues?: "Thick" | "Thin" | "Normal" | "Receding";
}

export interface OrthodonticTreatmentPlan {
  plan_id: number;
  ortho_patient_id: number;
  appointment_number?: string;
  treatment_date: string; // ISO date string
  arch_wire?: string;
  procedure_description: string;
  amount_paid: number;
  next_schedule?: string; // ISO date string
}
