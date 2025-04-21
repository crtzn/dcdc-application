// src/components/orthodontic/OrthodonticPatientEditForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrthodonticPatient } from "@/electron/types/OrthodonticPatient";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

interface OrthodonticPatientEditFormProps {
  patient: OrthodonticPatient;
  onSubmit: (data: Partial<Omit<OrthodonticPatient, "patient_id">>) => void;
  onCancel: () => void;
}

const OrthodonticPatientEditForm = ({
  patient,
  onSubmit,
  onCancel,
}: OrthodonticPatientEditFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<
    Partial<Omit<OrthodonticPatient, "patient_id">>
  >({
    defaultValues: patient,
  });

  // Initialize form with default values
  React.useEffect(() => {
    // Make sure boolean fields are properly set
    setValue(
      "under_treatment_or_medication",
      patient.under_treatment_or_medication || "No"
    );
    setValue(
      "congenital_abnormalities",
      patient.congenital_abnormalities || "No"
    );
    setValue("tmj_problems", patient.tmj_problems || "No");
    setValue("oral_hygiene", patient.oral_hygiene || "Fair");
    setValue("gingival_tissues", patient.gingival_tissues || "Normal");
    setValue("sex", patient.sex || "Male");
  }, [patient, setValue]);

  // Watch the values for the radio buttons and selects
  const underTreatment = watch("under_treatment_or_medication");
  const congenitalAbnormalities = watch("congenital_abnormalities");
  const tmjProblems = watch("tmj_problems");
  const oralHygiene = watch("oral_hygiene");
  const gingivalTissues = watch("gingival_tissues");
  const gender = watch("sex");

  const onFormSubmit = async (
    data: Partial<Omit<OrthodonticPatient, "patient_id">>
  ) => {
    try {
      await onSubmit(data);
      toast.success("Patient information updated successfully");
    } catch (error: unknown) {
      console.error("Failed to update patient:", error);
      toast.error("Error updating patient information");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4 max-h-[60vh] overflow-y-auto p-2"
    >
      <div>
        <Label htmlFor="date_of_exam">Date of Exam</Label>
        <Input id="date_of_exam" type="date" {...register("date_of_exam")} />
      </div>
      <div>
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} required />
      </div>
      <div>
        <Label htmlFor="occupation">Occupation</Label>
        <Input id="occupation" {...register("occupation")} />
      </div>
      <div>
        <Label htmlFor="birthday">Birthday</Label>
        <Input id="birthday" type="date" {...register("birthday")} />
      </div>
      <div>
        <Label htmlFor="parent_guardian_name">Parent/Guardian Name</Label>
        <Input
          id="parent_guardian_name"
          {...register("parent_guardian_name")}
        />
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input id="address" {...register("address")} />
      </div>
      <div>
        <Label htmlFor="telephone_home">Telephone (Home)</Label>
        <PhoneInput
          country={"ph"}
          value={patient.telephone_home || ""}
          onChange={(phone) => setValue("telephone_home", phone)}
          inputClass="w-full p-2 border rounded-md"
          containerClass="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="telephone_business">Telephone (Business)</Label>
        <PhoneInput
          country={"ph"}
          value={patient.telephone_business || ""}
          onChange={(phone) => setValue("telephone_business", phone)}
          inputClass="w-full p-2 border rounded-md"
          containerClass="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="cellphone_number">Cellphone Number</Label>
        <PhoneInput
          country={"ph"}
          value={patient.cellphone_number || ""}
          onChange={(phone) => setValue("cellphone_number", phone)}
          inputClass="w-full p-2 border rounded-md"
          containerClass="mt-1"
        />
      </div>
      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...register("email")} />
      </div>
      <div>
        <Label htmlFor="chart">Chart</Label>
        <Input id="chart" {...register("chart")} />
      </div>
      <div>
        <Label htmlFor="sex">Gender</Label>
        <Select
          value={gender}
          onValueChange={(value) =>
            setValue("sex", value as "Male" | "Female" | "Other")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="age">Age</Label>
        <Input id="age" type="number" {...register("age")} />
      </div>
      <div>
        <Label htmlFor="chief_complaint">Chief Complaint</Label>
        <Input id="chief_complaint" {...register("chief_complaint")} />
      </div>
      <div>
        <Label htmlFor="past_medical_dental_history">
          Past Medical/Dental History
        </Label>
        <Input
          id="past_medical_dental_history"
          {...register("past_medical_dental_history")}
        />
      </div>
      <div>
        <Label htmlFor="prior_orthodontic_history">
          Prior Orthodontic History
        </Label>
        <Input
          id="prior_orthodontic_history"
          {...register("prior_orthodontic_history")}
        />
      </div>
      <div>
        <Label htmlFor="under_treatment_or_medication">
          Under Treatment/Medication
        </Label>
        <RadioGroup
          value={underTreatment}
          onValueChange={(value) =>
            setValue("under_treatment_or_medication", value as "Yes" | "No")
          }
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Yes" id="under_treatment_yes" />
            <Label
              htmlFor="under_treatment_yes"
              className="font-normal text-sm"
            >
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="No" id="under_treatment_no" />
            <Label htmlFor="under_treatment_no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="congenital_abnormalities">
          Congenital Abnormalities
        </Label>
        <RadioGroup
          value={congenitalAbnormalities}
          onValueChange={(value) =>
            setValue("congenital_abnormalities", value as "Yes" | "No")
          }
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Yes" id="congenital_yes" />
            <Label htmlFor="congenital_yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="No" id="congenital_no" />
            <Label htmlFor="congenital_no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="tmj_problems">TMJ Problems</Label>
        <RadioGroup
          value={tmjProblems}
          onValueChange={(value) =>
            setValue("tmj_problems", value as "Yes" | "No")
          }
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="Yes" id="tmj_yes" />
            <Label htmlFor="tmj_yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="No" id="tmj_no" />
            <Label htmlFor="tmj_no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="oral_hygiene">Oral Hygiene</Label>
        <Select
          value={oralHygiene}
          onValueChange={(value) =>
            setValue("oral_hygiene", value as "Excellent" | "Fair" | "Poor")
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select oral hygiene" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Excellent">Excellent</SelectItem>
            <SelectItem value="Fair">Fair</SelectItem>
            <SelectItem value="Poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="gingival_tissues">Gingival Tissues</Label>
        <Select
          value={gingivalTissues}
          onValueChange={(value) =>
            setValue(
              "gingival_tissues",
              value as "Thick" | "Thin" | "Normal" | "Receding"
            )
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select gingival tissues" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Thick">Thick</SelectItem>
            <SelectItem value="Thin">Thin</SelectItem>
            <SelectItem value="Normal">Normal</SelectItem>
            <SelectItem value="Receding">Receding</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {patient.created_at && (
        <div>
          <Label htmlFor="created_at">Created At</Label>
          <Input
            id="created_at"
            value={
              patient.created_at
                ? new Date(patient.created_at).toLocaleDateString()
                : ""
            }
            disabled
            className="bg-gray-100"
          />
        </div>
      )}
      <div className="flex justify-end gap-2 pt-4 border-t mt-6">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Changes
        </Button>
      </div>
    </form>
  );
};

export default OrthodonticPatientEditForm;
