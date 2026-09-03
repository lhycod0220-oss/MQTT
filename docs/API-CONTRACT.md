# API Contract — 대시보드 ↔ 백엔드

이 문서는 `dashboard/`(React + TS + Vite) 가 `VITE_DATA_SOURCE=http` 로 동작할 때
기대하는 REST / WebSocket 계약입니다. 프론트엔드는 `src/lib/dataSource/httpSource.ts`
한 파일에서만 이 계약을 호출하므로, 경로나 필드명이 바뀌어도 화면 코드는 건드릴 필요가
없습니다.

타입 정의 원본: `src/lib/dataSource/types.ts`

## 합의 필요 (연동 전 확정 항목)

우선순위 순으로 정리했습니다. 이 표가 미확정 상태에서도 프론트는 `mock` 소스로 전부
동작하므로, 백엔드 작업과 병렬로 진행 가능합니다.

| # | 항목 | 프론트 제안 | 비고 |
|---|------|------------|------|
| 1 | 타임스탬프 포맷 | ISO 8601 + 오프셋 (`2026-09-03T10:41:07+09:00`) | 모든 엔드포인트 공통 |
| 2 | 가스 저항 단위 | 전송: Ω(정수) / 표시: kΩ | 변환은 프론트에서 수행 (`src/lib/format.ts`) |
| 3 | `power.csv` 의 `msg_id` | 조인 키로 추가 권장 | 없을 경우 `msgId` 필드를 생략 — 프론트는 이미 optional 로 처리함 |
| 4 | `/api/v1/stats/summary` 의 window 정의 | 세션 기준 / 시각 기준 중 응답에 `window_kind` 로 명시 | 프론트 타입은 `"session" \| "time"` 둘 다 지원 |
| 5 | baseline(Node 2) 적재 방식 | MQTT subscribe vs 별도 수집기 | `GET /api/v1/nodes` 응답의 `ingest_path` 로 노출 요청 |

## 엔드포인트

### `GET /api/v1/nodes`
등록된 노드 목록. → `NodeInfo[]`
```json
[{ "node_id": "node-01", "name": "Standard MQTT", "firmware": "standard_mqtt",
   "role": "primary", "ingest_path": "mqtt" }]
```
`firmware` 값: `standard_mqtt` | `monitor` | `gingerbread` (펌웨어 3종 빌드 타깃과 대응)

### `GET /api/v1/nodes/{node_id}/telemetry/latest`
최신 샘플 1건. 데이터 없으면 `404`.

### `GET /api/v1/nodes/{node_id}/telemetry?limit=N`
최근 N개 샘플, 시간 오름차순. → `TelemetrySample[]`
```json
{ "msg_id": 1042, "node_id": "node-01", "timestamp": "...",
  "temperature_c": 23.4, "humidity_pct": 46.1, "pressure_hpa": 1013.2,
  "gas_resistance_ohm": 95000, "rssi_dbm": -61, "battery_v": 4.03, "uptime_s": 18422 }
```

### WebSocket `{VITE_WS_URL}?node_id={node_id}`
`websocket_controller.py` 대응. 연결 후 서버가 `TelemetrySample` JSON 을 push.
프론트는 노드별로 소켓을 열고, 구독자가 없어지면 닫습니다.

### `GET /api/v1/sessions?node_id={optional}`
`GET /api/v1/sessions/{session_id}`
→ `SessionSummary[]` / `SessionSummary | 404`
```json
{ "session_id": "sess-...", "node_id": "node-01", "protocol": "mqtt", "qos": 1,
  "status": "running", "started_at": "...", "ended_at": null,
  "sample_count": 1260, "dropped_count": 3, "note": "" }
```
`status`: `running` | `completed` | `error` | `aborted`

### `GET /api/v1/nodes/{node_id}/power?limit=N`
→ `PowerSample[]` (`power.csv` 기반). `msg_id` 는 항목 3 확정 전까지 optional.

### `GET /api/v1/nodes/{node_id}/protocol-stats`
`qos_handler.py` / `packet_parser.py` / `udp_listener.py` 집계.
```json
{ "node_id": "node-01", "window_label": "최근 1시간", "delivered": 1400,
  "duplicate": 2, "out_of_order": 1, "parse_errors": 0,
  "avg_latency_ms": 62, "last_qos": 1 }
```

### `GET /api/v1/stats/summary?node_id={id}`
항목 4 참고. `window_kind` 필드 추가 요청.

### `GET /api/v1/nodes/{node_id}/config`
`PATCH /api/v1/nodes/{node_id}/config` (body: 변경할 필드만)
→ `NodeConfig`
```json
{ "node_id": "node-01", "report_interval_s": 2, "gas_baseline_ohm": 95000,
  "temp_warn_c": 30, "humidity_warn_pct": 70,
  "mqtt_topic": "nodes/node-01/telemetry", "qos": 1 }
```

### `GET /api/v1/nodes/{node_id}/control`
`POST /api/v1/nodes/{node_id}/control` (body: `{ "kind": ..., "payload": {...} }`)
→ `ControlCommand[]` / `ControlCommand`
`kind`: `set_report_interval` | `reboot` | `recalibrate_gas_baseline` | `toggle_relay`
`ack_status`: `pending` | `acked` | `failed`

## 필드 네이밍

위 예시는 백엔드 관례에 맞춰 `snake_case` 로 적었습니다. 프론트는 `camelCase` 타입을
쓰므로, 응답을 그대로 매핑하려면 `httpSource.ts` 에 변환 레이어를 추가하거나(권장),
백엔드가 이미 camelCase 로 응답하도록 맞춰도 됩니다 — 어느 쪽이든 이슈에서 먼저
합의해 주세요.
