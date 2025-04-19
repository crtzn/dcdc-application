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
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import PatientDetailsModal from "@/components/patientProfile/PatientModal"; // Swap with PatientDetailsDrawer if using sidebar
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "@/electron/types/RegularPatient";
import {
  OrthodonticPatient,
  OrthodonticTreatmentRecord,
} from "@/electron/types/OrthodonticPatient";
import PatientModal from "@/components/PatientModal";

interface Patient {
  patient_id: number;
  name: string;
  type: "Regular" | "Ortho";
  sex: string;
  age: number;
  created_at: string;
}

const PatientList = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchName, setSearchName] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [genderFilter, setGenderFilter] = useState("All");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("DESC");
  const [selectedPatient, setSelectedPatient] = useState<{
    info: RegularPatient | OrthodonticPatient;
    medicalHistory?: RegularMedicalHistory[];
    treatmentRecords?: RegularTreatmentRecord[] | OrthodonticTreatmentRecord[];
  } | null>(null);
  const [selectedType, setSelectedType] = useState<"Regular" | "Ortho" | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchPatientDetails = async (
    patientId: number,
    type: "Regular" | "Ortho"
  ) => {
    try {
      const result = await window.api.getPatientDetails(patientId, type);
      if (result.success && result.patient) {
        setSelectedPatient(result.patient);
        setSelectedType(type);
        setIsModalOpen(true);
      } else {
        throw new Error(result.error || "Patient not found");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error fetching patient details: ${errorMessage}`);
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await window.api.getFilteredPatients(
          searchName,
          typeFilter,
          genderFilter,
          sortBy,
          sortDirection
        );
        if (result.success && result.patients) {
          setPatients(result.patients);
        } else {
          throw new Error(result.error || "Failed to fetch patients");
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        setError(errorMessage);
        toast.error(`Error fetching patients: ${errorMessage}`);
        setPatients([]);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
    const unsubscribe = window.api.onPatientAdded(() => {
      console.log("Patient added event received, refetching patients");
      fetchPatients();
    });
    return () => unsubscribe();
  }, [searchName, typeFilter, genderFilter, sortBy, sortDirection]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setSortDirection("ASC");
    }
  };

  const resetFilters = () => {
    setSearchName("");
    setTypeFilter("All");
    setGenderFilter("All");
  };

  const resetSort = () => {
    setSortBy("created_at");
    setSortDirection("DESC");
  };

  const handleRowClick = (patient: Patient) => {
    fetchPatientDetails(patient.patient_id, patient.type);
  };

  return (
    <div className="w-full  mx-auto mt-10">
      <CardHeader>
        <CardTitle className="text-lg text-start font-semibold  text-[#1e1e1e]">
          <h1> Patient List</h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-10">
        <div className="flex flex-col sm:flex-row gap-4 mb-4 ">
          <Input
            placeholder="Search by name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            className="max-w-xs"
          />
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Types</SelectItem>
              <SelectItem value="Regular">Regular</SelectItem>
              <SelectItem value="Ortho">Ortho</SelectItem>
            </SelectContent>
          </Select>
          <Select value={genderFilter} onValueChange={setGenderFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by gender" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={resetFilters}
            className="bg-[#1e1e1e] text-white hover:bg-gray-700 hover:text-white]"
          >
            Reset Filters
          </Button>
          <Button
            variant="outline"
            onClick={resetSort}
            className="bg-[#1e1e1e] text-white hover:bg-gray-700 hover:text-white]"
          >
            Reset Sort
          </Button>
          <PatientModal />
        </div>
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
          <p className="text-gray-500 text-center py-4">No patients found.</p>
        ) : (
          <div className="max-h-[500px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    Name{" "}
                    {sortBy === "name" && (
                      <ArrowUpDown className="inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("type")}
                  >
                    Type{" "}
                    {sortBy === "type" && (
                      <ArrowUpDown className="inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("sex")}
                  >
                    Gender{" "}
                    {sortBy === "sex" && (
                      <ArrowUpDown className="inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("age")}
                  >
                    Age{" "}
                    {sortBy === "age" && (
                      <ArrowUpDown className="inline h-4 w-4" />
                    )}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer"
                    onClick={() => handleSort("created_at")}
                  >
                    Date Added{" "}
                    {sortBy === "created_at" && (
                      <ArrowUpDown className="inline h-4 w-4" />
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((patient) => (
                  <TableRow
                    key={`${patient.patient_id}-${patient.type}`}
                    className="cursor-pointer hover:bg-gray-100 text-start"
                    onClick={() => handleRowClick(patient)}
                  >
                    <TableCell>{patient.name}</TableCell>
                    <TableCell>{patient.type}</TableCell>
                    <TableCell>{patient.sex || "N/A"}</TableCell>
                    <TableCell>{patient.age || "N/A"}</TableCell>
                    <TableCell>
                      {patient.created_at
                        ? format(new Date(patient.created_at), "MMM dd, yyyy")
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <PatientDetailsModal
          patient={selectedPatient}
          type={selectedType}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPatient(null);
            setSelectedType(null);
          }}
        />
      </CardContent>
    </div>
  );
};

export default PatientList;
