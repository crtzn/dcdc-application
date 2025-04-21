// src/components/orthodontic/orthodontic-treatment-record.tsx
import React, { useEffect, useState } from "react";
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
import { OrthodonticTreatmentRecord } from "@/electron/types/OrthodonticPatient";
import { CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const treatmentSchema = z.object({
  appt_no: z.string().min(1, "Appointment number is required"),
  date: z.string().min(1, "Date is required"),
  arch_wire: z.string().optional(),
  procedure: z.string().optional(),
  amount_paid: z.number().min(0, "Amount paid must be positive").optional(),
  next_schedule: z.string().optional(),
  mode_of_payment: z.string().optional(),
});

type TreatmentFormValues = Omit<
  OrthodonticTreatmentRecord,
  "record_id" | "patient_id" | "created_at"
>;

interface OrthodonticTreatmentRecordFormProps {
  onSubmit: (data: TreatmentFormValues) => void;
  onBack: () => void;
  patientId?: number; // Optional patient ID for existing patients
  defaultAppointmentNumber?: string; // Optional default appointment number
}

const OrthodonticTreatmentRecordForm: React.FC<
  OrthodonticTreatmentRecordFormProps
> = ({ onSubmit, onBack, patientId, defaultAppointmentNumber }) => {
  const [loading, setLoading] = useState(false);
  const [treatmentDate, setTreatmentDate] = useState<Date | undefined>(
    new Date()
  );
  const [nextScheduleDate, setNextScheduleDate] = useState<Date | undefined>(
    undefined
  );

  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      appt_no: defaultAppointmentNumber || "",
      date: new Date().toISOString().split("T")[0],
      arch_wire: "",
      procedure: "",
      amount_paid: undefined,
      next_schedule: "",
      mode_of_payment: "Cash", // Default to Cash as per user preference for boolean fields
    },
  });

  // Fetch the next appointment number when the component mounts if patientId is provided
  useEffect(() => {
    const fetchNextAppointmentNumber = async () => {
      if (patientId && !defaultAppointmentNumber) {
        setLoading(true);
        try {
          const result = await window.api.getNextOrthoAppointmentNumber(
            patientId
          );
          if (result.success && result.next_appt_no) {
            form.setValue("appt_no", result.next_appt_no.toString());
          }
        } catch (error) {
          console.error("Error fetching next appointment number:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchNextAppointmentNumber();
  }, [patientId, defaultAppointmentNumber, form]);

  const handleSubmit = (data: TreatmentFormValues) => {
    console.log("Form submitted with data:", data); // Add logging
    onSubmit(data);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto shadow-lg border border-gray-200 p-0 sm:p-2">
      <CardHeader className="pb-0 pt-4 px-6">
        <CardTitle className="text-xl font-bold text-center text-gray-800">
          Orthodontic Treatment Record
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-2">
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
                          cannot be edited
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
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
                                setTreatmentDate(date);
                                field.onChange(
                                  date.toISOString().split("T")[0]
                                );
                              }
                            }}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                          />
                        </PopoverContent>
                      </Popover>
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
                        Arch Wire
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
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-xs" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator className="my-2" />

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
                        Amount Paid
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount paid"
                          className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 h-10"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              parseFloat(e.target.value) || undefined
                            )
                          }
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
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
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
                                setNextScheduleDate(date);
                                field.onChange(
                                  date.toISOString().split("T")[0]
                                );
                              }
                            }}
                            disabled={(date) => date < new Date("1900-01-01")}
                          />
                        </PopoverContent>
                      </Popover>
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
                        value={field.value}
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
          <CardFooter className="flex flex-col sm:flex-row justify-between gap-4 px-6 py-4 bg-gray-50 rounded-b-lg">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="w-full sm:w-auto border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md px-6 h-10"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 h-10"
            >
              Submit Record
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default OrthodonticTreatmentRecordForm;
