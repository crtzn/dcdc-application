// src/components/dashboard/MonthlyPatientsChart.tsx
import { useEffect, useState } from "react";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface MonthlyData {
  year: number;
  month: number;
  count: number;
}

const MonthlyPatientsChart: React.FC = () => {
  const [data, setData] = useState<MonthlyData[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>(
    new Date().getFullYear().toString()
  ); // Default to current year
  const [availableYears, setAvailableYears] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate years from 2000 to current year
  const currentYear = new Date().getFullYear();
  const startYear = 2000;
  const allYears = Array.from({ length: currentYear - startYear + 1 }, (_, i) =>
    (currentYear - i).toString()
  ); // e.g., ["2025", "2024", ..., "2000"]

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await window.api.getMonthlyPatientCounts();
        if (result.success && result.data) {
          setData(result.data);
          setAvailableYears(allYears); // Use all years, not just those with data
        } else {
          setError(result.error || "Failed to fetch monthly patient counts");
        }
      } catch (err) {
        setError("Error fetching data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter data by selected year
  const filteredData = data.filter((d) => d.year.toString() === selectedYear);

  // Format data for Chart.js
  const chartData = {
    labels: filteredData.map((d) =>
      new Date(d.year, d.month - 1).toLocaleString("default", {
        month: "short",
      })
    ), // e.g., "Jan", "Feb"
    datasets: [
      {
        label: "New Patients",
        data: filteredData.map((d) => d.count),
        backgroundColor: "rgba(36, 51, 111, 0.6)", // #24336f
        borderColor: "rgba(36, 51, 111, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: `New Patients in ${selectedYear}`,
        font: {
          size: 18,
        },
        color: "#1e1e1e",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Patients",
          font: {
            size: 14,
          },
        },
        ticks: {
          stepSize: 1, // Ensure whole numbers
        },
      },
      x: {
        title: {
          display: true,
          text: "Month",
          font: {
            size: 14,
          },
        },
      },
    },
  };

  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (filteredData.length === 0) {
    return (
      <Card className="w-full shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-[#1e1e1e]">
            Monthly Patient Trends
          </CardTitle>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {availableYears.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center text-[#1e1e1e] text-lg">
            No data found for {selectedYear}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-[#1e1e1e]">Monthly Patient Trends</CardTitle>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select Year" />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <Bar data={chartData} options={options} />
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPatientsChart;
