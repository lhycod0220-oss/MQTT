import type { SessionSummary } from "@/lib/dataSource/types";

const STATUS_MAP: Record<SessionSummary["status"], { label: string; color: string }> = {
  running: { label: "진행 중", color: "var(--signal-green)" },
  completed: { label: "완료", color: "var(--text-secondary)" },
  error: { label: "오류", color: "var(--signal-red)" },
  aborted: { label: "중단됨", color: "var(--signal-amber)" },
};

export function StatusTag({ status }: { status: SessionSummary["status"] }) {
  const cfg = STATUS_MAP[status];
  return (
    <span className="tag">
      <span className={status === "running" ? "dot dot-pulse" : "dot"} style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}
