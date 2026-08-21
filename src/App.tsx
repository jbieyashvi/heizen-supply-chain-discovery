import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { ToastProvider } from "./components/Toast";
import { DiscoveryProvider } from "./hooks/useDiscovery";
import { FocusProvider } from "./hooks/useFocus";
import { AuthProvider } from "./hooks/useAuth";
import { RequireAuth } from "./components/RequireAuth";
import { SignInPage } from "./pages/SignInPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { ProjectOverviewPage } from "./pages/ProjectOverviewPage";
import { ResearchPage } from "./pages/ResearchPage";
import { DiscoveryPage } from "./pages/DiscoveryPage";
import { CallModePage } from "./pages/CallModePage";
import { OpportunitiesPage } from "./pages/OpportunitiesPage";
import { ProcessMapPage } from "./pages/ProcessMapPage";
import { ProcessSnapshotPage } from "./pages/ProcessSnapshotPage";
import { SourcesPage } from "./pages/SourcesPage";
import { TeamPage } from "./pages/TeamPage";

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <DiscoveryProvider>
          <FocusProvider>
          <Routes>
            {/* Public */}
            <Route path="sign-in" element={<SignInPage />} />

            {/* Focused Call Mode — full screen, outside the app shell */}
            <Route
              path="projects/:projectId/discovery/call"
              element={
                <RequireAuth>
                  <CallModePage />
                </RequireAuth>
              }
            />

            {/* Client snapshot — clean presentation view, outside the app shell */}
            <Route
              path="projects/:projectId/process-map/snapshot"
              element={
                <RequireAuth>
                  <ProcessSnapshotPage />
                </RequireAuth>
              }
            />

            <Route
              element={
                <RequireAuth>
                  <AppShell />
                </RequireAuth>
              }
            >
              <Route index element={<Navigate to="/projects" replace />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="team" element={<TeamPage />} />
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
                element={<OpportunitiesPage />}
              />
              <Route
                path="projects/:projectId/process-map"
                element={<ProcessMapPage />}
              />
              <Route
                path="projects/:projectId/sources"
                element={<SourcesPage />}
              />
              <Route path="*" element={<Navigate to="/projects" replace />} />
            </Route>
          </Routes>
          </FocusProvider>
        </DiscoveryProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
