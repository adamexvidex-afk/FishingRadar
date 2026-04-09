import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const isLovablePreview =
  window.location.hostname.includes("--") && window.location.hostname.endsWith(".lovable.app");

if ("serviceWorker" in navigator && isLovablePreview) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => registration.unregister());
    });

    if ("caches" in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => {
          void caches.delete(key);
        });
      });
    }
  });
}

createRoot(document.getElementById("root")!).render(<App />);
