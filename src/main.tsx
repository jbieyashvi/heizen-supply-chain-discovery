import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import "./styles/components.css";

// Derive the router basename from Vite's BASE_URL so routing works both in
// local dev ("/") and under the GitHub Pages repo subpath
// ("/heizen-supply-chain-discovery/"). React Router expects no trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
