import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Toaster } from "@/components/ui/sonner";
import { HashRouter } from "react-router-dom";
import { loadFonts } from "@/lib/fontLoader";

// Simple loading component
const LoadingScreen = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      width: "100vw",
      backgroundColor: "#f2f7fa",
      fontFamily: "system-ui, sans-serif",
      color: "#000000",
    }}
  >
    <div style={{ textAlign: "center" }}>
      <h1 style={{ fontSize: "24px", marginBottom: "16px" }}>
        Loading Application...
      </h1>
      <div
        style={{
          width: "200px",
          height: "4px",
          backgroundColor: "#e5e5e5",
          borderRadius: "2px",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: "50%",
            height: "100%",
            backgroundColor: "#000000",
            animation: "loading 1.5s infinite ease-in-out",
          }}
        />
      </div>
      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  </div>
);

// Root component that handles font loading
const Root = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load fonts and then render the app
    const initApp = async () => {
      try {
        await loadFonts();
      } catch (error) {
        console.warn("Font loading error:", error);
        // Continue anyway with fallback fonts
      } finally {
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <StrictMode>
      <HashRouter>
        <App />
        <Toaster />
      </HashRouter>
    </StrictMode>
  );
};

createRoot(document.getElementById("root")!).render(<Root />);
