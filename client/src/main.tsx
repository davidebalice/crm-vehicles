import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";

// Call API to seed data in development mode
/*
if (import.meta.env.DEV) {
  fetch("/api/seed", { method: "POST" })
    .then(res => {
      if (res.ok) {
        console.log("Development data seeded successfully");
      }
    })
    .catch(err => console.error("Failed to seed development data:", err));
}
*/
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
