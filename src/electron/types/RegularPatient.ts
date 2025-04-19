export interface RegularPatient {
  patient_id: number;
  name: string;
  birthday?: string;
  religion?: string;
  home_address?: string;
  sex?: string;
  age?: number;
  nationality?: string;
  cellphone_number?: string;
  registration_date?: string;
  created_at?: string;
}

// types/RegularMedicalHistory.ts
export interface RegularMedicalHistory {
  history_id?: number; // Auto-incremented
  patient_id?: number; // Foreign key to regular_patients
  general_health?: string;
  under_medical_treatment?: boolean;
  medical_condition?: string;
  serious_illness_or_surgery?: boolean;
  illness_or_surgery_details?: string;
  hospitalized?: boolean;
  hospitalization_details?: string;
  taking_medications?: boolean;
  medications_list?: string;
  uses_tobacco?: boolean;
  list_of_allergies?: string;
  bleeding_time?: string;
  is_pregnant?: boolean;
  is_nursing?: boolean;
  taking_birth_control?: boolean;
  blood_type?: string;
  blood_pressure?: string;
  selected_conditions?: string;
}

// types/RegularTreatmentRecord.ts
export interface RegularTreatmentRecord {
  record_id?: number; // Auto-incremented
  patient_id?: number; // Foreign key to regular_patients
  treatment_date: string;
  tooth_number?: string;
  procedure?: string;
  dentist_name?: string;
  amount_charged?: number;
  amount_paid?: number;
  balance?: number;
  mode_of_payment?: string;
  notes?: string;
}
