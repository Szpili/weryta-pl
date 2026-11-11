/* Wspólna logika okienka "Zapytaj" dla weryta.pl i weryta.com.
   Język i teksty: window.WERYTA_ASK = {lang:'pl'|'en', teksty:{...}} w inline <script> przed tym plikiem. */
(function(){
const S=window.WERYTA_ASK||{},T=S.teksty||{};
const API='https://pop-os.tailaf1556.ts.net/prawo';
const f=document.getElementById('askf'),q=document.getElementById('askq'),out=document.getElementById('askout');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const zk=document.getElementById('zakres');zk.addEventListener('toggle',async()=>{if(!zk.open||zk.dataset.ok)return;try{const rz=await fetch(API+'/api/zakres',{signal:AbortSignal.timeout(15000)});if(!rz.ok)throw 0;const z=await rz.json();
 zk.lastElementChild.innerHTML='<p>'+esc(z.aktow)+T.zakresOkPre+esc(z.stan_z)+T.zakresOkMid+'</p><ul>'+(z.akty||[]).filter(Boolean).map(a=>'<li>'+esc(a.tytul)+' <span class="m">('+esc(a.eli)+')</span></li>').join('')+'</ul>';zk.dataset.ok=1;}catch(_){zk.lastElementChild.innerHTML='<p>'+T.zakresBlad+'</p>';}});
let seq=0;
f.addEventListener('submit',async e=>{e.preventDefault();const t=q.value.trim();if(!t)return;const my=++seq;out.hidden=false;out.innerHTML='<p class="m">'+T.szukam+'</p>';
 let n=1;try{n=(+sessionStorage.getItem('wn')||0)+1;sessionStorage.setItem('wn',n);}catch(_){}
 try{const r=await fetch(API+'/api/ask?q='+encodeURIComponent(t)+'&n='+n+(S.lang==='en'?'&lang=en':''),{signal:AbortSignal.timeout(20000)});let d={};try{d=await r.json();}catch(_){}
  if(my!==seq)return;
  if(!r.ok){const msg=r.status===429?T.blad429:(r.status>=502&&r.status<=504)?T.blad502:(d.co||d.error||T.blad);out.innerHTML='<p class="m">'+esc(msg)+'</p>';return;}
  let h='<p class="m">'+esc(d.komunikat)+(d.ms!=null?' ('+esc(d.ms)+' ms)':'')+'</p>';
  if(S.lang==='en'&&d.pytanie_pl)h+='<p class="m">'+T.szukaneJako+esc(d.pytanie_pl)+'</p>';
  const nie=!!d.pewnosc&&d.pewnosc!=='pewna',tm=d.temporal||{};
  if(nie)h+='<p class="warn"><b>'+T.slabe+'</b> ('+T.pewnosc+esc(d.pewnosc)+').'+((d.cytaty||[]).some(Boolean)?' '+T.pierwszyWynik:'')+'</p>';
  if(tm.kod==='OFFENSE_DATE_CLARIFICATION')h+='<form class="dt"><label>'+esc((S.lang==='en'?'':tm.pytanie)||T.dataPytanie)+' <input type="date" required max="'+new Date().toISOString().slice(0,10)+'"></label><button>'+T.dataPrzycisk+'</button></form>';
  (d.cytaty||[]).filter(Boolean).slice(0,3).forEach((c,i)=>{const st=c.stan||c.brzmienie||'';const kl=/bez zmian/.test(st)&&!/UWAGA/.test(st)?'ok':'warn';const w=c.wersja||{},wv=(w.dostepne_wersje||[]).filter(Boolean);
   const bq=t=>'<blockquote'+(S.lang==='en'?' lang="pl"':'')+'>„'+esc(String(t||'').slice(0,700))+(String(t||'').length>700?'…':'')+'”</blockquote>';
   const nd=((c.brzmienie_na_date||{}).na_date||[])[0]||null,hist=!!(nd&&nd.tekst),inny=hist&&String(nd.tekst).trim()!==String(c.cytat||'').trim();
   h+='<div class="r"><b>'+esc(c.tytul||c.akt)+'</b> · '+esc(c.adres||String(c.eid).replace(/__/g,' ').replace(/_/g,'. '))+'<div class="m">'+esc(c.eli)+' · '+T.jednostka+' '+esc(c.cytat_eid)+' · sha256 '+esc((c.sha256_zrodla||'').slice(0,16))+'…</div>'+(hist?'<div class="m">'+T.brzmienieNa+esc(String(nd.data||'').split('-').reverse().join('.'))+' ('+T.obowiazywalo+esc(nd.od||'?')+(nd.do?T.doDnia+esc(nd.do):T.nadal)+')</div>'+bq(nd.tekst)+(inny?'<div class="m">'+T.dzisBrzmi+'</div>'+bq(c.cytat):''):bq(c.cytat))+'<div class="m">'+T.stan+'<span class="'+kl+'">'+esc(st)+'</span></div>'+(c.ogloszony||c.obowiazuje_od?'<div class="m">'+T.ogloszony+esc(c.ogloszony||'?')+(c.promulgacja?' · '+T.promulgacja+((c.eli||'').startsWith('MP/')?'M.P. ':'Dz.U. ')+esc(c.promulgacja):'')+' · '+T.obowiazuje+esc(c.obowiazuje_od||'?')+'</div>':'')+(w.stan_na?'<div class="m">'+T.stanNa+esc(w.stan_na)+'</div>':'')+(wv.length?'<details class="m"><summary>'+T.wersje+' ('+wv.length+')</summary><ul>'+wv.map(v=>'<li>'+esc(v.akt)+' · '+T.stanNaPoz+esc(v.stan_na)+'</li>').join('')+'</ul></details>':'')+(c.przypis?'<div class="tri">'+(nie?'<span class="warn">'+T.slabeKrotko+'</span>':'')+'<button class="cp" data-i="'+i+'">'+T.kopiuj+(inny?T.kopiujDzis:'')+'</button></div>':'')
   +(S.lang==='en'?'<div class="tri"><button class="mt">'+T.mtPrzycisk+'</button></div>':'')
   +(i===0&&d.id?'<div class="tri" data-id="'+esc(d.id)+'">'+T.ocenaPytanie+' <button data-o="T">'+T.ocenaT+'</button><button data-o="N">'+T.ocenaN+'</button><button data-o="?">'+T.ocenaQ+'</button></div>':'')+'</div>';});
  (d.akty||[]).filter(Boolean).slice(0,3).forEach(a=>{h+='<div class="r"><b>'+esc(a.tytul)+'</b><div class="m">'+esc(a.eli)+' · '+esc(a.status)+' · '+T.brzmienie+esc(a.brzmienie)+' · '+(/^https?:\/\//.test(a.link||'')?'<a href="'+esc(a.link)+'" rel="noopener" target="_blank">'+T.eliLink+'</a>':esc(a.eli))+'</div></div>';});
  out.innerHTML=h;
  const dt=out.querySelector('.dt');if(dt)dt.addEventListener('submit',ev=>{ev.preventDefault();const[y,m,dd]=dt.querySelector('input').value.split('-');q.value=t+T.dataDoklej.replace('{d}',dd+'.'+m+'.'+y);f.requestSubmit();});
  out.querySelectorAll('.cp').forEach(b=>b.addEventListener('click',async()=>{const p=d.cytaty[+b.dataset.i].przypis;
   try{await navigator.clipboard.writeText(p);b.textContent=T.skopiowano;}catch(_){b.outerHTML='<span class="m">'+T.zaznacz+'</span><textarea rows="5" style="width:100%">'+esc(p)+'</textarea>';}
   if(d.id)fetch(API+'/ocena',{method:'POST',body:new URLSearchParams({id:d.id,ocena:'K'})}).catch(()=>{});}));
  out.querySelectorAll('.mt').forEach(b=>b.addEventListener('click',()=>{b.parentElement.innerHTML='<span class="m">'+T.mtBrak+'</span>';}));
  out.querySelectorAll('.tri button:not(.cp):not(.mt)').forEach(b=>b.addEventListener('click',async ev=>{const tri=ev.target.closest('.tri');const body=new URLSearchParams({id:tri.dataset.id,ocena:ev.target.dataset.o});
   try{const rr=await fetch(API+'/ocena',{method:'POST',body});tri.textContent=rr.ok?T.ocenaOk:T.ocenaBlad;}catch(_){tri.textContent=T.ocenaBlad;}}));
 }catch(err){if(my!==seq)return;out.innerHTML='<p class="m">'+(err&&(err.name==='TimeoutError'||err.name==='AbortError')?T.timeout:T.brakUslugi)+'</p>';}
});
})();
