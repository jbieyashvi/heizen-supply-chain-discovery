import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./hooks/useTheme";
import "./styles/global.css";
import "./styles/components.css";
import "./styles/research.css";
import "./styles/discovery.css";
import "./styles/auth.css";
import "./styles/ai.css";
import "./styles/opportunities.css";
import "./styles/processmap.css";
import "./styles/sources.css";
import "./styles/team.css";
import "./styles/firstcall.css";

// Derive the router basename from Vite's BASE_URL so routing works both in
// local dev ("/") and under the GitHub Pages repo subpath
// ("/heizen-supply-chain-discovery/"). React Router expects no trailing slash.
const basename = import.meta.env.BASE_URL.replace(/\/$/, "") || "/";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
