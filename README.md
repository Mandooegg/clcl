# 🏗️ SITE-MASTER

건설 현장의 **시공 진행·발주·검수·현장 정보**를 한 화면에서 관리하는 경량 웹앱.
단일 `index.html` 파일로 구성되어 있어 **정적 호스팅만으로 바로 배포**됩니다.

![version](https://img.shields.io/badge/version-2.3-blue)
![license](https://img.shields.io/badge/license-MIT-green)

---

## ✨ 주요 기능

| 영역 | 기능 |
|---|---|
| **대시보드** | 현장·동수·완료율·미확인 알림 요약 |
| **3D 시공현황** | Three.js 기반 뷰어, 태양 위치 시뮬레이션, 미니맵, 드래그 배치 편집 |
| **시공현황 테이블** | 층·호수별 상태 토글, 엑셀 ↑/↓ |
| **동 설정** | 판상형·타워형·복도형·혼합형·ㄱ자형·ㄷ자형 지원, 최대 50동 |
| **발주 관리** | N층 완료 시 자동 알림 → 발주 워크플로 (준비 → 의뢰서 → 입찰 → 발주완료) |
| **공장검수/테스트** | 검수 항목 등록·상태 추적 |
| **공지사항** | 긴급/일반, 현장별 타겟팅, 읽음 처리 |
| **관리자** | 현장 생성·삭제·수정, 담당자 역할/현장 배정, 조직 초대 코드 |
| **마스코트** | 상황별 반응 UI (저장·오류·알림·유휴) |

---

## 🚀 빠른 시작

### 옵션 A — 로컬 오프라인 (Firebase 불필요)

1. `index.html` 파일을 브라우저에서 열기 (또는 간단한 HTTP 서버 권장)
   ```bash
   # Python 3
   python -m http.server 8080
   # → http://localhost:8080
   ```
2. **로컬(오프라인)** 탭에서 데모 계정으로 로그인
   - `admin` / `1234` (관리자)
   - `manager1` / `1234` (세종시)
   - `manager2` / `1234` (대전)

> ⚠️ **운영 배포 전** `index.html`의 `iDB()` 함수에서 데모 계정을 반드시 제거하세요.

### 옵션 B — 클라우드 (Firebase)

다음 §Firebase 설정 참조 후 `FIREBASE_CONFIG` 채우고 배포하면 됩니다.

---

## 🔥 Firebase 설정 (클라우드 모드)

### 1. 프로젝트 생성
1. https://console.firebase.google.com 접속 → **프로젝트 추가**
2. Authentication → **시작하기** → **이메일/비밀번호** 활성화
3. Firestore Database → **데이터베이스 만들기** → 프로덕션 모드로 시작

### 2. 웹 앱 등록 & 설정 복사
프로젝트 설정 → **내 앱** → 웹(`</>`) 추가 → 나타나는 `firebaseConfig` 값을 복사해서
`index.html` 상단의 `FIREBASE_CONFIG`를 교체합니다.

```js
// index.html 내부
var FIREBASE_CONFIG={
  apiKey:'AIzaSy...',                         // ← 실제 값으로 교체
  authDomain:'my-project.firebaseapp.com',
  projectId:'my-project',
  storageBucket:'my-project.appspot.com',
  messagingSenderId:'1234567890',
  appId:'1:1234567890:web:abc...'
};
```

> Firebase 웹 apiKey는 공개되어도 괜찮습니다. **실제 방어선은 Firestore 보안 규칙**입니다.

### 3. ⚠️ Firestore 보안 규칙 (필수!)

Firebase 콘솔 → Firestore → **규칙** 탭에 아래 규칙을 붙여넣고 **게시**:

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isSignedIn() { return request.auth != null; }
    function myProfile() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data;
    }
    function myOrg() { return myProfile().orgId; }
    function myRole() { return myProfile().role; }

    // 사용자 문서 — 본인 또는 같은 조직 관리자만
    match /users/{uid} {
      allow read: if isSignedIn() &&
                  (request.auth.uid == uid ||
                   resource.data.orgId == myOrg());
      allow create: if request.auth.uid == uid;
      allow update: if request.auth.uid == uid ||
                    (myRole() == 'admin' && resource.data.orgId == myOrg());
      allow delete: if false;
    }

    // 조직 문서 — 가입 시 orgCode 조회 위해 list 허용,
    // read/write는 본인 조직만
    match /organizations/{oid} {
      allow read, list: if isSignedIn();
      allow create: if isSignedIn();
      allow update, delete: if isSignedIn() && myRole() == 'admin' && myOrg() == oid;
    }

    // 조직 하위 데이터 — 같은 조직만 접근
    match /orgs/{oid}/{col}/{doc} {
      allow read: if isSignedIn() && myOrg() == oid;
      allow write: if isSignedIn() && myOrg() == oid &&
                   (col != 'procRules' || myRole() == 'admin') &&
                   (col != 'announcements' || myRole() == 'admin' ||
                    request.resource.data.createdBy == request.auth.uid);
    }
  }
}
```

### 4. Firebase Auth 승인 도메인 추가
Authentication → **설정** → **승인된 도메인** 에
- `localhost` (개발용, 기본 포함)
- `<your-github-username>.github.io` (GitHub Pages 배포 시)
- 커스텀 도메인이 있다면 추가

를 등록해야 로그인이 작동합니다.

---

## 🌐 GitHub Pages 배포

### 1. 저장소 생성 & 파일 업로드
```bash
git init
git add index.html MASTERPLAN.md README.md
git commit -m "Initial: SITE-MASTER v2.3"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

### 2. Pages 활성화
GitHub 저장소 → **Settings** → **Pages**
- Source: `main` 브랜치 / `/ (root)`
- 저장 후 몇 분 뒤 `https://<your-username>.github.io/<repo-name>/` 접속

### 3. ⚠️ 중요
- **Public 저장소**: 소스가 모두 공개되므로 `iDB()` 안의 데모 계정 비밀번호를 반드시 제거하세요.
- `FIREBASE_CONFIG` 공개 OK, 단 보안 규칙이 반드시 배포되어 있어야 함.
- Firebase Auth **승인 도메인**에 `<username>.github.io` 추가 필수.

> **대안**: Private 저장소가 필요하면 **Firebase Hosting**을 사용하세요 (무료, 같은 도메인).
> ```bash
> npm i -g firebase-tools
> firebase login
> firebase init hosting     # public 디렉터리에 index.html 배치
> firebase deploy
> ```

---

## 📖 사용 매뉴얼

### 처음 조직 만들기 (관리자)
1. 클라우드 탭에서 **회원가입** 클릭
2. **🏢 처음이에요 (새 조직)** 선택, 조직명 입력 → 가입
3. 발송된 **인증 메일의 링크 클릭** → 다시 돌아와 로그인
4. **관리자 → 담당자 배정** 메뉴에서 **조직 초대 코드** 확인 → 팀원에게 공유

### 팀원 참여 (현장담당)
1. 관리자에게 받은 **6자리 조직 코드**로 가입
2. **🔗 초대받았어요 (코드)** 선택 → 코드 입력 → 가입
3. 인증 메일 확인 후 로그인
4. 관리자가 **현장을 배정**해야 해당 현장 데이터가 보입니다

### 현장 만들기 (관리자)
- 좌측 메뉴 **관리자 → 현장 생성/관리 → + 현장 추가**
- 현장명·위치·위도/경도·면적·착공일 등을 입력
- 위도/경도는 3D 뷰의 태양 시뮬레이션 정확도에 영향 (대한민국 기준: 위도 33~38, 경도 124~132)

### 동 추가
- **동 설정** 메뉴 → **+ 동 추가**
- 동 번호·이름·지하·지상·호수 입력
- **건물 형태** 선택 (판상형은 일자 배치, 타워형은 2열 배치 등)
- **X·Z 위치**와 **회전**으로 배치 — 나중에 3D 뷰에서 드래그로도 수정 가능

### 시공 진행 체크
- **3D 시공현황**에서 호수를 **탭하면** `준비중 → 시공중 → 완료` 순환
- 또는 **시공현황** 테이블에서 셀 클릭
- 엑셀 ↑ 업로드로 대량 반영 가능 (시트명 = 동 이름)

### 발주 자동 알림
1. **발주 설정**에서 규칙 추가 (예: 5층 완료 시 철근 발주, 리드타임 7일)
2. 해당 층이 전 호수 완료되면 **발주 알림**에 자동 등록
3. 알림 → **발주** 버튼 → 발주 현황에서 단계별 진행

---

## 🧪 브라우저 지원

| 브라우저 | 상태 |
|---|---|
| Chrome 120+ | ✅ |
| Edge 120+ | ✅ |
| Safari 16+ | ✅ |
| Firefox 115+ | ✅ |
| iOS Safari 16+ | ✅ |
| Samsung Internet 22+ | ✅ |
| IE 11 | ❌ 미지원 |

Three.js·WebGL 지원이 필요합니다. 3D 뷰어가 실패하면 다른 기능은 정상 작동합니다.

---

## ⚠️ 알려진 제한사항 (v2.3)

- `_doCloudSave()`는 **전체 데이터 덤프** 후 Firestore에 merge write → 동시 편집 시 덮어쓰기 위험. v3에서 변경분만 write로 개선 예정.
- 실시간 동기화는 **알림·공지만** 반영. 시공현황·건물 변경은 **새로고침 전까지 미반영**.
- 오프라인 캐시 (Service Worker) 미구현. CDN이 내려가면 3D·엑셀 기능 일시 정지.
- Firestore 문서 크기 1MB 제한 — 한 현장 당 **동 50개, 층 50개, 호수 6개**까지는 안전.

---

## 🔧 개발 가이드

### 로컬 개발
```bash
# HTTP 서버 (CORS·localStorage 정상 동작 위해 필수)
python -m http.server 8080
# 또는
npx serve .
```

`file://` 경로로 열어도 일부 동작하나, 3D CDN과 Firebase가 제대로 로드되지 않을 수 있습니다.

### 데이터 초기화
브라우저 DevTools → Application → Local Storage → `sitemaster_db_v2` 삭제 후 새로고침.

### Firestore 에뮬레이터 (권장)
```bash
npm i -g firebase-tools
firebase init emulators  # Auth, Firestore 선택
firebase emulators:start
```
개발 중에는 `FIREBASE_CONFIG` 대신 에뮬레이터에 연결해 실 비용 없이 테스트할 수 있습니다.

---

## 📂 파일 구조

```
.
├─ index.html              ← HTML shell (250줄, 마크업 + 모달)
├─ styles.css              ← 모든 스타일
├─ scripts/
│  ├─ config.js            ← 상수 + FIREBASE_CONFIG
│  ├─ store.js             ← localStorage 레이어 (iDB/gDB/sDB)
│  ├─ utils.js             ← esc/toast/modal/popSel/addHist
│  ├─ mascot.js            ← 마스코트 SVG + 반응
│  ├─ firebase.js          ← 인증·동기화·실시간·공지
│  ├─ auth.js              ← 로컬 로그인 + 전역 상태 + nav
│  ├─ viewer3d.js          ← Three.js 3D 뷰어
│  ├─ pages.js             ← 페이지 렌더러 9종
│  └─ main.js              ← 엔트리 + CDN 지연 로드
├─ README.md               ← 이 파일
├─ MASTERPLAN.md           ← 로드맵 & 아키텍처
└─ index.backup.html       ← 분리 전 원본 (.gitignore 제외)
```

로드 순서는 `index.html` 하단 `<script>` 태그 순서대로입니다.
추가 분리 계획은 `MASTERPLAN.md` §4 Phase 2 참조.

---

## 🤝 기여

1. 이슈 먼저 등록해서 방향 합의
2. 기능 브랜치 (`feature/xxx`) → PR
3. 코드 스타일: 현재는 `var` + inline 스타일 혼재. v3 리팩토링 이후 `let`/`const` + 모듈 분리 기준 정립 예정.

---

## 📄 라이선스

MIT License. 자유롭게 사용·수정·배포 가능합니다.

---

## 🙋 문의

- 버그/제안: GitHub Issues
- 전체 설계 문서: [`MASTERPLAN.md`](./MASTERPLAN.md)
