import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for navigation
import { toast } from "sonner";
import RegularPatientForm from "@/components/regular/regular-patient-form";
import MedicalHistoryForm from "@/components/regular/medical-history-form";
import TreatmentRecordForm from "@/components/regular/treatment-record";
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "@/electron/types/RegularPatient";
import { Progress } from "@/components/ui/progress";

const MultiStepForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState<
    Partial<Omit<RegularPatient, "patient_id">>
  >({});
  const [medicalHistoryData, setMedicalHistoryData] = useState<
    Partial<Omit<RegularMedicalHistory, "history_id">>
  >({});
  const [, setTreatmentRecordData] = useState<Partial<RegularTreatmentRecord>>(
    {}
  );
  const [, setPatientId] = useState<number | null>(null);
  const navigate = useNavigate(); // Added for navigation

  const steps = [
    { label: "Patient Information", step: 1 },
    { label: "Medical History", step: 2 },
    { label: "Treatment Record", step: 3 },
  ];

  const handleNext = (
    data: Partial<
      Omit<RegularPatient | RegularMedicalHistory, "patient_id" | "history_id">
    >,
    formType: string
  ) => {
    if (formType === "patient") {
      setPatientData(data);
      setStep(2);
    } else if (formType === "medicalHistory") {
      setMedicalHistoryData(data);
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (
    treatmentData: Partial<RegularTreatmentRecord>
  ) => {
    try {
      // Add patient
      const patientResult = await window.api.addPatient(
        patientData as Omit<RegularPatient, "patient_id">
      );
      if (!patientResult.success || !patientResult.patient_id) {
        throw new Error("Failed to add patient");
      }
      const newPatientId = patientResult.patient_id;
      setPatientId(newPatientId);

      // Add medical history
      const medicalHistoryWithId = {
        ...medicalHistoryData,
        patient_id: newPatientId,
      };
      const medicalResult = await window.api.addMedicalHistory(
        medicalHistoryWithId as Omit<RegularMedicalHistory, "history_id">
      );
      if (!medicalResult.success) {
        throw new Error("Failed to add medical history");
      }

      // Add treatment record
      const treatmentWithId = { ...treatmentData, patient_id: newPatientId };
      const treatmentResult = await window.api.addTreatmentRecord(
        treatmentWithId as RegularTreatmentRecord
      );
      if (!treatmentResult.success) {
        throw new Error("Failed to add treatment record");
      }

      // Notify user and navigate
      toast.success("Patient added successfully! Redirecting to dashboard...");
      setStep(1);
      setPatientData({});
      setMedicalHistoryData({});
      setTreatmentRecordData({});
      setPatientId(null);
      navigate("/patient-profile"); // Navigate to dashboard to see updated counts
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error submitting data: ${errorMessage}`);
    }
  };

  return (
    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          {steps.map((s) => (
            <div
              key={s.step}
              className={`flex-1 text-center ${
                step >= s.step ? "text-blue-600 font-semibold" : "text-gray-400"
              }`}
            >
              <div
                className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center ${
                  step >= s.step ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {s.step}
              </div>
              <span className="text-sm mt-2 block">{s.label}</span>
            </div>
          ))}
        </div>
        <Progress value={(step / steps.length) * 100} className="h-2" />
      </div>

      {/* Form Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {steps.find((s) => s.step === step)?.label}
        </h2>
        {step === 1 && (
          <RegularPatientForm
            onNext={(data) => handleNext(data, "patient")}
            initialData={patientData}
          />
        )}
        {step === 2 && (
          <MedicalHistoryForm
            onNext={(data) => handleNext(data, "medicalHistory")}
            onBack={handleBack}
            initialData={medicalHistoryData}
          />
        )}
        {step === 3 && (
          <TreatmentRecordForm onSubmit={handleSubmit} onBack={handleBack} />
        )}
      </div>
    </div>
  );
};

export default MultiStepForm;
