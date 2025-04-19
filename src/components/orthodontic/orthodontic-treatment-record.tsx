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
import { Separator } from "@/components/ui/separator";
import { OrthodonticTreatmentRecord } from "@/electron/types/OrthodonticPatient";

const treatmentSchema = z.object({
  appointment_number: z.string().min(1, "Appointment number is required"),
  date: z.string().min(1, "Date is required"),
  arch_wire: z.string().optional(),
  procedure: z.string().optional(),
  amount_paid: z.number().min(0, "Amount paid must be positive").optional(),
  next_schedule: z.string().optional(),
  notes: z.string().optional(),
});

type TreatmentFormValues = Omit<
  OrthodonticTreatmentRecord,
  "record_id" | "patient_id" | "created_at"
>;

interface OrthodonticTreatmentRecordFormProps {
  onSubmit: (data: TreatmentFormValues) => void;
  onBack: () => void;
}

const OrthodonticTreatmentRecordForm: React.FC<
  OrthodonticTreatmentRecordFormProps
> = ({ onSubmit, onBack }) => {
  const form = useForm<TreatmentFormValues>({
    resolver: zodResolver(treatmentSchema),
    defaultValues: {
      appointment_number: "",
      date: new Date().toISOString().split("T")[0],
      arch_wire: "",
      procedure: "",
      amount_paid: undefined,
      next_schedule: "",
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
                  name="appointment_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Appointment Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter appointment number"
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
                  name="date"
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
                  name="arch_wire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Arch Wire
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter arch wire details"
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
                            field.onChange(
                              parseFloat(e.target.value) || undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="next_schedule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Next Schedule
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

export default OrthodonticTreatmentRecordForm;
