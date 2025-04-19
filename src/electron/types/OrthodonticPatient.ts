export interface OrthodonticPatient {
  patient_id?: number;
  date_of_exam: string;
  name: string;
  occupation?: string;
  birthday?: string;
  parent_guardian_name?: string;
  address?: string;
  telephone_home?: string;
  telephone_business?: string;
  cellphone_number?: string;
  email?: string;
  chart?: string;
  sex: "Male" | "Female" | "Other";
  age?: number;
  chief_complaint: string;
  past_medical_dental_history?: string;
  prior_orthodontic_history?: string;
  under_treatment_or_medication: boolean;
  congenital_abnormalities: "Yes" | "No";
  tmj_problems: "Yes" | "No";
  oral_hygiene: "Excellent" | "Fair" | "Poor";
  gingival_tissues: "Thick" | "Thin" | "Normal" | "Receding";
  created_at?: string;
}

export interface OrthodonticTreatmentRecord {
  record_id?: number;
  patient_id: number;
  appointment_number: string;
  date: string;
  arch_wire?: string;
  procedure?: string;
  amount_paid?: number;
  next_schedule?: string;
}
