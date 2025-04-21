import React, { useState, useEffect } from "react";
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
// We're using zod schema for type inference instead of importing OrthodonticPatient
import { CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

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
  chief_complaint: z.string().optional(),
  past_medical_dental_history: z.string().optional(),
  prior_orthodontic_history: z.string().optional(),
  under_treatment_or_medication: z.enum(["Yes", "No"]),
  congenital_abnormalities: z.enum(["Yes", "No"]),
  tmj_problems: z.enum(["Yes", "No"]),
  oral_hygiene: z.enum(["Excellent", "Fair", "Poor"], {
    required_error: "Oral hygiene is required",
  }),
  gingival_tissues: z.enum(["Thick", "Thin", "Normal", "Receding"], {
    required_error: "Gingival tissues is required",
  }),
});

// Define the form values type based on the schema
type PatientFormValues = z.infer<typeof patientSchema>;

interface OrthodonticPatientFormProps {
  onNext: (data: PatientFormValues) => void;
  initialData?: Partial<PatientFormValues>;
}

const OrthodonticPatientForm: React.FC<OrthodonticPatientFormProps> = ({
  onNext,
  initialData = {},
}) => {
  const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialData.birthday ? new Date(initialData.birthday) : undefined
  );

  // Create a date at noon to avoid timezone issues
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0,
      0,
      0
    )
  );
  const currentDate = normalizedToday.toISOString().split("T")[0];

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      date_of_exam: initialData.date_of_exam || currentDate,
      name: initialData.name || "",
      occupation: initialData.occupation || "",
      birthday: initialData.birthday || "",
      parent_guardian_name: initialData.parent_guardian_name || "",
      address: initialData.address || "",
      telephone_home: initialData.telephone_home || "",
      telephone_business: initialData.telephone_business || "",
      cellphone_number: initialData.cellphone_number || "",
      email: initialData.email || "",
      chart: initialData.chart || "",
      sex: initialData.sex || undefined,
      age: initialData.age || undefined,
      chief_complaint: initialData.chief_complaint || "",
      past_medical_dental_history:
        initialData.past_medical_dental_history || "",
      prior_orthodontic_history: initialData.prior_orthodontic_history || "",
      under_treatment_or_medication:
        initialData.under_treatment_or_medication || "No",
      congenital_abnormalities: initialData.congenital_abnormalities || "No",
      tmj_problems: initialData.tmj_problems || "No",
      oral_hygiene: initialData.oral_hygiene || undefined,
      gingival_tissues: initialData.gingival_tissues || undefined,
    },
  });

  // Update birthday and age when date changes
  useEffect(() => {
    if (date) {
      // Use the date directly since we've already normalized it with UTC
      form.setValue("birthday", date.toISOString().split("T")[0]);

      // Calculate age using the normalized date
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < date.getDate())
      ) {
        age--;
      }
      form.setValue("age", age);

      // Log for debugging
      console.log("Birthday set to:", date.toISOString().split("T")[0]);
    }
  }, [date, form]);

  // Debounced name checking
  const watchedName = form.watch("name");

  useEffect(() => {
    if (watchedName && watchedName.length > 3) {
      const timer = setTimeout(async () => {
        setIsCheckingName(true);
        try {
          const normalizedName = watchedName.trim().toLowerCase();
          console.log(`Checking ortho patient name: ${normalizedName}`); // Debugging
          const exists = await window.api.checkOrthoPatientName(normalizedName);
          setNameExists(exists);
          setNameError(
            exists ? "A patient with this name already exists!" : null
          );
        } catch (error) {
          console.error("Error checking patient name:", error);
          setNameError("Error checking name. Please try again.");
        } finally {
          setIsCheckingName(false);
        }
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setNameError(null);
      setNameExists(false);
    }
  }, [watchedName, form]);

  const onSubmit = (data: PatientFormValues) => {
    if (nameExists) {
      form.setError("name", {
        type: "manual",
        message: "This patient already exists!",
      });
      return;
    }
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
                    Date of Exam <RequiredIndicator />
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-8 sm:h-9 border-gray-300 rounded-md text-xs sm:text-sm",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "MM/dd/yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarDays className="ml-auto h-4 w-4 text-black" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white shadow-lg rounded-md"
                      align="start"
                      side="bottom"
                      avoidCollisions
                    >
                      <Calendar
                        mode="single"
                        selected={
                          field.value ? new Date(field.value) : undefined
                        }
                        onSelect={(selectedDate) => {
                          if (selectedDate) {
                            // Create a date at noon to avoid timezone issues
                            const normalizedDate = new Date(
                              Date.UTC(
                                selectedDate.getFullYear(),
                                selectedDate.getMonth(),
                                selectedDate.getDate(),
                                12,
                                0,
                                0,
                                0
                              )
                            );
                            // Format the date as YYYY-MM-DD for the form field
                            field.onChange(
                              normalizedDate.toISOString().split("T")[0]
                            );
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        className="p-3 rounded-md border border-gray-200"
                        classNames={{
                          months:
                            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption:
                            "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium hidden",
                          caption_dropdowns: "flex justify-center space-x-2",
                          dropdown_month: "relative",
                          dropdown_year: "relative",
                          dropdown:
                            "border border-gray-300 rounded-md bg-white text-sm p-1 focus:ring-2 focus:ring-blue-500",
                          nav: "flex items-center",
                          nav_button: "hidden",
                          nav_button_previous: "hidden",
                          nav_button_next: "hidden",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex w-full mb-2",
                          head_cell:
                            "text-gray-600 w-10 h-10 flex items-center justify-center font-normal text-sm",
                          row: "flex w-full space-x-1",
                          cell: "w-10 h-10 flex items-center justify-center",
                          day: "w-10 h-10 flex items-center justify-center font-normal text-sm rounded-md hover:bg-gray-200 focus:bg-gray-200 focus:outline-none cursor-pointer",
                          day_selected:
                            "bg-blue-600 text-white rounded-md font-medium",
                          day_today:
                            "border border-blue-500 text-blue-600 rounded-md",
                          day_disabled:
                            "text-gray-400 opacity-50 cursor-not-allowed",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
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
                    Full Name <RequiredIndicator />
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        placeholder="Enter patient's full name"
                        className={`border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm h-8 sm:h-9 ${
                          nameExists ? "border-red-500" : ""
                        }`}
                        {...field}
                      />
                      {isCheckingName && (
                        <span className="absolute right-2 top-2 text-xs text-gray-500">
                          Checking...
                        </span>
                      )}
                    </div>
                  </FormControl>
                  {nameError && (
                    <p className="text-red-500 text-xs mt-1">{nameError}</p>
                  )}
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
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full pl-3 text-left font-normal h-8 sm:h-9 border-gray-300 rounded-md text-xs sm:text-sm",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(new Date(field.value), "MM/dd/yyyy")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarDays className="ml-auto h-4 w-4 text-black" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 bg-white shadow-lg rounded-md"
                      align="start"
                      side="bottom"
                      avoidCollisions
                    >
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          if (selectedDate) {
                            // Create a date at noon to avoid timezone issues
                            const normalizedDate = new Date(
                              Date.UTC(
                                selectedDate.getFullYear(),
                                selectedDate.getMonth(),
                                selectedDate.getDate(),
                                12,
                                0,
                                0,
                                0
                              )
                            );
                            setDate(normalizedDate); // Update the date state
                            console.log("Selected Date:", normalizedDate); // Debug to confirm selection
                          }
                        }}
                        disabled={(date) =>
                          date > new Date() || date < new Date("1900-01-01")
                        }
                        initialFocus
                        captionLayout="dropdown-buttons"
                        fromYear={1900}
                        toYear={new Date().getFullYear()}
                        className="p-3 rounded-md border border-gray-200"
                        classNames={{
                          months:
                            "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                          month: "space-y-4",
                          caption:
                            "flex justify-center pt-1 relative items-center",
                          caption_label: "text-sm font-medium hidden",
                          caption_dropdowns: "flex justify-center space-x-2",
                          dropdown_month: "relative",
                          dropdown_year: "relative",
                          dropdown:
                            "border border-gray-300 rounded-md bg-white text-sm p-1 focus:ring-2 focus:ring-blue-500",
                          nav: "flex items-center",
                          nav_button: "hidden",
                          nav_button_previous: "hidden",
                          nav_button_next: "hidden",
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex w-full mb-2",
                          head_cell:
                            "text-gray-600 w-10 h-10 flex items-center justify-center font-normal text-sm",
                          row: "flex w-full space-x-1",
                          cell: "w-10 h-10 flex items-center justify-center",
                          day: "w-10 h-10 flex items-center justify-center font-normal text-sm rounded-md hover:bg-gray-200 focus:bg-gray-200 focus:outline-none cursor-pointer",
                          day_selected:
                            "bg-blue-600 text-white rounded-md font-medium",
                          day_today:
                            "border border-blue-500 text-blue-600 rounded-md",
                          day_disabled:
                            "text-gray-400 opacity-50 cursor-not-allowed",
                        }}
                      />
                    </PopoverContent>
                  </Popover>
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
                    Age <RequiredIndicator />
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
                    Sex <RequiredIndicator />
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
                    Cellphone Number <RequiredIndicator />
                  </FormLabel>
                  <FormControl>
                    <PhoneInput
                      country={"ph"}
                      value={field.value}
                      onChange={(value) => field.onChange(value)}
                      inputClass="border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 text-xs sm:text-sm w-full h-8 sm:h-9"
                      dropdownClass="z-50"
                      placeholder="Enter cellphone number"
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
                    Under Treatment/Medication <RequiredIndicator />
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
                    Congenital Abnormalities <RequiredIndicator />
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
                    TMJ Problems <RequiredIndicator />
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
                    Oral Hygiene <RequiredIndicator />
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
                    Gingival Tissues <RequiredIndicator />
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
            disabled={nameExists || isCheckingName}
            className={`bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-1.5 text-xs sm:text-sm w-full sm:w-auto ${
              nameExists || isCheckingName
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            Next
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrthodonticPatientForm;
