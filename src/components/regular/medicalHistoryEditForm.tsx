// src/components/regular/MedicalHistoryEditForm.tsx
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegularMedicalHistory } from "@/electron/types/RegularPatient";
import { toast } from "sonner";

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
  const { register, handleSubmit } = useForm<
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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="general_health">General Health</Label>
        <Input id="general_health" {...register("general_health")} />
      </div>
      <div>
        <Label htmlFor="under_medical_treatment">Under Medical Treatment</Label>
        <Input
          id="under_medical_treatment"
          type="checkbox"
          {...register("under_medical_treatment")}
        />
      </div>
      <div>
        <Label htmlFor="medical_condition">Medical Condition</Label>
        <Input id="medical_condition" {...register("medical_condition")} />
      </div>
      <div>
        <Label htmlFor="serious_illness_or_surgery">
          Serious Illness/Surgery
        </Label>
        <Input
          id="serious_illness_or_surgery"
          type="checkbox"
          {...register("serious_illness_or_surgery")}
        />
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
        <Input
          id="hospitalized"
          type="checkbox"
          {...register("hospitalized")}
        />
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
        <Input
          id="taking_medications"
          type="checkbox"
          {...register("taking_medications")}
        />
      </div>
      <div>
        <Label htmlFor="medications_list">Medications List</Label>
        <Input id="medications_list" {...register("medications_list")} />
      </div>
      <div>
        <Label htmlFor="uses_tobacco">Uses Tobacco</Label>
        <Input
          id="uses_tobacco"
          type="checkbox"
          {...register("uses_tobacco")}
        />
      </div>
      <div>
        <Label htmlFor="list_of_allergies">List of Allergies</Label>
        <Input id="list_of_allergies" {...register("list_of_allergies")} />
      </div>
      <div>
        <Label htmlFor="bleeding_time">Bleeding Time</Label>
        <Input id="bleeding_time" {...register("bleeding_time")} />
      </div>
      <div>
        <Label htmlFor="is_pregnant">Is Pregnant</Label>
        <Input id="is_pregnant" type="checkbox" {...register("is_pregnant")} />
      </div>
      <div>
        <Label htmlFor="is_nursing">Is Nursing</Label>
        <Input id="is_nursing" type="checkbox" {...register("is_nursing")} />
      </div>
      <div>
        <Label htmlFor="taking_birth_control">Taking Birth Control</Label>
        <Input
          id="taking_birth_control"
          type="checkbox"
          {...register("taking_birth_control")}
        />
      </div>
      <div>
        <Label htmlFor="blood_type">Blood Type</Label>
        <Input id="blood_type" {...register("blood_type")} />
      </div>
      <div>
        <Label htmlFor="blood_pressure">Blood Pressure</Label>
        <Input id="blood_pressure" {...register("blood_pressure")} />
      </div>
      <div>
        <Label htmlFor="selected_conditions">Selected Conditions</Label>
        <Input id="selected_conditions" {...register("selected_conditions")} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
};

export default MedicalHistoryEditForm;
