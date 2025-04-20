// src/components/regular/RegularPatientEditForm.tsx
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegularPatient } from "@/electron/types/RegularPatient";
import { toast } from "sonner";

interface RegularPatientEditFormProps {
  patient: RegularPatient;
  onSubmit: (data: Partial<Omit<RegularPatient, "patient_id">>) => void;
  onCancel: () => void;
}

const RegularPatientEditForm = ({
  patient,
  onSubmit,
  onCancel,
}: RegularPatientEditFormProps) => {
  const { register, handleSubmit } = useForm<
    Partial<Omit<RegularPatient, "patient_id">>
  >({
    defaultValues: patient,
  });

  const onFormSubmit = async (
    data: Partial<Omit<RegularPatient, "patient_id">>
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
        <Label htmlFor="name">Name</Label>
        <Input id="name" {...register("name")} required />
      </div>
      <div>
        <Label htmlFor="birthday">Birthday</Label>
        <Input id="birthday" type="date" {...register("birthday")} />
      </div>
      <div>
        <Label htmlFor="religion">Religion</Label>
        <Input id="religion" {...register("religion")} />
      </div>
      <div>
        <Label htmlFor="home_address">Home Address</Label>
        <Input id="home_address" {...register("home_address")} />
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
        <Label htmlFor="nationality">Nationality</Label>
        <Input id="nationality" {...register("nationality")} />
      </div>
      <div>
        <Label htmlFor="cellphone_number">Cellphone Number</Label>
        <Input id="cellphone_number" {...register("cellphone_number")} />
      </div>
      <div>
        <Label htmlFor="registration_date">Registration Date</Label>
        <Input
          id="registration_date"
          type="date"
          {...register("registration_date")}
        />
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

export default RegularPatientEditForm;
