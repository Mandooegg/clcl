# SITE-MASTER 마스터 플랜

> 건설현장 통합 관리 웹앱 · 현재 버전 **v2.3** · 단일 `index.html` 구성

---

## 1. 비전

건설 현장의 **시공 진행·발주·검수·현장 정보**를 한 화면에서 추적하고, 관리자·현장담당자가 **모바일/PC에서 동일하게** 협업하는 경량 SaaS를 만든다. 복잡한 서버/빌드 없이 **정적 호스팅 + Firebase**만으로 중소 건설사가 바로 쓸 수 있어야 한다.

---

## 2. 현재 상태 (스냅샷)

| 항목 | 상태 |
|---|---|
| 런타임 | 단일 `index.html` (≈1,400 lines) — HTML + inline CSS + inline JS |
| 저장소 | 로컬: `localStorage`, 클라우드: Firebase Firestore |
| 인증 | Firebase Auth (이메일/비밀번호) + 로컬 데모 계정 |
| 실시간 | Firestore `onSnapshot` — 알림·공지만 |
| 3D | Three.js (CDN r128) |
| 엑셀 | SheetJS (CDN 0.18.5) |
| 배포 | 미배포 (GitHub Pages 예정) |

### 지원 기능
- 대시보드 · 공지사항 · 현장정보
- 3D 시공현황 뷰어 (태양 시뮬레이션, 미니맵, 배치 편집)
- 시공현황 테이블 (엑셀 ↑/↓)
- 동 설정 (판상형·타워형·복도형·혼합형·ㄱ자형·ㄷ자형)
- 발주 알림 / 발주 설정 / 발주 현황
- 공장검수 / 테스트
- 현장 관리 (관리자 전용)
- 담당자 배정 (관리자 전용)
- 수정이력
- 마스코트 반응형 UI

---

## 3. 아키텍처 방향

### 3.1 현재 (v2.3)

```
┌─────────────────────────────────────────┐
│  index.html  (HTML + CSS + JS 일체형)   │
│  ├─ FIREBASE_CONFIG (하드코딩)          │
│  ├─ iDB()/gDB()/sDB()  (로컬)           │
│  ├─ cloudLogin/Signup  (Firebase Auth)  │
│  ├─ loadCloudData/saveToCloud (전체덤프)│
│  ├─ onSnapshot (alerts, announcements)  │
│  └─ Three.js / XLSX (CDN 동적로드)      │
└─────────────────────────────────────────┘
         │
         ▼
┌────────────────────────────┐   ┌────────────┐
│ Firebase Auth              │   │ localStorage│
│ Firestore                  │   │ (fallback) │
│   /organizations           │   └────────────┘
│   /users                   │
│   /orgs/{id}/sites         │
│   /orgs/{id}/buildings     │
│   /orgs/{id}/progress      │
│   /orgs/{id}/procRules     │
│   /orgs/{id}/procOrders    │
│   /orgs/{id}/alerts        │
│   /orgs/{id}/inspections   │
│   /orgs/{id}/announcements │
│   /orgs/{id}/noticeReads   │
│   /orgs/{id}/editHistory   │
│   /orgs/{id}/userStates    │
└────────────────────────────┘
```

### 3.2 목표 (v3.x)

```
src/
├─ index.html            ← 마크업 shell만 (200줄 이하)
├─ styles/
│   ├─ base.css
│   ├─ layout.css
│   ├─ components.css
│   └─ mascot.css
├─ scripts/
│   ├─ config.js         ← FIREBASE_CONFIG, 상수 (SC/SL/TN …)
│   ├─ utils/
│   │   ├─ dom.js        ← esc(), toast(), modal open/close
│   │   └─ idb.js        ← localStorage 레이어
│   ├─ auth/
│   │   ├─ firebase.js   ← 초기화, onAuthStateChanged
│   │   ├─ cloud.js      ← signup/login/reset
│   │   └─ local.js      ← 로컬 데모 로그인
│   ├─ data/
│   │   ├─ store.js      ← gDB/sDB/memDB
│   │   ├─ sync.js       ← loadCloudData, diff-based save
│   │   └─ realtime.js   ← onSnapshot 구독 관리
│   ├─ features/
│   │   ├─ dashboard.js
│   │   ├─ notice.js
│   │   ├─ site.js
│   │   ├─ progress.js
│   │   ├─ building.js
│   │   ├─ procurement.js
│   │   ├─ inspection.js
│   │   ├─ users.js
│   │   └─ history.js
│   ├─ viewer3d/
│   │   ├─ init.js
│   │   ├─ sun.js        ← 태양 위치 계산
│   │   ├─ layout.js     ← getUnitLayout
│   │   └─ minimap.js
│   └─ mascot.js
├─ assets/
│   ├─ favicon.svg
│   ├─ manifest.json
│   └─ sw.js             ← Service Worker (오프라인)
├─ firestore.rules       ← 보안 규칙 (GitHub에 올릴 것)
├─ README.md
└─ MASTERPLAN.md
```

ES Modules(`<script type="module">`)로 분리하면 **빌드 도구 없이** GitHub Pages에서도 그대로 동작한다.

---

## 4. 로드맵

### Phase 1 — 배포 준비 (1~2주)
- [x] 누락 심볼 복원 (`gDB/sDB/iDB/SC/SL/…`)
- [x] XSS escape (`esc()`) 적용
- [x] CSP 메타, favicon, manifest data-URL
- [x] 이메일 인증 강제
- [ ] **Firebase 프로젝트 생성 + `FIREBASE_CONFIG` 주입**
- [ ] **Firestore 보안 규칙 작성·배포** ← 가장 중요
- [ ] GitHub 저장소 생성 + GitHub Pages 활성화
- [ ] Firebase Auth 승인 도메인에 배포 URL 추가

### Phase 2 — 구조 리팩토링 (2~4주)
- [ ] 파일 분리 (위 3.2 트리 참조, ES Modules 기반)
- [ ] Service Worker · 오프라인 캐시
- [ ] CDN `integrity` 해시 / 로컬 번들 백업
- [ ] 단위 테스트 초기 세팅 (Vitest, 주요 유틸부터)

### Phase 3 — 데이터 아키텍처 개선 (1~2개월)
- [ ] `_doCloudSave` 전체 덤프 제거 → 변경분만 write
- [ ] 실시간 동기화 확대 (sites/buildings/progress)
- [ ] Optimistic update + 충돌 해결
- [ ] 활동 로그(editHistory) 서버 측 TTL
- [ ] 대용량 현장(>20동, >500세대) 성능 테스트

### Phase 4 — 기능 확장 (2~3개월)
- [ ] 도면 업로드 (Firebase Storage) + 3D 오버레이
- [ ] 사진 첨부 (검수·공지)
- [ ] CSV/PDF 보고서
- [ ] 모바일 푸시 알림 (FCM)
- [ ] 다국어 (i18n) — ko/en 우선

### Phase 5 — 엔터프라이즈 (장기)
- [ ] SSO (Google Workspace)
- [ ] 역할 세분화 (감리·발주처·협력사)
- [ ] 감사 로그 불변화
- [ ] SLA 대시보드

---

## 5. 보안 설계 원칙

1. **Firestore 보안 규칙이 유일한 방어선** — 프론트 가드는 UX용.
2. **조직 격리** — 모든 문서는 `orgId` 필드를 갖고, `request.auth.token.orgId == resource.data.orgId`로 검증.
3. **역할 분리** — `admin`만 가능한 작업(발주 설정·현장 생성·역할 변경)은 Firestore 규칙에서 차단.
4. **XSS** — 모든 사용자 입력은 `esc()`로 escape 후 innerHTML. (v2.3에서 완료)
5. **Auth 상태** — 이메일 인증 미완료 계정 접근 거부. (v2.3에서 완료)
6. **CSP** — `connect-src`를 Firebase 도메인으로 제한.
7. **비밀번호** — Firebase Auth 정책 6자 이상 강제, 운영에선 8자·복잡도 권장.

### Firestore 규칙 원칙 (v3에서 적용)

```
match /databases/{db}/documents {
  function isSignedIn() { return request.auth != null; }
  function myOrg() { return get(/databases/$(db)/documents/users/$(request.auth.uid)).data.orgId; }
  function myRole() { return get(/databases/$(db)/documents/users/$(request.auth.uid)).data.role; }

  match /users/{uid} {
    allow read: if isSignedIn() && resource.data.orgId == myOrg();
    allow create: if request.auth.uid == uid;
    allow update: if (request.auth.uid == uid)
                  || (myRole() == 'admin' && resource.data.orgId == myOrg());
  }

  match /organizations/{oid} {
    allow read: if isSignedIn() && myOrg() == oid;
    allow list: if isSignedIn(); // 조직 코드 가입 플로우 위해 list 허용 (orgCode만 노출)
  }

  match /orgs/{oid}/{col}/{doc} {
    allow read, write: if isSignedIn() && oid == myOrg()
                        && (col != 'procRules' || myRole() == 'admin');
  }
}
```

---

## 6. 성능 목표

| 지표 | 목표 |
|---|---|
| First Contentful Paint (4G) | ≤ 2.0s |
| 3D 뷰어 초기 렌더 | ≤ 1.5s |
| Firestore 초기 로드 (1현장) | ≤ 800ms |
| `saveToCloud` 평균 쓰기 | ≤ 10 docs/trigger (현재는 전체 덤프) |
| 번들 크기 (목표) | ≤ 120KB gzip (HTML+CSS+JS, CDN 제외) |
| 동시 편집 사용자 | 20명 이상 무충돌 |

---

## 7. 리스크 & 완화

| 리스크 | 영향 | 완화책 |
|---|---|---|
| Firestore 규칙 누락 | 전 조직 데이터 유출 | Phase 1에서 반드시 배포. Firebase Emulator로 테스트. |
| `_doCloudSave` 전체 덤프 | 비용·충돌 | Phase 3에서 diff-based로 교체. 그 전에는 사용량 모니터링. |
| 단일 HTML 규모 | 유지보수 난이도 | Phase 2 파일 분리. |
| CDN 가용성 | 서비스 중단 | `integrity` + 로컬 번들 fallback (Phase 2). |
| Firebase 프리 티어 한도 | 50 동시·50K read/일 | 사용량 알림 설정. 유료 전환 기준 문서화. |
| GitHub Pages = public repo | 로컬 데모 계정 노출 | 운영에서는 `iDB()` 데모 계정 삭제. |

---

## 8. 지표 정의

- **DAU/WAU** (Firebase Analytics)
- **현장당 평균 동수 · 세대수**
- **발주 알림 → 발주완료 평균 소요일**
- **검수 합격률**
- **오류율** (Sentry 도입 검토)

---

## 9. 바로 시작할 것 (Next 3 actions)

1. **Firebase 프로젝트 생성** → `FIREBASE_CONFIG` 값 `index.html:418` 업데이트
2. **Firestore 보안 규칙 배포** (위 §5 템플릿 기반)
3. **GitHub 저장소 push + Pages 활성화** → Auth 승인 도메인에 URL 추가

---

## 10. 참고

- Firebase Auth 문서: https://firebase.google.com/docs/auth
- Firestore 보안 규칙: https://firebase.google.com/docs/firestore/security/get-started
- Three.js: https://threejs.org/docs/
- GitHub Pages: https://pages.github.com/
