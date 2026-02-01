import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Import Leaflet CSS
import "leaflet/dist/leaflet.css";
import "react-leaflet-markercluster/styles";

// Import react-day-picker CSS
import "react-day-picker/style.css";

// Import Inter font
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";

const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
