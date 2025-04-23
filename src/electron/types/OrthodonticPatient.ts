export interface OrthodonticPatient {
  patient_id?: number;
  registration_date: string;
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
  under_treatment_or_medication: "Yes" | "No";
  congenital_abnormalities: "Yes" | "No";
  tmj_problems: "Yes" | "No";
  oral_hygiene: "Excellent" | "Fair" | "Poor";
  gingival_tissues: "Thick" | "Thin" | "Normal" | "Receding";
  treatment_status?: "Not Started" | "In Progress" | "Completed";
  current_contract_price?: number;
  current_contract_months?: number;
  current_balance?: number;
  treatment_cycle?: number;
  created_at?: string;
}

export interface OrthodonticTreatmentRecord {
  record_id?: number;
  patient_id: number;
  treatment_cycle?: number;
  appt_no: string;
  date: string;
  arch_wire?: string;
  procedure?: string;
  contract_price?: number;
  contract_months?: number;
  amount_paid?: number;
  next_schedule?: string;
  mode_of_payment?: string;
  balance?: number;
}
