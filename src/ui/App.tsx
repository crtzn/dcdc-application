import "./App.css";
import Sidebar from "../components/Sidebar";
import { Route, Routes } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import PatientProfile from "../pages/PatientProfile";
import Activity from "../pages/Activity";

function App() {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 ml-10 p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/patient-profile" element={<PatientProfile />} />
          <Route path="/activity" element={<Activity />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
