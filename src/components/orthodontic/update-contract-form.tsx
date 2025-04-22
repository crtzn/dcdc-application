// src/components/orthodontic/update-contract-form.tsx
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
import { toast } from "sonner";
import { OrthodonticPatient } from "@/electron/types/OrthodonticPatient";

const contractSchema = z.object({
  contract_price: z
    .number()
    .min(0, "Contract price must be positive")
    .optional(),
  contract_months: z
    .number()
    .min(1, "Contract months must be at least 1")
    .optional(),
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface UpdateContractFormProps {
  patientId: number;
  patient: OrthodonticPatient;
  onSuccess: () => void;
  onCancel: () => void;
}

const UpdateContractForm: React.FC<UpdateContractFormProps> = ({
  patientId,
  patient,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contract_price: patient.current_contract_price,
      contract_months: patient.current_contract_months,
    },
  });

  // Calculate estimated new balance
  const watchContractPrice = form.watch("contract_price");
  const currentBalance = patient.current_balance || 0;
  const currentContractPrice = patient.current_contract_price || 0;

  // Calculate how much has been paid so far
  const paidSoFar = currentContractPrice - currentBalance;

  // Calculate new balance based on new contract price
  const estimatedNewBalance = watchContractPrice
    ? Math.max(0, watchContractPrice - paidSoFar)
    : currentBalance;

  const handleSubmit = async (data: ContractFormValues) => {
    try {
      setIsSubmitting(true);

      // Validate that at least one field is being updated
      if (
        data.contract_price === undefined &&
        data.contract_months === undefined
      ) {
        toast.error("Please update at least one field");
        setIsSubmitting(false);
        return;
      }

      const result = await window.api.updateOrthodonticContractDetails(
        patientId,
        data.contract_price,
        data.contract_months
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to update contract details");
      }

      toast.success("Contract details updated successfully");
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error updating contract details: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="mb-6 bg-blue-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-800 mb-2">
          Current Contract Details
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Current Contract Price</p>
            <p className="text-xl font-bold text-blue-600">
              ₱
              {(patient.current_contract_price || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Current Contract Duration</p>
            <p className="text-xl font-bold text-blue-600">
              {patient.current_contract_months || "N/A"}{" "}
              {patient.current_contract_months === 1 ? "month" : "months"}
            </p>
          </div>
          <div className="bg-white p-3 rounded-md shadow-sm">
            <p className="text-sm text-gray-500">Current Balance</p>
            <p className="text-xl font-bold text-red-600">
              ₱
              {currentBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="contract_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-700 font-medium">
                    New Contract Price
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter new contract price"
                      className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    {watchContractPrice !== undefined && (
                      <span className="text-amber-600 font-medium">
                        Estimated new balance: ₱
                        {estimatedNewBalance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    )}
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
                    New Contract Duration (Months)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter new duration in months"
                      className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
                    />
                  </FormControl>
                  <FormDescription className="text-xs text-gray-500">
                    This represents the total number of appointments needed to
                    complete the treatment
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
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? "Updating..." : "Update Contract Details"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default UpdateContractForm;
