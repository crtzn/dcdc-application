import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface PatientCountResult {
  success: boolean;
  total_count?: number;
  error?: string;
}

export function TotalPatientCount() {
  const [regularCount, setRegularCount] = useState<number | null>(null);
  const [orthoCount, setOrthoCount] = useState<number | null>(null);
  const [overallCount, setOverallCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCounts = async () => {
    try {
      setLoading(true);

      // Fetch regular patients count
      const regularResult: PatientCountResult =
        await window.api.getAllRegularPatients();
      if (
        regularResult.success &&
        typeof regularResult.total_count === "number"
      ) {
        setRegularCount(regularResult.total_count);
      } else {
        throw new Error(
          regularResult.error || "Failed to fetch regular patient count"
        );
      }

      // Fetch orthodontic patients count
      const orthoResult =
        (await window.api.getAllOrthodonticPatients()) as PatientCountResult;
      if (orthoResult.success && typeof orthoResult.total_count === "number") {
        setOrthoCount(orthoResult.total_count);
      } else {
        throw new Error(
          orthoResult.error || "Failed to fetch orthodontic patient count"
        );
      }

      // Fetch overall patients count
      const overallResult = await window.api.getAllPatients();
      if (
        overallResult.success &&
        typeof overallResult.total_count === "number"
      ) {
        setOverallCount(overallResult.total_count);
      } else {
        throw new Error(
          overallResult.error || "Failed to fetch overall patient count"
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error fetching patient counts: ${errorMessage}`);
      setRegularCount(null);
      setOrthoCount(null);
      setOverallCount(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCounts();

    const unsubscribe = window.api.onPatientAdded(() => {
      console.log("Patient added event received, refetching counts");
      fetchCounts();
    });

    return () => unsubscribe();
  }, []);

  return (
    <Card className="flex shadow-md">
      <CardHeader>
        <CardTitle className="text-lg text-start font-semibold text-gray-800">
          Patient Statistics
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center w-[45rem]">
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#24336f]" />
          </div>
        ) : regularCount !== null && orthoCount !== null ? (
          <div className="grid grid-cols-3 gap-4 w-full">
            <div className="text-center pr-4 border-r border-gray-200">
              <p className="text-sm font-medium text-gray-600">
                Regular Patients
              </p>
              <p className="text-2xl font-bold text-[#24336f]">
                {regularCount}
              </p>
            </div>
            <div className="text-center pr-4 border-r border-gray-200">
              <p className="text-sm font-medium text-gray-600">
                Orthodontic Patients
              </p>
              <p className="text-2xl font-bold text-[#24336f]">{orthoCount}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">
                Overall Patients
              </p>
              <p className="text-2xl font-bold text-[#24336f]">
                {overallCount}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-red-500 text-sm text-center">
            Unable to load patient counts
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export function TotalPatientToday() {
  return (
    <div>
      <Card>
        <CardContent>
          <CardHeader>
            <CardTitle>Total Patients Today</CardTitle>
            <CardDescription>Card Description</CardDescription>
          </CardHeader>
          <CardFooter>Card Footer</CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
