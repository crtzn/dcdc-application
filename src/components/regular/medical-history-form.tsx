import React, { useState } from "react";
import { CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

const medicalSchema = z.object({
  general_health: z.string().optional(),
  under_medical_treatment: z.boolean().optional(),
  medical_condition: z.string().optional(),
  serious_illness_or_surgery: z.boolean().optional(),
  illness_or_surgery_details: z.string().optional(),
  hospitalized: z.boolean().optional(),
  hospitalization_details: z.string().optional(),
  taking_medications: z.boolean().optional(),
  medications_list: z.string().optional(),
  uses_tobacco: z.boolean().optional(),
  list_of_allergies: z.string().optional(),
  bleeding_time: z.string().optional(),
  is_pregnant: z.boolean().optional(),
  is_nursing: z.boolean().optional(),
  taking_birth_control: z.boolean().optional(),
  blood_type: z.string().optional(),
  blood_pressure: z.string().optional(),
  selected_conditions: z.string().optional(),
});

type MedicalFormValues = z.infer<typeof medicalSchema>;

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

const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

interface MedicalHistoryFormProps {
  onNext: (data: MedicalFormValues) => void;
  onBack: () => void;
}

const MedicalHistoryForm: React.FC<MedicalHistoryFormProps> = ({
  onNext,
  onBack,
}) => {
  const [otherAllergy, setOtherAllergy] = useState("");
  const form = useForm<MedicalFormValues>({
    resolver: zodResolver(medicalSchema),
    defaultValues: {
      general_health: "",
      under_medical_treatment: false,
      medical_condition: "",
      serious_illness_or_surgery: false,
      illness_or_surgery_details: "",
      hospitalized: false,
      hospitalization_details: "",
      taking_medications: false,
      medications_list: "",
      uses_tobacco: false,
      list_of_allergies: "",
      bleeding_time: "",
      is_pregnant: false,
      is_nursing: false,
      taking_birth_control: false,
      blood_type: "",
      blood_pressure: "",
      selected_conditions: "",
    },
  });

  const { watch } = form;
  const underMedicalTreatment = watch("under_medical_treatment");
  const seriousIllnessOrSurgery = watch("serious_illness_or_surgery");
  const hospitalized = watch("hospitalized");
  const takingMedications = watch("taking_medications");

  const onSubmit = (data: MedicalFormValues) => {
    onNext(data);
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6   overflow-y-auto max-h-[80vh]">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* General Information */}
          <div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="general_health"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Are you in good health?
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select health status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="blood_pressure"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Blood Pressure
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 120/80 mmHg"
                        className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="blood_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Blood Type
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select blood type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {BLOOD_TYPES.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="bleeding_time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Bleeding Time
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., 2-4 minutes"
                        className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Medical Treatment */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Are you under medical treatment?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="under_medical_treatment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Under Medical Treatment?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="treatment_yes" />
                          <FormLabel
                            htmlFor="treatment_yes"
                            className="text-gray-600"
                          >
                            Yes
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="treatment_no" />
                          <FormLabel
                            htmlFor="treatment_no"
                            className="text-gray-600"
                          >
                            No
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              {underMedicalTreatment && (
                <FormField
                  control={form.control}
                  name="medical_condition"
                  render={({ field }) => (
                    <FormItem className="transition-all duration-300">
                      <FormLabel className="text-gray-700 font-medium">
                        Medical Condition
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Specify medical condition"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              )}
              <FormField
                control={form.control}
                name="taking_medications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Are you taking any prescriptions / non prescription
                      medication?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="medications_yes" />
                          <FormLabel
                            htmlFor="medications_yes"
                            className="text-gray-600"
                          >
                            Yes
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="medications_no" />
                          <FormLabel
                            htmlFor="medications_no"
                            className="text-gray-600"
                          >
                            No
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              {takingMedications && (
                <FormField
                  control={form.control}
                  name="medications_list"
                  render={({ field }) => (
                    <FormItem className="transition-all duration-300">
                      <FormLabel className="text-gray-700 font-medium">
                        Medications List
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="List all medications"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          <Separator />

          {/* Medical History */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Medical History
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="serious_illness_or_surgery"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Serious Illness or Surgery?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="illness_yes" />
                          <FormLabel
                            htmlFor="illness_yes"
                            className="text-gray-600"
                          >
                            Yes
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="illness_no" />
                          <FormLabel
                            htmlFor="illness_no"
                            className="text-gray-600"
                          >
                            No
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              {seriousIllnessOrSurgery && (
                <FormItem className="transition-all duration-300">
                  <FormLabel className="text-gray-700 font-medium">
                    Illness/Surgery Details
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="When and why?"
                      className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      {...form.register("illness_or_surgery_details")}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
              <FormField
                control={form.control}
                name="hospitalized"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Ever Hospitalized?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="hospitalized_yes" />
                          <FormLabel
                            htmlFor="hospitalized_yes"
                            className="text-gray-600"
                          >
                            Yes
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="hospitalized_no" />
                          <FormLabel
                            htmlFor="hospitalized_no"
                            className="text-gray-600"
                          >
                            No
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              {hospitalized && (
                <FormItem className="transition-all duration-300">
                  <FormLabel className="text-gray-700 font-medium">
                    Hospitalization Details
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Why were you hospitalized?"
                      className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      {...form.register("hospitalization_details")}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            </div>
          </div>

          <Separator />

          {/* Lifestyle and Allergies */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Lifestyle and Allergies
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="uses_tobacco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Use Tobacco Products?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="tobacco_yes" />
                          <FormLabel
                            htmlFor="tobacco_yes"
                            className="text-gray-600"
                          >
                            Yes
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="tobacco_no" />
                          <FormLabel
                            htmlFor="tobacco_no"
                            className="text-gray-600"
                          >
                            No
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="list_of_allergies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Allergies
                    </FormLabel>
                    <FormControl>
                      <div className="space-y-3">
                        {ALLERGIES.map((allergy) => (
                          <div
                            key={allergy}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={allergy}
                              checked={field.value?.includes(allergy)}
                              onCheckedChange={(checked) => {
                                const current = field.value
                                  ? field.value.split(",")
                                  : [];
                                if (checked) {
                                  field.onChange(
                                    [...current, allergy]
                                      .filter(Boolean)
                                      .join(",")
                                  );
                                } else {
                                  field.onChange(
                                    current
                                      .filter(
                                        (a) =>
                                          a !== allergy && a !== otherAllergy
                                      )
                                      .join(",")
                                  );
                                }
                              }}
                              className="border-gray-300 rounded-sm data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                            />
                            <label
                              htmlFor={allergy}
                              className="text-sm text-gray-600"
                            >
                              {allergy}
                            </label>
                          </div>
                        ))}
                        {field.value?.includes("Other") && (
                          <Input
                            placeholder="Specify other allergy"
                            className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 mt-2"
                            value={otherAllergy}
                            onChange={(e) => {
                              const value = e.target.value;
                              setOtherAllergy(value);
                              const current = field.value
                                ? field.value.split(",")
                                : [];
                              const updated = current.filter(
                                (a) => a !== "Other" && !ALLERGIES.includes(a)
                              );
                              if (value) {
                                field.onChange(
                                  [...updated, "Other", value]
                                    .filter(Boolean)
                                    .join(",")
                                );
                              } else {
                                field.onChange(updated.join(","));
                              }
                            }}
                          />
                        )}
                      </div>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Reproductive Health */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Reproductive Health
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="is_pregnant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Pregnant?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="pregnant_yes" />
                          <FormLabel
                            htmlFor="pregnant_yes"
                            className="text-gray-600"
                          >
                            Yes
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="pregnant_no" />
                          <FormLabel
                            htmlFor="pregnant_no"
                            className="text-gray-600"
                          >
                            No
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="is_nursing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Nursing?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="nursing_yes" />
                          <FormLabel
                            htmlFor="nursing_yes"
                            className="text-gray-600"
                          >
                            Yes
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="nursing_no" />
                          <FormLabel
                            htmlFor="nursing_no"
                            className="text-gray-600"
                          >
                            No
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="taking_birth_control"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Taking Birth Control?
                    </FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) =>
                          field.onChange(value === "true")
                        }
                        value={field.value ? "true" : "false"}
                        className="flex space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="true" id="birth_control_yes" />
                          <FormLabel
                            htmlFor="birth_control_yes"
                            className="text-gray-600"
                          >
                            Yes
                          </FormLabel>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="false" id="birth_control_no" />
                          <FormLabel
                            htmlFor="birth_control_no"
                            className="text-gray-600"
                          >
                            No
                          </FormLabel>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Conditions Checklist */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-4">
              Medical Conditions
            </h3>
            <FormField
              control={form.control}
              name="selected_conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    Do you have or have you had any of the following?
                  </FormLabel>
                  <FormControl>
                    <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {MEDICAL_HISTORY_CHECKLIST.map((condition) => (
                          <div
                            key={condition}
                            className="flex items-center space-x-2"
                          >
                            <Checkbox
                              id={condition}
                              checked={field.value?.includes(condition)}
                              onCheckedChange={(checked) => {
                                const current = field.value
                                  ? field.value.split(",").filter(Boolean)
                                  : [];
                                if (checked) {
                                  field.onChange(
                                    [...current, condition].join(",")
                                  );
                                } else {
                                  field.onChange(
                                    current
                                      .filter((c) => c !== condition)
                                      .join(",")
                                  );
                                }
                              }}
                              className="border-gray-300 rounded-sm data-[state=checked]:bg-blue-600 data-[state=checked]:text-white"
                            />
                            <label
                              htmlFor={condition}
                              className="text-sm text-gray-600"
                            >
                              {condition}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <CardFooter className="flex justify-between mt-6 sticky bottom-0 bg-white py-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              Next
            </Button>
          </CardFooter>
        </form>
      </Form>
    </div>
  );
};

export default MedicalHistoryForm;
