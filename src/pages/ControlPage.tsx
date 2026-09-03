import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNodes } from "@/hooks/useNodes";
import { useTelemetrySource } from "@/hooks/useTelemetrySource";
import { NodePicker } from "@/components/ui/NodePicker";
import { formatTimestamp } from "@/lib/format";
import type { ControlCommand, ControlCommandKind } from "@/lib/dataSource/types";

const COMMANDS: { kind: ControlCommandKind; label: string; description: string }[] = [
  { kind: "set_report_interval", label: "보고 주기 변경", description: "텔레메트리 전송 간격을 조정합니다" },
  { kind: "recalibrate_gas_baseline", label: "가스 기준값 재보정", description: "현재 대기를 기준값으로 저장합니다" },
  { kind: "toggle_relay", label: "릴레이 전환", description: "노드에 연결된 릴레이를 켜거나 끕니다" },
  { kind: "reboot", label: "재부팅", description: "노드를 재시작합니다 — 진행 중 세션이 끊깁니다" },
];

export function ControlPage() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const { nodes, loading } = useNodes();
  const source = useTelemetrySource();
  const [history, setHistory] = useState<ControlCommand[]>([]);
  const [intervalValue, setIntervalValue] = useState("2");
  const [sending, setSending] = useState<ControlCommandKind | null>(null);

  useEffect(() => {
    if (!loading && !nodeId && nodes.length > 0) {
      navigate(`/control/${nodes[0].nodeId}`, { replace: true });
    }
  }, [loading, nodeId, nodes, navigate]);

  useEffect(() => {
    if (!nodeId) return;
    source.listControlCommands(nodeId).then(setHistory);
  }, [nodeId, source]);

  async function issue(kind: ControlCommandKind, payload: Record<string, string | number | boolean> = {}) {
    if (!nodeId) return;
    setSending(kind);
    const cmd = await source.sendControlCommand(nodeId, kind, payload);
    setHistory((prev) => [cmd, ...prev]);
    setSending(null);
    // ack 는 비동기로 갱신되므로 잠시 후 다시 조회
    setTimeout(() => {
      source.listControlCommands(nodeId).then(setHistory);
    }, 1100);
  }

  const activeNode = nodes.find((n) => n.nodeId === nodeId) ?? null;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>제어</h1>
          <p className="page-sub">{activeNode ? activeNode.name : "노드를 선택하세요"}</p>
        </div>
        <NodePicker value={nodeId ?? null} onChange={(id) => navigate(`/control/${id}`)} />
      </div>

      <div className="grid-two">
        <div className="panel">
          <div className="panel-header">
            <h2>명령</h2>
          </div>
          <div className="panel-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              className="panel"
              style={{ padding: 12, background: "var(--bg-inset)", display: "flex", alignItems: "flex-end", gap: 10 }}
            >
              <div className="field" style={{ margin: 0, flex: 1 }}>
                <label>보고 주기 (초)</label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  value={intervalValue}
                  onChange={(e) => setIntervalValue(e.target.value)}
                />
              </div>
              <button
                className="btn btn-primary"
                disabled={sending !== null || !nodeId}
                onClick={() => issue("set_report_interval", { seconds: Number(intervalValue) })}
              >
                적용
              </button>
            </div>

            {COMMANDS.filter((c) => c.kind !== "set_report_interval").map((cmd) => (
              <div key={cmd.kind} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div>
                  <div style={{ fontSize: 13 }}>{cmd.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{cmd.description}</div>
                </div>
                <button className="btn" disabled={sending !== null || !nodeId} onClick={() => issue(cmd.kind)}>
                  {sending === cmd.kind ? "전송 중…" : "실행"}
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>명령 이력</h2>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            {history.length === 0 ? (
              <div className="empty-state">아직 전송된 명령이 없습니다.</div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>명령</th>
                    <th>상태</th>
                    <th>발행 시각</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((cmd) => (
                    <tr key={cmd.commandId}>
                      <td>{COMMANDS.find((c) => c.kind === cmd.kind)?.label ?? cmd.kind}</td>
                      <td>
                        <AckTag status={cmd.ackStatus} />
                      </td>
                      <td className="mono" style={{ color: "var(--text-secondary)" }}>
                        {formatTimestamp(cmd.issuedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function AckTag({ status }: { status: ControlCommand["ackStatus"] }) {
  const map = {
    pending: { label: "대기", color: "var(--signal-amber)" },
    acked: { label: "확인됨", color: "var(--signal-green)" },
    failed: { label: "실패", color: "var(--signal-red)" },
  } as const;
  const cfg = map[status];
  return (
    <span className="tag">
      <span className={status === "pending" ? "dot dot-pulse" : "dot"} style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}
