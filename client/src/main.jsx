import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "react-hot-toast";   // ✅ ADD THIS

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <BrowserRouter>
      <AppProvider>

        {/* ✅ THIS IS REQUIRED */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 2000,
          }}
        />

        <App />
      </AppProvider>
    </BrowserRouter>
  </ClerkProvider>
);
