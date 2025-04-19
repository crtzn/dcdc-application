// src/components/orthodontic/orthodontic-multi-step-form.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import OrthodonticPatientForm from "@/components/orthodontic/orthodontic-patient-form";
import OrthodonticTreatmentRecordForm from "@/components/orthodontic/orthodontic-treatment-record";
import {
  OrthodonticPatient,
  OrthodonticTreatmentRecord,
} from "@/electron/types/OrthodonticPatient";
import { Progress } from "@/components/ui/progress";

const OrthodonticMultiStepForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [patientData, setPatientData] = useState<
    Partial<
      Omit<OrthodonticPatient, "patient_id" | "created_at" | "updated_at">
    >
  >({});
  const [, setTreatmentRecordData] = useState<
    Partial<
      Omit<
        OrthodonticTreatmentRecord,
        "record_id" | "patient_id" | "created_at"
      >
    >
  >({});
  const [, setPatientId] = useState<number | null>(null);
  const navigate = useNavigate();

  const steps = [
    { label: "Patient Information", step: 1 },
    { label: "Treatment Record", step: 2 },
  ];

  const handleNext = (
    data: Partial<
      Omit<OrthodonticPatient, "patient_id" | "created_at" | "updated_at">
    >
  ) => {
    setPatientData(data);
    setStep(2);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async (
    treatmentData: Partial<
      Omit<
        OrthodonticTreatmentRecord,
        "record_id" | "patient_id" | "created_at"
      >
    >
  ) => {
    try {
      console.log("Treatment data received:", treatmentData); // Add logging
      // Add orthodontic patient
      const patientResult = await window.api.addOrthodonticPatient(
        patientData as Omit<
          OrthodonticPatient,
          "patient_id" | "created_at" | "updated_at"
        >
      );
      if (!patientResult.success || !patientResult.patient_id) {
        throw new Error("Failed to add orthodontic patient");
      }
      const newPatientId = patientResult.patient_id;
      setPatientId(newPatientId);

      // Add treatment record
      const treatmentWithId = {
        ...treatmentData,
        patient_id: newPatientId,
      } as Omit<OrthodonticTreatmentRecord, "record_id" | "created_at">;
      console.log("Treatment data sent to backend:", treatmentWithId); // Add logging
      const treatmentResult = await window.api.addOrthodonticTreatmentRecord(
        treatmentWithId
      );
      if (!treatmentResult.success) {
        throw new Error("Failed to add orthodontic treatment record");
      }

      // Notify user and navigate
      toast.success(
        "Orthodontic patient and treatment record added successfully! Redirecting to dashboard..."
      );
      setStep(1);
      setPatientData({});
      setTreatmentRecordData({});
      setPatientId(null);
      navigate("/");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error("Error in handleSubmit:", errorMessage, {
        patientData,
        treatmentData,
      });
      toast.error(`Error submitting data: ${errorMessage}`);
    }
  };

  return (
    <div className="w-full max-h-[80vh] overflow-y-auto py-4 px-3 sm:px-4">
      {/* Progress Indicator */}
      <div className="mb-4 sticky top-0 bg-white z-10 pb-2">
        <div className="flex justify-between items-center mb-2">
          {steps.map((s) => (
            <div
              key={s.step}
              className={`flex-1 text-center ${
                step >= s.step ? "text-blue-600 font-semibold" : "text-gray-400"
              }`}
            >
              <div
                className={`w-6 h-6 sm:w-8 sm:h-8 mx-auto rounded-full flex items-center justify-center ${
                  step >= s.step ? "bg-blue-600 text-white" : "bg-gray-200"
                }`}
              >
                {s.step}
              </div>
              <span className="text-xs sm:text-sm mt-1 block">{s.label}</span>
            </div>
          ))}
        </div>
        <Progress value={(step / steps.length) * 100} className="h-1.5" />
      </div>

      {/* Form Content */}
      <div className="rounded-lg">
        {step === 1 && <OrthodonticPatientForm onNext={handleNext} />}
        {step === 2 && (
          <OrthodonticTreatmentRecordForm
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        )}
      </div>
    </div>
  );
};

export default OrthodonticMultiStepForm;
