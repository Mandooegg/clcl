"use strict";
// ===== SITE-MASTER v2.3 =====
// ===== 상수 (상태/라벨/색상/형태) + Firebase 설정 =====

// 시공 상태
var SC=['pending','inprogress','complete'];
var SL={pending:'준비중',inprogress:'시공중',complete:'시공완료'};
var SH={pending:0x64748b,inprogress:0xf59e0b,complete:0x3b82f6};

// 발주 단계
var PS=['ready','request','bidding','bidcomplete','ordered'];
var PL={ready:'발주준비',request:'의뢰서상신',bidding:'입찰예정',bidcomplete:'입찰완료',ordered:'발주완료'};

// 건물 형태
var TN={plate:'판상형',tower:'타워형',corridor:'복도형',mixed:'혼합형',lshape:'ㄱ자형',ushape:'ㄷ자형'};
var TI={plate:'🏢',tower:'🏙️',corridor:'🏨',mixed:'🏗️',lshape:'🔲',ushape:'🔳'};

// 검수 상태
var ISL={scheduled:'예정',inprogress:'진행중',pass:'합격',fail:'불합격',retest:'재검수'};
var ISI={scheduled:'📅',inprogress:'🔄',pass:'✅',fail:'❌',retest:'🔁'};

// 현장 최대 개수
var MAX_SITES=40;

// ===== FIREBASE CONFIG =====
// Firebase 콘솔(console.firebase.google.com)에서 복사하세요
var FIREBASE_CONFIG={
  apiKey:'YOUR_FIREBASE_API_KEY',
  authDomain:'YOUR_PROJECT_ID.firebaseapp.com',
  projectId:'YOUR_PROJECT_ID',
  storageBucket:'YOUR_PROJECT_ID.appspot.com',
  messagingSenderId:'YOUR_MESSAGING_SENDER_ID',
  appId:'YOUR_APP_ID'
};

// Firebase 런타임 상태
var FB_AUTH=null;
var FB_DB=null;
var FB_USER=null;
var USE_CLOUD=false;
var CU_ORG_ID=null;

function isFirebaseConfigured(){return FIREBASE_CONFIG.apiKey!=='YOUR_FIREBASE_API_KEY';}

// 로그인 모드 스위처
function switchLoginMode(mode){
  document.getElementById('loginCloud').style.display=mode==='cloud'?'block':'none';
  document.getElementById('loginLocal').style.display=mode==='local'?'block':'none';
  document.getElementById('tabCloud').style.background=mode==='cloud'?'rgba(59,130,246,.15)':'var(--bg1)';
  document.getElementById('tabCloud').style.color=mode==='cloud'?'var(--blue)':'var(--t3)';
  document.getElementById('tabLocal').style.background=mode==='local'?'rgba(59,130,246,.15)':'var(--bg1)';
  document.getElementById('tabLocal').style.color=mode==='local'?'var(--blue)':'var(--t3)';
  if(mode==='cloud'&&!isFirebaseConfigured()){
    document.getElementById('cloudStatus').innerHTML='<span style="color:var(--amber)">Firebase 미설정</span><br><span style="font-size:10px">scripts/config.js 상단의 FIREBASE_CONFIG를 설정하세요.</span>';
  }
}
