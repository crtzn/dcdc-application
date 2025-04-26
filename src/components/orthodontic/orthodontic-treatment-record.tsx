// src/components/orthodontic/orthodontic-treatment-record.tsx
import React, { useEffect, useState } from "react";
import { usePopoverClose } from "@/hooks/usePopoverClose";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";
import { CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const treatmentSchema = z.object({
  appt_no: z.string().min(1, "Appointment number is required"),
  date: z.string().min(1, "Date is required"),
  arch_wire: z.string().min(1, "Arch wire is required"),
  procedure: z.string().optional(),
  appliances: z.string().optional(),
  contract_price: z
    .union([z.number().min(0, "Contract price must be positive"), z.null()])
    .optional(),
  contract_months: z
    .union([z.number().min(1, "Contract months must be at least 1"), z.null()])
    .optional(),
  amount_paid: z
    .union([z.number().min(0, "Amount paid must be positive"), z.null()])
    .optional(),
  next_schedule: z.string().optional(),
  mode_of_payment: z.string().optional(),
  treatment_cycle: z.union([z.number(), z.null()]).optional(),
  balance: z.union([z.number(), z.null()]).optional(),
});

// Define the form values type based on the Zod schema
type TreatmentFormValues = z.infer<typeof treatmentSchema>;

interface OrthodonticTreatmentRecordFormProps {
  onSubmit: (data: TreatmentFormValues) => void;
  onBack: () => void;
  patientId?: number; // Optional patient ID for existing patients
  defaultAppointmentNumber?: string; // Optional default appointment number
  initialData?: Partial<TreatmentFormValues>; // Initial data for editing
  isEditing?: boolean; // Flag to indicate if form is in edit mode
}

// Helper function to normalize date to avoid timezone issues
const normalizeDate = (date: Date): Date => {
  return new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12, // Set to noon UTC to avoid timezone issues
      0,
      0,
      0
    )
  );
};

const OrthodonticTreatmentRecordForm: React.FC<
  OrthodonticTreatmentRecordFormProps
> = ({
  onSubmit,
  onBack,
  patientId,
  defaultAppointmentNumber,
  initialData,
  isEditing = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [treatmentDate, setTreatmentDate] = useState<Date | undefined>(() => {
    // Initialize with normalized date from initialData or current date
    if (initialData?.date) {
      return normalizeDate(new Date(initialData.date));
    }
    return normalizeDate(new Date());
  });
  const [nextScheduleDate, setNextScheduleDate] = useState<Date | undefined>(
    () => {
      // Initialize with normalized date from initialData or undefined
      if (initialData?.next_schedule) {
        return normalizeDate(new Date(initialData.next_schedule));
      }
      return undefined;
    }
  );
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState(initialData?.appliances || "");

  // Popover states for calendar controls
  const treatmentDatePopover = usePopoverClose();
  const nextSchedulePopover = usePopoverClose();

  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: initialData
      ? {
          appt_no: initialData.appt_no || defaultAppointmentNumber || "",
          date: initialData.date || new Date().toISOString().split("T")[0],
          arch_wire: initialData.arch_wire || "",
          procedure: initialData.procedure || "",
          appliances: initialData.appliances || "",
          contract_price: initialData.contract_price,
          contract_months: initialData.contract_months,
          amount_paid: initialData.amount_paid,
          next_schedule: initialData.next_schedule || "",
          mode_of_payment: initialData.mode_of_payment || "Cash",
          treatment_cycle: initialData.treatment_cycle || 1,
          balance: initialData.balance,
        }
      : {
          appt_no: defaultAppointmentNumber || "",
          date: new Date().toISOString().split("T")[0],
          arch_wire: "", // Required field but marked as optional in the type
          procedure: "",
          appliances: "",
          contract_price: undefined,
          contract_months: undefined,
          amount_paid: undefined, // No default value
          next_schedule: "",
          mode_of_payment: "Cash", // Default to Cash as per user preference
          treatment_cycle: 1,
          balance: undefined,
        },
  });

  // Initialize appliances field state when component mounts
  useEffect(() => {
    const appliancesValue = form.getValues("appliances");
    if (appliancesValue) {
      if (
        ["Pads", "Anterior Bite Plate", "Retainers"].includes(appliancesValue)
      ) {
        setShowOtherInput(false);
      } else {
        setShowOtherInput(true);
        setOtherValue(appliancesValue);
      }
    }
  }, [form]);

  // Fetch the next appointment number and patient details when the component mounts
  useEffect(() => {
    // Skip fetching data if we're in editing mode
    if (isEditing) return;

    const fetchData = async () => {
      if (patientId) {
        setLoading(true);
        try {
          // Get patient details to check treatment cycle
          const patientDetails = await window.api.getPatientDetails(
            patientId,
            "Ortho"
          );

          if (patientDetails.success && patientDetails.patient) {
            const patient = patientDetails.patient.info;

            // Set treatment cycle
            if (patient.treatment_cycle) {
              form.setValue("treatment_cycle", patient.treatment_cycle);
            }

            // If this is the first appointment of a cycle, pre-fill contract details
            if (!defaultAppointmentNumber) {
              // Get next appointment number for this treatment cycle
              const result = await window.api.getNextOrthoAppointmentNumber(
                patientId,
                patient.treatment_cycle
              );

              if (result.success && result.next_appt_no) {
                form.setValue("appt_no", result.next_appt_no.toString());

                // If this is the first appointment of the cycle, pre-fill contract details
                if (result.next_appt_no === 1) {
                  // Pre-fill with current contract details if available
                  if (patient.current_contract_price) {
                    form.setValue(
                      "contract_price",
                      patient.current_contract_price
                    );
                  }
                  if (patient.current_contract_months) {
                    form.setValue(
                      "contract_months",
                      patient.current_contract_months
                    );
                  }
                }
              }
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchData();
  }, [patientId, defaultAppointmentNumber, form, isEditing]);

  // Function to handle manual date input for treatment date
  const handleTreatmentDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    form.setValue("date", inputValue);

    // Try to parse the input as a date
    const parsedDate = new Date(inputValue);
    if (!isNaN(parsedDate.getTime())) {
      // Normalize the date to avoid timezone issues
      const normalizedDate = normalizeDate(parsedDate);
      setTreatmentDate(normalizedDate);
    }
  };

  // Function to handle manual date input for next schedule
  const handleNextScheduleDateInput = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const inputValue = e.target.value;
    form.setValue("next_schedule", inputValue);

    // Try to parse the input as a date
    const parsedDate = new Date(inputValue);
    if (!isNaN(parsedDate.getTime())) {
      // Normalize the date to avoid timezone issues
      const normalizedDate = normalizeDate(parsedDate);
      setNextScheduleDate(normalizedDate);
    }
  };

  const handleSubmit = form.handleSubmit(
    (data) => {
      console.log("Form submitted with data:", data); // Add logging

      // Make sure arch_wire is not empty
      if (!data.arch_wire || data.arch_wire.trim() === "") {
        toast.error("Arch wire is required");
        return;
      }

      // For first appointment, make sure contract_price and contract_months are provided
      if (data.appt_no === "1" && !isEditing) {
        if (data.contract_price === undefined || data.contract_price === null) {
          toast.error("Contract price is required for the first appointment");
          return;
        }
        if (
          data.contract_months === undefined ||
          data.contract_months === null
        ) {
          toast.error(
            "Contract duration is required for the first appointment"
          );
          return;
        }
      }

      // Make sure amount_paid is provided
      if (data.amount_paid === undefined || data.amount_paid === null) {
        toast.error("Amount paid is required");
        return;
      }

      onSubmit(data);
    },
    (errors) => {
      console.error("Form validation errors:", errors);
      // Show validation errors to the user
      const errorFields = Object.keys(errors);
      if (errorFields.length > 0) {
        const firstErrorField = errorFields[0] as keyof typeof errors;
        const errorMessage =
          errors[firstErrorField]?.message || "Validation error";
        toast.error(`Form validation error: ${errorMessage}`);
      }
    }
  );

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border border-gray-200 flex flex-col">
      <CardHeader className="pb-0 pt-4 px-6">
        <CardTitle className="text-xl font-bold text-center text-gray-800">
          Orthodontic Treatment Record
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-2">
          <CardContent className="space-y-6 px-4 sm:px-6 pt-4">
            {/* Treatment Details */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
                Treatment Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="appt_no"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Appointment Number{" "}
                        <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder={
                            loading ? "Loading..." : "Enter appointment number"
                          }
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10 bg-gray-100"
                          disabled={true}
                          {...field}
                        />
                      </FormControl>
                      {patientId !== undefined && (
                        <FormDescription className="text-xs text-gray-500">
                          Appointment number is automatically assigned and
                          cannot be edited.
                        </FormDescription>
                      )}
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Treatment Date <span className="text-red-500">*</span>
                      </FormLabel>
                      <div className="flex flex-col space-y-2">
                        <Input
                          type="date"
                          placeholder="YYYY-MM-DD"
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10"
                          value={field.value}
                          onChange={handleTreatmentDateInput}
                        />
                        <Popover
                          open={treatmentDatePopover.open}
                          onOpenChange={treatmentDatePopover.onOpenChange}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal h-10 border-gray-300 rounded-md",
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
                              selected={treatmentDate}
                              onSelect={(date) => {
                                if (date) {
                                  // Normalize the date to avoid timezone issues
                                  const normalizedDate = normalizeDate(date);
                                  setTreatmentDate(normalizedDate);
                                  field.onChange(
                                    normalizedDate.toISOString().split("T")[0]
                                  );
                                  treatmentDatePopover.onSelect()(); // Close popover after selection
                                }
                              }}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
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
                                caption_dropdowns:
                                  "flex justify-center space-x-2",
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
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="arch_wire"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Arch Wire <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter arch wire details"
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="procedure"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Procedure
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter procedure"
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="appliances"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Appliances
                      </FormLabel>
                      <Select
                        onValueChange={(value) => {
                          if (value === "Others") {
                            setShowOtherInput(true);
                            // Keep the current value if switching to Others
                            if (
                              field.value &&
                              field.value !== "Others" &&
                              ![
                                "Pads",
                                "Anterior Bite Plate",
                                "Retainers",
                              ].includes(field.value)
                            ) {
                              setOtherValue(field.value);
                            }
                          } else {
                            setShowOtherInput(false);
                            field.onChange(value);
                          }
                        }}
                        value={showOtherInput ? "Others" : field.value || ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10">
                            <SelectValue placeholder="Select appliance" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Pads">Pads</SelectItem>
                          <SelectItem value="Anterior Bite Plate">
                            Anterior Bite Plate
                          </SelectItem>
                          <SelectItem value="Retainers">Retainers</SelectItem>
                          <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                      </Select>

                      {showOtherInput && (
                        <div className="mt-2">
                          <Input
                            placeholder="Specify other appliance"
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10"
                            value={otherValue}
                            onChange={(e) => {
                              const value = e.target.value;
                              setOtherValue(value);
                              field.onChange(value);
                            }}
                          />
                        </div>
                      )}

                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-2" />

            {/* Contract Information - Only show for first appointment */}
            {form.watch("appt_no") === "1" && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
                  Contract Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <FormField
                    control={form.control}
                    name="contract_price"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="text-gray-700 font-medium">
                          Contract Price <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter contract price"
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10"
                            {...field}
                            value={
                              field.value === undefined || field.value === null
                                ? ""
                                : field.value.toString()
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? undefined : parseFloat(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500">
                          Total price for the entire treatment plan
                        </FormDescription>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contract_months"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="text-gray-700 font-medium">
                          Contract Duration (Months){" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Enter duration in months"
                            className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10"
                            {...field}
                            value={
                              field.value === undefined || field.value === null
                                ? ""
                                : field.value.toString()
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? undefined : parseInt(value)
                              );
                            }}
                          />
                        </FormControl>
                        <FormDescription className="text-xs text-gray-500">
                          Expected duration of the treatment in months.
                        </FormDescription>
                        <FormMessage className="text-red-500 text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-800 mb-4 border-b pb-2">
                Payment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <FormField
                  control={form.control}
                  name="amount_paid"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Amount Paid <span className="text-red-500">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount paid"
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10"
                          {...field}
                          value={
                            field.value === undefined || field.value === null
                              ? ""
                              : field.value.toString()
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(
                              value === "" ? undefined : parseFloat(value)
                            );
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="next_schedule"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Next Schedule
                      </FormLabel>
                      <div className="flex flex-col space-y-2">
                        <Input
                          type="date"
                          placeholder="YYYY-MM-DD"
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10"
                          value={field.value || ""}
                          onChange={handleNextScheduleDateInput}
                        />
                        <Popover
                          open={nextSchedulePopover.open}
                          onOpenChange={nextSchedulePopover.onOpenChange}
                        >
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                type="button"
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal h-10 border-gray-300 rounded-md",
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
                              selected={nextScheduleDate}
                              onSelect={(date) => {
                                if (date) {
                                  // Normalize the date to avoid timezone issues
                                  const normalizedDate = normalizeDate(date);
                                  setNextScheduleDate(normalizedDate);
                                  field.onChange(
                                    normalizedDate.toISOString().split("T")[0]
                                  );
                                  nextSchedulePopover.onSelect()(); // Close popover after selection
                                }
                              }}
                              disabled={(date) => date < new Date("1900-01-01")}
                              initialFocus
                              captionLayout="dropdown-buttons"
                              fromYear={1900}
                              toYear={new Date().getFullYear() + 5}
                              className="p-3 rounded-md border border-gray-200"
                              classNames={{
                                months:
                                  "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                month: "space-y-4",
                                caption:
                                  "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium hidden",
                                caption_dropdowns:
                                  "flex justify-center space-x-2",
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
                              }}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <FormMessage className="text-red-500 text-xs" />
                      <FormDescription className="text-xs text-gray-500">
                        Select the date for the next appointment
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mode_of_payment"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-1.5">
                      <FormLabel className="text-gray-700 font-medium">
                        Mode of Payment
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value || ""}
                        defaultValue="Cash"
                      >
                        <FormControl>
                          <SelectTrigger className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10">
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Cash">Cash</SelectItem>
                          <SelectItem value="GCash">GCash</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="text-xs text-gray-500 mt-2 px-2">
              <p>
                Fields marked with <span className="text-red-500">*</span> are
                required
              </p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 px-6 py-4 bg-gray-50 rounded-b-lg sticky bottom-0 z-10 shadow-sm">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md px-6 h-10 shadow-sm transition-colors"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 h-10 shadow-sm transition-colors"
            >
              {isEditing ? "Update Record" : "Submit Record"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default OrthodonticTreatmentRecordForm;
