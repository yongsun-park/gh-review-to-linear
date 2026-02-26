# gh-review-to-linear

GitHub PR 리뷰 요청을 자동으로 Linear 이슈로 생성하는 CLI 도구.

## 요구사항

- Node.js 18+
- [gh CLI](https://cli.github.com/) (`gh auth login` 완료)
- [Linear API key](https://linear.app/settings/api)

## 설정

```bash
npm install
node setup.js
```

`setup.js`가 인터랙티브하게 `.env` 파일을 생성합니다. 수동으로 `.env.example`을 복사해서 작성해도 됩니다.

## 사용

```bash
# 수동 실행
node index.js

# 또는
npm start
```

## 자동 스케줄러

### macOS (launchd)

```bash
bash schedulers/install-mac.sh         # 기본 30분 간격
bash schedulers/install-mac.sh 900     # 15분 간격 (초 단위)
```

### Windows (Task Scheduler)

```powershell
powershell -ExecutionPolicy Bypass -File schedulers\install-windows.ps1
powershell -ExecutionPolicy Bypass -File schedulers\install-windows.ps1 -IntervalMinutes 15
```

## 동작 방식

1. `gh search prs --review-requested=@me --state=open` 으로 리뷰 요청된 PR 목록 조회
2. 각 PR URL로 Linear에서 기존 이슈 검색 (중복 방지)
3. 없으면 지정된 팀 + 라벨로 Linear 이슈 생성

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `LINEAR_API_KEY` | O | Linear API 키 |
| `LINEAR_TEAM_KEY` | O | Linear 팀 키 (예: `ENG`) |
| `LINEAR_LABEL_NAME` | X | 이슈에 붙일 라벨 (기본값: `review`) |
