import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNodes } from "@/hooks/useNodes";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { NodePicker } from "@/components/ui/NodePicker";
import { StatTile } from "@/components/ui/StatTile";
import { LineChart } from "@/components/charts/LineChart";
import {
  formatGasResistance,
  formatHumidity,
  formatPressure,
  formatRelativeTime,
  formatTemperature,
  formatUptime,
} from "@/lib/format";

export function TelemetryPage() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const { nodes, loading } = useNodes();

  useEffect(() => {
    if (!loading && !nodeId && nodes.length > 0) {
      navigate(`/telemetry/${nodes[0].nodeId}`, { replace: true });
    }
  }, [loading, nodeId, nodes, navigate]);

  const activeNode = nodes.find((n) => n.nodeId === nodeId) ?? null;
  const { samples, latest, loading: sampleLoading } = useLiveTelemetry(nodeId ?? null, 60);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>텔레메트리</h1>
          <p className="page-sub">
            {activeNode ? `${activeNode.name} · msg_id ${latest?.msgId ?? "-"}` : "노드를 선택하세요"}
          </p>
        </div>
        <NodePicker value={nodeId ?? null} onChange={(id) => navigate(`/telemetry/${id}`)} />
      </div>

      {sampleLoading || !latest ? (
        <div className="empty-state">텔레메트리를 불러오는 중…</div>
      ) : (
        <>
          <div className="grid-stats">
            <StatTile
              label="온도"
              value={formatTemperature(latest.temperatureC).replace("°C", "")}
              unit="°C"
              accent="var(--signal-teal)"
            />
            <StatTile
              label="습도"
              value={formatHumidity(latest.humidityPct).replace("%", "")}
              unit="%"
              accent="var(--signal-amber)"
            />
            <StatTile
              label="가스 저항"
              value={formatGasResistance(latest.gasResistanceOhm).replace(" kΩ", "")}
              unit="kΩ"
              accent="var(--signal-violet)"
            />
            <StatTile label="기압" value={formatPressure(latest.pressureHpa).replace(" hPa", "")} unit="hPa" />
            <StatTile label="RSSI" value={String(latest.rssiDbm)} unit="dBm" />
            <StatTile
              label="배터리"
              value={latest.batteryV.toFixed(2)}
              unit="V"
              sub={`가동 ${formatUptime(latest.uptimeS)} · ${formatRelativeTime(latest.timestamp)}`}
            />
          </div>

          <div className="grid-two">
            <div className="panel">
              <div className="panel-header">
                <h2>온도 / 습도</h2>
              </div>
              <div className="panel-body">
                <LineChart
                  series={[
                    { label: "온도 (°C)", color: "var(--signal-teal)", values: samples.map((s) => s.temperatureC) },
                    { label: "습도 (%)", color: "var(--signal-amber)", values: samples.map((s) => s.humidityPct) },
                  ]}
                  formatValue={(v) => v.toFixed(1)}
                />
              </div>
            </div>

            <div className="panel">
              <div className="panel-header">
                <h2>가스 저항</h2>
              </div>
              <div className="panel-body">
                <LineChart
                  series={[
                    {
                      label: "가스 저항 (kΩ)",
                      color: "var(--signal-violet)",
                      values: samples.map((s) => s.gasResistanceOhm / 1000),
                    },
                  ]}
                  formatValue={(v) => `${v.toFixed(1)} kΩ`}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
