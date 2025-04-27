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
import OrthodonticPaymentForm from "@/components/orthodontic/orthodontic-payment-form";
import NewTreatmentCycleForm from "@/components/orthodontic/new-treatment-cycle-form";
import UpdateContractForm from "@/components/orthodontic/update-contract-form";
import ConfirmationDialog from "@/components/ui/confirmation-dialog";
import { Trash2, RefreshCw, Edit, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Component to display multiple values in a compact way
const MultiValueDisplay = ({
  value,
  fieldName = "items",
}: {
  value: string | null | undefined;
  fieldName?: string;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!value) return <span>N/A</span>;

  const items = value.split(", ");

  if (items.length <= 1) {
    return <span>{value}</span>;
  }

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="cursor-pointer">
              {isExpanded ? (
                <div className="flex flex-col space-y-1 max-w-[150px]">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="text-xs bg-blue-50 px-2 py-1 rounded border border-blue-100"
                    >
                      {item}
                    </div>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsExpanded(false);
                    }}
                    className="text-blue-600 hover:text-blue-800 text-xs flex items-center justify-center mt-1 bg-blue-50 px-2 py-1 rounded border border-blue-100"
                  >
                    Show Less <ChevronUp size={12} className="ml-1" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsExpanded(true)}
                  className="flex items-center"
                >
                  <div className="text-xs bg-blue-50 px-2 py-1 rounded border border-blue-100 truncate max-w-[100px]">
                    {items[0]}
                  </div>
                  <span className="text-blue-600 text-xs ml-1 whitespace-nowrap">
                    +{items.length - 1} more
                  </span>
                </div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-white p-2 shadow-lg border rounded-md"
          >
            <div className="max-w-[200px] max-h-[200px] overflow-y-auto">
              <p className="font-medium text-sm mb-2 text-blue-800">
                All {fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}:
              </p>
              {items.map((item, index) => (
                <div
                  key={index}
                  className="text-sm py-1 border-b border-gray-100 last:border-0"
                >
                  {item}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

// Alias components for specific fields
const ArchWireDisplay = (props: { value: string | null | undefined }) => (
  <MultiValueDisplay {...props} fieldName="arch wires" />
);

const ProcedureDisplay = (props: { value: string | null | undefined }) => (
  <MultiValueDisplay {...props} fieldName="procedures" />
);

const AppliancesDisplay = (props: { value: string | null | undefined }) => (
  <MultiValueDisplay {...props} fieldName="appliances" />
);

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
  const [showNewCycleForm, setShowNewCycleForm] = useState(false);
  const [showUpdateContractForm, setShowUpdateContractForm] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedMedicalHistory, setSelectedMedicalHistory] =
    useState<RegularMedicalHistory | null>(null);
  const [selectedTreatmentRecord, setSelectedTreatmentRecord] =
    useState<RegularTreatmentRecord | null>(null);
  const [selectedOrthoTreatmentRecord, setSelectedOrthoTreatmentRecord] =
    useState<OrthodonticTreatmentRecord | null>(null);
  const [showEditTreatmentForm, setShowEditTreatmentForm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleEditTreatmentSubmit = async (data: any) => {
    try {
      console.log("Submitting edited treatment record:", data);

      let result;
      if (type === "Regular" && selectedTreatmentRecord) {
        // Convert empty strings to null for numeric fields
        const processedData = {
          ...data,
          amount_charged:
            data.amount_charged === "" ? null : data.amount_charged,
          amount_paid: data.amount_paid === "" ? null : data.amount_paid,
          balance: data.balance === "" ? null : data.balance,
        };

        result = await window.api.updateRegularTreatmentRecord(
          selectedTreatmentRecord.record_id!,
          processedData as Partial<
            Omit<RegularTreatmentRecord, "record_id" | "patient_id">
          >
        );
      } else if (type === "Ortho" && selectedOrthoTreatmentRecord) {
        // For orthodontic treatment records, we need to be extra careful with the data processing
        console.log("Original data for update:", data);

        // Start with a clean object containing only the fields we want to update
        const processedData: Record<string, string | number | null> = {};

        // Copy all string fields directly
        if (data.appt_no !== undefined) processedData.appt_no = data.appt_no;
        if (data.date !== undefined) processedData.date = data.date;
        if (data.arch_wire !== undefined)
          processedData.arch_wire = data.arch_wire;
        if (data.procedure !== undefined)
          processedData.procedure = data.procedure;
        if (data.appliances !== undefined)
          processedData.appliances = data.appliances;
        if (data.next_schedule !== undefined)
          processedData.next_schedule = data.next_schedule;
        if (data.mode_of_payment !== undefined)
          processedData.mode_of_payment = data.mode_of_payment;

        // Process numeric fields carefully - only include them if they're actually present
        // and convert them to numbers or null as appropriate

        // Contract price
        if (data.contract_price !== undefined) {
          if (data.contract_price === "") {
            processedData.contract_price = null;
          } else {
            const numValue = Number(data.contract_price);
            processedData.contract_price = isNaN(numValue) ? null : numValue;
          }
        }

        // Contract months
        if (data.contract_months !== undefined) {
          if (data.contract_months === "") {
            processedData.contract_months = null;
          } else {
            const numValue = Number(data.contract_months);
            processedData.contract_months = isNaN(numValue) ? null : numValue;
          }
        }

        // Amount paid
        if (data.amount_paid !== undefined) {
          if (data.amount_paid === "") {
            processedData.amount_paid = null;
          } else {
            const numValue = Number(data.amount_paid);
            processedData.amount_paid = isNaN(numValue) ? null : numValue;
          }
        }

        // Balance
        if (data.balance !== undefined) {
          if (data.balance === "") {
            processedData.balance = null;
          } else {
            const numValue = Number(data.balance);
            processedData.balance = isNaN(numValue) ? null : numValue;
          }
        }

        // Treatment cycle
        if (data.treatment_cycle !== undefined) {
          if (data.treatment_cycle === "") {
            processedData.treatment_cycle = null;
          } else {
            const numValue = Number(data.treatment_cycle);
            processedData.treatment_cycle = isNaN(numValue) ? null : numValue;
          }
        }

        // Additional charges fields
        // Process recement_bracket_count
        if (data.recement_bracket_count !== undefined) {
          const numValue = Number(data.recement_bracket_count);
          processedData.recement_bracket_count = isNaN(numValue) ? 0 : numValue;
        }

        // Process replacement_bracket_count
        if (data.replacement_bracket_count !== undefined) {
          const numValue = Number(data.replacement_bracket_count);
          processedData.replacement_bracket_count = isNaN(numValue)
            ? 0
            : numValue;
        }

        // Process rebracket_count
        if (data.rebracket_count !== undefined) {
          const numValue = Number(data.rebracket_count);
          processedData.rebracket_count = isNaN(numValue) ? 0 : numValue;
        }

        // Process xray_count
        if (data.xray_count !== undefined) {
          const numValue = Number(data.xray_count);
          processedData.xray_count = isNaN(numValue) ? 0 : numValue;
        }

        // Process dental_kit_count
        if (data.dental_kit_count !== undefined) {
          const numValue = Number(data.dental_kit_count);
          processedData.dental_kit_count = isNaN(numValue) ? 0 : numValue;
        }

        // Process kabayoshi_count
        if (data.kabayoshi_count !== undefined) {
          const numValue = Number(data.kabayoshi_count);
          processedData.kabayoshi_count = isNaN(numValue) ? 0 : numValue;
        }

        // Process lingual_button_count
        if (data.lingual_button_count !== undefined) {
          const numValue = Number(data.lingual_button_count);
          processedData.lingual_button_count = isNaN(numValue) ? 0 : numValue;
        }

        // Process additional_charges_total
        if (data.additional_charges_total !== undefined) {
          const numValue = Number(data.additional_charges_total);
          processedData.additional_charges_total = isNaN(numValue)
            ? 0
            : numValue;
        }

        console.log("Processed data for update:", processedData);

        console.log("Processing orthodontic treatment record update:", {
          originalData: data,
          processedData,
          recordId: selectedOrthoTreatmentRecord.record_id,
        });

        result = await window.api.updateOrthodonticTreatmentRecord(
          selectedOrthoTreatmentRecord.record_id!,
          processedData as Partial<
            Omit<OrthodonticTreatmentRecord, "record_id" | "patient_id">
          >
        );
      } else {
        throw new Error("No treatment record selected for editing");
      }

      if (result.success) {
        toast.success("Treatment record updated successfully");

        // Clear form state and close the form
        setShowEditTreatmentForm(false);
        setSelectedTreatmentRecord(null);
        setSelectedOrthoTreatmentRecord(null);

        // Force a refresh to get the updated data with a slightly longer delay
        // to ensure database operations are complete
        console.log("Treatment record updated, refreshing data...");
        setTimeout(() => {
          onRefresh();
          console.log("Data refresh triggered");
        }, 1000);
      } else {
        throw new Error(result.error || "Failed to update treatment record");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error updating treatment record: ${errorMessage}`);
    }
  };

  const exportToPDF = async () => {
    const doc = new jsPDF();
    let yOffset = 20;
    const pageWidth = 210; // A4 page width in mm
    const margin = 10;
    const usableWidth = pageWidth - 2 * margin; // 170mm

    // Logo dimensions
    const logoWidth = 30;
    const logoHeight = 30;

    // Helper function to format currency with peso sign
    const formatCurrency = (amount: number) => {
      return `P${amount.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`;
    };

    // Function to add header on each page
    const addHeader = async () => {
      // Use a path that works in both development and production
      let logoUrl = "/desktopIcon.png";

      if (window.api.getLogoPath) {
        try {
          logoUrl = await window.api.getLogoPath();
        } catch (error) {
          console.error("Error getting logo path:", error);
        }
      }

      try {
        doc.addImage(logoUrl, "PNG", margin, 10, logoWidth, logoHeight);
      } catch (error) {
        console.error("Failed to load logo:", error);
        doc.setFillColor(200, 200, 200);
        doc.rect(margin, 10, logoWidth, logoHeight, "F");
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text("Logo", margin + 5, 25);
      }

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
      doc.text("Phone: 0943 586 2245", margin + logoWidth + 10, 34);

      doc.setFontSize(12);
      doc.setFont("helvetica", "italic");
      doc.setTextColor(39, 118, 171);
      doc.text(
        "Your teeth are treasure, making you smile is our pleasure.",
        margin + logoWidth + 10,
        41
      );
      doc.setTextColor(0, 0, 0);

      doc.setLineWidth(0.5);
      doc.setDrawColor(39, 118, 171);
      doc.line(margin, 45, margin + usableWidth, 45);
      doc.setDrawColor(0, 0, 0);
      yOffset = 50;
    };

    // Function to check if a new page is needed
    const checkPage = async () => {
      if (yOffset > 250) {
        doc.addPage();
        await addHeader();
        yOffset = 50;
      }
    };

    // Add header to first page
    await addHeader();

    // Title (unchanged)
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "bold");
    doc.text(
      `Patient Details - ${patient.info.name} (${type})`,
      margin,
      yOffset
    );
    yOffset += 10;

    // Patient Info Section (unchanged)
    doc.setFontSize(14);
    doc.setTextColor(39, 118, 171);
    doc.setFont("helvetica", "bold");
    doc.text("Patient Information", margin, yOffset);
    doc.setTextColor(0, 0, 0);
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
            { key: "registration_date", label: "Registration Date" },
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
    for (const { key, label } of patientFields) {
      await checkPage();
      const value = formatValue(
        (patient.info as RegularPatient | OrthodonticPatient)[
          key as keyof (RegularPatient | OrthodonticPatient)
        ]
      );
      doc.text(`${label}:`, margin, yOffset);
      doc.text(value, margin + 60, yOffset);
      yOffset += 8;
    }
    yOffset += 10;

    // Medical History Section (unchanged)
    if (
      type === "Regular" &&
      patient.medicalHistory &&
      patient.medicalHistory.length > 0
    ) {
      await checkPage();
      doc.setFontSize(14);
      doc.setTextColor(39, 118, 171);
      doc.setFont("helvetica", "bold");
      doc.text("Medical History", margin, yOffset);
      doc.setTextColor(0, 0, 0);
      yOffset += 8;

      for (const history of patient.medicalHistory) {
        await checkPage();
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
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
        for (const { label, value } of historyFields) {
          await checkPage();
          doc.text(`${label}:`, margin + 5, yOffset);
          doc.text(formatValue(value), margin + 45, yOffset);
          yOffset += 8;
        }
        yOffset += 5;
      }
    } else if (type === "Regular") {
      await checkPage();
      doc.setFontSize(14);
      doc.setTextColor(39, 118, 171);
      doc.setFont("helvetica", "bold");
      doc.text("Medical History", margin, yOffset);
      doc.setTextColor(0, 0, 0);
      yOffset += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("No medical history available.", margin, yOffset);
      yOffset += 10;
    }

    // Treatment Records Section
    if (patient.treatmentRecords && patient.treatmentRecords.length > 0) {
      await checkPage();
      doc.setFontSize(14);
      doc.setTextColor(39, 118, 171);
      doc.setFont("helvetica", "bold");
      doc.text("Treatment Records", margin, yOffset);
      doc.setTextColor(0, 0, 0);
      yOffset += 8;

      // Add Payment History Section for Regular patients (unchanged)
      if (type === "Regular") {
        if (patient.paymentHistory && patient.paymentHistory.length > 0) {
          const totalPaid = patient.paymentHistory.reduce(
            (sum: number, payment: PaymentHistory) => sum + payment.amount_paid,
            0
          );

          await checkPage();
          yOffset += 10;
          doc.setFontSize(14);
          doc.setTextColor(39, 118, 171);
          doc.setFont("helvetica", "bold");
          doc.text("Payment History", margin, yOffset);
          doc.setTextColor(0, 0, 0);
          yOffset += 8;

          doc.setFontSize(10);
          doc.setFont("helvetica", "normal");
          doc.text(
            `Total Payments: ${formatCurrency(totalPaid)}`,
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

          await checkPage();
          const paymentHeaders = [
            "Date",
            "Amount Paid",
            "Method",
            "Balance",
            "Notes",
          ];
          const paymentColumnWidths = [25, 35, 25, 35, 50];
          const paymentData = patient.paymentHistory.map(
            (payment: PaymentHistory) => {
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
                formatCurrency(payment.amount_paid),
                payment.payment_method,
                formatCurrency(payment.remaining_balance),
                payment.notes || "",
              ];
            }
          );

          doc.setFontSize(9);
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(39, 118, 171);
          doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
          let xOffset = margin;
          paymentHeaders.forEach((header, index) => {
            doc.text(header, xOffset + 3, yOffset);
            xOffset += paymentColumnWidths[index];
          });
          yOffset += 8;

          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          for (const [rowIndex, row] of paymentData.entries()) {
            await checkPage();
            xOffset = margin;
            let maxHeight = 0;
            if (rowIndex % 2 === 0) {
              doc.setFillColor(240, 240, 240);
              doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
            }
            for (let index = 0; index < row.length; index++) {
              const cell = row[index];
              const wrappedText = doc.splitTextToSize(
                cell,
                paymentColumnWidths[index] - 6
              );
              doc.text(wrappedText, xOffset + 3, yOffset);
              const cellHeight = wrappedText.length * 5;
              maxHeight = Math.max(maxHeight, cellHeight);
              xOffset += paymentColumnWidths[index];
            }
            yOffset += maxHeight + 2;
          }

          yOffset += 10;
        } else {
          const paymentRecords = (
            patient.treatmentRecords as RegularTreatmentRecord[]
          ).filter((record) => record.amount_paid && record.amount_paid > 0);

          if (paymentRecords.length > 0) {
            const totalPaid = paymentRecords.reduce(
              (sum, record) => sum + (record.amount_paid || 0),
              0
            );

            await checkPage();
            yOffset += 10;
            doc.setFontSize(14);
            doc.setTextColor(39, 118, 171);
            doc.setFont("helvetica", "bold");
            doc.text("Payment Summary", margin, yOffset);
            doc.setTextColor(0, 0, 0);
            yOffset += 8;

            doc.setFontSize(10);
            doc.setFont("helvetica", "normal");
            doc.text(
              `Total Payments: ${formatCurrency(totalPaid)}`,
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
                ? formatCurrency(record.amount_charged)
                : "N/A",
              record.amount_paid ? formatCurrency(record.amount_paid) : "N/A",
              record.balance ? formatCurrency(record.balance) : "N/A",
              formatValue(record.mode_of_payment),
            ];
          }
        );

        doc.setFontSize(9);
        doc.setTextColor(255, 255, 255);
        doc.setFillColor(39, 118, 171);
        doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
        let xOffset = margin;
        headers.forEach((header, index) => {
          doc.text(header, xOffset + 3, yOffset);
          xOffset += columnWidths[index];
        });
        yOffset += 8;

        doc.setTextColor(0, 0, 0);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);
        for (const [rowIndex, row] of data.entries()) {
          await checkPage();
          xOffset = margin;
          let maxHeight = 0;
          if (rowIndex % 2 === 0) {
            doc.setFillColor(240, 240, 240);
            doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
          }
          for (let index = 0; index < row.length; index++) {
            const cell = row[index];
            const wrappedText = doc.splitTextToSize(
              cell,
              columnWidths[index] - 6
            );
            doc.text(wrappedText, xOffset + 3, yOffset);
            const cellHeight = wrappedText.length * 5;
            maxHeight = Math.max(maxHeight, cellHeight);
            xOffset += columnWidths[index];
          }
          yOffset += maxHeight + 2;
        }
      } else {
        // Orthodontic Treatment Records (Updated Section)
        const records =
          patient.treatmentRecords as OrthodonticTreatmentRecord[];
        const recordsByCycle: { [key: string]: OrthodonticTreatmentRecord[] } =
          {};
        records.forEach((record) => {
          const cycle = record.treatment_cycle || 1;
          if (!recordsByCycle[cycle]) {
            recordsByCycle[cycle] = [];
          }
          recordsByCycle[cycle].push(record);
        });

        // Sort records within each cycle by appointment number
        Object.keys(recordsByCycle).forEach((cycle) => {
          recordsByCycle[cycle].sort((a, b) => {
            const apptNoA = parseInt(a.appt_no);
            const apptNoB = parseInt(b.appt_no);
            return apptNoA - apptNoB; // Sort in ascending order by appointment number
          });
        });

        const sortedCycles = Object.keys(recordsByCycle)
          .map(Number)
          .sort((a, b) => a - b);

        for (const [index, cycle] of sortedCycles.entries()) {
          if (index > 0) {
            yOffset += 10;
          }

          await checkPage();
          doc.setFillColor(39, 118, 171);
          doc.rect(margin, yOffset - 5, usableWidth, 12, "F");
          doc.setFontSize(12);
          doc.setTextColor(255, 255, 255);
          doc.setFont("helvetica", "bold");
          doc.text(`Treatment Cycle #${cycle}`, margin + 5, yOffset + 2);
          yOffset += 15;

          const cycleRecords = recordsByCycle[cycle];
          const firstRecord = cycleRecords.find(
            (record) => record.contract_price && record.contract_months
          );

          const cycleContractPrice = firstRecord?.contract_price || 0;
          const cycleContractMonths = firstRecord?.contract_months || 0;
          const cycleTotalPaid = cycleRecords.reduce(
            (sum, record) => sum + (record.amount_paid || 0),
            0
          );

          // Calculate total additional charges for this cycle
          const cycleTotalAdditionalCharges = cycleRecords.reduce(
            (sum, record) => sum + (record.additional_charges_total || 0),
            0
          );

          // Update the balance calculation to include additional charges
          const cycleBalance = Math.max(
            0,
            cycleContractPrice + cycleTotalAdditionalCharges - cycleTotalPaid
          );

          // Adjust for 5 cards instead of 4 (adding Additional Charges card)
          const cardWidth = usableWidth / 5 - 4;
          const cardHeight = 25;

          for (let i = 0; i < 5; i++) {
            const cardX = margin + (cardWidth + 4) * i;
            doc.setFillColor(245, 250, 255);
            doc.rect(cardX, yOffset, cardWidth, cardHeight, "F");
            doc.setDrawColor(200, 220, 240);
            doc.setLineWidth(0.5);
            doc.rect(cardX, yOffset, cardWidth, cardHeight, "S");
          }

          doc.setTextColor(39, 118, 171);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text("Contract Price", margin + 5, yOffset + 7);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(
            formatCurrency(cycleContractPrice),
            margin + 5,
            yOffset + 17
          );

          const card2X = margin + cardWidth + 4;
          doc.setTextColor(39, 118, 171);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text("Contract Duration", card2X + 5, yOffset + 7);
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(`${cycleContractMonths} months`, card2X + 5, yOffset + 17);

          const card3X = margin + (cardWidth + 4) * 2;
          doc.setTextColor(39, 118, 171);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text("Total Paid", card3X + 5, yOffset + 7);
          doc.setTextColor(0, 102, 0);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(formatCurrency(cycleTotalPaid), card3X + 5, yOffset + 17);

          // Add Additional Charges card
          const card4X = margin + (cardWidth + 4) * 3;
          doc.setTextColor(39, 118, 171);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text("Additional Charges", card4X + 5, yOffset + 7);
          doc.setTextColor(128, 0, 128); // Purple color for additional charges
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(
            formatCurrency(cycleTotalAdditionalCharges),
            card4X + 5,
            yOffset + 17
          );

          const card5X = margin + (cardWidth + 4) * 4;
          doc.setTextColor(39, 118, 171);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(8);
          doc.text("Total Balance", card5X + 5, yOffset + 7);
          doc.setTextColor(204, 0, 0);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(10);
          doc.text(formatCurrency(cycleBalance), card5X + 5, yOffset + 17);

          // Add small note about calculation
          doc.setFontSize(6);
          doc.setTextColor(100, 100, 100);
          doc.text(
            "(Contract Price + Additional Charges - Total Paid)",
            card5X + 5,
            yOffset + 22
          );

          yOffset += cardHeight + 10;
          await checkPage();

          // Updated Table Headers to Include Appliances and Additional Charges
          const headers = [
            "Appt #",
            "Date",
            "Arch Wire",
            "Procedure",
            "Appliances",
            "Additional Charges",
            "Amount Paid",
            "Payment Mode",
            "Next Sched.",
          ];
          // Adjusted column widths to accommodate all columns (total = 170mm)
          const columnWidths = [15, 20, 20, 25, 20, 25, 20, 15, 20];

          // Prepare data for this cycle
          const data = recordsByCycle[cycle].map((record) => {
            const dateObj = record.date ? new Date(record.date) : null;
            const formattedDate = dateObj
              ? `${(dateObj.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}/${dateObj
                  .getDate()
                  .toString()
                  .padStart(2, "0")}/${dateObj
                  .getFullYear()
                  .toString()
                  .substring(2)}`
              : "N/A";

            // Format next_schedule
            const nextScheduleDate = record.next_schedule
              ? new Date(record.next_schedule)
              : null;
            const formattedNextSchedule = nextScheduleDate
              ? `${(nextScheduleDate.getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}/${nextScheduleDate
                  .getDate()
                  .toString()
                  .padStart(2, "0")}/${nextScheduleDate
                  .getFullYear()
                  .toString()
                  .substring(2)}`
              : "N/A";

            // Format additional charges
            let additionalChargesText = "None";
            if ((record.additional_charges_total || 0) > 0) {
              // Only show the details without the total amount
              const chargeDetails = [];
              if ((record.recement_bracket_count || 0) > 0) {
                const count = record.recement_bracket_count || 0;
                chargeDetails.push(`Recement: ${count}`);
              }
              if ((record.replacement_bracket_count || 0) > 0) {
                const count = record.replacement_bracket_count || 0;
                chargeDetails.push(`Replacement: ${count}`);
              }
              if ((record.rebracket_count || 0) > 0) {
                const count = record.rebracket_count || 0;
                chargeDetails.push(`Rebracket: ${count}`);
              }
              if ((record.xray_count || 0) > 0) {
                const count = record.xray_count || 0;
                chargeDetails.push(`X-ray: ${count}`);
              }
              if ((record.dental_kit_count || 0) > 0) {
                const count = record.dental_kit_count || 0;
                chargeDetails.push(`Dental Kit: ${count}`);
              }
              if ((record.kabayoshi_count || 0) > 0) {
                const count = record.kabayoshi_count || 0;
                chargeDetails.push(`Kabayoshi: ${count}`);
              }
              if ((record.lingual_button_count || 0) > 0) {
                const count = record.lingual_button_count || 0;
                chargeDetails.push(`Lingual Button: ${count}`);
              }

              if (chargeDetails.length > 0) {
                additionalChargesText = chargeDetails.join("\n");
              }
            }

            return [
              formatValue(record.appt_no),
              formattedDate,
              formatValue(record.arch_wire),
              formatValue(record.procedure),
              formatValue(record.appliances),
              additionalChargesText,
              record.amount_paid ? formatCurrency(record.amount_paid) : "N/A",
              formatValue(record.mode_of_payment),
              formattedNextSchedule,
            ];
          });

          // Draw Headers
          doc.setFontSize(8); // Slightly smaller font for headers to fit
          doc.setTextColor(255, 255, 255);
          doc.setFillColor(39, 118, 171);
          doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
          let xOffset = margin;
          headers.forEach((header, index) => {
            // Wrap header text if too long
            const wrappedHeader = doc.splitTextToSize(
              header,
              columnWidths[index] - 6
            );
            doc.text(wrappedHeader, xOffset + 3, yOffset);
            xOffset += columnWidths[index];
          });
          yOffset += 8;

          // Draw Data Rows
          doc.setTextColor(0, 0, 0);
          doc.setFont("helvetica", "normal");
          doc.setFontSize(7); // Smaller font for data to prevent overlap

          await checkPage();
          for (const [rowIndex, row] of data.entries()) {
            await checkPage();
            xOffset = margin;
            let maxHeight = 0;
            if (rowIndex % 2 === 0) {
              doc.setFillColor(240, 240, 240);
              doc.rect(margin, yOffset - 5, usableWidth, 10, "F");
            }
            for (let index = 0; index < row.length; index++) {
              const cell = row[index];
              const wrappedText = doc.splitTextToSize(
                cell,
                columnWidths[index] - 6
              );
              doc.text(wrappedText, xOffset + 3, yOffset);
              const cellHeight = wrappedText.length * 5;
              maxHeight = Math.max(maxHeight, cellHeight);
              xOffset += columnWidths[index];
            }
            yOffset += maxHeight + 2;
          }

          yOffset += 15;
        }
      }
    } else {
      await checkPage();
      doc.setFontSize(14);
      doc.setTextColor(39, 118, 171);
      doc.setFont("helvetica", "bold");
      doc.text("Treatment Records", margin, yOffset);
      doc.setTextColor(0, 0, 0);
      yOffset += 8;
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("No treatment records available.", margin, yOffset);
      yOffset += 10;
    }

    // Add footer with page number (unchanged)
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

  const handleDeletePatient = async () => {
    if (!patient || !type) return;

    try {
      setIsDeleting(true);
      let result;

      if (type === "Regular") {
        result = await window.api.deleteRegularPatient(
          patient.info.patient_id!
        );
      } else {
        result = await window.api.deleteOrthodonticPatient(
          patient.info.patient_id!
        );
      }

      if (result.success) {
        toast.success(`Patient ${patient.info.name} deleted successfully`);
        onClose(); // Close the modal
        // Don't call onRefresh() here as it would try to fetch the deleted patient
        // The patient list will be refreshed by the onPatientDeleted event listener
      } else {
        throw new Error(result.error || "Failed to delete patient");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      toast.error(`Error deleting patient: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmation(false);
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
            { key: "registration_date", label: "Registration Date" },
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
      if (type === "Regular") {
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
      } else {
        // For orthodontic patients with no payment history
        const orthoPatient = patient.info as OrthodonticPatient;
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">
                Payment Summary
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-500">Contract Price</p>
                  <p className="text-xl font-bold text-blue-600">
                    ₱
                    {(orthoPatient.current_contract_price || 0).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-500">Contract Balance</p>
                  <p className="text-xl font-bold text-red-600">
                    ₱
                    {(orthoPatient.current_balance || 0).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
                  </p>
                </div>
                <div className="bg-white p-3 rounded-md shadow-sm">
                  <p className="text-sm text-gray-500">Treatment Status</p>
                  <p className="text-xl font-bold text-blue-600">
                    {orthoPatient.treatment_status || "Not Started"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 max-w-xl w-full">
                <div className="flex items-center gap-2 text-amber-700 mb-2">
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
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p className="text-sm font-medium">
                    No payment history available
                  </p>
                </div>
              </div>
            </div>

            {(orthoPatient.current_balance || 0) > 0 && (
              <div className="flex justify-center mt-4">
                <Button
                  onClick={() => setShowPaymentForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  Make Payment
                </Button>
              </div>
            )}
          </div>
        );
      }
    }

    // Calculate total payments
    const totalPaid = patient.paymentHistory.reduce(
      (sum: number, payment: PaymentHistory) => sum + payment.amount_paid,
      0
    );

    if (type === "Regular") {
      // Get records with outstanding balances for regular patients
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
                        <TableCell>
                          <ProcedureDisplay value={record.procedure} />
                        </TableCell>
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
                      <TableCell>
                        {formatValue(payment.payment_method)}
                      </TableCell>
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
    } else {
      // For orthodontic patients with payment history
      const orthoPatient = patient.info as OrthodonticPatient;

      return (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
            <h3 className="text-lg font-semibold text-blue-800 mb-2">
              Payment Summary
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Contract Price</p>
                <p className="text-xl font-bold text-blue-600">
                  ₱
                  {(orthoPatient.current_contract_price || 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Total Paid</p>
                <p className="text-xl font-bold text-green-600">
                  ₱
                  {totalPaid.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Contract Balance</p>
                <p className="text-xl font-bold text-red-600">
                  ₱
                  {(orthoPatient.current_balance || 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
                {(orthoPatient.current_balance || 0) > 0 && (
                  <Button
                    onClick={() => setShowPaymentForm(true)}
                    className="mt-2 bg-green-600 hover:bg-green-700 text-white text-xs w-full"
                    size="sm"
                  >
                    Make Payment
                  </Button>
                )}
              </div>
              <div className="bg-white p-3 rounded-md shadow-sm">
                <p className="text-sm text-gray-500">Treatment Status</p>
                <p className="text-xl font-bold text-blue-600">
                  {orthoPatient.treatment_status || "Not Started"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {orthoPatient.current_contract_months || 0} appointments
                  needed
                </p>
              </div>
            </div>
          </div>

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
                      <TableCell>
                        {formatValue(payment.payment_method)}
                      </TableCell>
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
    }
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
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(patient.treatmentRecords as RegularTreatmentRecord[]).map(
                (record) => (
                  <TableRow key={record.record_id}>
                    <TableCell>{formatValue(record.treatment_date)}</TableCell>
                    <TableCell>{formatValue(record.tooth_number)}</TableCell>
                    <TableCell>
                      <ProcedureDisplay value={record.procedure} />
                    </TableCell>
                    <TableCell>{formatValue(record.dentist_name)}</TableCell>
                    <TableCell>{formatValue(record.amount_charged)}</TableCell>
                    <TableCell>{formatValue(record.amount_paid)}</TableCell>
                    <TableCell>{formatValue(record.balance)}</TableCell>
                    <TableCell>{formatValue(record.mode_of_payment)}</TableCell>
                    <TableCell>
                      <Button
                        onClick={() => {
                          setSelectedTreatmentRecord(record);
                          setShowEditTreatmentForm(true);
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 flex items-center gap-1"
                        size="sm"
                      >
                        <Edit size={12} />
                        Edit
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>
      );
    }

    // For orthodontic patients, first show contract and payment summary
    const orthoPatient = patient.info as OrthodonticPatient;
    const treatmentRecords =
      patient.treatmentRecords as OrthodonticTreatmentRecord[];

    // Group records by treatment cycle
    const recordsByCycle: Record<string, OrthodonticTreatmentRecord[]> = {};
    treatmentRecords.forEach((record) => {
      const cycle = record.treatment_cycle?.toString() || "1";
      if (!recordsByCycle[cycle]) {
        recordsByCycle[cycle] = [];
      }
      recordsByCycle[cycle].push(record);
    });

    // Sort records within each cycle by appointment number
    Object.keys(recordsByCycle).forEach((cycle) => {
      recordsByCycle[cycle].sort((a, b) => {
        const apptNoA = parseInt(a.appt_no);
        const apptNoB = parseInt(b.appt_no);
        return apptNoA - apptNoB; // Sort in ascending order by appointment number
      });
    });

    // Sort cycles in descending order (newest first)
    const sortedCycles = Object.keys(recordsByCycle).sort(
      (a, b) => parseInt(b) - parseInt(a)
    );

    // Calculate total paid and additional charges for current cycle
    const currentCycle = orthoPatient.treatment_cycle?.toString() || "1";
    const currentCycleRecords = recordsByCycle[currentCycle] || [];
    const totalPaid = currentCycleRecords.reduce(
      (sum, record) => sum + (record.amount_paid || 0),
      0
    );
    const totalAdditionalCharges = currentCycleRecords.reduce(
      (sum, record) => sum + (record.additional_charges_total || 0),
      0
    );

    return (
      <div className="space-y-6">
        {/* Contract and Payment Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center mb-2">
            <div>
              <h3 className="text-lg font-semibold text-blue-800">
                Treatment Cycle #{orthoPatient.treatment_cycle || 1} -{" "}
                {orthoPatient.treatment_status || "Not Started"}
              </h3>
            </div>
            <div className="flex gap-2">
              {orthoPatient.treatment_status === "In Progress" && (
                <Button
                  onClick={() => setShowUpdateContractForm(true)}
                  className="bg-amber-600 hover:bg-amber-700 text-white text-sm flex items-center gap-1"
                  size="sm"
                >
                  <Edit size={14} />
                  Update Contract
                </Button>
              )}
              {orthoPatient.treatment_status === "Completed" && (
                <Button
                  onClick={() => setShowNewCycleForm(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm flex items-center gap-1"
                  size="sm"
                >
                  <RefreshCw size={14} />
                  Start New Cycle
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mt-4">
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Contract Price</p>
              <p className="text-xl font-bold text-blue-600">
                ₱
                {(orthoPatient.current_contract_price || 0).toLocaleString(
                  undefined,
                  {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  }
                )}
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Contract Duration</p>
              <p className="text-xl font-bold text-blue-600">
                {orthoPatient.current_contract_months || "N/A"}{" "}
                {orthoPatient.current_contract_months === 1
                  ? "month"
                  : "months"}
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Total Paid</p>
              <p className="text-xl font-bold text-green-600">
                ₱
                {totalPaid.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Additional Charges</p>
              <p className="text-xl font-bold text-purple-600">
                ₱
                {totalAdditionalCharges.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="bg-white p-3 rounded-md shadow-sm">
              <p className="text-sm text-gray-500">Total Balance</p>
              <p className="text-xl font-bold text-red-600">
                ₱
                {(
                  (orthoPatient.current_contract_price || 0) +
                  totalAdditionalCharges -
                  totalPaid
                ).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                (Contract Price + Additional Charges - Total Paid)
              </p>
              {/* Payment button removed as per requirement */}
            </div>
          </div>
        </div>

        {/* Treatment Records by Cycle - with improved layout */}
        <div className="space-y-6 max-h-[500px] overflow-y-auto pr-2">
          {sortedCycles.map((cycle) => (
            <div
              key={cycle}
              className="border rounded-lg overflow-hidden shadow-sm"
            >
              <div className="bg-blue-50 px-4 py-3 border-b sticky top-0 z-10">
                <h3 className="font-semibold text-blue-800">
                  Treatment Cycle #{cycle} Records
                </h3>
              </div>

              {/* Simplified table with fewer columns */}
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[60px]">Appt #</TableHead>
                      <TableHead className="w-[100px]">Date</TableHead>
                      <TableHead className="w-[180px]">Treatment</TableHead>
                      <TableHead className="w-[200px]">
                        Additional Charges
                      </TableHead>
                      <TableHead className="w-[100px]">Amount Paid</TableHead>
                      <TableHead className="w-[100px]">Next Schedule</TableHead>
                      <TableHead className="w-[60px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recordsByCycle[cycle].map((record) => (
                      <TableRow
                        key={record.record_id}
                        className="hover:bg-gray-50"
                      >
                        <TableCell className="font-medium">
                          {formatValue(record.appt_no)}
                        </TableCell>
                        <TableCell>{formatValue(record.date)}</TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {record.procedure && (
                              <div>
                                <span className="text-xs font-medium text-gray-500">
                                  Procedure:
                                </span>
                                <ProcedureDisplay value={record.procedure} />
                              </div>
                            )}
                            {record.arch_wire && (
                              <div>
                                <span className="text-xs font-medium text-gray-500">
                                  Arch Wire:
                                </span>
                                <ArchWireDisplay value={record.arch_wire} />
                              </div>
                            )}
                            {record.appliances && (
                              <div>
                                <span className="text-xs font-medium text-gray-500">
                                  Appliances:
                                </span>
                                <AppliancesDisplay value={record.appliances} />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {(record.additional_charges_total || 0) > 0 ? (
                            <div className="space-y-1">
                              <div className="text-xs text-gray-700">
                                {(record.recement_bracket_count || 0) > 0 && (
                                  <div>
                                    Recement: {record.recement_bracket_count}
                                  </div>
                                )}
                                {(record.replacement_bracket_count || 0) >
                                  0 && (
                                  <div>
                                    Replacement:{" "}
                                    {record.replacement_bracket_count}
                                  </div>
                                )}
                                {(record.rebracket_count || 0) > 0 && (
                                  <div>Rebracket: {record.rebracket_count}</div>
                                )}
                                {(record.xray_count || 0) > 0 && (
                                  <div>X-ray: {record.xray_count}</div>
                                )}
                                {(record.dental_kit_count || 0) > 0 && (
                                  <div>
                                    Dental Kit: {record.dental_kit_count}
                                  </div>
                                )}
                                {(record.kabayoshi_count || 0) > 0 && (
                                  <div>Kabayoshi: {record.kabayoshi_count}</div>
                                )}
                                {(record.lingual_button_count || 0) > 0 && (
                                  <div>
                                    Lingual Button:{" "}
                                    {record.lingual_button_count}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.amount_paid ? (
                            <span className="font-medium text-green-600">
                              ₱
                              {record.amount_paid.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          ) : (
                            <span className="text-gray-500">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {record.next_schedule ? (
                            formatValue(record.next_schedule)
                          ) : (
                            <span className="text-gray-500">None</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Button
                            onClick={() => {
                              setSelectedOrthoTreatmentRecord(record);
                              setShowEditTreatmentForm(true);
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs py-1 px-2 flex items-center gap-1"
                            size="sm"
                          >
                            <Edit size={12} />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
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

  const renderEditTreatmentForm = () => {
    if (!showEditTreatmentForm) return null;

    return (
      <Dialog
        open={showEditTreatmentForm}
        onOpenChange={setShowEditTreatmentForm}
      >
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Edit size={20} />
              Edit Treatment Record
            </DialogTitle>
            <p className="text-gray-500 text-sm mt-1">
              Update treatment record details below.
            </p>
          </DialogHeader>
          {type === "Regular" && selectedTreatmentRecord ? (
            <TreatmentRecordForm
              onSubmit={handleEditTreatmentSubmit}
              onBack={() => {
                setShowEditTreatmentForm(false);
                setSelectedTreatmentRecord(null);
              }}
              initialData={selectedTreatmentRecord}
              isEditing={true}
            />
          ) : type === "Ortho" && selectedOrthoTreatmentRecord ? (
            <OrthodonticTreatmentRecordForm
              onSubmit={handleEditTreatmentSubmit}
              onBack={() => {
                setShowEditTreatmentForm(false);
                setSelectedOrthoTreatmentRecord(null);
              }}
              patientId={patient.info.patient_id}
              initialData={selectedOrthoTreatmentRecord}
              isEditing={true}
            />
          ) : (
            <div className="p-4 text-center text-red-500">
              No treatment record selected for editing.
            </div>
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
              {type === "Regular" && selectedTreatmentRecord
                ? `Recording payment for treatment on ${formatValue(
                    selectedTreatmentRecord.treatment_date
                  )}`
                : "Record a payment for this patient's outstanding balance."}
            </p>
          </DialogHeader>
          {type === "Regular" ? (
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
          ) : (
            <OrthodonticPaymentForm
              patientId={patient.info.patient_id!}
              patient={patient.info as OrthodonticPatient}
              onSuccess={() => {
                setShowPaymentForm(false);
                onRefresh();
              }}
              onCancel={() => {
                setShowPaymentForm(false);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    );
  };

  const renderNewCycleForm = () => {
    if (!showNewCycleForm) return null;

    return (
      <Dialog open={showNewCycleForm} onOpenChange={setShowNewCycleForm}>
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <RefreshCw size={20} />
              Start New Treatment Cycle
            </DialogTitle>
            <p className="text-gray-500 text-sm mt-1">
              Start a new treatment cycle for this patient. This will preserve
              all previous treatment records.
            </p>
          </DialogHeader>
          <NewTreatmentCycleForm
            patientId={patient.info.patient_id!}
            onSuccess={() => {
              setShowNewCycleForm(false);
              onRefresh();
            }}
            onCancel={() => {
              setShowNewCycleForm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  };

  const renderUpdateContractForm = () => {
    if (!showUpdateContractForm) return null;

    return (
      <Dialog
        open={showUpdateContractForm}
        onOpenChange={setShowUpdateContractForm}
      >
        <DialogContent
          className="max-w-3xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Edit size={20} />
              Update Contract Details
            </DialogTitle>
            <p className="text-gray-500 text-sm mt-1">
              Update the contract price or duration for this patient's current
              treatment cycle.
            </p>
          </DialogHeader>
          <UpdateContractForm
            patientId={patient.info.patient_id!}
            patient={patient.info as OrthodonticPatient}
            onSuccess={() => {
              setShowUpdateContractForm(false);
              onRefresh();
            }}
            onCancel={() => {
              setShowUpdateContractForm(false);
            }}
          />
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-full sm:max-w-[80rem] rounded-lg bg-white shadow-lg">
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
            {renderTreatmentRecords()}
          </TabsContent>
          {type === "Regular" && (
            <TabsContent value="payments">
              <ScrollArea className="max-h-[60vh] pr-4">
                {renderPaymentHistory()}
              </ScrollArea>
            </TabsContent>
          )}
        </Tabs>
        <DialogFooter className="mt-6 flex justify-between gap-4 sticky bottom-0 bg-white py-4 px-6 border-t z-10">
          <Button
            variant="destructive"
            className="flex items-center gap-2"
            onClick={() => setShowDeleteConfirmation(true)}
            disabled={isDeleting}
          >
            <Trash2 size={16} />
            Delete Patient
          </Button>
          <div className="flex gap-4">
            <Button
              className="bg-[#24336f] text-white hover:bg-[#24336fd8]"
              onClick={() => {
                toast.info("Generating PDF...");
                exportToPDF()
                  .then(() => {
                    // Success is already handled in exportToPDF
                  })
                  .catch((error) => {
                    toast.error(`Error exporting PDF: ${error.message}`);
                  });
              }}
            >
              Export to PDF
            </Button>
            <Button
              className="bg-[#1e1e1e] text-white hover:bg-[#1e1e1ee6] hover:text-white"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
      {renderTreatmentForm()}
      {renderEditTreatmentForm()}
      {renderEditForm()}
      {renderMedicalHistoryEditForm()}
      {renderPaymentForm()}
      {renderNewCycleForm()}
      {renderUpdateContractForm()}
      <ConfirmationDialog
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleDeletePatient}
        title="Delete Patient"
        description={`Are you sure you want to delete ${patient?.info.name}? This action cannot be undone and will delete all associated records including medical history, treatment records, and payment history.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
      />
    </Dialog>
  );
};

export default PatientDetailsModal;
