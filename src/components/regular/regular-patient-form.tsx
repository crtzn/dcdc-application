import React, { useState, useEffect } from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
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
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameExists, setNameExists] = useState(false);

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

  // Debounced name checking
  useEffect(() => {
    const name = form.watch("name");
    if (name && name.length > 3) {
      // Only check after 3 characters
      const timer = setTimeout(async () => {
        setIsCheckingName(true);
        try {
          // Convert the input name to lowercase for case-insensitive comparison
          const normalizedName = name.toLowerCase();
          const exists = await window.api.checkPatientName(normalizedName);
          setNameExists(exists);
          setNameError(
            exists ? "A patient with this name already exists!" : null
          );
        } catch (error) {
          console.error("Error checking patient name:", error);
        } finally {
          setIsCheckingName(false);
        }
      }, 500); // 0.5 second delay

      return () => clearTimeout(timer);
    } else {
      setNameError(null);
      setNameExists(false);
    }
  }, [form.watch("name")]);

  const handleBackToDropdown = () => {
    setShowOtherInput(false);
    form.setValue("religion", "");
  };

  const onSubmit = async (data: PatientFormValues) => {
    if (nameExists) {
      form.setError("name", {
        type: "manual",
        message: "This patient already exists!",
      });
      return;
    }
    onNext(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <CardContent className="space-y-8">
          {/* Personal Details */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Full Name
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter patient's full name"
                          className={`border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm ${
                            nameExists ? "border-red-500" : ""
                          }`}
                          {...field}
                        />
                        {isCheckingName && (
                          <span className="absolute right-2 top-2 text-xs text-gray-500">
                            Checking...
                          </span>
                        )}
                      </div>
                    </FormControl>
                    {nameError && (
                      <p className="text-red-500 text-xs mt-1">{nameError}</p>
                    )}
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthday"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Date of Birth
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Age
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        placeholder="Enter age"
                        className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                        {...field}
                        onChange={(e) =>
                          field.onChange(parseInt(e.target.value) || 0)
                        }
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="sex"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Sex
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                          aria-label="Select sex"
                        >
                          <SelectValue placeholder="Select sex" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="religion"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Religion
                    </FormLabel>
                    {showOtherInput ? (
                      <div className="space-y-2 transition-all duration-300">
                        <Input
                          placeholder="Specify your religion"
                          className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                          {...field}
                          autoFocus
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleBackToDropdown}
                          className="border-gray-300 text-gray-600 hover:bg-gray-100 rounded-md text-xs"
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
                          <SelectTrigger
                            className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                            aria-label="Select religion"
                          >
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
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nationality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Nationality
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter nationality"
                        className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <Separator />

          {/* Contact Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cellphone_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Phone Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter phone number"
                        className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="registration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Registration Date
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="border-gray-300 rounded-md bg-gray-50 focus:ring-2 focus:ring-blue-500 text-sm"
                        {...field}
                        disabled
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="home_address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Home Address
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter complete home address"
                        className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs" />
                  </FormItem>
                )}
              />
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end mt-6">
          <Button
            type="submit"
            disabled={nameExists}
            className={`bg-blue-600 hover:bg-blue-700 text-white rounded-md px-6 py-2 text-sm w-full sm:w-auto ${
              nameExists ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </Button>
        </CardFooter>
      </form>
    </Form>
  );
};

export default RegularPatientForm;
