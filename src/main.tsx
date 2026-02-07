import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("Main.tsx: Application initializing...");

// Remove initial loader if it exists
const removeLoader = () => {
  const loader = document.querySelector('.initial-loader');
  if (loader) {
    console.log("Main.tsx: Removing initial loader");
    loader.remove();
  }
};

// Render the app
const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
  
  // As a fallback, remove loader after a short delay if it's still there
  setTimeout(removeLoader, 2000);
} else {
  console.error("Main.tsx: Root container not found!");
}
