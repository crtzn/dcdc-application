// src/components/RegularPatientForm.tsx
import React, { useState } from "react";
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
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Separator } from "@/components/ui/separator";

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthday: z.string().min(1, "Birthday is required"),
  religion: z.string().min(1, "Religion is required"),
  home_address: z.string().min(1, "Address is required"),
  sex: z.string().min(1, "Sex is required"),
  age: z.number().min(0, "Age must be positive"),
  nationality: z.string().min(1, "Nationality is required"),
  cellphone_number: z.string().min(1, "Phone number is required"),
  registration_date: z.string().min(1, "Registration date is required"),
});

type PatientFormValues = z.infer<typeof patientSchema>;

const RELIGIONS = [
  "Roman Catholic",
  "Islam",
  "Iglesia ni Cristo",
  "Protestant",
  "Born Again Christian",
  "Seventh-day Adventist",
  "Jehovah's Witness",
  "Church of Christ",
  "Other",
];

interface RegularPatientFormProps {
  onNext: (data: PatientFormValues) => void;
}

const RegularPatientForm: React.FC<RegularPatientFormProps> = ({ onNext }) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: "",
      birthday: "",
      religion: "",
      home_address: "",
      sex: "",
      age: 0,
      nationality: "",
      cellphone_number: "",
      registration_date: new Date().toISOString().split("T")[0],
    },
  });

  const handleBackToDropdown = () => {
    setShowOtherInput(false);
    form.setValue("religion", "");
  };

  const onSubmit = (data: PatientFormValues) => {
    onNext(data);
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-gray-800">
          Patient Information
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-8">
            {/* Personal Details */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Personal Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Full Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter patient's full name"
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
                  name="birthday"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Date of Birth
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
                  name="age"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Age
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Enter age"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value) || 0)
                          }
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="sex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Sex
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                            <SelectValue placeholder="Select sex" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="religion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Religion
                      </FormLabel>
                      {showOtherInput ? (
                        <div className="space-y-2 transition-all duration-300">
                          <Input
                            placeholder="Specify your religion"
                            className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                            {...field}
                            autoFocus
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleBackToDropdown}
                            className="border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md"
                          >
                            Back to list
                          </Button>
                        </div>
                      ) : (
                        <Select
                          onValueChange={(value) => {
                            if (value === "Other") {
                              setShowOtherInput(true);
                              field.onChange("");
                            } else {
                              field.onChange(value);
                            }
                          }}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                              <SelectValue placeholder="Select religion" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {RELIGIONS.map((religion) => (
                              <SelectItem key={religion} value={religion}>
                                {religion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nationality"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Nationality
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter nationality"
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

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-medium text-gray-700 mb-4">
                Contact Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="cellphone_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Phone Number
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter phone number"
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
                  name="registration_date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700 font-medium">
                        Registration Date
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500"
                          {...field}
                          disabled
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="home_address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel className="text-gray-700 font-medium">
                        Home Address
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter complete home address"
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
          </CardContent>
          <CardFooter className="flex justify-end mt-6">
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6"
            >
              Next
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default RegularPatientForm;
