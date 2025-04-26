// src/components/orthodontic/new-treatment-cycle-form.tsx
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { usePopoverClose } from "@/hooks/usePopoverClose";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const newCycleSchema = z.object({
  contract_price: z
    .number()
    .min(0, "Contract price must be positive")
    .optional(),
  contract_months: z
    .number()
    .min(1, "Contract months must be at least 1")
    .optional(),
  treatment_date: z.string().min(1, "Treatment date is required"),
  arch_wire: z.string().min(1, "Arch wire is required"),
  procedure: z.string().optional(),
  appliances: z.string().optional(),
  amount_paid: z.number().min(0, "Amount paid must be positive").optional(),
  mode_of_payment: z.string(),
  next_schedule: z.string().optional(),
});

type NewCycleFormValues = z.infer<typeof newCycleSchema>;

interface NewTreatmentCycleFormProps {
  patientId: number;
  onSuccess: () => void;
  onCancel: () => void;
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

const NewTreatmentCycleForm: React.FC<NewTreatmentCycleFormProps> = ({
  patientId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [treatmentDate, setTreatmentDate] = useState<Date | undefined>(() => {
    // Initialize with normalized current date to avoid timezone issues
    return normalizeDate(new Date());
  });
  const [nextScheduleDate, setNextScheduleDate] = useState<Date | undefined>(
    undefined
  );
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [otherValue, setOtherValue] = useState("");

  // Popover states for calendar controls
  const treatmentDatePopover = usePopoverClose();
  const nextSchedulePopover = usePopoverClose();

  const form = useForm<NewCycleFormValues>({
    resolver: zodResolver(newCycleSchema),
    defaultValues: {
      contract_price: undefined,
      contract_months: undefined,
      treatment_date: new Date().toISOString().split("T")[0],
      arch_wire: "",
      procedure: "",
      appliances: "",
      amount_paid: undefined,
      mode_of_payment: "Cash",
      next_schedule: "",
    },
  });

  // Function to handle manual date input for treatment date
  const handleTreatmentDateInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    form.setValue("treatment_date", inputValue);

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

  // Update form when treatment date changes
  React.useEffect(() => {
    if (treatmentDate) {
      // Use the normalized date to set the form value
      form.setValue(
        "treatment_date",
        treatmentDate.toISOString().split("T")[0]
      );
    }
  }, [treatmentDate, form]);

  // Update form when next schedule date changes
  React.useEffect(() => {
    if (nextScheduleDate) {
      // Use the normalized date to set the form value
      form.setValue(
        "next_schedule",
        nextScheduleDate.toISOString().split("T")[0]
      );
    }
  }, [nextScheduleDate, form]);

  // Handle appliance selection
  const handleApplianceChange = (value: string) => {
    if (value === "Other") {
      setShowOtherInput(true);
      form.setValue("appliances", otherValue);
    } else {
      setShowOtherInput(false);
      form.setValue("appliances", value);
    }
  };

  // Handle other appliance input
  const handleOtherApplianceChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setOtherValue(value);
    form.setValue("appliances", value);
  };

  const handleSubmit = async (data: NewCycleFormValues) => {
    try {
      setIsSubmitting(true);

      const result = await window.api.startNewOrthodonticTreatmentCycle(
        patientId,
        data.contract_price,
        data.contract_months,
        data.treatment_date,
        data.arch_wire,
        data.procedure,
        data.appliances,
        data.amount_paid,
        data.mode_of_payment,
        data.next_schedule
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to start new treatment cycle");
      }

      toast.success(
        `New treatment cycle started successfully (Cycle #${result.new_cycle})`
      );

      // Add a small delay before refreshing to ensure the database transaction is complete
      setTimeout(() => {
        onSuccess();
      }, 500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error starting new treatment cycle: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">
              Contract Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contract_price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      New Contract Price <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <FormattedNumberInput
                        placeholder="Enter contract price"
                        className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Total price for the new treatment plan
                    </FormDescription>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contract_months"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      New Contract Duration (Months){" "}
                      <span className="text-red-500">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter duration in months"
                        className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        {...field}
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? undefined : parseInt(value)
                          );
                        }}
                      />
                    </FormControl>
                    <FormDescription className="text-xs text-gray-500">
                      Expected duration of the new treatment in months
                    </FormDescription>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Treatment Date */}
              <FormField
                control={form.control}
                name="treatment_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="text-gray-700 font-medium">
                      Treatment Date <span className="text-red-500">*</span>
                    </FormLabel>
                    <div className="flex flex-col space-y-2">
                      <Input
                        type="date"
                        placeholder="YYYY-MM-DD"
                        className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                              variant="outline"
                              className="w-full pl-3 text-left font-normal flex justify-between items-center border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              {treatmentDate ? (
                                format(treatmentDate, "PPP")
                              ) : (
                                <span className="text-gray-400">
                                  Pick a date
                                </span>
                              )}
                              <CalendarIcon className="h-4 w-4 opacity-50" />
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
                                treatmentDatePopover.onSelect()();
                              }
                            }}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear() + 10}
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

              {/* Arch Wire */}
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
                        placeholder="Enter arch wire"
                        className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Procedure */}
              <FormField
                control={form.control}
                name="procedure"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="text-gray-700 font-medium">
                      Procedure
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter procedure details"
                        className="resize-none border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Appliances */}
              <FormField
                control={form.control}
                name="appliances"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="text-gray-700 font-medium">
                      Appliances
                    </FormLabel>
                    <Select
                      onValueChange={handleApplianceChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select appliance" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Pads">Pads</SelectItem>
                        <SelectItem value="Anterior Bite Plate">
                          Anterior Bite Plate
                        </SelectItem>
                        <SelectItem value="Retainers">Retainers</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {showOtherInput && (
                      <Input
                        placeholder="Specify other appliance"
                        value={otherValue}
                        onChange={handleOtherApplianceChange}
                        className="mt-2 border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      />
                    )}
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Amount Paid */}
              <FormField
                control={form.control}
                name="amount_paid"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-1.5">
                    <FormLabel className="text-gray-700 font-medium">
                      Amount Paid
                    </FormLabel>
                    <FormControl>
                      <FormattedNumberInput
                        placeholder="Enter amount paid"
                        className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Mode of Payment */}
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
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                          <SelectValue placeholder="Select payment mode" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="Credit Card">Credit Card</SelectItem>
                        <SelectItem value="Debit Card">Debit Card</SelectItem>
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
                        <SelectItem value="GCash">GCash</SelectItem>
                        <SelectItem value="Maya">Maya</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />

              {/* Next Schedule */}
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
                        className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                        value={field.value}
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
                              variant="outline"
                              className="w-full pl-3 text-left font-normal flex justify-between items-center border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            >
                              {nextScheduleDate ? (
                                format(nextScheduleDate, "PPP")
                              ) : (
                                <span className="text-gray-400">
                                  Pick a date
                                </span>
                              )}
                              <CalendarIcon className="h-4 w-4 opacity-50" />
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
                                nextSchedulePopover.onSelect()();
                              }
                            }}
                            initialFocus
                            captionLayout="dropdown-buttons"
                            fromYear={1900}
                            toYear={new Date().getFullYear() + 10}
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
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-2 px-2">
            <p>
              Fields marked with <span className="text-red-500">*</span> are
              required
            </p>
          </div>

          <div className="flex justify-end space-x-4 sticky bottom-0 bg-white z-10 border-t border-gray-200 py-4 px-2 mt-6 shadow-sm">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 shadow-sm transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors"
            >
              {isSubmitting ? "Starting..." : "Start New Treatment Cycle"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewTreatmentCycleForm;
