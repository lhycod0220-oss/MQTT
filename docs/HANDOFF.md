# 인수인계 메모

대시보드 작성 시점의 원본 인수인계 메모입니다. 저장소 배치에 관한 항목은 이번
PR에서 `dashboard/` 디렉터리 방식으로 반영했습니다 (아래 "전달 형태" 참고).

## 전달 형태

같은 저장소 안 `dashboard/` 를 택했습니다. 백엔드와 API 계약을 자주 맞춰야 하는
프로젝트라, 이슈·PR에서 백엔드 변경과 화면 변경을 한 번에 볼 수 있는 쪽이 유리
합니다.

- 백엔드 담당자에게는 `docs/API-CONTRACT.md` 를 이슈 본문으로 그대로 붙여
  넣으세요. 우선순위 표까지 포함되어 있습니다.
- 디자인 근거가 필요하면 Claude Design 캔버스 링크를 함께 첨부하세요.

## 백엔드와 합의해야 할 것 (연동 전)

`docs/API-CONTRACT.md` 의 "합의 필요" 표와 동일합니다:

1. 타임스탬프 포맷 (ISO 8601 + 오프셋)
2. 가스 저항 단위 (Ω 전송 / kΩ 표시)
3. `power.csv` 에 `msg_id` 추가 여부 — 로그 테이블 조인 키
4. `/api/v1/stats/summary` 의 window 정의: 세션 기준인지 시각 기준인지
5. baseline(Node 2) 데이터 적재 방식: MQTT subscribe vs 별도 수집기

## 구현 메모

- 데이터 소스 추상화는 `src/lib/dataSource/types.ts` 의 `TelemetrySource`
  인터페이스 하나로 되어 있습니다. `mockSource.ts` 와 `httpSource.ts` 가 이를
  각각 구현하고, `index.ts` 가 `VITE_DATA_SOURCE` 값으로 둘 중 하나를 고릅니다.
  기본값은 `mock` — 백엔드 없이도 화면이 전부 동작합니다.
- 런타임 의존성은 의도적으로 3개(`react`, `react-dom`, `react-router-dom`)만
  유지했습니다. 차트는 별도 라이브러리 없이 SVG로 직접 그렸습니다
  (`src/components/charts/`). 의존성을 추가하기 전에 정말 필요한지 한 번 더
  검토해 주세요.
- `dashboard/.gitignore` 에 `!src/lib/` 규칙을 넣었습니다. 상위 저장소에서
  Python 빌드용으로 `lib/` 를 무시하는 경우 `src/lib/` 소스가 조용히 누락되는
  것을 막기 위함입니다.

## 참고

펌웨어 3종 빌드 타깃(`main_standard_MQTT.cpp`, `main_monitor.cpp`,
`main_gingerbread.cpp`)을 노드 타입으로 매핑했습니다. 실제 노드 이름/역할이
다르면 `mockSource.ts` 상단의 `NODES` 배열과 `src/lib/format.ts` 의
`FIRMWARE_LABEL` / `FIRMWARE_COLOR` 만 고치면 됩니다.
