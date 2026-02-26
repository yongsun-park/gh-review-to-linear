# gh-review-to-linear

GitHub에서 나에게 리뷰 요청된 PR을 자동으로 Linear 이슈로 생성하는 CLI 도구.

## 동작 방식

```
gh search prs --review-requested=@me --state=open
        │
        ▼
  PR 목록 수집
        │
        ▼
  Linear에서 PR URL로 기존 이슈 검색 (중복 방지)
        │
        ├─ 이미 존재 → skip
        │
        └─ 없음 → Linear 이슈 생성
                   (지정 팀 + "review" 라벨)
```

## 요구사항

- **Node.js 18+** (native fetch 사용)
- **[gh CLI](https://cli.github.com/)** — `gh auth login` 완료 상태
- **[Linear API key](https://linear.app/settings/api)**

## 설치

```bash
git clone git@github.com:yongsun-park/gh-review-to-linear.git
cd gh-review-to-linear
npm install
```

## 설정

### 방법 1: 인터랙티브 설정

```bash
node setup.js
```

Linear API key, 팀 키, 라벨 이름을 입력하면 `.env` 파일이 생성됩니다.

### 방법 2: 수동 설정

```bash
cp .env.example .env
```

`.env` 파일을 열어서 값을 채워넣으면 됩니다.

### 환경 변수

| 변수 | 필수 | 설명 |
|------|:----:|------|
| `LINEAR_API_KEY` | O | Linear API 키 (`lin_api_...`) |
| `LINEAR_TEAM_KEY` | O | Linear 팀 키 (예: `ENG`, `DEV`) |
| `LINEAR_LABEL_NAME` | X | 이슈에 붙일 라벨 (기본값: `review`) |

## 사용

```bash
node index.js
```

```
Fetching PR review requests...
Found 3 PR(s) requesting your review.
  created: ENG-142 — Review: org/repo#45 — Add auth middleware
  created: ENG-143 — Review: org/repo#52 — Fix pagination bug
  skip: org/other-repo#10 (already tracked)

Done. Created: 2, Skipped: 1
```

재실행해도 이미 생성된 이슈는 중복 생성되지 않습니다.

## 자동 스케줄러

### macOS (launchd)

```bash
bash schedulers/install-mac.sh         # 기본 30분 간격
bash schedulers/install-mac.sh 900     # 15분 간격 (초 단위)
```

로그는 `~/Library/Logs/gh-review-to-linear/`에 저장됩니다.

제거:

```bash
launchctl unload ~/Library/LaunchAgents/com.gh-review-to-linear.plist
rm ~/Library/LaunchAgents/com.gh-review-to-linear.plist
```

### Windows (Task Scheduler)

```powershell
powershell -ExecutionPolicy Bypass -File schedulers\install-windows.ps1
powershell -ExecutionPolicy Bypass -File schedulers\install-windows.ps1 -IntervalMinutes 15
```

제거:

```powershell
Unregister-ScheduledTask -TaskName 'gh-review-to-linear' -Confirm:$false
```

## 프로젝트 구조

```
gh-review-to-linear/
├── index.js              ← 메인 실행
├── lib/
│   ├── config.js         ← .env 로딩 및 검증
│   ├── github.js         ← gh CLI로 PR 조회 (execFile)
│   └── linear.js         ← Linear GraphQL API
├── setup.js              ← 인터랙티브 초기 설정
├── schedulers/
│   ├── install-mac.sh    ← macOS launchd 등록
│   └── install-windows.ps1 ← Windows Task Scheduler 등록
├── package.json
├── .env.example
└── .gitignore
```

## 기술 결정

- **ESM** (`"type": "module"`) — 모던 Node.js 스타일
- **의존성 최소화** — `dotenv`만 사용
- **`execFile`** — shell injection 방지를 위해 `exec` 대신 사용
- **중복 방지** — Linear 이슈 description에 PR URL 포함 → `searchIssues`로 확인
