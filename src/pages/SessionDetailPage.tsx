import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useTelemetrySource } from "@/hooks/useTelemetrySource";
import { useNodes } from "@/hooks/useNodes";
import { StatusTag } from "@/components/ui/StatusTag";
import { StatTile } from "@/components/ui/StatTile";
import { formatTimestamp } from "@/lib/format";
import type { SessionSummary } from "@/lib/dataSource/types";

export function SessionDetailPage() {
  const { sessionId } = useParams();
  const source = useTelemetrySource();
  const { nodes } = useNodes();
  const [session, setSession] = useState<SessionSummary | null | undefined>(undefined);

  useEffect(() => {
    if (!sessionId) return;
    source.getSession(sessionId).then(setSession);
  }, [source, sessionId]);

  if (session === undefined) {
    return <div className="empty-state">불러오는 중…</div>;
  }
  if (session === null) {
    return (
      <div className="empty-state">
        세션을 찾을 수 없습니다.
        <div style={{ marginTop: 12 }}>
          <Link to="/sessions" style={{ color: "var(--signal-teal)" }}>
            세션 목록으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const node = nodes.find((n) => n.nodeId === session.nodeId);
  const dropRate = session.sampleCount > 0 ? (session.droppedCount / session.sampleCount) * 100 : 0;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="mono">{session.sessionId}</h1>
          <p className="page-sub">{node?.name ?? session.nodeId}</p>
        </div>
        <StatusTag status={session.status} />
      </div>

      {session.note && (
        <div className="panel" style={{ marginBottom: 16, padding: "10px 14px", borderLeft: "2px solid var(--signal-amber)" }}>
          <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{session.note}</span>
        </div>
      )}

      <div className="grid-stats">
        <StatTile label="프로토콜" value={session.protocol.toUpperCase()} sub={`QoS ${session.qos}`} />
        <StatTile label="샘플 수" value={session.sampleCount.toLocaleString()} />
        <StatTile
          label="드롭"
          value={session.droppedCount.toLocaleString()}
          unit={`(${dropRate.toFixed(2)}%)`}
          accent={dropRate > 1.5 ? "var(--signal-red)" : undefined}
        />
        <StatTile label="시작" value={formatTimestamp(session.startedAt)} />
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>타임라인</h2>
        </div>
        <div className="panel-body">
          <table>
            <tbody>
              <tr>
                <th>시작</th>
                <td className="mono">{formatTimestamp(session.startedAt)}</td>
              </tr>
              <tr>
                <th>종료</th>
                <td className="mono">{session.endedAt ? formatTimestamp(session.endedAt) : "진행 중"}</td>
              </tr>
              <tr>
                <th>수집 경로</th>
                <td className="mono">{node?.ingestPath ?? "-"}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
