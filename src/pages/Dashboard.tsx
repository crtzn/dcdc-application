// src/Dashboard.tsx

import { TotalPatientCount } from "@/components/dashboard/patient-count";
import MonthlyPatientsChart from "@/components/dashboard/MonthlyPatientCharts";
import RecentPatientsList from "@/components/dashboard/RecentPatientList";

function Dashboard() {
  return (
    <div className="main-page flex flex-col p-8 pt-10">
      <div className="header-text">
        <h1 className="text-start text-[#1e1e1e]">
          Welcome to <span className="text-[#24336f]">D</span>
          <span className="text-[#c84e67]">C</span>
          <span className="text-[#24336f]">D</span>
          <span className="text-[#c84e67]">C</span>
        </h1>
      </div>
      <div className="header-card flex items-center justify-between mt-5">
        <TotalPatientCount />
      </div>
      <div className="chart-and-list-section flex gap-2 w-full flex-col md:flex-row">
        <div className="lg:col-span-2 w-full">
          <MonthlyPatientsChart />
        </div>
        <div className="w-full">
          <RecentPatientsList />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
