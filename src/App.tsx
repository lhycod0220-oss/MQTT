import { Navigate, Route, Routes } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { OverviewPage } from "@/pages/OverviewPage";
import { TelemetryPage } from "@/pages/TelemetryPage";
import { SessionsPage } from "@/pages/SessionsPage";
import { SessionDetailPage } from "@/pages/SessionDetailPage";
import { PowerPage } from "@/pages/PowerPage";
import { ProtocolPage } from "@/pages/ProtocolPage";
import { ControlPage } from "@/pages/ControlPage";
import { ConfigPage } from "@/pages/ConfigPage";

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/overview" replace />} />
        <Route path="overview" element={<OverviewPage />} />
        <Route path="telemetry" element={<TelemetryPage />} />
        <Route path="telemetry/:nodeId" element={<TelemetryPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="sessions/:sessionId" element={<SessionDetailPage />} />
        <Route path="power" element={<PowerPage />} />
        <Route path="power/:nodeId" element={<PowerPage />} />
        <Route path="protocol" element={<ProtocolPage />} />
        <Route path="control" element={<ControlPage />} />
        <Route path="control/:nodeId" element={<ControlPage />} />
        <Route path="config" element={<ConfigPage />} />
        <Route path="config/:nodeId" element={<ConfigPage />} />
        <Route path="*" element={<Navigate to="/overview" replace />} />
      </Route>
    </Routes>
  );
}
