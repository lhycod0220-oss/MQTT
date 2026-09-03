import { useNodes } from "@/hooks/useNodes";
import { FIRMWARE_COLOR, FIRMWARE_LABEL } from "@/lib/format";

export function NodePicker({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (nodeId: string) => void;
}) {
  const { nodes, loading } = useNodes();

  if (loading) {
    return <div style={{ fontSize: 12, color: "var(--text-tertiary)" }}>노드 불러오는 중…</div>;
  }

  return (
    <div style={{ display: "flex", gap: 6 }}>
      {nodes.map((node) => {
        const active = node.nodeId === value;
        return (
          <button
            key={node.nodeId}
            className="btn"
            onClick={() => onChange(node.nodeId)}
            style={{
              padding: "6px 10px",
              borderColor: active ? "var(--signal-teal)" : "var(--border-hair-strong)",
              background: active ? "var(--bg-panel-raised)" : "var(--bg-inset)",
            }}
          >
            <span
              className="dot"
              style={{ background: FIRMWARE_COLOR[node.firmware] }}
            />
            <span style={{ fontSize: 12 }}>{node.name}</span>
          </button>
        );
      })}
    </div>
  );
}

export function firmwareLabel(id: string, nodes: { nodeId: string; firmware: keyof typeof FIRMWARE_LABEL }[]) {
  return FIRMWARE_LABEL[nodes.find((n) => n.nodeId === id)?.firmware ?? "standard_mqtt"];
}
