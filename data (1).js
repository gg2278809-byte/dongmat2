const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const Data={
  list:[],
  async load(){try{const r=await fetch('data/restaurants.json');const j=await r.json();this.list=Array.isArray(j)?j.filter(x=>x&&x.id&&x.name):[]}catch(e){this.list=[];toast('음식점 데이터를 불러오지 못했어요.')}},
  dist(a,b){if(typeof a.lat!=='number'||typeof b.lat!=='number'||typeof b.lng!=='number')return null;const R=6371000,t=x=>x*Math.PI/180,h=Math.sin(t(b.lat-a.lat)/2)**2+Math.cos(t(a.lat))*Math.cos(t(b.lat))*Math.sin(t(b.lng-a.lng)/2)**2;return 2*R*Math.asin(Math.sqrt(h))},
  fmt(m){return m<1000?Math.round(m)+'m':(m/1000).toFixed(1)+'km'}
};
