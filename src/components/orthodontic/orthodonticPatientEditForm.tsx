// src/components/orthodontic/OrthodonticPatientEditForm.tsx
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OrthodonticPatient } from "@/electron/types/OrthodonticPatient";
import { toast } from "sonner";

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
  const { register, handleSubmit } = useForm<
    Partial<Omit<OrthodonticPatient, "patient_id">>
  >({
    defaultValues: patient,
  });

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
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
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
        <Input id="telephone_home" {...register("telephone_home")} />
      </div>
      <div>
        <Label htmlFor="telephone_business">Telephone (Business)</Label>
        <Input id="telephone_business" {...register("telephone_business")} />
      </div>
      <div>
        <Label htmlFor="cellphone_number">Cellphone Number</Label>
        <Input id="cellphone_number" {...register("cellphone_number")} />
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
        <Input id="sex" {...register("sex")} />
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
        <Input
          id="under_treatment_or_medication"
          type="checkbox"
          {...register("under_treatment_or_medication")}
        />
      </div>
      <div>
        <Label htmlFor="congenital_abnormalities">
          Congenital Abnormalities
        </Label>
        <Input
          id="congenital_abnormalities"
          type="checkbox"
          {...register("congenital_abnormalities")}
        />
      </div>
      <div>
        <Label htmlFor="temporomandibular_joint_problems">TMJ Problems</Label>
        <Input
          id="temporomandibular_joint_problems"
          type="checkbox"
          {...register("tmj_problems")}
        />
      </div>
      <div>
        <Label htmlFor="oral_hygiene">Oral Hygiene</Label>
        <Input id="oral_hygiene" {...register("oral_hygiene")} />
      </div>
      <div>
        <Label htmlFor="gingival_tissues">Gingival Tissues</Label>
        <Input id="gingival_tissues" {...register("gingival_tissues")} />
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

export default OrthodonticPatientEditForm;
