// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import RecentAddPatientTable from "@/components/dashboard/patient-table";
import { TotalPatientCount } from "@/components/dashboard/patient-count";

function Dashboard() {
  return (
    <>
      <div className="main-page flex flex-col p-8">
        <div className="header-text">
          <h1 className="text-start text-[#1e1e1e]">
            Welcome to <span className="text-[#24336f]">D</span>
            <span className="text-[#c84e67]">C</span>
            <span className="text-[#24336f]">D</span>
            <span className="text-[#c84e67]">C</span>
          </h1>
        </div>
        <div className="header-card flex items-center mt-5">
          <TotalPatientCount />
        </div>
        <div className="patient-table mt-10">
          {/* Recent patients added here show */}
          <RecentAddPatientTable />
        </div>
      </div>
    </>
  );
}

export default Dashboard;
