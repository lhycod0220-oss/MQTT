import { ConnectionBadge } from "@/components/ui/ConnectionBadge";

export function TopBar() {
  return (
    <header
      style={{
        gridArea: "topbar",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        borderBottom: "1px solid var(--border-hair)",
        background: "var(--bg-panel)",
      }}
    >
      <div className="mono" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
        {new Date().toISOString().slice(0, 10)} 실험 세션
      </div>
      <ConnectionBadge />
    </header>
  );
}
