// LocalStorage 보관소: 오류가 나도 앱이 멈추지 않도록 감쌉니다.
const Store={
  get(k,d){try{const v=localStorage.getItem('dm_'+k);return v==null?d:JSON.parse(v)}catch(e){return d}},
  set(k,v){try{localStorage.setItem('dm_'+k,JSON.stringify(v));return true}catch(e){toast('저장 공간 오류로 저장하지 못했어요.');return false}},
  del(k){try{localStorage.removeItem('dm_'+k)}catch(e){}}
};
