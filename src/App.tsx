import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ToastProvider } from "./components/Toast";
import { DiscoveryProvider } from "./hooks/useDiscovery";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectOverviewPage } from "./pages/ProjectOverviewPage";
import { ResearchPage } from "./pages/ResearchPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { CallModePage } from "./pages/CallModePage";
import { PlaceholderPage } from "./pages/PlaceholderPage";

export default function App() {
  return (
    <ToastProvider>
      <DiscoveryProvider>
        <Routes>
          {/* Focused Call Mode — full screen, outside the app shell */}
          <Route
            path="projects/:projectId/discovery/call"
            element={<CallModePage />}
          />

          <Route element={<AppShell />}>
            <Route index element={<Navigate to="/projects" replace />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:projectId" element={<ProjectOverviewPage />} />
            <Route
              path="projects/:projectId/research"
              element={<ResearchPage />}
            />
            <Route
              path="projects/:projectId/discovery"
              element={<DiscoveryPage />}
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
      </DiscoveryProvider>
    </ToastProvider>
  );
}
