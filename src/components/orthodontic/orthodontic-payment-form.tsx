// src/components/orthodontic/orthodontic-payment-form.tsx
import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OrthodonticPatient } from "@/electron/types/OrthodonticPatient";

// Create a schema for payment form validation
const paymentSchema = z.object({
  payment_date: z.string().min(1, "Payment date is required"),
  amount_paid: z
    .number()
    .min(0.01, "Amount paid must be greater than 0")
    .refine((val) => !isNaN(val), {
      message: "Amount paid must be a valid number",
    }),
  payment_method: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface OrthodonticPaymentFormProps {
  patientId: number;
  patient: OrthodonticPatient;
  onSuccess: () => void;
  onCancel: () => void;
}

const OrthodonticPaymentForm = ({
  patientId,
  patient,
  onSuccess,
  onCancel,
}: OrthodonticPaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentBalance = patient.current_balance || 0;

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_date: format(new Date(), "yyyy-MM-dd"),
      amount_paid: currentBalance,
      payment_method: "Cash",
      notes: "",
    },
  });

  // Update remaining balance when amount paid changes
  const watchAmountPaid = form.watch("amount_paid");

  // Calculate remaining balance
  const remainingBalance = Math.max(0, currentBalance - (watchAmountPaid || 0));

  const handleSubmit = async (data: PaymentFormValues) => {
    try {
      setIsSubmitting(true);

      // Add payment history
      const paymentResult = await window.api.addPaymentHistory({
        patient_id: patientId,
        patient_type: "Ortho",
        payment_date: data.payment_date,
        amount_paid: data.amount_paid,
        payment_method: data.payment_method,
        remaining_balance: remainingBalance,
        notes: data.notes,
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Failed to add payment");
      }

      toast.success("Payment recorded successfully");
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error recording payment: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Payment Summary
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Contract Price</p>
            <p className="text-xl font-bold text-blue-600">
              ₱
              {(patient.current_contract_price || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Contract Balance</p>
            <p className="text-xl font-bold text-red-600">
              ₱
              {currentBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">After This Payment</p>
            <p className="text-xl font-bold text-green-600">
              ₱
              {remainingBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        <div className="mt-4 bg-amber-50 p-3 rounded-md border border-amber-200">
          <div className="flex items-center gap-2 text-amber-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <p className="text-sm font-medium">
              Treatment Status:{" "}
              <span className="font-bold">{patient.treatment_status}</span>
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="payment_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Payment Date <span className="text-red-500">*</span>
                  </FormLabel>
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
              name="amount_paid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Amount Paid (₱) <span className="text-red-500">*</span>
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
              name="payment_method"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">
                    Payment Method <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300 focus:ring-blue-500">
                        <SelectValue placeholder="Select payment method" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Cash">Cash</SelectItem>
                      <SelectItem value="GCash">GCash</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                      <SelectItem value="Credit Card">Credit Card</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700">Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Add any additional notes about this payment"
                      className="border-gray-300 focus:ring-blue-500 resize-none h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    Optional: Add any relevant details about this payment
                  </FormDescription>
                  <FormMessage className="text-red-500 text-xs" />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {isSubmitting ? "Processing..." : "Record Payment"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OrthodonticPaymentForm;
