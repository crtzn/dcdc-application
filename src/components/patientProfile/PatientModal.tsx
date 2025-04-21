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
  PaymentHistory,
} from "@/electron/types/RegularPatient";
import {
  OrthodonticPatient,
  OrthodonticTreatmentRecord,
} from "@/electron/types/OrthodonticPatient";
import { useState } from "react";
import jsPDF from "jspdf";
import RegularPatientEditForm from "@/components/regular/patientEditForm";
import OrthodonticPatientEditForm from "@/components/orthodontic/orthodonticPatientEditForm";
import MedicalHistoryEditForm from "@/components/regular/medicalHistoryEditForm";
import PaymentForm from "@/components/regular/payment-form";

interface PatientDetailsModalProps {
  patient: {
    info: RegularPatient | OrthodonticPatient;
    medicalHistory?: RegularMedicalHistory[];
    treatmentRecords?: RegularTreatmentRecord[] | OrthodonticTreatmentRecord[];
    paymentHistory?: PaymentHistory[];
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
  const [showEditForm, setShowEditForm] = useState(false);
  const [showMedicalHistoryEditForm, setShowMedicalHistoryEditForm] =
    useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedMedicalHistory, setSelectedMedicalHistory] =
    useState<RegularMedicalHistory | null>(null);
  const [selectedTreatmentRecord, setSelectedTreatmentRecord] =
    useState<RegularTreatmentRecord | null>(null);

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

  const handleTreatmentSubmit = async (
    data: Partial<RegularTreatmentRecord | OrthodonticTreatmentRecord>
  ) => {
    try {
      let result;
      if (type === "Regular") {
        const treatmentData = {
          patient_id: patient.info.patient_id!,
          ...data,
        };
        result = await window.api.addTreatmentRecord(
          treatmentData as RegularTreatmentRecord
        );
      } else {
        const treatmentData = {
          patient_id: patient.info.patient_id!,
          ...data,
        };
        result = await window.api.addOrthodonticTreatmentRecord(
          treatmentData as OrthodonticTreatmentRecord
        );
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

    // Logo dimensions (adjust based on actual logo aspect ratio)
    const logoWidth = 30;
    const logoHeight = 30;

    // Function to add header on each page
    const addHeader = () => {
      // Add actual logo
      const logoUrl = "/desktopIcon.png"; // Path relative to public folder
      try {
        doc.addImage(logoUrl, "PNG", margin, 10, logoWidth, logoHeight);
      } catch (error) {
        console.error("Failed to load logo:", error);
        // Fallback to placeholder
        doc.setFillColor(200, 200, 200);
        doc.rect(margin, 10, logoWidth, logoHeight, "F");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Logo", margin + 5, 25);
      }

      // Clinic Information
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text("Dra. Cez Dental Clinic", margin + logoWidth + 10, 20);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(
        "A&E Commercial Complex,Brgy Siling Bata,Pandi Bulacan 3014 Pandi, Philippines",
        margin + logoWidth + 10,
        27
      );
      doc.text(
        "Phone: 0943 586 2245 | Email: example@gmail.com",
        margin + logoWidth + 10,
        34
      );

      // Tagline
      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(39, 118, 171); // Blue (#2776ab)
      doc.text(
        "Your teeth are treasure, making you smile is our pleasure.",
        margin + logoWidth + 10,
        41
      );
      doc.setTextColor(0, 0, 0); // Reset text color to black

      // Horizontal line
      doc.setLineWidth(0.5);
      doc.setDrawColor(39, 118, 171);
      doc.line(margin, 45, margin + usableWidth, 45);
      doc.setDrawColor(0, 0, 0); // Reset draw color to black

      yOffset = 50; // Reset yOffset after header
    };

    // Function to check if a new page is needed
    const checkPage = () => {
      if (yOffset > 250) {
        doc.addPage();
        addHeader();
      }
    };

    // Add header to first page
    addHeader();

    // Title
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Patient Details - ${patient.info.name} (${type})`,
      margin,
      yOffset
    );
    yOffset += 10;

    // Patient Info Section
    doc.setFontSize(14);
    doc.setTextColor(39, 118, 171);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", margin, yOffset);
    doc.setTextColor(0, 0, 0); // Reset text color to black
    yOffset += 8;

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
    doc.setFont("helvetica", "normal");
    patientFields.forEach(({ key, label }) => {
      checkPage();
      const value = formatValue(
        (patient.info as RegularPatient | OrthodonticPatient)[
          key as keyof (RegularPatient | OrthodonticPatient)
        ]
      );
      doc.text(`${label}:`, margin, yOffset);
      doc.text(value, margin + 40, yOffset); // Align values
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
      doc.setTextColor(39, 118, 171);
      doc.setFont("helvetica", "bold");
      doc.text("Medical History", margin, yOffset);
      doc.setTextColor(0, 0, 0); // Reset text color to black
      yOffset += 8;

      patient.medicalHistory.forEach((history) => {
        checkPage();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
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
        doc.setFont("helvetica", "normal");
        historyFields.forEach(({ label, value }) => {
          checkPage();
          doc.text(`${label}:`, margin + 5, yOffset);
          doc.text(formatValue(value), margin + 45, yOffset); // Align values
          yOffset += 8;
        });
        yOffset += 5;
      });
    } else if (type === "Regular") {
      checkPage();
      doc.setFontSize(14);
      doc.setTextColor(39, 118, 171);
      doc.setFont("helvetica", "bold");
      doc.text("Medical History", margin, yOffset);
      doc.setTextColor(0, 0, 0); // Reset text color to black
      yOffset += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("No medical history available.", margin, yOffset);
      yOffset += 10;
    }

    // Treatment Records Section
    if (patient.treatmentRecords && patient.treatmentRecords.length > 0) {
      checkPage();
      doc.setFontSize(14);
      doc.setTextColor(39, 118, 171);
      doc.setFont("helvetica", "bold");
      doc.text("Treatment Records", margin, yOffset);
      doc.setTextColor(0, 0, 0); // Reset text color to black
      yOffset += 8;

      // Add Payment History Section for Regular patients
      if (type === "Regular") {
        // Check if we have payment history from the dedicated table
        if (patient.paymentHistory && patient.paymentHistory.length > 0) {
          // Calculate total payments
          const totalPaid = patient.paymentHistory.reduce(
            (sum: number, payment: PaymentHistory) => sum + payment.amount_paid,
            0
          );

          // Add Payment History heading
          checkPage();
          yOffset += 10;
          doc.setFontSize(14);
          doc.setTextColor(39, 118, 171);
          doc.setFont("helvetica", "bold");
          doc.text("Payment History", margin, yOffset);
          doc.setTextColor(0, 0, 0); // Reset text color to black
          yOffset += 8;

          // Add Payment Summary
          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Total Payments: PHP ${totalPaid.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}`,
            margin,
            yOffset
          );
          yOffset += 6;
          doc.text(
            `Payment Transactions: ${patient.paymentHistory.length}`,
            margin,
            yOffset
          );
          yOffset += 10;

          // Draw Payment History Table
          checkPage();
          const paymentHeaders = [
            "Date",
            "Amount Paid",
            "Method",
            "Balance",
            "Notes",
          ];
          // Adjust column widths to prevent overcrowding
          const paymentColumnWidths = [25, 35, 25, 35, 50];
          const paymentData = patient.paymentHistory.map(
            (payment: PaymentHistory) => {
              // Format date to save space (MM/DD/YY)
              const dateObj = new Date(payment.payment_date);
              const formattedDate = `${(dateObj.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${dateObj
                .getDate()
                .toString()
                .padStart(2, "0")}/${dateObj
                .getFullYear()
                .toString()
                .substring(2)}`;

              return [
                formattedDate,
                `PHP ${payment.amount_paid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                payment.payment_method,
                `PHP ${payment.remaining_balance.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`,
                payment.notes || "",
              ];
            }
          );

          // Draw Headers
          doc.setFontSize(9); // Slightly smaller font for headers
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(39, 118, 171);
          doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
          let xOffset = margin;
          paymentHeaders.forEach((header, index) => {
            doc.text(header, xOffset + 3, yOffset); // Add 3mm padding for text
            xOffset += paymentColumnWidths[index];
          });
          yOffset += 8;

          // Draw Data Rows
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8); // Smaller font for data to prevent overlap
          paymentData.forEach((row, rowIndex) => {
            checkPage();
            xOffset = margin;
            let maxHeight = 0;
            if (rowIndex % 2 === 0) {
              doc.setFillColor(240, 240, 240);
              doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
            }
            row.forEach((cell, index) => {
              const wrappedText = doc.splitTextToSize(
                cell,
                paymentColumnWidths[index] - 6
              ); // Reduce width for better spacing
              doc.text(wrappedText, xOffset + 3, yOffset); // Add 3mm padding for text
              const cellHeight = wrappedText.length * 5;
              maxHeight = Math.max(maxHeight, cellHeight);
              xOffset += paymentColumnWidths[index];
            });
            yOffset += maxHeight + 2;
          });

          yOffset += 10; // Add some space after the payment history table
        } else {
          // If no payment history from dedicated table, use treatment records as before
          const paymentRecords = (
            patient.treatmentRecords as RegularTreatmentRecord[]
          ).filter((record) => record.amount_paid && record.amount_paid > 0);

          if (paymentRecords.length > 0) {
            // Calculate total payments
            const totalPaid = paymentRecords.reduce(
              (sum, record) => sum + (record.amount_paid || 0),
              0
            );

            // Add Payment Summary
            checkPage();
            yOffset += 10;
            doc.setFontSize(14);
            doc.setTextColor(39, 118, 171);
            doc.setFont("helvetica", "bold");
            doc.text("Payment Summary", margin, yOffset);
            doc.setTextColor(0, 0, 0); // Reset text color to black
            yOffset += 8;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(
              `Total Payments: PHP ${totalPaid.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
              margin,
              yOffset
            );
            yOffset += 6;
            doc.text(
              `Payment Transactions: ${paymentRecords.length}`,
              margin,
              yOffset
            );
            yOffset += 10;
          }
        }
      }

      if (type === "Regular") {
        const headers = [
          "Date",
          "Tooth #",
          "Procedure",
          "Dentist",
          "Charged",
          "Paid",
          "Balance",
          "Payment Mode",
        ];
        const columnWidths = [25, 15, 30, 25, 25, 25, 25, 30];
        const data = (patient.treatmentRecords as RegularTreatmentRecord[]).map(
          (record) => {
            // Format date to save space (MM/DD/YY)
            const dateObj = new Date(record.treatment_date);
            const formattedDate = `${(dateObj.getMonth() + 1)
              .toString()
              .padStart(2, "0")}/${dateObj
              .getDate()
              .toString()
              .padStart(2, "0")}/${dateObj
              .getFullYear()
              .toString()
              .substring(2)}`;

            return [
              formattedDate,
              formatValue(record.tooth_number),
              formatValue(record.procedure),
              formatValue(record.dentist_name),
              record.amount_charged
                ? `PHP ${record.amount_charged.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "N/A",
              record.amount_paid
                ? `PHP ${record.amount_paid.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "N/A",
              record.balance
                ? `PHP ${record.balance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}`
                : "N/A",
              formatValue(record.mode_of_payment),
            ];
          }
        );

        // Draw Headers
        doc.setFontSize(9); // Slightly smaller font for headers
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(39, 118, 171);
        doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
        let xOffset = margin;
        headers.forEach((header, index) => {
          doc.text(header, xOffset + 3, yOffset); // Add 3mm padding for text
          xOffset += columnWidths[index];
        });
        yOffset += 8;

        // Draw Data Rows
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8); // Smaller font for data to prevent overlap
        data.forEach((row, rowIndex) => {
          checkPage();
          xOffset = margin;
          let maxHeight = 0;
          if (rowIndex % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
          }
          row.forEach((cell, index) => {
            const wrappedText = doc.splitTextToSize(
              cell,
              columnWidths[index] - 6
            ); // Reduce width for better spacing
            doc.text(wrappedText, xOffset + 3, yOffset); // Add 3mm padding for text
            const cellHeight = wrappedText.length * 5;
            maxHeight = Math.max(maxHeight, cellHeight);
            xOffset += columnWidths[index];
          });
          yOffset += maxHeight + 2;
        });
      } else {
        const headers = [
          "Appt #",
          "Date",
          "Arch Wire",
          "Procedure",
          "Amount Paid",
          "Payment Mode",
          "Next Schedule",
        ];
        const columnWidths = [20, 25, 25, 30, 25, 25, 30];
        const data = (
          patient.treatmentRecords as OrthodonticTreatmentRecord[]
        ).map((record) => {
          // Format date to save space (MM/DD/YY)
          const dateObj = record.date ? new Date(record.date) : null;
          const formattedDate = dateObj
            ? `${(dateObj.getMonth() + 1).toString().padStart(2, "0")}/${dateObj
                .getDate()
                .toString()
                .padStart(2, "0")}/${dateObj
                .getFullYear()
                .toString()
                .substring(2)}`
            : "N/A";

          // Format next schedule date
          const nextDateObj = record.next_schedule
            ? new Date(record.next_schedule)
            : null;
          const formattedNextDate = nextDateObj
            ? `${(nextDateObj.getMonth() + 1)
                .toString()
                .padStart(2, "0")}/${nextDateObj
                .getDate()
                .toString()
                .padStart(2, "0")}/${nextDateObj
                .getFullYear()
                .toString()
                .substring(2)}`
            : "N/A";

          return [
            formatValue(record.appt_no),
            formattedDate,
            formatValue(record.arch_wire),
            formatValue(record.procedure),
            record.amount_paid
              ? `PHP ${record.amount_paid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : "N/A",
            formatValue(record.mode_of_payment),
            formattedNextDate,
          ];
        });

        // Draw Headers
        doc.setFontSize(9); // Slightly smaller font for headers
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(39, 118, 171);
        doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
        let xOffset = margin;
        headers.forEach((header, index) => {
          doc.text(header, xOffset + 3, yOffset); // Add 3mm padding for text
          xOffset += columnWidths[index];
        });
        yOffset += 8;

        // Draw Data Rows
        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8); // Smaller font for data to prevent overlap
        data.forEach((row, rowIndex) => {
          checkPage();
          xOffset = margin;
          let maxHeight = 0;
          if (rowIndex % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
          }
          row.forEach((cell, index) => {
            const wrappedText = doc.splitTextToSize(
              cell,
              columnWidths[index] - 6
            ); // Reduce width for better spacing
            doc.text(wrappedText, xOffset + 3, yOffset); // Add 3mm padding for text
            const cellHeight = wrappedText.length * 5;
            maxHeight = Math.max(maxHeight, cellHeight);
            xOffset += columnWidths[index];
          });
          yOffset += maxHeight + 2;
        });
      }
    } else {
      checkPage();
      doc.setFontSize(14);
      doc.setTextColor(39, 118, 171);
      doc.setFont("helvetica", "bold");
      doc.text("Treatment Records", margin, yOffset);
      doc.setTextColor(0, 0, 0); // Reset text color to black
      yOffset += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("No treatment records available.", margin, yOffset);
      yOffset += 10;
    }

    // Add footer with page number
    // Cast to unknown first to avoid TypeScript errors with jsPDF internal API
    const pageCount = (
      doc as unknown as { internal: { getNumberOfPages: () => number } }
    ).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, 287);
    }

    const fileName = `${patient.info.name.replace(
      /\s+/g,
      "_"
    )}_Patient_Details_${format(new Date(), "yyyyMMdd")}.pdf`;
    doc.save(fileName);
    toast.success("PDF exported successfully!");
  };

  const handleEditSubmit = async (
    data: Partial<Omit<RegularPatient | OrthodonticPatient, "patient_id">>
  ) => {
    try {
      let result;
      if (type === "Regular") {
        result = await window.api.updateRegularPatient(
          patient.info.patient_id!,
          data as Partial<Omit<RegularPatient, "patient_id">>
        );
      } else {
        result = await window.api.updateOrthodonticPatient(
          patient.info.patient_id!,
          data as Partial<Omit<OrthodonticPatient, "patient_id">>
        );
      }

      if (result.success) {
        toast.success("Patient information updated successfully");
        setShowEditForm(false);
        onRefresh();
      } else {
        throw new Error(result.error || "Failed to update patient information");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error updating patient information: ${errorMessage}`);
    }
  };

  const handleMedicalHistoryEditSubmit = async (
    data: Partial<Omit<RegularMedicalHistory, "history_id" | "patient_id">>
  ) => {
    try {
      if (!selectedMedicalHistory || !selectedMedicalHistory.history_id) {
        throw new Error("No medical history selected");
      }

      const result = await window.api.updateMedicalHistory(
        selectedMedicalHistory.history_id,
        data
      );

      if (result.success) {
        toast.success("Medical history updated successfully");
        setShowMedicalHistoryEditForm(false);
        setSelectedMedicalHistory(null);
        onRefresh();
      } else {
        throw new Error(result.error || "Failed to update medical history");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error updating medical history: ${errorMessage}`);
    }
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
      <div className="relative">
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-t-lg border-b">
          <h3 className="text-lg font-semibold text-gray-800">
            Patient Information
          </h3>
          <Button
            onClick={() => setShowEditForm(true)}
            className="bg-[#2776ab] text-white hover:bg-[#2776abeb] flex items-center gap-2"
            size="sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit Patient Info
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
          {fields.map(({ key, label }) => (
            <div key={key} className="flex flex-col">
              <span className="font-semibold text-sm text-gray-700">
                {label}
              </span>
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
              className="border rounded-lg p-4 bg-gray-50 shadow-sm relative"
            >
              <div className="absolute top-2 right-2">
                <Button
                  onClick={() => {
                    setSelectedMedicalHistory(history);
                    setShowMedicalHistoryEditForm(true);
                  }}
                  className="bg-blue-600 text-white hover:bg-blue-700 h-8 px-2 py-1 text-xs flex items-center gap-1"
                  size="sm"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edit
                </Button>
              </div>
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

  const renderPaymentHistory = () => {
    if (!patient.paymentHistory || patient.paymentHistory.length === 0) {
      // Check if there are treatment records with balances
      const recordsWithBalances = patient.treatmentRecords
        ? (patient.treatmentRecords as RegularTreatmentRecord[]).filter(
            (record) => record.balance && record.balance > 0
          )
        : [];

      return (
        <div className="space-y-6">
          <p className="text-gray-500 text-center p-4">
            No payment history available.
          </p>

          {recordsWithBalances.length > 0 && (
            <div className="flex flex-col items-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Outstanding Balances
              </h3>
              <div className="w-full max-w-2xl overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Procedure</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordsWithBalances.map((record) => (
                      <TableRow key={record.record_id}>
                        <TableCell>
                          {formatValue(record.treatment_date)}
                        </TableCell>
                        <TableCell>{formatValue(record.procedure)}</TableCell>
                        <TableCell className="font-medium text-red-600">
                          ₱
                          {record.balance?.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => {
                              setSelectedTreatmentRecord(record);
                              setShowPaymentForm(true);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2"
                            size="sm"
                          >
                            Make Payment
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </div>
      );
    }

    // Calculate total payments
    const totalPaid = patient.paymentHistory.reduce(
      (sum: number, payment: PaymentHistory) => sum + payment.amount_paid,
      0
    );

    // Get records with outstanding balances
    const recordsWithBalances = patient.treatmentRecords
      ? (patient.treatmentRecords as RegularTreatmentRecord[]).filter(
          (record) => record.balance && record.balance > 0
        )
      : [];

    return (
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 mb-4">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            Payment Summary
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-blue-600">
                ₱
                {totalPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Payment Transactions</p>
              <p className="text-2xl font-bold text-blue-600">
                {patient.paymentHistory.length}
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Outstanding Balances</p>
              <p className="text-2xl font-bold text-red-600">
                {recordsWithBalances.length}
              </p>
            </div>
          </div>
        </div>

        {recordsWithBalances.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-gray-800">
                Outstanding Balances
              </h3>
              <Button
                onClick={() => setShowPaymentForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white text-sm"
                size="sm"
              >
                Make Payment
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Procedure</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recordsWithBalances.map((record) => (
                    <TableRow key={record.record_id}>
                      <TableCell>
                        {formatValue(record.treatment_date)}
                      </TableCell>
                      <TableCell>{formatValue(record.procedure)}</TableCell>
                      <TableCell className="font-medium text-red-600">
                        ₱
                        {record.balance?.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => {
                            setSelectedTreatmentRecord(record);
                            setShowPaymentForm(true);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs py-1 px-2"
                          size="sm"
                        >
                          Make Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Payment History
          </h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount Paid</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Remaining Balance</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patient.paymentHistory.map((payment: PaymentHistory) => (
                  <TableRow key={payment.payment_id}>
                    <TableCell>{formatValue(payment.payment_date)}</TableCell>
                    <TableCell className="font-medium text-green-600">
                      ₱
                      {payment.amount_paid.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{formatValue(payment.payment_method)}</TableCell>
                    <TableCell className="font-medium text-blue-600">
                      ₱
                      {payment.remaining_balance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>{formatValue(payment.notes)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
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
              patientId={patient.info.patient_id}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const renderEditForm = () => {
    if (!showEditForm) return null;

    return (
      <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Patient Information
            </DialogTitle>
            <p className="text-gray-500 text-sm mt-1">
              Update patient details below. Fields marked with * are required.
            </p>
          </DialogHeader>
          {type === "Regular" ? (
            <RegularPatientEditForm
              patient={patient.info as RegularPatient}
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditForm(false)}
            />
          ) : (
            <OrthodonticPatientEditForm
              patient={patient.info as OrthodonticPatient}
              onSubmit={handleEditSubmit}
              onCancel={() => setShowEditForm(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const renderMedicalHistoryEditForm = () => {
    if (!showMedicalHistoryEditForm || !selectedMedicalHistory) return null;

    return (
      <Dialog
        open={showMedicalHistoryEditForm}
        onOpenChange={setShowMedicalHistoryEditForm}
      >
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit Medical History
            </DialogTitle>
            <p className="text-gray-500 text-sm mt-1">
              Update medical history details below.
            </p>
          </DialogHeader>
          <MedicalHistoryEditForm
            history={selectedMedicalHistory}
            onSubmit={handleMedicalHistoryEditSubmit}
            onCancel={() => {
              setShowMedicalHistoryEditForm(false);
              setSelectedMedicalHistory(null);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  };

  const renderPaymentForm = () => {
    if (!showPaymentForm) return null;

    return (
      <Dialog open={showPaymentForm} onOpenChange={setShowPaymentForm}>
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
              Record Payment
            </DialogTitle>
            <p className="text-gray-500 text-sm mt-1">
              {selectedTreatmentRecord
                ? `Recording payment for treatment on ${formatValue(
                    selectedTreatmentRecord.treatment_date
                  )}`
                : "Record a new payment"}
            </p>
          </DialogHeader>
          <PaymentForm
            patientId={patient.info.patient_id!}
            treatmentRecord={selectedTreatmentRecord || undefined}
            onSuccess={() => {
              setShowPaymentForm(false);
              setSelectedTreatmentRecord(null);
              onRefresh();
            }}
            onCancel={() => {
              setShowPaymentForm(false);
              setSelectedTreatmentRecord(null);
            }}
          />
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
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 bg-gray-100 p-1 rounded-lg">
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
            {type === "Regular" && (
              <TabsTrigger
                value="payments"
                className="text-sm font-medium data-[state=active]:bg-white data-[state=active]:shadow-sm"
              >
                Payment History
              </TabsTrigger>
            )}
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
          {type === "Regular" && (
            <TabsContent value="payments">
              <ScrollArea className="max-h-[60vh] pr-4">
                {renderPaymentHistory()}
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
        <DialogFooter className="mt-6 flex justify-end gap-4">
          <Button
            className="bg-[#24336f] text-white hover:bg-[#24336fd8]"
            onClick={exportToPDF}
          >
            Export to PDF
          </Button>
          <Button
            className="bg-[#c84e67] text-white hover:bg-[#c84e66e5]"
            onClick={onClose}
          >
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
      {renderTreatmentForm()}
      {renderEditForm()}
      {renderMedicalHistoryEditForm()}
      {renderPaymentForm()}
    </Dialog>
  );
};

export default PatientDetailsModal;
