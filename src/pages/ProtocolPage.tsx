import { useEffect, useState } from "react";
import { useNodes } from "@/hooks/useNodes";
import { useTelemetrySource } from "@/hooks/useTelemetrySource";
import { FIRMWARE_COLOR } from "@/lib/format";
import type { ProtocolStats } from "@/lib/dataSource/types";

export function ProtocolPage() {
  const { nodes } = useNodes();
  const source = useTelemetrySource();
  const [stats, setStats] = useState<Record<string, ProtocolStats>>({});

  useEffect(() => {
    if (nodes.length === 0) return;
    Promise.all(nodes.map((n) => source.getProtocolStats(n.nodeId))).then((results) => {
      const map: Record<string, ProtocolStats> = {};
      results.forEach((r) => {
        map[r.nodeId] = r;
      });
      setStats(map);
    });
  }, [nodes, source]);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>프로토콜 / QoS</h1>
          <p className="page-sub">udp_listener / qos_handler / packet_parser 수신 집계</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-body" style={{ padding: 0 }}>
          <table>
            <thead>
              <tr>
                <th>노드</th>
                <th>구간</th>
                <th>수신</th>
                <th>중복</th>
                <th>순서 어긋남</th>
                <th>파싱 오류</th>
                <th>평균 지연</th>
                <th>QoS</th>
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => {
                const s = stats[node.nodeId];
                return (
                  <tr key={node.nodeId}>
                    <td>
                      <span className="dot" style={{ background: FIRMWARE_COLOR[node.firmware], marginRight: 8 }} />
                      {node.name}
                    </td>
                    {s ? (
                      <>
                        <td className="mono" style={{ color: "var(--text-secondary)" }}>
                          {s.windowLabel}
                        </td>
                        <td className="mono">{s.delivered.toLocaleString()}</td>
                        <td className="mono">{s.duplicate}</td>
                        <td className="mono">{s.outOfOrder}</td>
                        <td
                          className="mono"
                          style={{ color: s.parseErrors > 0 ? "var(--signal-red)" : "var(--text-primary)" }}
                        >
                          {s.parseErrors}
                        </td>
                        <td className="mono">{s.avgLatencyMs} ms</td>
                        <td className="mono">QoS {s.lastQos}</td>
                      </>
                    ) : (
                      <td colSpan={6} className="mono" style={{ color: "var(--text-tertiary)" }}>
                        불러오는 중…
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <p style={{ fontSize: 12, color: "var(--text-tertiary)", marginTop: 12 }}>
        UDP 경로 노드는 중복/순서 어긋남이 자연히 더 높게 나올 수 있습니다 — QoS 보장이 없는 전송 계층이기 때문입니다.
      </p>
    </div>
  );
}
