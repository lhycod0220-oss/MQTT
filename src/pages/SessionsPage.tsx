import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTelemetrySource } from "@/hooks/useTelemetrySource";
import { useNodes } from "@/hooks/useNodes";
import { StatusTag } from "@/components/ui/StatusTag";
import { formatRelativeTime, formatTimestamp } from "@/lib/format";
import type { SessionSummary } from "@/lib/dataSource/types";

export function SessionsPage() {
  const source = useTelemetrySource();
  const { nodes } = useNodes();
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    source.listSessions().then((list) => {
      setSessions(list);
      setLoading(false);
    });
  }, [source]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>세션</h1>
          <p className="page-sub">노드별 수집 세션 이력 · 드롭률 확인은 세션 상세에서</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body" style={{ padding: 0 }}>
          {loading ? (
            <div className="empty-state">불러오는 중…</div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>세션 ID</th>
                  <th>노드</th>
                  <th>프로토콜</th>
                  <th>상태</th>
                  <th>샘플</th>
                  <th>드롭</th>
                  <th>시작</th>
                  <th>종료</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.sessionId}>
                    <td>
                      <Link
                        to={`/sessions/${s.sessionId}`}
                        className="mono"
                        style={{ color: "var(--signal-teal)", textDecoration: "none" }}
                      >
                        {s.sessionId}
                      </Link>
                    </td>
                    <td>{nodes.find((n) => n.nodeId === s.nodeId)?.name ?? s.nodeId}</td>
                    <td className="mono">
                      {s.protocol.toUpperCase()} / QoS{s.qos}
                    </td>
                    <td>
                      <StatusTag status={s.status} />
                    </td>
                    <td className="mono">{s.sampleCount.toLocaleString()}</td>
                    <td className="mono" style={{ color: s.droppedCount > 20 ? "var(--signal-red)" : "var(--text-secondary)" }}>
                      {s.droppedCount}
                    </td>
                    <td className="mono" style={{ color: "var(--text-secondary)" }}>
                      {formatTimestamp(s.startedAt)}
                    </td>
                    <td className="mono" style={{ color: "var(--text-secondary)" }}>
                      {s.endedAt ? formatRelativeTime(s.endedAt) : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
