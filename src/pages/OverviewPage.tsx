import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNodes } from "@/hooks/useNodes";
import { useLiveTelemetry } from "@/hooks/useLiveTelemetry";
import { useTelemetrySource } from "@/hooks/useTelemetrySource";
import { Sparkline } from "@/components/charts/Sparkline";
import { StatusTag } from "@/components/ui/StatusTag";
import {
  FIRMWARE_COLOR,
  FIRMWARE_LABEL,
  formatGasResistance,
  formatHumidity,
  formatRelativeTime,
  formatTemperature,
} from "@/lib/format";
import type { SessionSummary } from "@/lib/dataSource/types";

export function OverviewPage() {
  const { nodes, loading } = useNodes();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const source = useTelemetrySource();

  useEffect(() => {
    source.listSessions().then(setSessions);
  }, [source]);

  const runningCount = sessions.filter((s) => s.status === "running").length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>개요</h1>
          <p className="page-sub">등록된 {nodes.length}개 노드 · 진행 중 세션 {runningCount}개</p>
        </div>
      </div>

      {loading ? (
        <div className="empty-state">노드 정보를 불러오는 중…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 14 }}>
          {nodes.map((node) => (
            <NodeCard key={node.nodeId} nodeId={node.nodeId} name={node.name} firmware={node.firmware} />
          ))}
        </div>
      )}

      <div style={{ marginTop: 28 }} className="panel">
        <div className="panel-header">
          <h2>최근 세션</h2>
          <Link to="/sessions" style={{ fontSize: 12, color: "var(--signal-teal)", textDecoration: "none" }}>
            전체 보기
          </Link>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>세션</th>
                <th>노드</th>
                <th>프로토콜</th>
                <th>상태</th>
                <th>샘플 수</th>
                <th>시작</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 5).map((s) => (
                <tr key={s.sessionId}>
                  <td className="mono">{s.sessionId}</td>
                  <td>{nodes.find((n) => n.nodeId === s.nodeId)?.name ?? s.nodeId}</td>
                  <td className="mono">
                    {s.protocol.toUpperCase()} / QoS{s.qos}
                  </td>
                  <td>
                    <StatusTag status={s.status} />
                  </td>
                  <td className="mono">{s.sampleCount.toLocaleString()}</td>
                  <td className="mono" style={{ color: "var(--text-secondary)" }}>
                    {formatRelativeTime(s.startedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function NodeCard({
  nodeId,
  name,
  firmware,
}: {
  nodeId: string;
  name: string;
  firmware: keyof typeof FIRMWARE_LABEL;
}) {
  const { samples, latest } = useLiveTelemetry(nodeId, 40);
  const color = FIRMWARE_COLOR[firmware];

  return (
    <Link to={`/telemetry/${nodeId}`} className="panel" style={{ textDecoration: "none", color: "inherit", display: "block" }}>
      <div className="panel-header" style={{ borderLeft: `2px solid ${color}` }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{name}</div>
          <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
            {FIRMWARE_LABEL[firmware]}
          </div>
        </div>
        {latest && (
          <span className="mono" style={{ fontSize: 11, color: "var(--text-tertiary)" }}>
            {formatRelativeTime(latest.timestamp)}
          </span>
        )}
      </div>
      <div className="panel-body">
        {latest ? (
          <>
            <div style={{ display: "flex", gap: 20, marginBottom: 12 }}>
              <MiniStat label="온도" value={formatTemperature(latest.temperatureC)} />
              <MiniStat label="습도" value={formatHumidity(latest.humidityPct)} />
              <MiniStat label="가스" value={formatGasResistance(latest.gasResistanceOhm)} />
            </div>
            <Sparkline
              values={samples.map((s) => s.temperatureC)}
              color={color}
              width={260}
              height={40}
            />
          </>
        ) : (
          <div style={{ color: "var(--text-tertiary)", fontSize: 12 }}>연결 대기 중…</div>
        )}
      </div>
    </Link>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "var(--text-tertiary)", marginBottom: 3 }}>{label}</div>
      <div className="mono" style={{ fontSize: 14 }}>
        {value}
      </div>
    </div>
  );
}


