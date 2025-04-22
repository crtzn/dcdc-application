// src/components/PatientList.tsx
import { useEffect, useState, useCallback } from "react";
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
import { Loader2, Search, Filter, RefreshCw, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import PatientDetailsModal from "@/components/patientProfile/PatientModal";
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
import { Badge } from "@/components/ui/badge";

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

  // Create a function to fetch patients that can be called from multiple places
  const fetchPatients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("Fetching patients with filters:", {
        searchName,
        typeFilter,
        genderFilter,
        sortBy,
        sortDirection,
      });

      const result = await window.api.getFilteredPatients(
        searchName,
        typeFilter,
        genderFilter,
        sortBy,
        sortDirection
      );

      if (result.success && result.patients) {
        console.log(`Received ${result.patients.length} patients`);
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
  }, [searchName, typeFilter, genderFilter, sortBy, sortDirection]);

  // Use debounce for search input to avoid too many requests
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPatients();
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchName, fetchPatients]);

  // Immediate fetch for other filter changes
  useEffect(() => {
    fetchPatients();
  }, [typeFilter, genderFilter, sortBy, sortDirection, fetchPatients]);

  // Set up event listeners for patient added/updated/deleted events
  useEffect(() => {
    const unsubscribeAdded = window.api.onPatientAdded(() => {
      console.log("Patient added event received, refetching patients");
      fetchPatients();
    });

    const unsubscribeUpdated = window.api.onPatientUpdated(() => {
      console.log("Patient updated event received, refetching patients");
      fetchPatients();
    });

    const unsubscribeDeleted = window.api.onPatientDeleted(() => {
      console.log("Patient deleted event received, refetching patients");
      fetchPatients();
    });

    return () => {
      unsubscribeAdded();
      unsubscribeUpdated();
      unsubscribeDeleted();
    };
  }, [fetchPatients]);

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

  const handleRefreshPatientDetails = () => {
    if (selectedPatient && selectedType) {
      fetchPatientDetails(selectedPatient.info.patient_id!, selectedType);
    }
  };

  const getPatientTypeColor = (type: string) => {
    return type === "Regular"
      ? "bg-blue-100 text-blue-800"
      : "bg-emerald-100 text-emerald-800";
  };

  return (
    <div className="w-full mx-auto p-8">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl text-start font-semibold text-[#1e1e1e]">
          <h1>Patient List</h1>
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-4">
        <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search patients..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-8 max-w-xs bg-white"
              />
            </div>
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[140px] bg-white">
                  <SelectValue placeholder="Patient Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  <SelectItem value="Regular">Regular</SelectItem>
                  <SelectItem value="Ortho">Ortho</SelectItem>
                </SelectContent>
              </Select>
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[190px] bg-white">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Genders</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Reset Filters
            </Button>
            <Button
              variant="outline"
              onClick={resetSort}
              className="flex items-center gap-1"
            >
              <RefreshCw className="h-4 w-4" />
              Reset Sort
            </Button>
            <PatientModal />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-10">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-2" />
              <p className="text-sm text-gray-500">Loading patients...</p>
            </div>
          </div>
        ) : error ? (
          <Alert variant="destructive" className="my-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : patients.length === 0 ? (
          <div className="text-center py-10 border rounded-lg bg-gray-50">
            <p className="text-gray-500">
              No patients found matching your criteria.
            </p>
            <Button variant="link" onClick={resetFilters} className="mt-2">
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="border p-5 rounded-lg overflow-hidden">
            <div className="max-h-[500px] overflow-y-auto">
              <Table>
                <TableHeader className="bg-gray-50">
                  <TableRow>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-medium"
                      onClick={() => handleSort("name")}
                    >
                      <div className="flex items-center">
                        Name
                        {sortBy === "name" && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-medium"
                      onClick={() => handleSort("type")}
                    >
                      <div className="flex items-center">
                        Type
                        {sortBy === "type" && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-medium"
                      onClick={() => handleSort("sex")}
                    >
                      <div className="flex items-center">
                        Gender
                        {sortBy === "sex" && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-medium"
                      onClick={() => handleSort("age")}
                    >
                      <div className="flex items-center">
                        Age
                        {sortBy === "age" && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="cursor-pointer hover:bg-gray-100 transition-colors font-medium"
                      onClick={() => handleSort("created_at")}
                    >
                      <div className="flex items-center">
                        Date Added
                        {sortBy === "created_at" && (
                          <ArrowUpDown className="ml-1 h-4 w-4" />
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {patients.map((patient) => (
                    <TableRow
                      key={`${patient.patient_id}-${patient.type}`}
                      className="cursor-pointer hover:bg-gray-50 transition-colors text-start"
                      onClick={() => handleRowClick(patient)}
                    >
                      <TableCell className="font-medium">
                        {patient.name}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getPatientTypeColor(patient.type)}
                        >
                          {patient.type}
                        </Badge>
                      </TableCell>
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
          </div>
        )}
        {patients.length > 0 && (
          <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
            <p>
              Showing {patients.length}{" "}
              {patients.length === 1 ? "patient" : "patients"}
            </p>
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
          onRefresh={handleRefreshPatientDetails}
        />
      </CardContent>
    </div>
  );
};

export default PatientList;
