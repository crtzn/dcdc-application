// src/components/dashboard/RecentPatientsList.tsx
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PatientModal from "@/components/PatientModal";

interface Patient {
  name: string;
  type: "Regular" | "Ortho";
  sex: string;
  age: number;
  created_at: string;
}

const RecentPatientsList: React.FC = () => {
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
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentPatients();

    const unsubscribeAdded = window.api.onPatientAdded(() => {
      console.log("Patient added event received, refetching recent patients");
      fetchRecentPatients();
    });

    const unsubscribeDeleted = window.api.onPatientDeleted(() => {
      console.log("Patient deleted event received, refetching recent patients");
      fetchRecentPatients();
    });

    return () => {
      unsubscribeAdded();
      unsubscribeDeleted();
    };
  }, []);

  if (loading) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Recent Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full shadow-md">
        <CardHeader className="">
          <CardTitle className="text-lg font-semibold text-gray-800">
            Recent Patients
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle className="flex justify-between text-lg font-semibold text-gray-800">
          Recent Patients
          <div>
            <PatientModal />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No recent patients found.
          </p>
        ) : (
          <div className="max-h-[400px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient, index) => (
                  <TableRow
                    key={`${patient.name}-${patient.type}-${index}`}
                    className="text-start"
                  >
                    <TableCell className="text-gray-800">
                      {patient.name}
                    </TableCell>
                    <TableCell>
                      <span
                        className={`text-sm px-2 py-1 rounded ${
                          patient.type === "Regular"
                            ? "bg-[#24336f]/10 text-[#24336f]"
                            : "bg-[#c84e67]/10 text-[#c84e67]"
                        }`}
                      >
                        {patient.type}
                      </span>
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

export default RecentPatientsList;
