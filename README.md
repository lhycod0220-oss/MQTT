# 노드 대시보드

운영 · 실험 · 프로토콜을 한 화면에서 보는 대시보드입니다. React + TypeScript +
Vite로 작성했고, 런타임 의존성은 3개(`react`, `react-dom`, `react-router-dom`)뿐입니다.

데이터 소스 추상화(`TelemetrySource`)로 `mock` ↔ `http` 를 환경 변수 하나로
전환합니다. 기본값이 `mock` 이라 **백엔드 없이도 화면이 전부 동작**합니다.
백엔드 요청 사항은 [`docs/API-CONTRACT.md`](./docs/API-CONTRACT.md) 에 정리되어
있습니다.

## 실행 방법

```bash
cd dashboard
npm install
npm run dev
```

Vite 개발 서버가 뜨면 터미널에 출력된 로컬 주소(기본 `http://localhost:5173`)로
접속하세요.

실제 API에 붙이려면 `.env.example` 을 `.env` 로 복사한 뒤
`VITE_DATA_SOURCE=http` 로 바꾸고 `VITE_API_BASE_URL`, `VITE_WS_URL` 을 게이트웨이
주소로 지정하세요.

## 화면 구성

| 경로 | 내용 |
|------|------|
| `/overview` | 전체 노드 상태 요약, 최근 세션 |
| `/telemetry/:nodeId` | 온도·습도·가스저항·기압·RSSI·배터리 실시간 차트 |
| `/sessions`, `/sessions/:sessionId` | 세션 이력, 드롭률 |
| `/power/:nodeId` | 전압/전류/전력, 배터리 추정치 |
| `/protocol` | QoS / 중복·순서어긋남·파싱오류 집계 |
| `/control/:nodeId` | 노드 원격 명령 (보고 주기, 재보정, 릴레이, 재부팅) |
| `/config/:nodeId` | 노드별 파라미터 편집 |

## 그 밖의 스크립트

| 명령 | 설명 |
|------|------|
| `npm run build` | 타입 체크 후 프로덕션 번들 생성 |
| `npm run preview` | 빌드 결과 로컬 미리보기 |
| `npm run typecheck` | 타입 체크만 수행 |

## 인수인계 메모

대시보드 작성 시점의 원본 인수인계 메모는 [`docs/HANDOFF.md`](./docs/HANDOFF.md)
에 있습니다.
