const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const IC={home:'M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',map:'M9 4L3 6v14l6-2 6 2 6-2V4l-6 2zM9 4v14M15 6v14',heart:'M12 21s-8-5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 6-8 11-8 11z',dice:'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01',gear:'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5',pin:'M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12zM12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z',share:'M12 3v12M7 8l5-5 5 5M5 12v8h14v-8',back:'M15 5l-7 7 7 7'};
const ic=(n,f)=>`<svg class="ic" viewBox="0 0 24 24" fill="${f?'currentColor':'none'}" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="${IC[n]}"/></svg>`;
const RAD=[500,1000,2000,3000,5000],CATS=['한식','중식','일식','양식','분식','카페','기타'];
const S={loc:Store.get('loc',null),radius:Store.get('radius',1000),sort:Store.get('sort','distance'),cats:[],q:'',favs:Store.get('favs',[]),memos:Store.get('memos',{}),recent:Store.get('recent',[]),hist:Store.get('hist',[]),theme:Store.get('theme','system')};
const loc=()=>S.loc||{lat:37.5665,lng:126.978,name:'서울시청 (기본 위치)'};
let hm,mm,view='home',picking=false,dip;

function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>t.classList.remove('on'),2600)}
function busy(on){$('#prog').classList.toggle('on',on)}
const save=k=>Store.set(k,S[k]);

function items(){
  const l=loc(),q=S.q.toLowerCase();
  let a=Data.list.map(r=>({...r,d:Data.dist(l,r)})).filter(r=>r.d!=null&&r.d<=S.radius);
  if(S.cats.length)a=a.filter(r=>S.cats.includes(r.category));
  if(q)a=a.filter(r=>[r.name,r.category,r.address,...(r.menu||[]).map(m=>m.name)].join(' ').toLowerCase().includes(q));
  const k=S.sort;
  return a.sort(k==='distance'?(x,y)=>x.d-y.d:(x,y)=>(y[k]??-1)-(x[k]??-1));
}
const meta=r=>[r.category,r.d!=null?Data.fmt(r.d):'',r.rating!=null?'★ '+r.rating+(r.reviews!=null?` (${r.reviews})`:''):''].filter(Boolean).map(esc).join(' · ');
const heart=id=>`<button class="heart ${S.favs.includes(id)?'on':''}" data-fav="${esc(id)}" aria-label="즐겨찾기">${ic('heart',S.favs.includes(id))}</button>`;
const card=r=>`<article class="card" data-open="${esc(r.id)}">${r.photo?`<img src="${esc(r.photo)}" alt="" loading="lazy">`:''}<div class="info"><b>${esc(r.name)}</b>${r.isSample?'<i class="tag">예시 데이터</i>':''}<small>${meta(r)}</small><small>${esc(r.address||'')}</small></div>${heart(r.id)}</article>`;

function render(){
  const a=items(),l=loc();
  $('#logo').innerHTML=ic('pin')+'동맛';
  $('#locBtn').innerHTML=esc(l.name);$('#srchBtn').innerHTML=ic('search');
  $('#chips').innerHTML=['전체',...CATS].map(c=>`<button class="chip ${(c==='전체'?!S.cats.length:S.cats.includes(c))?'on':''}" data-cat="${c}">${c}</button>`).join('');
  $$('.radQuick').forEach(e=>e.innerHTML=RAD.map(r=>`<button class="chip ${r===S.radius?'on':''}" data-rad="${r}">${r<1000?r+'m':r/1000+'km'}</button>`).join(''));
  $$('.radRange').forEach(e=>e.value=RAD.indexOf(S.radius));
  $$('.sortSel').forEach(e=>e.innerHTML=[['distance','거리순'],['rating','평점순'],['reviews','리뷰 수순'],['popularity','인기순']].map(([v,t])=>{const off=v!=='distance'&&!Data.list.some(r=>r[v]!=null);return `<option value="${v}" ${off?'disabled':''} ${v===S.sort?'selected':''}>${t}${off?' (데이터 없음)':''}</option>`}).join(''));
  $('#hist').innerHTML=S.hist.map(h=>`<button class="chip" data-hq="${esc(h)}">${esc(h)}</button>`).join('');
  $('#count').textContent=`주변 음식점 ${a.length}곳`;
  $('#list').innerHTML=a.length?a.map(card).join(''):`<p class="empty">${Data.list.length?'조건에 맞는 음식점이 없어요.<br>반경을 넓히거나 카테고리를 바꿔 보세요.':'등록된 음식점이 없어요.<br>data/restaurants.json에 음식점을 추가해 주세요.'}</p>`;
  const f=Data.list.filter(r=>S.favs.includes(r.id)).map(r=>({...r,d:Data.dist(l,r)}));
  $('#favList').innerHTML=f.length?f.map(r=>card(r)+`<textarea data-memo="${esc(r.id)}" placeholder="개인 메모 (예: 다음엔 칼국수 먹기)" aria-label="개인 메모">${esc(S.memos[r.id]||'')}</textarea>`).join(''):'<p class="empty">하트를 눌러 마음에 드는 음식점을 저장해 보세요.</p>';
  const nm=id=>(Data.list.find(r=>r.id===id)||{}).name||id;
  const grp=(t,rows,all)=>`<h3>${t}</h3>`+(rows.length?rows.map(([x,k])=>`<div class="row"><span>${x}</span><button class="icon" data-del="${esc(k)}" aria-label="삭제">×</button></div>`).join('')+(rows.length>1?`<button class="ghost" data-del="${all}">모두 삭제</button>`:''):'<p class="mute">저장된 정보가 없어요.</p>');
  $('#store').innerHTML=grp('검색 기록',S.hist.map((h,i)=>[esc(h),'hist:'+i]),'hist:all')+grp('최근 본 음식점',S.recent.map(id=>[esc(nm(id)),'recent:'+id]),'recent:all')+grp('개인 메모',Object.keys(S.memos).map(id=>[esc(nm(id))+': '+esc(S.memos[id]),'memo:'+id]),'memo:all')+grp('즐겨찾기',S.favs.map(id=>[esc(nm(id)),'fav:'+id]),'fav:all')+grp('마지막 위치',S.loc?[[esc(S.loc.name),'loc:x']]:[],'loc:x');
  $$('[data-theme]').forEach(b=>b.classList.toggle('on',b.dataset.theme===S.theme));
  if(hm)hm.update(l,S.radius,a);
  if(mm&&view==='mapV')mm.update(l,S.radius,a);
}

function setLoc(l){S.loc=l;save('loc');render()}
function locate(){
  if(!navigator.geolocation)return toast('위치 기능을 지원하지 않아요. 주소 검색을 이용해 주세요.');
  busy(true);
  navigator.geolocation.getCurrentPosition(p=>{busy(false);setLoc({lat:p.coords.latitude,lng:p.coords.longitude,name:'현재 위치'});$('#locSheet').close()},
    e=>{busy(false);toast(e.code===1?'위치 권한이 꺼져 있어요. 주소 검색이나 지도 선택으로 위치를 정해 주세요.':'현재 위치를 가져오지 못했어요. 주소 검색을 이용해 주세요.')},{timeout:10000});
}
async function addr(){
  const q=$('#addrIn').value.trim();if(!q)return;busy(true);
  try{const j=await(await fetch('https://nominatim.openstreetmap.org/search?format=json&limit=1&accept-language=ko&q='+encodeURIComponent(q))).json();
    if(j[0]){setLoc({lat:+j[0].lat,lng:+j[0].lon,name:q});$('#locSheet').close()}else toast('주소를 찾지 못했어요. 다른 표현으로 검색해 보세요.')}
  catch(e){toast('주소 검색에 실패했어요. 인터넷 연결을 확인해 주세요.')}
  busy(false);
}

function show(v){
  view=v;$$('.view').forEach(s=>s.classList.toggle('on',s.id===v));
  $$('#nav button').forEach(b=>b.classList.toggle('on',b.dataset.v===v));
  $('#detail').classList.remove('on');
  if(v==='mapV'){if(!mm)mm=makeMap($('#bigMap'),p=>{if(picking){picking=false;setLoc({...p,name:'지도에서 선택한 위치'});toast('위치를 설정했어요.')}});if(mm)mm.update(loc(),S.radius,items())}
  window.scrollTo(0,0);
}

function openDetail(id){
  const r=Data.list.find(x=>x.id===id);if(!r)return toast('음식점 정보를 찾을 수 없어요.');
  S.recent=[id,...S.recent.filter(x=>x!==id)].slice(0,10);save('recent');
  const row=(k,v)=>`<p ${v?'':'class="mute"'}><b>${k}</b>${v||'정보 없음'}</p>`;
  const q=encodeURIComponent(r.name+' '+(r.address||'')),ok=typeof r.lat==='number'&&typeof r.lng==='number',n=encodeURIComponent(r.name);
  const menu=(r.menu||[]).map(m=>esc(m.name)+(m.price!=null?' '+Number(m.price).toLocaleString()+'원':'')).join('<br>');
  $('#detail').innerHTML=`<div class="dhead"><button data-back aria-label="뒤로">${ic('back')}</button><b>${esc(r.name)}</b><button data-share="${esc(id)}" aria-label="공유">${ic('share')}</button>${heart(id)}</div><div class="dbody">${r.photo?`<img class="hero" src="${esc(r.photo)}" alt="">`:''}<h2>${esc(r.name)}${r.isSample?'<i class="tag">예시 데이터</i>':''}</h2>
  <p>${r.rating!=null?'★ '+esc(r.rating)+(r.reviews!=null?` · 리뷰 ${esc(r.reviews)}개`:''):'<span class="mute">평점 정보 없음</span>'}</p>
  ${row('음식 종류',esc(r.category))}${row('주소',esc(r.address))}${row('대표 메뉴',menu)}${row('영업시간',esc(r.hours))}${row('전화번호',r.phone?`<a href="tel:${esc(r.phone)}">${esc(r.phone)}</a>`:'')}${S.memos[id]?row('내 메모',esc(S.memos[id])):''}
  <h3>길찾기</h3><div class="links"><a target="_blank" rel="noopener" href="https://map.naver.com/p/search/${q}">네이버 지도</a><a target="_blank" rel="noopener" href="${ok?`https://map.kakao.com/link/to/${n},${r.lat},${r.lng}`:'https://map.kakao.com/?q='+q}">카카오맵</a><a target="_blank" rel="noopener" href="${ok?`https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lng}`:'https://www.google.com/maps/search/?api=1&query='+q}">구글 지도</a></div>
  <p class="mute">앱이 없으면 웹 지도가 열려요. 네이버 지도는 가게 검색 결과로 연결돼요.</p></div>`;
  $('#detail').classList.add('on');
}
async function share(id){
  const r=Data.list.find(x=>x.id===id),text=`${r.name}\n${r.address||''}`,url=location.href.split('#')[0];
  try{if(navigator.share){await navigator.share({title:r.name,text,url});return}}catch(e){if(e.name==='AbortError')return}
  try{await navigator.clipboard.writeText(`${text}\n${url}`);toast('링크를 복사했어요.')}catch(e){prompt('아래 내용을 복사해 주세요.',`${text}\n${url}`)}
}
function del(k){
  const i=k.indexOf(':'),t=k.slice(0,i),v=k.slice(i+1),all=v==='all';
  if(t==='hist'){S.hist=all?[]:S.hist.filter((_,j)=>j!==+v);save('hist')}
  else if(t==='recent'){S.recent=all?[]:S.recent.filter(x=>x!==v);save('recent')}
  else if(t==='memo'){if(all)S.memos={};else delete S.memos[v];save('memos')}
  else if(t==='fav'){S.favs=all?[]:S.favs.filter(x=>x!==v);save('favs')}
  else if(t==='loc'){S.loc=null;Store.del('loc')}
  render();
}
function renderInstall(){
  const sa=matchMedia('(display-mode: standalone)').matches||navigator.standalone,ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  $('#install').innerHTML=sa?'<p class="mute">이미 앱으로 설치되어 실행 중이에요.</p>':dip?'<button class="primary" id="doInst">앱 설치하기</button>':ios?'<p>Safari 하단의 공유 버튼을 누르고 <b>"홈 화면에 추가"</b>를 선택해 주세요.</p>':'<p class="mute">설치 버튼은 설치할 수 있는 환경(Chrome, Edge 등)에서만 보여요. 브라우저 메뉴의 "앱 설치"도 확인해 보세요.</p>';
}
function applyTheme(){document.documentElement.dataset.theme=S.theme}

document.addEventListener('click',e=>{
  const t=e.target,c=s=>t.closest(s);let x;
  if(x=c('[data-fav]')){const id=x.dataset.fav;S.favs=S.favs.includes(id)?S.favs.filter(f=>f!==id):[...S.favs,id];save('favs');render();$$('#detail [data-fav]').forEach(b=>{b.classList.toggle('on',S.favs.includes(id));b.innerHTML=ic('heart',S.favs.includes(id))});return}
  if(x=c('[data-open]')){e.preventDefault();openDetail(x.dataset.open);return}
  if(c('[data-back]'))return $('#detail').classList.remove('on');
  if(x=c('[data-share]'))return share(x.dataset.share);
  if(x=c('[data-cat]')){const v=x.dataset.cat;S.cats=v==='전체'?[]:S.cats.includes(v)?S.cats.filter(k=>k!==v):[...S.cats,v];return render()}
  if(x=c('[data-rad]')){S.radius=+x.dataset.rad;save('radius');return render()}
  if(x=c('[data-hq]')){S.q=x.dataset.hq;$('#q').value=S.q;return render()}
  if(x=c('[data-del]'))return del(x.dataset.del);
  if(x=c('[data-theme]')){S.theme=x.dataset.theme;save('theme');applyTheme();return render()}
  if(x=c('#nav button'))return show(x.dataset.v);
  if(c('#locBtn'))return $('#locSheet').showModal();
  if(c('#srchBtn')){const b=$('#srchBar');b.hidden=!b.hidden;if(!b.hidden)$('#q').focus();return}
  if(c('#gps'))return locate();
  if(c('#addrBtn'))return addr();
  if(c('#pickGo')||c('#pickBtn')){$('#locSheet').close();picking=true;show('mapV');return toast('지도에서 원하는 위치를 눌러 주세요.')}
  if(c('#rbtn')){busy(true);setTimeout(()=>{busy(false);const a=items();$('#rbox').innerHTML=a.length?card(a[Math.floor(Math.random()*a.length)])+'<p class="mute">카드를 누르면 상세 정보로 이동해요. 버튼을 다시 누르면 다른 곳을 추천해요.</p>':'<p class="empty">조건에 맞는 음식점이 없어요.<br>반경이나 카테고리를 바꿔 보세요.</p>'},300);return}
  if(c('#doInst')&&dip){dip.prompt();dip.userChoice.finally(()=>{dip=null;renderInstall()})}
});
document.addEventListener('change',e=>{
  const t=e.target;
  if(t.dataset.memo){const v=t.value.trim();if(v)S.memos[t.dataset.memo]=v;else delete S.memos[t.dataset.memo];save('memos');render();toast('메모를 저장했어요.')}
  if(t.classList.contains('sortSel')){S.sort=t.value;save('sort');render()}
});
document.addEventListener('input',e=>{
  if(e.target.classList.contains('radRange')){S.radius=RAD[+e.target.value];save('radius');render()}
  if(e.target.id==='q'){S.q=e.target.value.trim();render()}
});
$('#q').addEventListener('keydown',e=>{if(e.key==='Enter'&&S.q){S.hist=[S.q,...S.hist.filter(h=>h!==S.q)].slice(0,8);save('hist');busy(true);setTimeout(()=>busy(false),400);render()}});
$('#addrIn').addEventListener('keydown',e=>{if(e.key==='Enter')addr()});
document.addEventListener('pointerdown',e=>{
  const b=e.target.closest('button,.card');if(!b)return;
  const r=b.getBoundingClientRect(),z=Math.max(r.width,r.height),s=document.createElement('span');
  s.className='rip';s.style.cssText=`width:${z}px;height:${z}px;left:${e.clientX-r.left-z/2}px;top:${e.clientY-r.top-z/2}px`;b.appendChild(s);setTimeout(()=>s.remove(),500);
});
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;renderInstall()});
const net=()=>{$('#offline').hidden=navigator.onLine};addEventListener('online',net);addEventListener('offline',net);

(async()=>{
  busy(true);applyTheme();net();
  $('#nav').innerHTML=[['home','home','홈'],['mapV','map','지도'],['favV','heart','즐겨찾기'],['rndV','dice','랜덤 추천'],['setV','gear','설정']].map(([v,i,t])=>`<button data-v="${v}" class="${v==='home'?'on':''}">${ic(i)}${t}</button>`).join('');
  await Data.load();hm=makeMap($('#miniMap'));render();renderInstall();busy(false);
  if('serviceWorker'in navigator)navigator.serviceWorker.register('service-worker.js').catch(()=>{});
})();
