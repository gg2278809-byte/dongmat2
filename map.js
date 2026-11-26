// 지도: Leaflet + OpenStreetMap (API 키 불필요). 불러오지 못해도 앱은 계속 동작합니다.
function makeMap(el,onClick){
  if(typeof L==='undefined'){el.innerHTML='<p class="empty">지도를 불러오지 못했어요.<br>인터넷 연결을 확인해 주세요.</p>';return null}
  const m=L.map(el,{zoomControl:false}).setView([37.5665,126.978],14);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:19}).addTo(m);
  const g=L.layerGroup().addTo(m);let me,ring;
  m.on('click',e=>onClick&&onClick({lat:e.latlng.lat,lng:e.latlng.lng}));
  return{update(loc,r,items){
    g.clearLayers();if(me)me.remove();if(ring)ring.remove();
    me=L.circleMarker([loc.lat,loc.lng],{radius:8,color:'#fff',weight:3,fillColor:'#0A84FF',fillOpacity:1}).addTo(m);
    ring=L.circle([loc.lat,loc.lng],{radius:r,color:'#F28C28',weight:2,fillOpacity:.07}).addTo(m);
    items.forEach(x=>L.marker([x.lat,x.lng]).addTo(g).bindPopup(`<b>${esc(x.name)}</b><br>${esc(x.category||'')} ${Data.fmt(x.d)}<br><a href="#" data-open="${esc(x.id)}">상세 보기</a>`));
    m.fitBounds(ring.getBounds());setTimeout(()=>m.invalidateSize(),80)}};
}
