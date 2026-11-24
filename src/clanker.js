const API='/api/clanker';
const money=value=>{const n=Number(value);if(!Number.isFinite(n)||n<=0)return '—';return n>=1e9?'$'+(n/1e9).toFixed(2)+'B':n>=1e6?'$'+(n/1e6).toFixed(2)+'M':n>=1e3?'$'+(n/1e3).toFixed(2)+'K':n<.01?'$'+n.toExponential(2):'$'+n.toFixed(n<1?5:3)};
const pick=(o,keys)=>{for(const k of keys){const v=k.split('.').reduce((a,b)=>a?.[b],o);if(v!==undefined&&v!==null&&v!=='')return v}return null};
const arr=data=>{
 if(Array.isArray(data))return data;
 const candidates=[data?.data,data?.tokens,data?.results,data?.items,data?.pools,data?.trending,data?.clankers,data?.data?.tokens,data?.data?.results,data?.data?.items,data?.data?.pools];
 return candidates.find(Array.isArray)||[];
};
function tokenCard(pool,i,included=[]){
 const attrs=pool?.attributes||pool||{};
 const rel=pool?.relationships||{};
 const baseId=rel?.base_token?.data?.id||rel?.baseToken?.data?.id;
 const quoteId=rel?.quote_token?.data?.id||rel?.quoteToken?.data?.id;
 const base=included.find(x=>x?.id===baseId)?.attributes||{};
 const quote=included.find(x=>x?.id===quoteId)?.attributes||{};
 const token=Object.keys(base).length?base:(Object.keys(quote).length?quote:(pool?.token||pool?.baseToken||{}));
 const address=pick(token,['address','contract_address','token_address'])||pick(attrs,['token_address','base_token_address','address'])||'';
 const name=pick(token,['name','token_name'])||pick(attrs,['token_name','name'])||String(attrs.name||'').split(' / ')[0]||'Unknown token';
 const symbol=pick(token,['symbol','ticker'])||pick(attrs,['symbol','token_symbol'])||'—';
 const findTokenImage=(root)=>{
  const imageKeys=/^(image|image_url|imageurl|image_uri|imageuri|logo|logouri|logo_uri|logo_url|icon|icon_url|token_image|tokenimage|avatar_url)$/i;
  const seen=new Set();
  const walk=(value,depth=0)=>{
   if(!value||typeof value!=='object'||depth>6||seen.has(value))return null;
   seen.add(value);
   for(const [key,item] of Object.entries(value)){
    if(imageKeys.test(key)&&typeof item==='string'&&item.trim())return item.trim();
   }
   for(const item of Object.values(value)){
    if(item&&typeof item==='object'){const found=walk(item,depth+1);if(found)return found;}
   }
   return null;
  };
  return walk(root);
 };
 const rawLogo=findTokenImage([token,attrs,pool,base,quote])||
  pick(token,['metadata.image','metadata.image_url','metadata.imageUrl','properties.image','properties.image_url'])||
  pick(attrs,['metadata.image','metadata.image_url','metadata.imageUrl']);
 const logo=imageUrl(rawLogo);
 const price=pick(attrs,['base_token_price_usd','price_usd','priceUsd','price_usd.value','baseTokenPriceUsd'])||pick(pool,['priceUsd','price_usd']);
 const cap=pick(attrs,['market_cap_usd','fdv_usd','marketCapUsd','fdv'])||pick(pool,['marketCapUsd','fdvUsd']);
 const liquidity=pick(attrs,['reserve_in_usd','liquidity_usd','liquidityUsd','liquidity'])||pick(pool,['liquidityUsd']);
 const volume=pick(attrs,['volume_usd.h24','volume24hUsd','volume_24h_usd','volume24h'])||pick(pool,['volume24hUsd']);
 const change=Number(pick(attrs,['price_change_percentage.h24','priceChange24h','price_change_24h','change24h'])||pick(pool,['priceChange24h'])||0);
 const href=address?'https://www.clanker.world/clanker/'+encodeURIComponent(address):'https://www.clanker.world/clankers?filter=trending';
 const initials=escapeHtml((symbol&&symbol!=='—'?symbol:name).trim().slice(0,3).toUpperCase());
 const img=logo?'<img src="'+escapeHtml(logo)+'" alt="'+escapeHtml(name)+' official token icon" loading="lazy" referrerpolicy="no-referrer" onerror="clankerImageFallback(this)"/>':'<span class="ct-logo-fallback" aria-label="'+escapeHtml(name)+' token icon">'+initials+'</span>';
 const short=address?address.slice(0,6)+'…'+address.slice(-4):'Address unavailable';
 return '<article class="clanker-token" data-token-address="'+escapeHtml(address)+'"><div class="ct-top"><span class="ct-rank">'+String(i+1).padStart(2,'0')+'</span><div class="ct-logo">'+img+'</div><div class="ct-name"><b>'+escapeHtml(name)+'</b><small>$'+escapeHtml(symbol)+'</small></div><span class="ct-change '+(change>=0?'up':'down')+'">'+(change>0?'+':'')+change.toFixed(2)+'%</span></div><div class="ct-metrics"><div><small>PRICE</small><b>'+money(price)+'</b></div><div><small>MARKET CAP / FDV</small><b>'+money(cap)+'</b></div><div><small>LIQUIDITY</small><b>'+money(liquidity)+'</b></div><div><small>24H VOLUME</small><b>'+money(volume)+'</b></div></div><div class="ct-bottom"><code title="'+escapeHtml(address)+'">'+escapeHtml(short)+'</code><a href="'+href+'" target="_blank" rel="noopener noreferrer">OPEN CLANKER ↗</a></div></article>';
}
function imageUrl(value){
 if(!value||typeof value!=='string')return '';
 const raw=value.trim();
 if(/^ipfs:\/\//i.test(raw))return 'https://ipfs.io/ipfs/'+raw.replace(/^ipfs:\/\//i,'').replace(/^ipfs\//,'');
 if(/^ar:\/\//i.test(raw))return 'https://arweave.net/'+raw.slice(5);
 if(raw.startsWith('/ipfs/'))return 'https://ipfs.io'+raw;
 return safeUrl(raw);
}
function clankerImageFallback(img){
 const original=img.dataset.original||img.src;
 img.dataset.original=original;
 const gateways=['https://www.clanker.world','https://gateway.pinata.cloud','https://cloudflare-ipfs.com','https://ipfs.io'];
 const path=original.match(/(?:ipfs\/|ipfs:\/\/)([^?#]+)/i)?.[1];
 const tried=Number(img.dataset.gatewayTry||0);
 if(!path||tried>=gateways.length){img.style.display='none';return}
 img.dataset.gatewayTry=String(tried+1);
 img.src=gateways[tried]+'/ipfs/'+path.replace(/^ipfs\//,'');
}
function safeUrl(value){if(!value)return '';try{const u=new URL(value);return ['https:','http:'].includes(u.protocol)?u.href:''}catch{return ''}}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
async function hydrateTokenProfiles(grid){
 const cards=[...grid.querySelectorAll('.clanker-token[data-token-address]')];
 await Promise.all(cards.map(async card=>{
  const address=card.dataset.tokenAddress;
  if(!/^0x[a-f0-9]{40}$/i.test(address))return;
  try{
   const response=await fetch('https://api.dexscreener.com/latest/dex/tokens/'+encodeURIComponent(address),{headers:{accept:'application/json'}});
   if(!response.ok)return;
   const data=await response.json();
   const pairs=Array.isArray(data?.pairs)?data.pairs.filter(p=>String(p.chainId||'').toLowerCase()==='base'):[];
   pairs.sort((a,b)=>Number(b?.liquidity?.usd||0)-Number(a?.liquidity?.usd||0));
   const pair=pairs[0];
   const token=pair?.baseToken&&String(pair.baseToken.address||'').toLowerCase()===address.toLowerCase()?pair.baseToken:
    pair?.quoteToken&&String(pair.quoteToken.address||'').toLowerCase()===address.toLowerCase()?pair.quoteToken:pair?.baseToken;
   const info=pair?.info||{};
   const icon=safeUrl(info?.imageUrl||info?.header||'');
   const logo=card.querySelector('.ct-logo');
   if(icon&&logo){
    logo.innerHTML='<img src="'+escapeHtml(icon)+'" alt="Token icon" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">';
   }
   if(token?.symbol){
    const symbolNode=card.querySelector('.ct-name small');
    if(symbolNode)symbolNode.textContent='
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
   if(!res.ok){let info={};try{info=await res.json()}catch{}throw new Error(info.details||info.error||('API returned HTTP '+res.status))}
   const payload=await res.json();
   const tokens=arr(payload).slice(0,10);
   if(!tokens.length)throw new Error('No trending Base tokens returned');
   grid.innerHTML=tokens.map((token,index)=>tokenCard(token,index,Array.isArray(payload?.included)?payload.included:[])).join('');
   status.textContent='LIVE · '+tokens.length+' TOKENS · BASE';
   hydrateTokenProfiles(grid);
  }catch(err){
   status.textContent='DATA FEED UNAVAILABLE';
   grid.innerHTML='<div class="cl-empty cl-error">Unable to load live Clanker data. '+escapeHtml(err?.message||'Request failed')+'. <a href="https://www.clanker.world/clankers?filter=trending" target="_blank" rel="noopener noreferrer" style="color:#64baf0">Open Clanker trending ↗</a></div>';
  }
 }
 load();
 window.setInterval(()=>{if(panel.classList.contains('open'))load()},30000);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
+token.symbol;
   }
   if(token?.name){
    const nameNode=card.querySelector('.ct-name b');
    if(nameNode)nameNode.textContent=token.name;
   }
  }catch{}
 }));
}
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
   if(!res.ok){let info={};try{info=await res.json()}catch{}throw new Error(info.details||info.error||('API returned HTTP '+res.status))}
   const payload=await res.json();
   const tokens=arr(payload).slice(0,10);
   if(!tokens.length)throw new Error('No trending Base tokens returned');
   grid.innerHTML=tokens.map((token,index)=>tokenCard(token,index,Array.isArray(payload?.included)?payload.included:[])).join('');
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
