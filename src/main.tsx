import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

console.log("CR7-DEBUG: Main.tsx execution started");

// Immediately remove any loader from index.html
const loader = document.querySelector('.initial-loader');
if (loader) {
  loader.remove();
  console.log("CR7-DEBUG: Initial loader removed");
}

const container = document.getElementById("root");
if (container) {
  console.log("CR7-DEBUG: Root container found, rendering App");
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("CR7-DEBUG: Root container NOT found");
}
