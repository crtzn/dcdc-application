import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import MultiStepForm from "@/components/regular/multi-step-regular-form";
import OrthoMultiStepForm from "./orthodontic/multi-step-orthodontic";
import { Button } from "@/components/ui/button";

function PatientModal() {
  const [activeForm, setActiveForm] = useState<
    "regular" | "orthodontic" | null
  >(null);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2">
          New Patient
        </Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-[90vw] sm:max-w-lg md:max-w-2xl lg:max-w-4xl p-4 sm:p-6"
        onInteractOutside={() => setActiveForm(null)}
        onEscapeKeyDown={() => setActiveForm(null)}
      >
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-800">
            Register New Patient
          </DialogTitle>
        </DialogHeader>
        {!activeForm ? (
          <div className="flex flex-col gap-4">
            <Button
              onClick={() => setActiveForm("regular")}
              className="h-12 bg-[#c84e67] hover:bg-[#a63e55] text-white text-sm"
            >
              Regular Patient
            </Button>
            <Button
              onClick={() => setActiveForm("orthodontic")}
              className="h-12 bg-[#24336f] hover:bg-[#1b2657] text-white text-sm"
            >
              Orthodontic Patient
            </Button>
          </div>
        ) : (
          <div className="mt-4">
            {activeForm === "regular" && <MultiStepForm />}
            {activeForm === "orthodontic" && <OrthoMultiStepForm />}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PatientModal;
