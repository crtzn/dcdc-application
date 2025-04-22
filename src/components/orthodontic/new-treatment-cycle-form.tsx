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
import { toast } from "sonner";

const newCycleSchema = z.object({
  contract_price: z
    .number()
    .min(0, "Contract price must be positive")
    .optional(),
  contract_months: z
    .number()
    .min(1, "Contract months must be at least 1")
    .optional(),
});

type NewCycleFormValues = z.infer<typeof newCycleSchema>;

interface NewTreatmentCycleFormProps {
  patientId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

const NewTreatmentCycleForm: React.FC<NewTreatmentCycleFormProps> = ({
  patientId,
  onSuccess,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<NewCycleFormValues>({
    resolver: zodResolver(newCycleSchema),
    defaultValues: {
      contract_price: undefined,
      contract_months: undefined,
    },
  });

  const handleSubmit = async (data: NewCycleFormValues) => {
    try {
      setIsSubmitting(true);

      const result = await window.api.startNewOrthodonticTreatmentCycle(
        patientId,
        data.contract_price,
        data.contract_months
      );

      if (!result.success) {
        throw new Error(result.error || "Failed to start new treatment cycle");
      }

      toast.success(
        `New treatment cycle started successfully (Cycle #${result.new_cycle})`
      );
      onSuccess();
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
                      placeholder="Enter contract price"
                      className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || undefined)
                      }
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
                    New Contract Duration (Months)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter duration in months"
                      className="w-full border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || undefined)
                      }
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
              {isSubmitting ? "Starting..." : "Start New Treatment Cycle"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default NewTreatmentCycleForm;
