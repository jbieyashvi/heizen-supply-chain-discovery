import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ToastProvider } from "./components/Toast";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectOverviewPage } from "./pages/ProjectOverviewPage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export default function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to="/projects" replace />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="projects/:projectId" element={<ProjectOverviewPage />} />
          <Route
            path="projects/:projectId/research"
            element={<PlaceholderPage section="Research" />}
          />
          <Route
            path="projects/:projectId/discovery"
            element={<PlaceholderPage section="Discovery" />}
          />
          <Route
            path="projects/:projectId/opportunities"
            element={<PlaceholderPage section="Opportunities" />}
          />
          <Route
            path="projects/:projectId/process-map"
            element={<PlaceholderPage section="Process Map" />}
          />
          <Route
            path="projects/:projectId/sources"
            element={<PlaceholderPage section="Sources" />}
          />
          <Route path="*" element={<Navigate to="/projects" replace />} />
        </Route>
      </Routes>
    </ToastProvider>
  );
}
