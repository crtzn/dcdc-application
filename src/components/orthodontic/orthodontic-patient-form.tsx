import React from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";
import { OrthodonticPatient } from "@/electron/types/OrthodonticPatient";

const patientSchema = z.object({
  date_of_exam: z.string().min(1, "Date of exam is required"),
  name: z.string().min(1, "Name is required"),
  occupation: z.string().optional(),
  birthday: z.string().optional(),
  parent_guardian_name: z.string().optional(),
  address: z.string().optional(),
  telephone_home: z.string().optional(),
  telephone_business: z.string().optional(),
  cellphone_number: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  chart: z.string().optional(),
  sex: z.enum(["Male", "Female", "Other"], {
    required_error: "Sex is required",
  }),
  age: z.number().min(0, "Age must be positive").optional(),
  chief_complaint: z.string().min(1, "Chief complaint is required"),
  past_medical_dental_history: z.string().optional(),
  prior_orthodontic_history: z.string().optional(),
  under_treatment_or_medication: z.enum(["Yes", "No"], {
    required_error: "Please select an option",
  }),
  congenital_abnormalities: z.enum(["Yes", "No"], {
    required_error: "Please select an option",
  }),
  tmj_problems: z.enum(["Yes", "No"], {
    required_error: "Please select an option",
  }),
  oral_hygiene: z.enum(["Excellent", "Fair", "Poor"], {
    required_error: "Oral hygiene is required",
  }),
  gingival_tissues: z.enum(["Thick", "Thin", "Normal", "Receding"], {
    required_error: "Gingival tissues is required",
  }),
});

type PatientFormValues = Omit<
  OrthodonticPatient,
  "patient_id" | "created_at" | "updated_at"
>;

interface OrthodonticPatientFormProps {
  onNext: (data: PatientFormValues) => void;
}

const OrthodonticPatientForm: React.FC<OrthodonticPatientFormProps> = ({
  onNext,
}) => {
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      date_of_exam: new Date().toISOString().split("T")[0],
      name: "",
      occupation: "",
      birthday: "",
      parent_guardian_name: "",
      address: "",
      telephone_home: "",
      telephone_business: "",
      cellphone_number: "",
      email: "",
      chart: "",
      sex: undefined,
      age: undefined,
      chief_complaint: "",
      past_medical_dental_history: "",
      prior_orthodontic_history: "",
      under_treatment_or_medication: undefined,
      congenital_abnormalities: undefined,
      tmj_problems: undefined,
      oral_hygiene: undefined,
      gingival_tissues: undefined,
    },
  });

  const onSubmit = (data: PatientFormValues) => {
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Personal Details */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-2 sm:text-lg">
            Personal Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="date_of_exam"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Date of Exam
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter patient's full name"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="occupation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Occupation
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter occupation"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="birthday"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Date of Birth
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Age
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter age"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Sex
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                        aria-label="Select sex"
                      >
                        <SelectValue placeholder="Select sex" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="parent_guardian_name"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Parent/Guardian Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter parent or guardian name"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="my-2" />

        {/* Contact Information */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-2 sm:text-lg">
            Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="telephone_home"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Telephone (Home)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter home telephone"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="telephone_business"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Telephone (Business)
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter business telephone"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="cellphone_number"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Cellphone Number
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter cellphone number"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter email address"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter complete address"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator className="my-2" />

        {/* Medical Details */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-2 sm:text-lg">
            Medical Details
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormField
              control={form.control}
              name="chief_complaint"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Chief Complaint
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter chief complaint"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm min-h-[60px] sm:min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="past_medical_dental_history"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Past Medical/Dental History
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter past medical/dental history"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm min-h-[60px] sm:min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="prior_orthodontic_history"
              render={({ field }) => (
                <FormItem className="sm:col-span-2">
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Prior Orthodontic History
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter prior orthodontic history"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm min-h-[60px] sm:min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="chart"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Chart
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter chart details"
                      className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="under_treatment_or_medication"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Under Treatment/Medication
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="Yes"
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-xs sm:text-sm">
                          Yes
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="No"
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-xs sm:text-sm">
                          No
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="congenital_abnormalities"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Congenital Abnormalities
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="Yes"
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-xs sm:text-sm">
                          Yes
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="No"
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-xs sm:text-sm">
                          No
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tmj_problems"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    TMJ Problems
                  </FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="flex space-x-4"
                    >
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="Yes"
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-xs sm:text-sm">
                          Yes
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          <RadioGroupItem
                            value="No"
                            className="h-3 w-3 sm:h-4 sm:w-4"
                          />
                        </FormControl>
                        <FormLabel className="font-normal text-xs sm:text-sm">
                          No
                        </FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="oral_hygiene"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Oral Hygiene
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                        aria-label="Select oral hygiene"
                      >
                        <SelectValue placeholder="Select oral hygiene" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Excellent">Excellent</SelectItem>
                      <SelectItem value="Fair">Fair</SelectItem>
                      <SelectItem value="Poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gingival_tissues"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-gray-700 sm:text-sm">
                    Gingival Tissues
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger
                        className="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9"
                        aria-label="Select gingival tissues"
                      >
                        <SelectValue placeholder="Select gingival tissues" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Thick">Thick</SelectItem>
                      <SelectItem value="Thin">Thin</SelectItem>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="Receding">Receding</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <Button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1.5 text-xs sm:text-sm w-full sm:w-auto"
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrthodonticPatientForm;
