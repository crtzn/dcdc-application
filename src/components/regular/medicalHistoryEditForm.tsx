// src/components/regular/MedicalHistoryEditForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegularMedicalHistory } from "@/electron/types/RegularPatient";
import { toast } from "sonner";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MedicalHistoryEditFormProps {
  history: RegularMedicalHistory;
  onSubmit: (
    data: Partial<Omit<RegularMedicalHistory, "history_id" | "patient_id">>
  ) => void;
  onCancel: () => void;
}

const MedicalHistoryEditForm = ({
  history,
  onSubmit,
  onCancel,
}: MedicalHistoryEditFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<
    Partial<Omit<RegularMedicalHistory, "history_id" | "patient_id">>
  >({
    defaultValues: {
      general_health: history.general_health || "",
      under_medical_treatment: history.under_medical_treatment || false,
      medical_condition: history.medical_condition || "",
      serious_illness_or_surgery: history.serious_illness_or_surgery || false,
      illness_or_surgery_details: history.illness_or_surgery_details || "",
      hospitalized: history.hospitalized || false,
      hospitalization_details: history.hospitalization_details || "",
      taking_medications: history.taking_medications || false,
      medications_list: history.medications_list || "",
      uses_tobacco: history.uses_tobacco || false,
      list_of_allergies: history.list_of_allergies || "",
      bleeding_time: history.bleeding_time || "",
      is_pregnant: history.is_pregnant || false,
      is_nursing: history.is_nursing || false,
      taking_birth_control: history.taking_birth_control || false,
      blood_type: history.blood_type || "",
      blood_pressure: history.blood_pressure || "",
      selected_conditions: history.selected_conditions || "",
    },
  });

  // Watch boolean values
  const underMedicalTreatment = watch("under_medical_treatment");
  const seriousIllnessOrSurgery = watch("serious_illness_or_surgery");
  const hospitalized = watch("hospitalized");
  const takingMedications = watch("taking_medications");
  const usesTobacco = watch("uses_tobacco");
  const isPregnant = watch("is_pregnant");
  const isNursing = watch("is_nursing");
  const takingBirthControl = watch("taking_birth_control");

  // Blood type options
  const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // Medical conditions and allergies
  const MEDICAL_HISTORY_CHECKLIST: string[] = [
    "High blood pressure",
    "Low blood pressure",
    "Epilepsy/convulsions",
    "AIDS or HIV Infection",
    "Sexually transmitted disease",
    "Stomach troubles/ulcers",
    "Fainting seizure",
    "Rapid weight loss",
    "Joint replacement / implant",
    "Heart attack",
    "Thyroid problem",
    "Heart disease",
    "Heart murmur",
    "Hepatitis/liver disease",
    "Rheumatic fever",
    "Hay fever / allergies",
    "Respiratory problems",
    "Hepatitis / jaundice",
    "Tuberculosis",
    "Swollen ankles",
    "Kidney disease",
    "Diabetes",
    "Stroke",
    "Cancer/ tumor",
    "Anemia",
    "Angina",
    "Asthma",
    "Emphysema",
    "Bleeding problems",
    "Blood disease",
    "Head injuries",
    "Arthritis / rheumatism",
    "Heart surgery",
    "Chest pain",
  ];

  const ALLERGIES: string[] = [
    "Local anesthetic",
    "Sulfa drugs",
    "Aspirin",
    "Penicillin",
    "Latex",
    "Other",
  ];

  // Parse selected conditions and allergies
  const [selectedConditions, setSelectedConditions] = React.useState<string[]>(
    history.selected_conditions
      ? history.selected_conditions.split(",").map((item) => item.trim())
      : []
  );

  const [selectedAllergies, setSelectedAllergies] = React.useState<string[]>(
    history.list_of_allergies
      ? history.list_of_allergies.split(",").map((item) => item.trim())
      : []
  );

  // For handling "Other" allergies
  const [otherAllergy, setOtherAllergy] = React.useState("");

  // Extract "Other" allergy if present
  React.useEffect(() => {
    const otherAllergyEntry = selectedAllergies.find((a) =>
      a.startsWith("Other:")
    );
    if (otherAllergyEntry) {
      setOtherAllergy(otherAllergyEntry.replace("Other:", "").trim());
    }
  }, []);

  // Update form values when checkboxes change
  React.useEffect(() => {
    setValue("selected_conditions", selectedConditions.join(", "));
  }, [selectedConditions, setValue]);

  React.useEffect(() => {
    setValue("list_of_allergies", selectedAllergies.join(", "));
  }, [selectedAllergies, setValue]);

  const onFormSubmit = async (
    data: Partial<Omit<RegularMedicalHistory, "history_id" | "patient_id">>
  ) => {
    try {
      await onSubmit(data);
      toast.success("Medical history updated successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error updating medical history: ${errorMessage}`);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4 max-h-[60vh] overflow-y-auto p-2"
    >
      <div>
        <Label htmlFor="general_health">General Health</Label>
        <Select
          defaultValue={history.general_health || ""}
          onValueChange={(value) => setValue("general_health", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select health status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Excellent">Excellent</SelectItem>
            <SelectItem value="Good">Good</SelectItem>
            <SelectItem value="Fair">Fair</SelectItem>
            <SelectItem value="Poor">Poor</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="under_medical_treatment">Under Medical Treatment</Label>
        <RadioGroup
          defaultValue={underMedicalTreatment ? "true" : "false"}
          onValueChange={(value) =>
            setValue("under_medical_treatment", value === "true")
          }
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="treatment-yes" />
            <Label htmlFor="treatment-yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="treatment-no" />
            <Label htmlFor="treatment-no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="medical_condition">Medical Condition</Label>
        <Input id="medical_condition" {...register("medical_condition")} />
      </div>
      <div>
        <Label htmlFor="serious_illness_or_surgery">
          Serious Illness/Surgery
        </Label>
        <RadioGroup
          defaultValue={seriousIllnessOrSurgery ? "true" : "false"}
          onValueChange={(value) =>
            setValue("serious_illness_or_surgery", value === "true")
          }
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="illness-yes" />
            <Label htmlFor="illness-yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="illness-no" />
            <Label htmlFor="illness-no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="illness_or_surgery_details">
          Illness/Surgery Details
        </Label>
        <Input
          id="illness_or_surgery_details"
          {...register("illness_or_surgery_details")}
        />
      </div>
      <div>
        <Label htmlFor="hospitalized">Hospitalized</Label>
        <RadioGroup
          defaultValue={hospitalized ? "true" : "false"}
          onValueChange={(value) => setValue("hospitalized", value === "true")}
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="hospitalized-yes" />
            <Label htmlFor="hospitalized-yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="hospitalized-no" />
            <Label htmlFor="hospitalized-no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="hospitalization_details">Hospitalization Details</Label>
        <Input
          id="hospitalization_details"
          {...register("hospitalization_details")}
        />
      </div>
      <div>
        <Label htmlFor="taking_medications">Taking Medications</Label>
        <RadioGroup
          defaultValue={takingMedications ? "true" : "false"}
          onValueChange={(value) =>
            setValue("taking_medications", value === "true")
          }
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="medications-yes" />
            <Label htmlFor="medications-yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="medications-no" />
            <Label htmlFor="medications-no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="medications_list">Medications List</Label>
        <Input id="medications_list" {...register("medications_list")} />
      </div>
      <div>
        <Label htmlFor="uses_tobacco">Uses Tobacco</Label>
        <RadioGroup
          defaultValue={usesTobacco ? "true" : "false"}
          onValueChange={(value) => setValue("uses_tobacco", value === "true")}
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="tobacco-yes" />
            <Label htmlFor="tobacco-yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="tobacco-no" />
            <Label htmlFor="tobacco-no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="list_of_allergies" className="mb-2 block">
          Allergies
        </Label>
        <ScrollArea className="h-[150px] border rounded-md p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            {ALLERGIES.map((allergy) => (
              <div key={allergy} className="flex items-center space-x-2">
                <Checkbox
                  id={`allergy-${allergy}`}
                  checked={selectedAllergies.includes(allergy)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedAllergies([...selectedAllergies, allergy]);
                    } else {
                      setSelectedAllergies(
                        selectedAllergies.filter((a) => a !== allergy)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`allergy-${allergy}`}
                  className="font-normal text-sm"
                >
                  {allergy}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
        {selectedAllergies.includes("Other") && (
          <Input
            className="mt-2"
            placeholder="Specify other allergies"
            value={otherAllergy}
            onChange={(e) => setOtherAllergy(e.target.value)}
            onBlur={() => {
              if (otherAllergy.trim() && selectedAllergies.includes("Other")) {
                const updatedAllergies = selectedAllergies.filter(
                  (a) => !a.startsWith("Other:")
                );
                setSelectedAllergies([
                  ...updatedAllergies,
                  `Other: ${otherAllergy.trim()}`,
                ]);
              }
            }}
          />
        )}
      </div>
      <div>
        <Label htmlFor="bleeding_time">Bleeding Time</Label>
        <Input id="bleeding_time" {...register("bleeding_time")} />
      </div>
      <div>
        <Label htmlFor="is_pregnant">Is Pregnant</Label>
        <RadioGroup
          defaultValue={isPregnant ? "true" : "false"}
          onValueChange={(value) => setValue("is_pregnant", value === "true")}
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="pregnant-yes" />
            <Label htmlFor="pregnant-yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="pregnant-no" />
            <Label htmlFor="pregnant-no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="is_nursing">Is Nursing</Label>
        <RadioGroup
          defaultValue={isNursing ? "true" : "false"}
          onValueChange={(value) => setValue("is_nursing", value === "true")}
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="nursing-yes" />
            <Label htmlFor="nursing-yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="nursing-no" />
            <Label htmlFor="nursing-no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="taking_birth_control">Taking Birth Control</Label>
        <RadioGroup
          defaultValue={takingBirthControl ? "true" : "false"}
          onValueChange={(value) =>
            setValue("taking_birth_control", value === "true")
          }
          className="flex space-x-4 mt-1"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="true" id="birth-control-yes" />
            <Label htmlFor="birth-control-yes" className="font-normal text-sm">
              Yes
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="false" id="birth-control-no" />
            <Label htmlFor="birth-control-no" className="font-normal text-sm">
              No
            </Label>
          </div>
        </RadioGroup>
      </div>
      <div>
        <Label htmlFor="blood_type">Blood Type</Label>
        <Select
          defaultValue={history.blood_type || ""}
          onValueChange={(value) => setValue("blood_type", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select blood type" />
          </SelectTrigger>
          <SelectContent>
            {BLOOD_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="blood_pressure">Blood Pressure</Label>
        <Input id="blood_pressure" {...register("blood_pressure")} />
      </div>
      <div>
        <Label htmlFor="selected_conditions" className="mb-2 block">
          Medical Conditions
        </Label>
        <ScrollArea className="h-[200px] border rounded-md p-4 bg-gray-50">
          <div className="grid grid-cols-2 gap-3">
            {MEDICAL_HISTORY_CHECKLIST.map((condition) => (
              <div key={condition} className="flex items-center space-x-2">
                <Checkbox
                  id={`condition-${condition}`}
                  checked={selectedConditions.includes(condition)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedConditions([...selectedConditions, condition]);
                    } else {
                      setSelectedConditions(
                        selectedConditions.filter((c) => c !== condition)
                      );
                    }
                  }}
                />
                <Label
                  htmlFor={`condition-${condition}`}
                  className="font-normal text-sm"
                >
                  {condition}
                </Label>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
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

export default MedicalHistoryEditForm;
