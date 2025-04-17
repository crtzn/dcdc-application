import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export function TotalPatientCount() {
  const [regularCount, setRegularCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        setLoading(true);
        const result = await window.api.getAllRegularPatients();
        if (result.success && typeof result.total_count === "number") {
          setRegularCount(result.total_count);
        } else {
          throw new Error(result.error || "Failed to fetch patient count");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        toast.error(`Error fetching patient count: ${errorMessage}`);
        setRegularCount(null);
      } finally {
        setLoading(false);
      }
    };

    fetchCount();
  }, [setRegularCount]);

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Total Regular Patients
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : regularCount !== null ? (
          <p className="text-3xl font-bold text-blue-600">{regularCount}</p>
        ) : (
          <p className="text-red-500 text-sm">Unable to load count</p>
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
