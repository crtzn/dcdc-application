// src/components/MultiStepForm.tsx
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import RegularPatientForm from "@/components/regular/RegularPatientForm";
import MedicalHistoryForm from "@/components/regular/medical-history-form";
import TreatmentRecordForm from "@/components/regular/TreatmentRecord";
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "@/electron/types/RegularPatient";

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
      // Submit Patient Info
      const patientResult = await window.api.addPatient(
        patientData as Omit<RegularPatient, "patient_id">
      );
      if (!patientResult.success || !patientResult.patient_id) {
        throw new Error("Failed to add patient");
      }
      const newPatientId = patientResult.patient_id;

      // Submit Medical History
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

      // Submit Treatment Record
      const treatmentWithId = { ...treatmentData, patient_id: newPatientId };
      const treatmentResult = await window.api.addTreatmentRecord(
        treatmentWithId as RegularTreatmentRecord
      );
      if (!treatmentResult.success) {
        throw new Error("Failed to add treatment record");
      }

      toast.success("All data submitted successfully!");
      setStep(1);
      setPatientData({});
      setMedicalHistoryData({});
      setTreatmentRecordData({});
      setPatientId(null);
    } catch (error) {
      toast.error(
        `Error submitting data: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-slate-800">
            {step === 1 && "Patient Registration"}
            {step === 2 && "Medical History"}
            {step === 3 && "Treatment Record"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <RegularPatientForm
              onNext={(data) => handleNext(data, "patient")}
            />
          )}
          {step === 2 && (
            <MedicalHistoryForm
              onNext={(data) => handleNext(data, "medicalHistory")}
              onBack={handleBack}
            />
          )}
          {step === 3 && (
            <TreatmentRecordForm onSubmit={handleSubmit} onBack={handleBack} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MultiStepForm;
