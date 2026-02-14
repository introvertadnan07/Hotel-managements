import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ClerkProvider } from "@clerk/clerk-react";
import App from "./App";
import "./index.css";
import { AppProvider } from "./context/AppContext";
import { Toaster } from "react-hot-toast";
import ScrollToTop from "./components/ScrollToTop";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

ReactDOM.createRoot(document.getElementById("root")).render(
  <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
    <BrowserRouter>
      <AppProvider>

        <ScrollToTop />

        <Toaster position="top-center" />

        <App />
      </AppProvider>
    </BrowserRouter>
  </ClerkProvider>
);
