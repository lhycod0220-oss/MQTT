import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNodes } from "@/hooks/useNodes";
import { useTelemetrySource } from "@/hooks/useTelemetrySource";
import { NodePicker } from "@/components/ui/NodePicker";
import { StatTile } from "@/components/ui/StatTile";
import { LineChart } from "@/components/charts/LineChart";
import { formatCurrent, formatPower, formatVoltage } from "@/lib/format";
import type { PowerSample } from "@/lib/dataSource/types";

export function PowerPage() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const { nodes, loading } = useNodes();
  const source = useTelemetrySource();
  const [samples, setSamples] = useState<PowerSample[]>([]);
  const [samplesLoading, setSamplesLoading] = useState(true);

  useEffect(() => {
    if (!loading && !nodeId && nodes.length > 0) {
      navigate(`/power/${nodes[0].nodeId}`, { replace: true });
    }
  }, [loading, nodeId, nodes, navigate]);

  useEffect(() => {
    if (!nodeId) return;
    setSamplesLoading(true);
    source.getPowerHistory(nodeId, 60).then((data) => {
      setSamples(data);
      setSamplesLoading(false);
    });
  }, [nodeId, source]);

  const activeNode = nodes.find((n) => n.nodeId === nodeId) ?? null;
  const latest = samples[samples.length - 1];
  const msgIdKnown = samples.some((s) => s.msgId !== undefined);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>전력</h1>
          <p className="page-sub">{activeNode ? activeNode.name : "노드를 선택하세요"}</p>
        </div>
        <NodePicker value={nodeId ?? null} onChange={(id) => navigate(`/power/${id}`)} />
      </div>

      {samplesLoading || !latest ? (
        <div className="empty-state">전력 로그를 불러오는 중…</div>
      ) : (
        <>
          <div className="grid-stats">
            <StatTile label="전압" value={latest.voltageV.toFixed(2)} unit="V" accent="var(--signal-teal)" />
            <StatTile label="전류" value={latest.currentMa.toFixed(1)} unit="mA" accent="var(--signal-amber)" />
            <StatTile label="전력" value={latest.powerMw.toFixed(0)} unit="mW" accent="var(--signal-violet)" />
            <StatTile
              label="배터리 추정"
              value={latest.estimatedBatteryPct.toFixed(0)}
              unit="%"
              accent={latest.estimatedBatteryPct < 20 ? "var(--signal-red)" : undefined}
            />
          </div>

          <div className="panel">
            <div className="panel-header">
              <h2>전압 / 전류</h2>
            </div>
            <div className="panel-body">
              <LineChart
                series={[
                  { label: "전압 (V)", color: "var(--signal-teal)", values: samples.map((s) => s.voltageV) },
                  { label: "전류 (mA)", color: "var(--signal-amber)", values: samples.map((s) => s.currentMa) },
                ]}
              />
            </div>
          </div>

          <div className="panel" style={{ marginTop: 16 }}>
            <div className="panel-header">
              <h2>로그</h2>
            </div>
            <div className="panel-body" style={{ padding: 0 }}>
              <table>
                <thead>
                  <tr>
                    <th>시각</th>
                    {msgIdKnown && <th>msg_id</th>}
                    <th>전압</th>
                    <th>전류</th>
                    <th>전력</th>
                    <th>배터리</th>
                  </tr>
                </thead>
                <tbody>
                  {[...samples].reverse().slice(0, 12).map((s, i) => (
                    <tr key={i}>
                      <td className="mono" style={{ color: "var(--text-secondary)" }}>
                        {new Date(s.timestamp).toLocaleTimeString("ko-KR", { hour12: false })}
                      </td>
                      {msgIdKnown && <td className="mono">{s.msgId ?? "-"}</td>}
                      <td className="mono">{formatVoltage(s.voltageV)}</td>
                      <td className="mono">{formatCurrent(s.currentMa)}</td>
                      <td className="mono">{formatPower(s.powerMw)}</td>
                      <td className="mono">{s.estimatedBatteryPct.toFixed(0)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
