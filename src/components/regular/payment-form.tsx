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
import { RegularTreatmentRecord } from "@/electron/types/RegularPatient";

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
  remaining_balance: z.number().min(0, "Remaining balance cannot be negative"),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  patientId: number;
  treatmentRecord?: RegularTreatmentRecord;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm = ({
  patientId,
  treatmentRecord,
  onSuccess,
  onCancel,
}: PaymentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      payment_date: format(new Date(), "yyyy-MM-dd"),
      amount_paid: treatmentRecord?.balance || 0,
      payment_method: "Cash",
      remaining_balance: 0,
      notes: "",
    },
  });

  // Update remaining balance when amount paid changes
  const watchAmountPaid = form.watch("amount_paid");
  const currentBalance = treatmentRecord?.balance || 0;

  // Calculate remaining balance
  const remainingBalance = Math.max(0, currentBalance - (watchAmountPaid || 0));

  // Update the remaining balance field
  if (form.getValues("remaining_balance") !== remainingBalance) {
    form.setValue("remaining_balance", remainingBalance);
  }

  const handleSubmit = async (data: PaymentFormValues) => {
    try {
      setIsSubmitting(true);

      // Add payment history
      const paymentResult = await window.api.addPaymentHistory({
        patient_id: patientId,
        treatment_record_id: treatmentRecord?.record_id,
        patient_type: "Regular", // Specify patient type as Regular
        payment_date: data.payment_date,
        amount_paid: data.amount_paid,
        payment_method: data.payment_method,
        remaining_balance: data.remaining_balance,
        notes: data.notes,
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.error || "Failed to add payment");
      }

      // Update treatment record balance if applicable
      if (treatmentRecord?.record_id) {
        const updateResult = await window.api.updateTreatmentRecordBalance(
          treatmentRecord.record_id,
          data.remaining_balance
        );

        if (!updateResult.success) {
          throw new Error(updateResult.error || "Failed to update balance");
        }
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="payment_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  Payment Date *
                </FormLabel>
                <FormControl>
                  <Input
                    type="date"
                    className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    {...field}
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
                <FormLabel className="text-gray-700 font-medium">
                  Payment Method *
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue="Cash"
                >
                  <FormControl>
                    <SelectTrigger className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="GCash">GCash</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage className="text-red-500 text-xs" />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-2 text-gray-700 font-medium">
              Current Balance
            </div>
            <div className="p-3 bg-gray-100 rounded-md text-lg font-semibold text-red-600">
              ₱
              {currentBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <FormField
            control={form.control}
            name="amount_paid"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-700 font-medium">
                  Amount Paid *
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-2 text-gray-700 font-medium">
              Remaining Balance
            </div>
            <div className="p-3 bg-gray-100 rounded-md text-lg font-semibold text-blue-600">
              ₱
              {remainingBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>
        </div>

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-700 font-medium">Notes</FormLabel>
              <FormControl>
                <Textarea
                  className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  placeholder="Add any additional notes about this payment"
                  {...field}
                />
              </FormControl>
              <FormMessage className="text-red-500 text-xs" />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4 sticky bottom-0 bg-white z-10 border-t border-gray-200 py-4 px-2 mt-6 shadow-sm">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-green-600 text-white hover:bg-green-700 shadow-sm transition-colors"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Record Payment"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default PaymentForm;
