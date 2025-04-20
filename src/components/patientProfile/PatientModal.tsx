// src/components/patientProfile/PatientDetailsModal.tsx
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import TreatmentRecordForm from "@/components/regular/treatment-record";
import OrthodonticTreatmentRecordForm from "@/components/orthodontic/orthodontic-treatment-record";
import {
  RegularPatient,
  RegularMedicalHistory,
  RegularTreatmentRecord,
} from "@/electron/types/RegularPatient";
import {
  OrthodonticPatient,
  OrthodonticTreatmentRecord,
} from "@/electron/types/OrthodonticPatient";
import { useState } from "react";
import jsPDF from "jspdf";

interface PatientDetailsModalProps {
  patient: {
    info: RegularPatient | OrthodonticPatient;
    medicalHistory?: RegularMedicalHistory[];
    treatmentRecords?: RegularTreatmentRecord[] | OrthodonticTreatmentRecord[];
  } | null;
  type: "Regular" | "Ortho" | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
}

const PatientDetailsModal = ({
  patient,
  type,
  isOpen,
  onClose,
  onRefresh,
}: PatientDetailsModalProps) => {
  const [showTreatmentForm, setShowTreatmentForm] = useState(false);

  if (!patient || !type) return null;

  const formatValue = (
    value: string | number | boolean | Date | null | undefined
  ): string => {
    if (value === null || value === undefined) return "N/A";
    if (typeof value === "number" && (value === 0 || value === 1)) {
      return value === 1 ? "Yes" : "No";
    }
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (
      value instanceof Date ||
      (typeof value === "string" && value.match(/^\d{4}-\d{2}-\d{2}/))
    ) {
      try {
        return format(new Date(value), "MMM dd, yyyy");
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const handleTreatmentSubmit = async (data: any) => {
    try {
      let result;
      if (type === "Regular") {
        const treatmentData: RegularTreatmentRecord = {
          patient_id: patient.info.patient_id!,
          ...data,
        };
        result = await window.api.addTreatmentRecord(treatmentData);
      } else {
        const treatmentData: OrthodonticTreatmentRecord = {
          patient_id: patient.info.patient_id!,
          ...data,
        };
        result = await window.api.addOrthodonticTreatmentRecord(treatmentData);
      }
      if (result.success) {
        toast.success("Treatment record added successfully");
        setShowTreatmentForm(false);
        onRefresh();
      } else {
        throw new Error("Failed to add treatment record");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error adding treatment record: ${errorMessage}`);
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    let yOffset = 20;
    const pageWidth = 210; // A4 page width in mm
    const margin = 20;
    const usableWidth = pageWidth - 2 * margin; // 170mm

    const checkPage = () => {
      if (yOffset > 250) {
        doc.addPage();
        yOffset = 20;
      }
    };

    // Title
    doc.setFontSize(18);
    doc.text(
      `Patient Details - ${patient.info.name} (${type})`,
      margin,
      yOffset
    );
    yOffset += 15;

    // Patient Info Section
    doc.setFontSize(14);
    doc.text("Patient Information", margin, yOffset);
    yOffset += 10;

    const patientFields =
      type === "Regular"
        ? [
            { key: "name", label: "Name" },
            { key: "birthday", label: "Birthday" },
            { key: "religion", label: "Religion" },
            { key: "home_address", label: "Home Address" },
            { key: "sex", label: "Gender" },
            { key: "age", label: "Age" },
            { key: "nationality", label: "Nationality" },
            { key: "cellphone_number", label: "Cellphone Number" },
            { key: "registration_date", label: "Registration Date" },
            { key: "created_at", label: "Created At" },
          ]
        : [
            { key: "date_of_exam", label: "Date of Exam" },
            { key: "name", label: "Name" },
            { key: "occupation", label: "Occupation" },
            { key: "birthday", label: "Birthday" },
            { key: "parent_guardian_name", label: "Parent/Guardian Name" },
            { key: "address", label: "Address" },
            { key: "telephone_home", label: "Telephone (Home)" },
            { key: "telephone_business", label: "Telephone (Business)" },
            { key: "cellphone_number", label: "Cellphone Number" },
            { key: "email", label: "Email" },
            { key: "chart", label: "Chart" },
            { key: "sex", label: "Gender" },
            { key: "age", label: "Age" },
            { key: "chief_complaint", label: "Chief Complaint" },
            {
              key: "past_medical_dental_history",
              label: "Past Medical/Dental History",
            },
            {
              key: "prior_orthodontic_history",
              label: "Prior Orthodontic History",
            },
            {
              key: "under_treatment_or_medication",
              label: "Under Treatment/Medication",
            },
            {
              key: "congenital_abnormalities",
              label: "Congenital Abnormalities",
            },
            {
              key: "temporomandibular_joint_problems",
              label: "TMJ Problems",
            },
            { key: "oral_hygiene", label: "Oral Hygiene" },
            { key: "gingival_tissues", label: "Gingival Tissues" },
            { key: "created_at", label: "Created At" },
          ];

    doc.setFontSize(10);
    patientFields.forEach(({ key, label }) => {
      checkPage();
      const value = formatValue(
        (patient.info as RegularPatient | OrthodonticPatient)[
          key as keyof (RegularPatient | OrthodonticPatient)
        ]
      );
      doc.text(`${label}: ${value}`, margin, yOffset);
      yOffset += 8;
    });
    yOffset += 10;

    // Medical History Section (Regular Patients Only)
    if (
      type === "Regular" &&
      patient.medicalHistory &&
      patient.medicalHistory.length > 0
    ) {
      checkPage();
      doc.setFontSize(14);
      doc.text("Medical History", margin, yOffset);
      yOffset += 10;

      patient.medicalHistory.forEach((history) => {
        checkPage();
        doc.setFontSize(12);
        doc.text(`Medical History #${history.history_id}`, margin, yOffset);
        yOffset += 8;

        const historyFields = [
          { label: "General Health", value: history.general_health },
          { label: "Under Treatment", value: history.under_medical_treatment },
          { label: "Medical Condition", value: history.medical_condition },
          {
            label: "Serious Illness/Surgery",
            value: history.serious_illness_or_surgery,
          },
          {
            label: "Illness/Surgery Details",
            value: history.illness_or_surgery_details,
          },
          { label: "Hospitalized", value: history.hospitalized },
          {
            label: "Hospitalization Details",
            value: history.hospitalization_details,
          },
          { label: "Taking Medications", value: history.taking_medications },
          { label: "Medications List", value: history.medications_list },
          { label: "Uses Tobacco", value: history.uses_tobacco },
          { label: "Allergies", value: history.list_of_allergies },
          { label: "Bleeding Time", value: history.bleeding_time },
          { label: "Pregnant", value: history.is_pregnant },
          { label: "Nursing", value: history.is_nursing },
          { label: "Birth Control", value: history.taking_birth_control },
          { label: "Blood Type", value: history.blood_type },
          { label: "Blood Pressure", value: history.blood_pressure },
          { label: "Selected Conditions", value: history.selected_conditions },
        ];

        doc.setFontSize(10);
        historyFields.forEach(({ label, value }) => {
          checkPage();
          doc.text(`${label}: ${formatValue(value)}`, margin + 5, yOffset);
          yOffset += 8;
        });
        yOffset += 5;
      });
    } else if (type === "Regular") {
      checkPage();
      doc.setFontSize(14);
      doc.text("Medical History", margin, yOffset);
      yOffset += 10;
      doc.setFontSize(10);
      doc.text("No medical history available.", margin, yOffset);
      yOffset += 10;
    }

    // Treatment Records Section (Improved Layout)
    if (patient.treatmentRecords && patient.treatmentRecords.length > 0) {
      checkPage();
      doc.setFontSize(14);
      doc.text("Treatment Records", margin, yOffset);
      yOffset += 10;

      if (type === "Regular") {
        const headers = [
          "Treatment Date",
          "Tooth Number",
          "Procedure",
          "Dentist Name",
          "Amount Charged",
          "Amount Paid",
          "Balance",
          "Mode of Payment",
        ];
        const columnWidths = [25, 20, 20, 25, 20, 20, 15, 25, 30]; // Adjusted widths to fit within 170mm
        const data = (patient.treatmentRecords as RegularTreatmentRecord[]).map(
          (record) => [
            formatValue(record.treatment_date),
            formatValue(record.tooth_number),
            formatValue(record.procedure),
            formatValue(record.dentist_name),
            formatValue(record.amount_charged),
            formatValue(record.amount_paid),
            formatValue(record.balance),
            formatValue(record.mode_of_payment),
            formatValue(record.notes),
          ]
        );

        // Draw Headers
        doc.setFontSize(10);
        let xOffset = margin;
        headers.forEach((header, index) => {
          const wrappedHeader = doc.splitTextToSize(
            header,
            columnWidths[index]
          );
          doc.text(wrappedHeader, xOffset, yOffset);
          xOffset += columnWidths[index];
        });
        yOffset += 8;
        doc.line(margin, yOffset, margin + usableWidth, yOffset); // Header line
        yOffset += 5;

        // Draw Data Rows
        data.forEach((row) => {
          checkPage();
          xOffset = margin;
          let maxHeight = 0;
          const rowHeights: number[] = [];

          // Calculate the height of each cell (for wrapped text)
          row.forEach((cell, index) => {
            const wrappedText = doc.splitTextToSize(cell, columnWidths[index]);
            const cellHeight = wrappedText.length * 5; // Approximate height per line
            rowHeights.push(cellHeight);
            maxHeight = Math.max(maxHeight, cellHeight);
          });

          // Draw each cell in the row
          row.forEach((cell, index) => {
            const wrappedText = doc.splitTextToSize(cell, columnWidths[index]);
            doc.text(wrappedText, xOffset, yOffset);
            xOffset += columnWidths[index];
          });

          yOffset += maxHeight + 2; // Add some padding between rows
        });
      } else {
        const headers = [
          "Appointment No.",
          "Date",
          "Arch Wire",
          "Procedure",
          "Amount Paid",
          "Mode of Payment",
          "Next Schedule",
        ];
        const columnWidths = [25, 25, 20, 20, 20, 25, 25]; // Adjusted widths to fit within 170mm
        const data = (
          patient.treatmentRecords as OrthodonticTreatmentRecord[]
        ).map((record) => [
          formatValue(record.appt_no),
          formatValue(record.date),
          formatValue(record.arch_wire),
          formatValue(record.procedure),
          formatValue(record.amount_paid),
          formatValue(record.mode_of_payment),
          formatValue(record.next_schedule),
        ]);

        // Draw Headers
        doc.setFontSize(10);
        let xOffset = margin;
        headers.forEach((header, index) => {
          const wrappedHeader = doc.splitTextToSize(
            header,
            columnWidths[index]
          );
          doc.text(wrappedHeader, xOffset, yOffset);
          xOffset += columnWidths[index];
        });
        yOffset += 8;
        doc.line(margin, yOffset, margin + usableWidth, yOffset); // Header line
        yOffset += 5;

        // Draw Data Rows
        data.forEach((row) => {
          checkPage();
          xOffset = margin;
          let maxHeight = 0;
          const rowHeights: number[] = [];

          // Calculate the height of each cell (for wrapped text)
          row.forEach((cell, index) => {
            const wrappedText = doc.splitTextToSize(cell, columnWidths[index]);
            const cellHeight = wrappedText.length * 5; // Approximate height per line
            rowHeights.push(cellHeight);
            maxHeight = Math.max(maxHeight, cellHeight);
          });

          // Draw each cell in the row
          row.forEach((cell, index) => {
            const wrappedText = doc.splitTextToSize(cell, columnWidths[index]);
            doc.text(wrappedText, xOffset, yOffset);
            xOffset += columnWidths[index];
          });

          yOffset += maxHeight + 2; // Add some padding between rows
        });
      }
    } else {
      checkPage();
      doc.setFontSize(14);
      doc.text("Treatment Records", margin, yOffset);
      yOffset += 10;
      doc.setFontSize(10);
      doc.text("No treatment records available.", margin, yOffset);
      yOffset += 10;
    }

    const fileName = `${patient.info.name.replace(
      /\s+/g,
      "_"
    )}_Patient_Details_${format(new Date(), "yyyyMMdd")}.pdf`;
    doc.save(fileName);
    toast.success("PDF exported successfully!");
  };

  const renderPatientInfo = () => {
    const fields =
      type === "Regular"
        ? [
            { key: "name", label: "Name" },
            { key: "birthday", label: "Birthday" },
            { key: "religion", label: "Religion" },
            { key: "home_address", label: "Home Address" },
            { key: "sex", label: "Gender" },
            { key: "age", label: "Age" },
            { key: "nationality", label: "Nationality" },
            { key: "cellphone_number", label: "Cellphone Number" },
            { key: "registration_date", label: "Registration Date" },
            { key: "created_at", label: "Created At" },
          ]
        : [
            { key: "date_of_exam", label: "Date of Exam" },
            { key: "name", label: "Name" },
            { key: "occupation", label: "Occupation" },
            { key: "birthday", label: "Birthday" },
            { key: "parent_guardian_name", label: "Parent/Guardian Name" },
            { key: "address", label: "Address" },
            { key: "telephone_home", label: "Telephone (Home)" },
            { key: "telephone_business", label: "Telephone (Business)" },
            { key: "cellphone_number", label: "Cellphone Number" },
            { key: "email", label: "Email" },
            { key: "chart", label: "Chart" },
            { key: "sex", label: "Gender" },
            { key: "age", label: "Age" },
            { key: "chief_complaint", label: "Chief Complaint" },
            {
              key: "past_medical_dental_history",
              label: "Past Medical/Dental History",
            },
            {
              key: "prior_orthodontic_history",
              label: "Prior Orthodontic History",
            },
            {
              key: "under_treatment_or_medication",
              label: "Under Treatment/Medication",
            },
            {
              key: "congenital_abnormalities",
              label: "Congenital Abnormalities",
            },
            {
              key: "temporomandibular_joint_problems",
              label: "TMJ Problems",
            },
            { key: "oral_hygiene", label: "Oral Hygiene" },
            { key: "gingival_tissues", label: "Gingival Tissues" },
            { key: "created_at", label: "Created At" },
          ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
        {fields.map(({ key, label }) => (
          <div key={key} className="flex flex-col">
            <span className="font-semibold text-sm text-gray-700">{label}</span>
            <span className="text-gray-600 text-sm">
              {formatValue(
                (patient.info as RegularPatient | OrthodonticPatient)[
                  key as keyof (RegularPatient | OrthodonticPatient)
                ]
              )}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderMedicalHistory = () => {
    if (
      type !== "Regular" ||
      !patient.medicalHistory ||
      patient.medicalHistory.length === 0
    ) {
      return (
        <p className="text-gray-500 text-center p-4">
          No medical history available.
        </p>
      );
    }

    return (
      <ScrollArea className="max-h-[60vh] w-full pr-4">
        <div className="space-y-4">
          {patient.medicalHistory.map((history) => (
            <div
              key={history.history_id}
              className="border rounded-lg p-4 bg-gray-50 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Medical History #{history.history_id}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <span className="font-semibold text-gray-700">
                    General Health:
                  </span>{" "}
                  {formatValue(history.general_health)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Under Treatment:
                  </span>{" "}
                  {formatValue(history.under_medical_treatment)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Medical Condition:
                  </span>{" "}
                  {formatValue(history.medical_condition)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Serious Illness/Surgery:
                  </span>{" "}
                  {formatValue(history.serious_illness_or_surgery)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Illness/Surgery Details:
                  </span>{" "}
                  {formatValue(history.illness_or_surgery_details)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Hospitalized:
                  </span>{" "}
                  {formatValue(history.hospitalized)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Hospitalization Details:
                  </span>{" "}
                  {formatValue(history.hospitalization_details)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Take Medications:
                  </span>{" "}
                  {formatValue(history.taking_medications)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Medications List:
                  </span>{" "}
                  {formatValue(history.medications_list)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Uses Tobacco:
                  </span>{" "}
                  {formatValue(history.uses_tobacco)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Allergies:
                  </span>{" "}
                  {formatValue(history.list_of_allergies)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Bleeding Time:
                  </span>{" "}
                  {formatValue(history.bleeding_time)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Pregnant:</span>{" "}
                  {formatValue(history.is_pregnant)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Nursing:</span>{" "}
                  {formatValue(history.is_nursing)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Birth Control:
                  </span>{" "}
                  {formatValue(history.taking_birth_control)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Blood Type:
                  </span>{" "}
                  {formatValue(history.blood_type)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Blood Pressure:
                  </span>{" "}
                  {formatValue(history.blood_pressure)}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">
                    Selected Conditions:
                  </span>{" "}
                  {formatValue(history.selected_conditions)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    );
  };

  const renderTreatmentRecords = () => {
    if (!patient.treatmentRecords || patient.treatmentRecords.length === 0) {
      return (
        <p className="text-gray-500 text-center p-4">
          No treatment records available.
        </p>
      );
    }

    if (type === "Regular") {
      return (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Treatment Date</TableHead>
                <TableHead>Tooth Number</TableHead>
                <TableHead>Procedure</TableHead>
                <TableHead>Dentist Name</TableHead>
                <TableHead>Amount Charged</TableHead>
                <TableHead>Amount Paid</TableHead>
                <TableHead>Balance</TableHead>
                <TableHead>Mode of Payment</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(patient.treatmentRecords as RegularTreatmentRecord[]).map(
                (record) => (
                  <TableRow key={record.record_id}>
                    <TableCell>{formatValue(record.treatment_date)}</TableCell>
                    <TableCell>{formatValue(record.tooth_number)}</TableCell>
                    <TableCell>{formatValue(record.procedure)}</TableCell>
                    <TableCell>{formatValue(record.dentist_name)}</TableCell>
                    <TableCell>{formatValue(record.amount_charged)}</TableCell>
                    <TableCell>{formatValue(record.amount_paid)}</TableCell>
                    <TableCell>{formatValue(record.balance)}</TableCell>
                    <TableCell>{formatValue(record.mode_of_payment)}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Appointment No.</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Arch Wire</TableHead>
              <TableHead>Procedure</TableHead>
              <TableHead>Amount Paid</TableHead>
              <TableHead>Mode of Payment</TableHead>
              <TableHead>Next Schedule</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(patient.treatmentRecords as OrthodonticTreatmentRecord[]).map(
              (record) => (
                <TableRow key={record.record_id}>
                  <TableCell>{formatValue(record.appt_no)}</TableCell>
                  <TableCell>{formatValue(record.date)}</TableCell>
                  <TableCell>{formatValue(record.arch_wire)}</TableCell>
                  <TableCell>{formatValue(record.procedure)}</TableCell>
                  <TableCell>{formatValue(record.amount_paid)}</TableCell>
                  <TableCell>{formatValue(record.mode_of_payment)}</TableCell>
                  <TableCell>{formatValue(record.next_schedule)}</TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </div>
    );
  };

  const renderTreatmentForm = () => {
    if (!showTreatmentForm) return null;

    return (
      <Dialog open={showTreatmentForm} onOpenChange={setShowTreatmentForm}>
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Add New Treatment Record</DialogTitle>
          </DialogHeader>
          {type === "Regular" ? (
            <TreatmentRecordForm
              onSubmit={handleTreatmentSubmit}
              onBack={() => setShowTreatmentForm(false)}
            />
          ) : (
            <OrthodonticTreatmentRecordForm
              onSubmit={handleTreatmentSubmit}
              onBack={() => setShowTreatmentForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-[80rem] p-6 rounded-lg bg-white shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-800">
            Patient Details - {patient.info.name} ({type})
          </DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
            <TabsTrigger
              value="info"
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Patient Info
            </TabsTrigger>
            {type === "Regular" && (
              <TabsTrigger
                value="history"
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Medical History
              </TabsTrigger>
            )}
            <TabsTrigger
              value="records"
              className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Treatment Records
            </TabsTrigger>
          </TabsList>
          <TabsContent value="info">
            <ScrollArea className="max-h-[60vh] pr-4">
              {renderPatientInfo()}
            </ScrollArea>
          </TabsContent>
          {type === "Regular" && (
            <TabsContent value="history">
              <ScrollArea className="max-h-[60vh] pr-4">
                {renderMedicalHistory()}
              </ScrollArea>
            </TabsContent>
          )}
          <TabsContent value="records">
            <div className="flex justify-end mb-4">
              <Button
                className="bg-green-600 text-white hover:bg-green-700"
                onClick={() => setShowTreatmentForm(true)}
              >
                Add Treatment Record
              </Button>
            </div>
            <ScrollArea className="max-h-[60vh] pr-4">
              {renderTreatmentRecords()}
            </ScrollArea>
          </TabsContent>
        </Tabs>
        <DialogFooter className="mt-6 flex justify-end gap-4">
          <Button
            variant="outline"
            className="border-gray-300 text-gray-700 hover:bg-gray-100"
            onClick={() =>
              console.log("Edit patient:", patient.info.patient_id)
            }
          >
            Edit (Coming Soon)
          </Button>
          <Button
            className="bg-purple-600 text-white hover:bg-purple-700"
            onClick={exportToPDF}
          >
            Export to PDF
          </Button>
          <Button
            className="bg-blue-600 text-white hover:bg-blue-700"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      {renderTreatmentForm()}
    </Dialog>
  );
};

export default PatientDetailsModal;
