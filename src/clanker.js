const API='https://www.clanker.world/api/tokens/trending';
const money=value=>{const n=Number(value);if(!Number.isFinite(n)||n<=0)return '—';return n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(2)+'M':n>=1e3?'$'+(n/1e3).toFixed(2)+'K':n<.01?'$'+n.toExponential(2):'$'+n.toFixed(n<1?5:3)};
const pick=(o,keys)=>{for(const k of keys){const v=k.split('.').reduce((a,b)=>a?.[b],o);if(v!==undefined&&v!==null&&v!=='')return v}return null};
const arr=data=>Array.isArray(data)?data:(data?.tokens||data?.data?.tokens||data?.data||data?.results||data?.pools||[]);
function safeUrl(value){if(!value)return '';try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function tokenCard(t,i){
 const address=pick(t,['token.address','tokenAddress','address','contractAddress','token_address'])||'';
 const name=pick(t,['token.name','name','tokenName'])||'Unknown token';
 const symbol=pick(t,['token.symbol','symbol','ticker'])||'—';
 const logo=safeUrl(pick(t,['token.imageUrl','token.image','imageUrl','image','logoURI','logo']));
 const price=pick(t,['market.priceUsd','priceUsd','price_usd','price.usd','price']);
 const cap=pick(t,['market.marketCapUsd','marketCapUsd','market_cap_usd','marketCap','fdv']);
 const liquidity=pick(t,['market.liquidityUsd','liquidityUsd','liquidity_usd','liquidity']);
 const volume=pick(t,['market.volume24hUsd','volume24hUsd','volume_24h_usd','volume24h','volume']);
 const change=Number(pick(t,['market.priceChange24h','priceChange24h','price_change_24h','change24h','priceChange'])||0);
 const href=address?'https://www.clanker.world/clanker/'+encodeURIComponent(address):'https://www.clanker.world/';
 const img=logo?'<img src="'+logo.replace(/"/g,'&quot;')+'" alt="" loading="lazy" onerror="this.remove()">':'';
 const short=address?address.slice(0,6)+'…'+address.slice(-4):'Address unavailable';
 return '<article class="clanker-token"><div class="ct-top"><span class="ct-rank">'+String(i+1).padStart(2,'0')+'</span><div class="ct-logo">'+img+'</div><div class="ct-name"><b>'+escapeHtml(name)+'</b><small>$'+escapeHtml(symbol)+'</small></div><span class="ct-change '+(change>=0?'up':'down')+'">'+(change>0?'+':'')+change.toFixed(2)+'%</span></div><div class="ct-metrics"><div><small>PRICE</small><b>'+money(price)+'</b></div><div><small>MARKET CAP</small><b>'+money(cap)+'</b></div><div><small>LIQUIDITY</small><b>'+money(liquidity)+'</b></div><div><small>24H VOLUME</small><b>'+money(volume)+'</b></div></div><div class="ct-bottom"><code title="'+escapeHtml(address)+'">'+escapeHtml(short)+'</code><a href="'+href+'" target="_blank" rel="noopener noreferrer">OPEN CLANKER ↗</a></div></article>';
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function mount(){
 if(document.getElementById('clankerLauncher'))return;
 const launcher=document.createElement('button');launcher.id='clankerLauncher';launcher.type='button';launcher.innerHTML='<span class="cl-live-dot"></span> CLANKER LIVE';
 const panel=document.createElement('section');panel.id='clankerPanel';panel.className='cl-panel';panel.setAttribute('aria-label','Clanker trending tokens');panel.innerHTML='<div class="cl-head"><div><small>BASE NETWORK / LIVE MARKET FEED</small><h2>CLANKER <span>TRENDING</span></h2><p>Top 10 trending Clanker tokens</p></div><button class="cl-close" aria-label="Close">×</button></div><div class="cl-toolbar"><span id="clStatus">CONNECTING TO CLANKER…</span><button id="clRefresh" type="button">↻ REFRESH</button></div><div id="clGrid" class="cl-grid"><div class="cl-empty">Loading trending tokens…</div></div><div class="cl-foot">Market data supplied by Clanker · Refreshes every 30 seconds</div>';
 document.body.append(launcher,panel);
 const close=()=>panel.classList.remove('open');
 launcher.addEventListener('click',()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))load()});
 panel.querySelector('.cl-close').addEventListener('click',close);
 panel.querySelector('#clRefresh').addEventListener('click',load);
 async function load(){
  const status=panel.querySelector('#clStatus'),grid=panel.querySelector('#clGrid');
  status.textContent='UPDATING…';
  try{
   const res=await fetch(API,{headers:{accept:'application/json'},cache:'no-store'});
   if(!res.ok)throw new Error('Clanker API returned '+res.status);
   const payload=await res.json();
   const tokens=arr(payload).filter(t=>{const chain=pick(t,['chainId','chain_id','chain.id','token.chainId']);return chain==null||Number(chain)===8453}).slice(0,10);
   if(!tokens.length)throw new Error('No trending Base tokens returned');
   grid.innerHTML=tokens.map(tokenCard).join('');
   status.textContent='LIVE · '+tokens.length+' TOKENS · BASE';
  }catch(err){
   status.textContent='DATA FEED UNAVAILABLE';
   grid.innerHTML='<div class="cl-empty cl-error">Unable to load live Clanker data. '+escapeHtml(err?.message||'Request failed')+'. <a href="https://www.clanker.world/clankers?filter=trending" target="_blank" rel="noopener noreferrer" style="color:#64baf0">Open Clanker trending ↗</a></div>';
  }
 }
 load();
 window.setInterval(()=>{if(panel.classList.contains('open'))load()},30000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
