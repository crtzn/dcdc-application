import { useEffect, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import PatientModal from "../PatientModal";

interface Patient {
  name: string;
  type: "Regular" | "Ortho";
  sex: string;
  age: number;
  created_at: string;
}

const RecentAddPatientTable = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecentPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await window.api.getRecentPatients();
      if (result.success && result.patients) {
        setPatients(result.patients);
      } else {
        throw new Error(result.error || "Failed to fetch recent patients");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      setError(errorMessage);
      toast.error(`Error fetching recent patients: ${errorMessage}`);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch patients on mount
    fetchRecentPatients();

    // Listen for patient-added event
    const unsubscribe = window.api.onPatientAdded(() => {
      console.log("Patient added event received, refetching recent patients");
      fetchRecentPatients();
    });

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <Card className="w-full  mx-auto shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between text-lg font-semibold text-gray-800">
          <div>Recently Added Patients</div>
          <div>
            <PatientModal />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : patients.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No recent patients found.
          </p>
        ) : (
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Date Added</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient, index) => (
                  <TableRow
                    key={`${patient.name}-${patient.type}-${index}`}
                    className="text-start"
                  >
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.type}</TableCell>
                    <TableCell>{patient.sex}</TableCell>
                    <TableCell>{patient.age}</TableCell>
                    <TableCell>
                      {format(new Date(patient.created_at), "MMM dd, yyyy")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentAddPatientTable;
