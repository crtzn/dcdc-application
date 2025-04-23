import React, { useState, useEffect } from "react";
import { usePopoverClose } from "@/hooks/usePopoverClose";
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

import { CalendarDays } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

const patientSchema = z.object({
  name: z.string().min(1, "Name is required"),
  birthday: z.string().min(1, "Birthday is required"),
  religion: z.string().min(1, "Religion is required"),
  home_address: z.string().min(1, "Address is required"),
  sex: z.string().min(1, "Sex is required"),
  age: z.number().min(0, "Age must be positive"),
  nationality: z.string().optional(),
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
  initialData?: Partial<PatientFormValues>;
}

const RegularPatientForm: React.FC<RegularPatientFormProps> = ({
  onNext,
  initialData = {},
}) => {
  const [showOtherInput, setShowOtherInput] = useState(false);
  const [nameError, setNameError] = useState<string | null>(null);
  const [isCheckingName, setIsCheckingName] = useState(false);
  const [nameExists, setNameExists] = useState(false);
  const [date, setDate] = useState<Date | undefined>(
    initialData.birthday ? new Date(initialData.birthday) : undefined
  );

  // Popover states for calendar controls
  const birthdayPopover = usePopoverClose();
  const registrationPopover = usePopoverClose();

  // Create a date at noon to avoid timezone issues
  const today = new Date();
  const normalizedToday = new Date(
    Date.UTC(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      12,
      0,
      0,
      0
    )
  );
  const currentDate = normalizedToday.toISOString().split("T")[0];

  const form = useForm<PatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      name: initialData.name || "",
      birthday: initialData.birthday || "",
      religion: initialData.religion || "",
      home_address: initialData.home_address || "",
      sex: initialData.sex || "",
      age: initialData.age || 0,
      nationality: initialData.nationality || "",
      cellphone_number: initialData.cellphone_number || "",
      registration_date: initialData.registration_date || currentDate,
    },
  });

  // Update birthday and age when date changes
  useEffect(() => {
    if (date) {
      // Use the date directly since we've already normalized it with UTC
      form.setValue("birthday", date.toISOString().split("T")[0]);

      // Calculate age using the normalized date
      const today = new Date();
      let age = today.getFullYear() - date.getFullYear();
      const monthDiff = today.getMonth() - date.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < date.getDate())
      ) {
        age--;
      }
      form.setValue("age", age);

      // Log for debugging
      console.log("Birthday set to:", date.toISOString().split("T")[0]);
    }
  }, [date, form]);

  // Debounced name checking
  const watchedName = form.watch("name");

  useEffect(() => {
    if (watchedName && watchedName.length > 3) {
      const timer = setTimeout(async () => {
        setIsCheckingName(true);
        try {
          const normalizedName = watchedName.trim().toLowerCase();
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
      }, 500);

      return () => clearTimeout(timer);
    } else {
      setNameError(null);
      setNameExists(false);
    }
  }, [watchedName, form]);

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
    // Trim the name before submitting
    const trimmedData = {
      ...data,
      name: data.name.trim(),
    };
    onNext(trimmedData);
  };

  const RequiredIndicator = () => <span className="text-red-500 ml-1">*</span>;

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
                      Full Name <RequiredIndicator />
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
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-sm font-medium text-gray-700 mb-1">
                      Date of Birth <RequiredIndicator />
                    </FormLabel>
                    <Popover
                      open={birthdayPopover.open}
                      onOpenChange={birthdayPopover.onOpenChange}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal h-10 border-gray-300 rounded-md text-sm",
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
                          selected={date}
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              // Create a date at noon to avoid timezone issues
                              const normalizedDate = new Date(
                                Date.UTC(
                                  selectedDate.getFullYear(),
                                  selectedDate.getMonth(),
                                  selectedDate.getDate(),
                                  12,
                                  0,
                                  0,
                                  0
                                )
                              );
                              setDate(normalizedDate); // Update the date state
                              birthdayPopover.onSelect()(); // Close popover after selection
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
                            head_cell:
                              "text-gray-600 w-10 h-10 flex items-center justify-center font-normal text-sm",
                            row: "flex w-full space-x-1",
                            cell: "w-10 h-10 flex items-center justify-center",
                            day: "w-10 h-10 flex items-center justify-center font-normal text-sm rounded-md hover:bg-gray-200 focus:bg-gray-200 focus:outline-none cursor-pointer",
                            day_selected:
                              "bg-blue-600 text-white rounded-md font-medium",
                            day_today:
                              "border border-blue-500 text-blue-600 rounded-md",
                            day_disabled:
                              "text-gray-400 opacity-50 cursor-not-allowed",
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
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Age <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm bg-gray-50"
                        value={field.value}
                        readOnly
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
                      Sex <RequiredIndicator />
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
                      Religion <RequiredIndicator />
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
                      Phone Number <RequiredIndicator />
                    </FormLabel>
                    <FormControl>
                      <PhoneInput
                        country={"ph"}
                        value={field.value}
                        onChange={(value) => field.onChange(value)}
                        inputClass="border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 text-sm w-full h-10"
                        dropdownClass="z-50"
                        placeholder="Enter phone number"
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
                      Registration Date <RequiredIndicator />
                    </FormLabel>
                    <Popover
                      open={registrationPopover.open}
                      onOpenChange={registrationPopover.onOpenChange}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal h-10 border-gray-300 rounded-md text-sm",
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
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(selectedDate) => {
                            if (selectedDate) {
                              // Create a date at noon to avoid timezone issues
                              const normalizedDate = new Date(
                                Date.UTC(
                                  selectedDate.getFullYear(),
                                  selectedDate.getMonth(),
                                  selectedDate.getDate(),
                                  12,
                                  0,
                                  0,
                                  0
                                )
                              );
                              // Format the date as YYYY-MM-DD for the form field
                              field.onChange(
                                normalizedDate.toISOString().split("T")[0]
                              );
                              registrationPopover.onSelect()(); // Close popover after selection
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
                            head_cell:
                              "text-gray-600 w-10 h-10 flex items-center justify-center font-normal text-sm",
                            row: "flex w-full space-x-1",
                            cell: "w-10 h-10 flex items-center justify-center",
                            day: "w-10 h-10 flex items-center justify-center font-normal text-sm rounded-md hover:bg-gray-200 focus:bg-gray-200 focus:outline-none cursor-pointer",
                            day_selected:
                              "bg-blue-600 text-white rounded-md font-medium",
                            day_today:
                              "border border-blue-500 text-blue-600 rounded-md",
                            day_disabled:
                              "text-gray-400 opacity-50 cursor-not-allowed",
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
                name="home_address"
                render={({ field }) => (
                  <FormItem className="sm:col-span-2">
                    <FormLabel className="text-sm font-medium text-gray-700">
                      Home Address <RequiredIndicator />
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
            className={`bg-[#1e1e1e] hover:bg-[#1e1e1ee4] text-white rounded-md px-6 py-2 text-sm w-full sm:w-auto ${
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
