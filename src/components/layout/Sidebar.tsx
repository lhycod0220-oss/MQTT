import { NavLink } from "react-router-dom";

const NAV_ITEMS = [
  { to: "/overview", label: "개요" },
  { to: "/telemetry", label: "텔레메트리" },
  { to: "/sessions", label: "세션" },
  { to: "/power", label: "전력" },
  { to: "/protocol", label: "프로토콜 / QoS" },
  { to: "/control", label: "제어" },
  { to: "/config", label: "설정" },
];

export function Sidebar() {
  return (
    <aside
      style={{
        gridArea: "sidebar",
        borderRight: "1px solid var(--border-hair)",
        background: "var(--bg-panel)",
        display: "flex",
        flexDirection: "column",
        padding: "18px 12px",
      }}
    >
      <div style={{ padding: "0 8px", marginBottom: 22 }}>
        <div style={{ fontSize: 13, fontWeight: 600, letterSpacing: "-0.01em" }}>노드 콘솔</div>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginTop: 2 }}>
          MQTT · UDP 센서 실험
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: "block",
              padding: "8px 10px",
              borderRadius: 4,
              fontSize: 13,
              color: isActive ? "var(--text-primary)" : "var(--text-secondary)",
              background: isActive ? "var(--bg-panel-raised)" : "transparent",
              borderLeft: isActive
                ? "2px solid var(--signal-teal)"
                : "2px solid transparent",
              textDecoration: "none",
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: "auto", padding: "0 8px" }}>
        <div style={{ fontSize: 11, color: "var(--text-tertiary)", marginBottom: 8 }}>
          펌웨어 변형
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <LegendRow color="var(--signal-teal)" label="Standard MQTT" />
          <LegendRow color="var(--signal-violet)" label="Gingerbread (baseline)" />
          <LegendRow color="var(--signal-amber)" label="Monitor" />
        </div>
      </div>
    </aside>
  );
}

function LegendRow({ color, label }: { color: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--text-secondary)" }}>
      <span className="dot" style={{ background: color }} />
      {label}
    </div>
  );
}
