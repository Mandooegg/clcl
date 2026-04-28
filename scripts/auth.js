"use strict";
// ===== 로컬 인증 + 공통 앱 상태/네비게이션 =====
// 전역 상태 선언 (3D/뷰어 관련 변수 포함)
// doLogin/doLogout: 로컬 모드 로그인/로그아웃
// setup: 로그인 후 UI 초기화
// nav: 페이지 전환

// ===== 전역 앱 상태 =====
var CU=null,CP='dash',SBT='plate';

// 3D 뷰어 전역 상태 (viewer3d.js에서 사용)
var tS=null,tC=null,tR=null,tAF=null,ray,mse,bMs=[],editMode=false,groundMesh=null,selBldgId=null;
var rotY=.3,rotX=.5,dist=120,panX=0,panY=10,panZ=0,sunHour=10;
var _lastSunPos={alt:45,az:180};

// 현재 편집 중인 현장 ID (pages.js의 rInfo/saveSI에서 사용)
var ceSI=null;

// ===== 로컬 로그인 =====
function doLogin(){
  var id=document.getElementById('loginId').value.trim();
  var pw=document.getElementById('loginPw').value.trim();
  var d=gDB(),u=null;
  for(var i=0;i<d.users.length;i++){
    if(d.users[i].id===id&&d.users[i].pw===pw){u=d.users[i];break;}
  }
  if(!u){toast('로그인 실패','error');return;}
  CU={id:u.id,name:u.name,role:u.role,sites:u.sites,curSite:u.role==='admin'?'all':u.sites[0]};
  document.getElementById('LP').style.display='none';
  document.getElementById('AP').style.display='block';
  setup();
  toast(u.name+'님 환영합니다! 👷','success');
  setTimeout(function(){
    mascotReact('login');setMascotMood('love','jump');
    showMascotTip('여기 있어요! 👋',u.name+'님 반가워요! 저를 눌러보세요~');
  },800);
  resetIdleTimer();
}

function doLogout(){
  stopRealtime();
  // 승인 대기 구독 정리
  if(typeof _pendingUnsub!=='undefined'&&_pendingUnsub){try{_pendingUnsub();}catch(e){}_pendingUnsub=null;}
  if(USE_CLOUD&&FB_AUTH){FB_AUTH.signOut();FB_USER=null;USE_CLOUD=false;CU_ORG_ID=null;}
  CU=null;closeSB();
  // 대기/거절 화면 닫기
  var ps=document.getElementById('pendingScreen');if(ps)ps.style.display='none';
  var rs=document.getElementById('rejectedScreen');if(rs)rs.style.display='none';
  document.getElementById('LP').style.display='flex';
  document.getElementById('AP').style.display='none';
  var mf=document.getElementById('mascotFloat');if(mf)mf.classList.add('hide');
  var mb=document.getElementById('mascotBody');if(mb)mb.innerHTML='';
  if(tAF)cancelAnimationFrame(tAF);
  if(tR){tR.dispose();tR=null;}
}

// ===== 로그인 후 UI 셋업 =====
function setup(){
  var ia=CU.role==='admin';
  document.getElementById('UA').className='ua '+(ia?'admin':'manager');
  document.getElementById('UA').textContent=CU.name[0];
  document.getElementById('UN').textContent=CU.name;
  document.getElementById('UR').textContent=ia?'관리자':'현장담당';
  document.getElementById('navPS').style.display=ia?'flex':'none';
  document.getElementById('navAdmin').style.display=ia?'block':'none';
  var d=gDB();
  document.getElementById('SN').textContent=ia?'전체 현장 관리':(d.sites[CU.curSite]?d.sites[CU.curSite].name:'');
  var cb=document.getElementById('cloudBadge');
  if(cb)cb.style.display=USE_CLOUD?'block':'none';
  popSel();updBdg();
  if(USE_CLOUD)updNoticeBdg();
  nav('dash');
}

// ===== 네비게이션 =====
function nav(p){
  // 엄격한 접근 제어 (프론트 가드 — Firestore 규칙이 실제 방어선)
  var adminOnly=['pset','sites','users'];
  if(adminOnly.indexOf(p)>=0&&CU.role!=='admin'){toast('관리자만 접근 가능','error');return;}
  CP=p;closeSB();
  var pages=document.querySelectorAll('.pg');
  for(var i=0;i<pages.length;i++)pages[i].classList.remove('active');
  var navs=document.querySelectorAll('.ni');
  for(var j=0;j<navs.length;j++)navs[j].classList.remove('active');
  var pe=document.getElementById('pg-'+p);if(pe)pe.classList.add('active');
  var ne=document.querySelector('.ni[data-p="'+p+'"]');if(ne)ne.classList.add('active');
  var ti={dash:['대시보드','메인>대시보드'],notice:['공지사항','메인>공지사항'],info:['현장정보','메인>현장정보'],v3d:['3D 시공현황','시공>3D'],prog:['시공현황','시공>현황'],bldg:['동 설정','시공>동설정'],alerts:['발주 알림','발주>알림'],pset:['발주 설정','발주>설정'],pstat:['발주 현황','발주>현황'],insp:['공장검수','검수>공장검수'],sites:['현장 관리','관리자>현장'],users:['담당자 배정','관리자>담당자'],hist:['수정이력','기록>이력']};
  var t=ti[p]||['',''];
  document.getElementById('PT').textContent=t[0];
  document.getElementById('PB').textContent=t[1];
  var fn={dash:rDash,notice:rNotice,info:rInfo,v3d:init3D,prog:rPT,bldg:rBC,alerts:rAlerts,pset:rPS,pstat:rPStat,insp:rInsp,sites:rSites,users:rUsers,hist:rHist};
  if(fn[p])fn[p]();
  mascotReact('nav');
  saveUserState();
}
