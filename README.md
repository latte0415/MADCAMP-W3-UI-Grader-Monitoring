# 그래프 구축 모니터링 페이지

`start_graph_building` 함수의 실행 상태를 실시간으로 모니터링할 수 있는 웹페이지입니다.

## 기능

### 1. Run 정보
- Run ID, 상태 (running/completed/failed/stopped)
- Target URL, Start URL
- 생성 시간, 완료 시간
- 실행 시간

### 2. 통계 대시보드
- 노드 수 (총 개수)
- 엣지 수 (총 개수)
- 액션 타입별 분포 (click, fill, navigate 등)
- 엣지 성공/실패 비율
- Pending actions 수
- Run memory 키 수

### 3. 그래프 시각화
- 노드-엣지 관계 그래프
- 노드 클릭 시 URL 열기
- 엣지 색상으로 성공/실패 구분

### 4. 워커 상태 모니터링
- 전체 워커 통계 (대기 중, 지연, 처리 중)
- 워커 타입별 상태:
  - `process_node_worker`
  - `process_action_worker`
  - `process_pending_actions_worker`
- 특정 run_id와 관련된 워커 상태

### 5. 실시간 업데이트
- 3초 간격 자동 새로고침
- 자동 새로고침 토글

## 설치 및 실행

### 1. 의존성 설치

```bash
cd frontend
npm install
```

### 2. 환경 변수 설정 (선택사항)

`.env` 파일을 생성하여 API 서버 URL을 설정할 수 있습니다:

```env
VITE_API_BASE_URL=http://localhost:8000
```

기본값은 `http://localhost:8000`입니다.

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` (또는 표시된 포트)로 접속하세요.

### 4. 빌드

프로덕션 빌드:

```bash
npm run build
```

빌드된 파일은 `dist` 폴더에 생성됩니다.

## 사용 방법

1. 웹페이지에 접속합니다.
2. 상단의 입력 필드에 Run ID를 입력하고 "조회" 버튼을 클릭합니다.
3. 모니터링 데이터가 자동으로 표시됩니다.
4. "자동 새로고침" 체크박스를 통해 실시간 업데이트를 제어할 수 있습니다.

## 기술 스택

- **React** - UI 프레임워크
- **Vite** - 빌드 도구
- **Axios** - HTTP 클라이언트
- **Cytoscape.js** - 그래프 시각화
- **Recharts** - 차트 라이브러리

## API 엔드포인트

Backend API 서버가 다음 엔드포인트를 제공해야 합니다:

- `GET /api/runs/{run_id}/monitor` - 모니터링 통계 데이터
- `GET /api/runs/{run_id}/graph` - 그래프 구조 데이터
- `GET /api/workers/status` - 전체 워커 상태
- `GET /api/workers/status/{run_id}` - 특정 run_id 관련 워커 상태

## 문제 해결

### CORS 오류
Backend 서버에서 CORS가 활성화되어 있는지 확인하세요. `backend/main.py`에서 CORS 미들웨어가 설정되어 있어야 합니다.

### 데이터가 표시되지 않음
1. Backend API 서버가 실행 중인지 확인하세요.
2. 브라우저 개발자 도구의 Network 탭에서 API 호출이 성공하는지 확인하세요.
3. Run ID가 올바른지 확인하세요.
