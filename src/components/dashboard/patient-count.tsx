import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, Smile, UserPlus } from "lucide-react";
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
    <div className="container mx-auto py-6">
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-[#24336f]" />
        </div>
      ) : regularCount !== null &&
        orthoCount !== null &&
        overallCount !== null ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Regular Patients Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-[#24336f]" />
              <CardTitle className="text-lg font-semibold text-gray-800">
                Regular Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold text-[#24336f]">
                {regularCount}
              </p>
            </CardContent>
          </Card>

          {/* Orthodontic Patients Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex items-center space-x-2">
              <Smile className="h-6 w-6 text-[#24336f]" />
              <CardTitle className="text-lg font-semibold text-gray-800">
                Orthodontic Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold text-[#24336f]">{orthoCount}</p>
            </CardContent>
          </Card>

          {/* Overall Patients Card */}
          <Card className="shadow-md hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex items-center space-x-2">
              <UserPlus className="h-6 w-6 text-[#24336f]" />
              <CardTitle className="text-lg font-semibold text-gray-800">
                Overall Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold text-[#24336f]">
                {overallCount}
              </p>
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-red-500 text-center text-lg">
          Unable to load patient counts
        </p>
      )}
    </div>
  );
}
