// src/components/TreatmentRecordForm.tsx
import React from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
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

const treatmentSchema = z.object({
  treatment_date: z.string().min(1, "Treatment date is required"),
  tooth_number: z.string().optional(),
  procedure: z.string().optional(),
  dentist_name: z.string().optional(),
  amount_charged: z
    .number()
    .min(0, "Amount charged must be positive")
    .optional(),
  amount_paid: z.number().min(0, "Amount paid must be positive").optional(),
  balance: z.number().min(0, "Balance must be positive").optional(),
  mode_of_payment: z.string().optional(),
  notes: z.string().optional(),
});

type TreatmentFormValues = z.infer<typeof treatmentSchema>;

interface TreatmentRecordFormProps {
  onSubmit: (data: TreatmentFormValues) => void;
  onBack: () => void;
}

const TreatmentRecordForm: React.FC<TreatmentRecordFormProps> = ({
  onSubmit,
  onBack,
}) => {
  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      treatment_date: new Date().toISOString().split("T")[0],
      tooth_number: "",
      procedure: "",
      dentist_name: "",
      amount_charged: 0,
      amount_paid: 0,
      balance: 0,
      mode_of_payment: "",
      notes: "",
    },
  });

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            {/* Treatment Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Treatment Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="treatment_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Treatment Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tooth_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Tooth Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter tooth number"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="procedure"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Procedure
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter procedure"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dentist_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Dentist Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter dentist name"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Payment Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Payment Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="amount_charged"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Amount Charged
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount charged"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="amount_paid"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Amount Paid
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter amount paid"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="balance"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Balance
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter balance"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="mode_of_payment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Mode of Payment
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select payment mode" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="GCash">Cash</SelectItem>
                          <SelectItem value="Cash">Credit Card</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Additional Notes */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Additional Notes
              </h3>
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700 font-medium">
                      Notes
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Enter additional notes"
                        className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500" />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="border-gray-300 text-gray-700 hover:bg-gray-100 rounded-md px-6"
            >
              Back
            </Button>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6"
            >
              Submit All
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default TreatmentRecordForm;
