// src/components/TreatmentRecordForm.tsx
import React, { useEffect } from "react";
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

const treatmentSchema = z.object({
  treatment_date: z.string().min(1, "Treatment date is required"),
  tooth_number: z.string().min(1, "Tooth number is required"),
  procedure: z.string().optional(),
  dentist_name: z.string().optional(),
  amount_charged: z
    .number()
    .min(0, "Amount charged must be positive")
    .min(1, "Amount charged is required")
    .optional()
    .nullable(),
  amount_paid: z
    .number()
    .min(0, "Amount paid must be positive")
    .min(1, "Amount paid is required")
    .optional()
    .nullable(),
  balance: z.number().min(0, "Balance must be positive").optional().nullable(),
  mode_of_payment: z.string().min(1, "mode of payment is required"),
});

type TreatmentFormValues = z.infer<typeof treatmentSchema>;

interface TreatmentRecordFormProps {
  onSubmit: (data: TreatmentFormValues) => void;
  onBack: () => void;
  isModal?: boolean; // New prop to indicate if form is in modal
}

const TreatmentRecordForm: React.FC<TreatmentRecordFormProps> = ({
  onSubmit,
  onBack,
  isModal = false,
}) => {
  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
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
                <FormLabel className="text-gray-700">Treatment Date*</FormLabel>
                <FormControl>
                  <Input
                    type="date"
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
                  <Input
                    type="number"
                    placeholder="Amount Charged"
                    className="border-gray-300 focus:ring-blue-500"
                    {...field}
                    value={
                      field.value === undefined || field.value === null
                        ? ""
                        : field.value
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
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
            name="amount_paid"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">
                  Amount Paid (₱) <RequiredIndicator />
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="Amount Paid"
                    className="border-gray-300 focus:ring-blue-500"
                    {...field}
                    value={
                      field.value === undefined || field.value === null
                        ? ""
                        : field.value
                    }
                    onChange={(e) =>
                      field.onChange(
                        e.target.value ? parseFloat(e.target.value) : undefined
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
            name="balance"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700">Balance (₱)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0.00"
                    className="border-gray-300 bg-gray-100 focus:ring-blue-500"
                    {...field}
                    value={
                      field.value === undefined || field.value === null
                        ? ""
                        : field.value
                    }
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
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
              className="border-gray-300 text-gray-700 hover:bg-gray-50 px-6"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6"
            >
              Save Treatment
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TreatmentRecordForm;
