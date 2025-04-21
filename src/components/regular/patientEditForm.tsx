// src/components/regular/RegularPatientEditForm.tsx
import React from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegularPatient } from "@/electron/types/RegularPatient";
import { toast } from "sonner";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const { register, handleSubmit, setValue } = useForm<
    Partial<Omit<RegularPatient, "patient_id">>
  >({
    defaultValues: patient,
  });

  // Initialize form with default values
  React.useEffect(() => {
    // Make sure fields are properly set
    setValue("name", patient.name || "");
    setValue("birthday", patient.birthday || "");
    setValue("religion", patient.religion || "");
    setValue("home_address", patient.home_address || "");
    setValue("sex", patient.sex || "Male");
    setValue("age", patient.age || 0);
    setValue("nationality", patient.nationality || "");
    setValue("cellphone_number", patient.cellphone_number || "");
    setValue("registration_date", patient.registration_date || "");
  }, [patient, setValue]);

  // Watch values
  const gender = React.useMemo(() => patient.sex || "Male", [patient.sex]);
  const religion = React.useMemo(
    () => patient.religion || "",
    [patient.religion]
  );

  // Religion options
  const RELIGIONS = [
    "Roman Catholic",
    "Islam",
    "Iglesia ni Cristo",
    "Protestant",
    "Born Again Christian",
    "Seventh-day Adventist",
    "Jehovah's Witness",
    "Church of Christ",
    "Other",
  ];

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
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="space-y-4 max-h-[60vh] overflow-y-auto p-2"
    >
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
        <Select
          defaultValue={religion}
          onValueChange={(value) => setValue("religion", value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select religion" />
          </SelectTrigger>
          <SelectContent>
            {RELIGIONS.map((rel) => (
              <SelectItem key={rel} value={rel}>
                {rel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="home_address">Home Address</Label>
        <Input id="home_address" {...register("home_address")} />
      </div>
      <div>
        <Label htmlFor="sex">Gender</Label>
        <Select
          defaultValue={gender}
          onValueChange={(value) => setValue("sex", value)}
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
        <Label htmlFor="nationality">Nationality</Label>
        <Input id="nationality" {...register("nationality")} />
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
        <Label htmlFor="registration_date">Registration Date</Label>
        <Input
          id="registration_date"
          type="date"
          {...register("registration_date")}
          disabled
          className="bg-gray-100"
        />
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

export default RegularPatientEditForm;
