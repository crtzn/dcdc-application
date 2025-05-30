// src/components/TreatmentRecordForm.tsx
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
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
import { FormattedNumberInput } from "@/components/ui/formatted-number-input";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useForm } from "react-hook-form";
import { CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const treatmentSchema = z.object({
  treatment_date: z.string().min(1, "Treatment date is required"),
  tooth_number: z.string().min(1, "Tooth number is required"),
  procedure: z.string().min(1, "Procedure is required"),
  dentist_name: z.string().min(1, "Dentist name is required"),
  amount_charged: z
    .union([z.number().min(0, "Amount charged must be positive"), z.null()])
    .optional(),
  amount_paid: z
    .union([z.number().min(0, "Amount paid must be positive"), z.null()])
    .optional(),
  balance: z
    .union([z.number().min(0, "Balance must be positive"), z.null()])
    .optional(),
  mode_of_payment: z.string().min(1, "Mode of payment is required"),
});

type TreatmentFormValues = z.infer<typeof treatmentSchema>;

interface TreatmentRecordFormProps {
  onSubmit: (data: TreatmentFormValues) => void;
  onBack: () => void;
  isModal?: boolean; // New prop to indicate if form is in modal
  initialData?: Partial<TreatmentFormValues>; // Initial data for editing
  isEditing?: boolean; // Flag to indicate if form is in edit mode
}

const TreatmentRecordForm: React.FC<TreatmentRecordFormProps> = ({
  onSubmit,
  onBack,
  isModal = false,
  initialData,
  isEditing = false,
}) => {
  const [, setTreatmentDate] = useState<Date | undefined>(
    initialData?.treatment_date
      ? new Date(initialData.treatment_date)
      : new Date()
  );

  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: initialData
      ? {
          treatment_date:
            initialData.treatment_date ||
            new Date().toLocaleDateString("en-CA"),
          tooth_number: initialData.tooth_number || "",
          procedure: initialData.procedure || "",
          dentist_name: initialData.dentist_name || "",
          amount_charged: initialData.amount_charged,
          amount_paid: initialData.amount_paid,
          balance: initialData.balance,
          mode_of_payment: initialData.mode_of_payment || "",
        }
      : {
          treatment_date: new Date().toLocaleDateString("en-CA"),
          tooth_number: "",
          procedure: "",
          dentist_name: "",
          amount_charged: undefined,
          amount_paid: undefined,
          balance: undefined,
          mode_of_payment: "",
        },
  });

  // Watch amount_charged and amount_paid fields to calculate balance
  const amountCharged = form.watch("amount_charged");
  const amountPaid = form.watch("amount_paid");

  useEffect(() => {
    // Calculate balance whenever amount_charged or amount_paid changes
    if (amountCharged !== undefined || amountPaid !== undefined) {
      const balance = (amountCharged || 0) - (amountPaid || 0);
      form.setValue("balance", balance >= 0 ? balance : 0);
    } else {
      form.setValue("balance", undefined);
    }
  }, [amountCharged, amountPaid, form]);

  const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

  // Form content that can be scrolled if in modal
  const formContent = (
    <CardContent className="space-y-8 p-6">
      {/* Treatment Details */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Treatment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="treatment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  Treatment Date <RequiredIndicator />
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
                      selected={field.value ? new Date(field.value) : undefined}
                      onSelect={(date) => {
                        if (date) {
                          setTreatmentDate(date);
                          field.onChange(date.toLocaleDateString("en-CA"));
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
            name="tooth_number"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  Tooth Number <RequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., 12, 21, etc."
                    className="border-gray-300 focus:ring-blue-500"
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
              <FormItem>
                <FormLabel className="text-gray-700">
                  Procedure <RequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g., Filling, Extraction"
                    className="border-gray-300 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dentist_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  Dentist Name <RequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Dr. Smith"
                    className="border-gray-300 focus:ring-blue-500"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>

      <Separator className="my-4" />

      {/* Payment Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Payment Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="amount_charged"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  Amount Charged (₱) <RequiredIndicator />
                </FormLabel>
                <FormControl>
                  <FormattedNumberInput
                    placeholder="Amount Charged"
                    className="border-gray-300 focus:ring-blue-500"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount_paid"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  Amount Paid (₱) <RequiredIndicator />
                </FormLabel>
                <FormControl>
                  <FormattedNumberInput
                    placeholder="Amount Paid"
                    className="border-gray-300 focus:ring-blue-500"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Balance (₱)</FormLabel>
                <FormControl>
                  <FormattedNumberInput
                    placeholder="0.00"
                    className="border-gray-300 bg-gray-100 focus:ring-blue-500"
                    value={field.value}
                    onChange={field.onChange}
                    readOnly
                  />
                </FormControl>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mode_of_payment"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  Mode of Payment <RequiredIndicator />
                </FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="border-gray-300 focus:ring-blue-500">
                      <SelectValue placeholder="Select payment mode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="GCash">GCash</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />
        </div>
      </div>
    </CardContent>
  );

  return (
    <Card
      className={`w-full mx-auto shadow-lg ${
        isModal ? "border-none shadow-none" : "max-w-3xl"
      }`}
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(
            (data) => {
              console.log("Form submitted with data:", data);

              // Make sure required fields are provided
              if (!data.treatment_date || data.treatment_date.trim() === "") {
                toast.error("Treatment date is required");
                return;
              }

              if (!data.tooth_number || data.tooth_number.trim() === "") {
                toast.error("Tooth number is required");
                return;
              }

              if (!data.procedure || data.procedure.trim() === "") {
                toast.error("Procedure is required");
                return;
              }

              if (!data.dentist_name || data.dentist_name.trim() === "") {
                toast.error("Dentist name is required");
                return;
              }

              if (!data.mode_of_payment || data.mode_of_payment.trim() === "") {
                toast.error("Mode of payment is required");
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
          )}
        >
          {isModal ? (
            <ScrollArea className="h-[calc(100vh-200px)]">
              {formContent}
            </ScrollArea>
          ) : (
            formContent
          )}
          <CardFooter
            className={`flex justify-between px-6 pb-6 ${
              isModal ? "sticky bottom-0 bg-white border-t" : ""
            }`}
          >
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-gray-300 bg-[#1e1e1e] text-white hover:bg-[#1e1e1eed] hover:text-white px-6"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              {isEditing ? "Update Treatment" : "Save Treatment"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TreatmentRecordForm;
