import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useNodes } from "@/hooks/useNodes";
import { useTelemetrySource } from "@/hooks/useTelemetrySource";
import { NodePicker } from "@/components/ui/NodePicker";
import type { NodeConfig } from "@/lib/dataSource/types";

export function ConfigPage() {
  const { nodeId } = useParams();
  const navigate = useNavigate();
  const { nodes, loading } = useNodes();
  const source = useTelemetrySource();
  const [config, setConfig] = useState<NodeConfig | null>(null);
  const [draft, setDraft] = useState<NodeConfig | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && !nodeId && nodes.length > 0) {
      navigate(`/config/${nodes[0].nodeId}`, { replace: true });
    }
  }, [loading, nodeId, nodes, navigate]);

  useEffect(() => {
    if (!nodeId) return;
    source.getNodeConfig(nodeId).then((cfg) => {
      setConfig(cfg);
      setDraft(cfg);
    });
  }, [nodeId, source]);

  const activeNode = nodes.find((n) => n.nodeId === nodeId) ?? null;
  const dirty = config && draft && JSON.stringify(config) !== JSON.stringify(draft);

  async function save() {
    if (!nodeId || !draft) return;
    setSaving(true);
    const next = await source.updateNodeConfig(nodeId, draft);
    setConfig(next);
    setDraft(next);
    setSaving(false);
    setSavedAt(Date.now());
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>설정</h1>
          <p className="page-sub">{activeNode ? activeNode.name : "노드를 선택하세요"}</p>
        </div>
        <NodePicker value={nodeId ?? null} onChange={(id) => navigate(`/config/${id}`)} />
      </div>

      {!draft ? (
        <div className="empty-state">설정을 불러오는 중…</div>
      ) : (
        <div className="panel" style={{ maxWidth: 480 }}>
          <div className="panel-header">
            <h2>노드 파라미터</h2>
          </div>
          <div className="panel-body">
            <div className="field">
              <label>보고 주기 (초)</label>
              <input
                type="number"
                min={1}
                value={draft.reportIntervalS}
                onChange={(e) => setDraft({ ...draft, reportIntervalS: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>가스 기준값 (Ω)</label>
              <input
                type="number"
                value={draft.gasBaselineOhm}
                onChange={(e) => setDraft({ ...draft, gasBaselineOhm: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>온도 경고 임계값 (°C)</label>
              <input
                type="number"
                value={draft.tempWarnC}
                onChange={(e) => setDraft({ ...draft, tempWarnC: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>습도 경고 임계값 (%)</label>
              <input
                type="number"
                value={draft.humidityWarnPct}
                onChange={(e) => setDraft({ ...draft, humidityWarnPct: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>MQTT 토픽</label>
              <input
                type="text"
                value={draft.mqttTopic}
                onChange={(e) => setDraft({ ...draft, mqttTopic: e.target.value })}
              />
            </div>
            <div className="field">
              <label>QoS</label>
              <select
                value={draft.qos}
                onChange={(e) => setDraft({ ...draft, qos: Number(e.target.value) as 0 | 1 | 2 })}
              >
                <option value={0}>0 — at most once</option>
                <option value={1}>1 — at least once</option>
                <option value={2}>2 — exactly once</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <button className="btn btn-primary" disabled={!dirty || saving} onClick={save}>
                {saving ? "저장 중…" : "변경 사항 저장"}
              </button>
              {!dirty && savedAt && (
                <span style={{ fontSize: 12, color: "var(--signal-green)" }}>저장됨</span>
              )}
              {dirty && (
                <button className="btn" onClick={() => setDraft(config)}>
                  되돌리기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
