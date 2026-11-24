import './intelligence-suite.css';

const $ = (selector, root=document) => root.querySelector(selector);
const esc = value => String(value ?? '');
const short = value => value ? value.slice(0,6)+'…'+value.slice(-4) : '—';
const money = value => {
  const n=Number(value);
  if(!Number.isFinite(n)) return '—';
  if(n>=1e9) return '$'+(n/1e9).toFixed(2)+'B';
  if(n>=1e6) return '$'+(n/1e6).toFixed(2)+'M';
  if(n>=1e3) return '$'+(n/1e3).toFixed(2)+'K';
  if(n>=1) return '$'+n.toFixed(4);
  if(n>0) return '$'+n.toPrecision(3);
  return '—';
};
const pct = value => Number.isFinite(Number(value)) ? (Number(value)>0?'+':'')+Number(value).toFixed(2)+'%' : '—';

function el(tag, className, text) {
  const node=document.createElement(tag);
  if(className) node.className=className;
  if(text!==undefined) node.textContent=text;
  return node;
}
function link(url,label) {
  const a=el('a','intel-link',label);
  a.href=url;a.target='_blank';a.rel='noopener noreferrer';
  return a;
}
function init(){
  const sidebar=$('.sidebar');
  if(!sidebar || $('#intelLauncher')) return;
  const resources=$('.resources-label',sidebar);
  const label=el('div','side-label intel-nav-label','INTELLIGENCE');
  const button=el('button','side-item','◎  INTELLIGENCE LAB');
  button.id='intelLauncher';button.type='button';
  if(resources){sidebar.insertBefore(label,resources);sidebar.insertBefore(button,resources);}
  else sidebar.append(label,button);

  const topbar=$('.topbar');
  if(topbar){
    const quick=el('button','intel-quick-trigger','INTEL LAB');
    quick.type='button';quick.addEventListener('click',open);
    topbar.insertBefore(quick,topbar.firstChild);
  }
  button.addEventListener('click',open);

  const overlay=el('div','intel-overlay');
  overlay.id='intelOverlay';overlay.hidden=true;
  const dialog=el('section','intel-dialog');
  dialog.setAttribute('role','dialog');dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','intelTitle');
  const head=el('header','intel-dialog-head');
  const heading=el('div','');
  heading.append(el('span','intel-kicker','SNIPER / TACTICAL INTELLIGENCE'),el('h2','','INTELLIGENCE LAB'),el('p','','Compare AI models and inspect Base token market data.'));
  const close=el('button','intel-close','×');close.type='button';close.setAttribute('aria-label','Close Intelligence Lab');close.addEventListener('click',()=>{overlay.hidden=true});
  head.append(heading,close);
  const tabs=el('div','intel-tabs');
  const arenaTab=el('button','intel-tab active','MODEL ARENA');arenaTab.type='button';arenaTab.dataset.tab='arena';
  const chainTab=el('button','intel-tab','BASE INTELLIGENCE');chainTab.type='button';chainTab.dataset.tab='chain';
  tabs.append(arenaTab,chainTab);
  const content=el('div','intel-content');
  const arena=buildArena();
  const chain=buildChain();
  content.append(arena,chain);
  dialog.append(head,tabs,content);overlay.append(dialog);document.body.append(overlay);
  tabs.addEventListener('click',event=>{
    const tab=event.target.closest('[data-tab]');if(!tab)return;
    tabs.querySelectorAll('.intel-tab').forEach(item=>item.classList.toggle('active',item===tab));
    arena.hidden=tab.dataset.tab!=='arena';chain.hidden=tab.dataset.tab!=='chain';
  });
  overlay.addEventListener('click',event=>{if(event.target===overlay)overlay.hidden=true});
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!overlay.hidden)overlay.hidden=true});
  let modelsLoaded=false;
  button.addEventListener('click',()=>{if(!modelsLoaded){modelsLoaded=true;loadModels(arena)}});
  quick?.addEventListener('click',()=>{if(!modelsLoaded){modelsLoaded=true;loadModels(arena)}});
  arenaTab.addEventListener('click',()=>{if(!modelsLoaded){modelsLoaded=true;loadModels(arena)}});
  $('#intelSearch',chain).addEventListener('submit',event=>{event.preventDefault();searchBase(chain)});
}
function open(){
  const overlay=$('#intelOverlay');if(!overlay)return;
  overlay.hidden=false;
  if(!overlay.dataset.opened){overlay.dataset.opened='1';loadModels($('#intelArena'));}
}
function buildArena(){
  const panel=el('section','intel-panel');panel.id='intelArena';
  const intro=el('div','intel-intro');
  intro.append(el('h3','','Run the same prompt across multiple models'),el('p','','Choose up to three currently available free routes. Compare their answers side by side. Provider availability and limits apply.'));
  const form=el('form','intel-arena-form');
  const prompt=el('textarea','intel-prompt');prompt.placeholder='Enter a question, research task, or coding challenge…';prompt.maxLength=4000;prompt.required=true;
  const controls=el('div','intel-arena-controls');
  const modelWrap=el('div','intel-model-picks');
  modelWrap.append(el('span','intel-field-label','AVAILABLE FREE ROUTES'));
  const status=el('div','intel-status','LOADING MODEL DIRECTORY…');status.id='intelModelStatus';
  const run=el('button','intel-primary','RUN COMPARISON');run.type='submit';
  controls.append(modelWrap,run);
  form.append(el('label','intel-field-label','TEST PROMPT'),prompt,controls,status);
  const results=el('div','intel-results');results.id='intelModelResults';
  form.addEventListener('submit',event=>{event.preventDefault();runArena(form,results,status)});
  panel.append(intro,form,results);
  return panel;
}
async function loadModels(panel){
  if(!panel)return;
  const status=$('#intelModelStatus',panel),wrap=$('.intel-model-picks',panel);
  if(!status||!wrap||wrap.dataset.loaded)return;
  wrap.dataset.loaded='1';
  try{
    const response=await fetch('/api/models',{headers:{accept:'application/json'},cache:'no-store'});
    const data=await response.json();
    if(!response.ok)throw new Error(data.error||'Model directory unavailable');
    const blockedModel=/inclusion\s*ai|inclusionai|ling[-\s._]*3[.]?2[-\s._]*flash/i;
    const models=(Array.isArray(data.models)?data.models:[]).filter(model=>!blockedModel.test(String(model.id||'')+' '+String(model.name||'')));
    if(!models.length)throw new Error('No eligible free model routes are currently available.');
    const selected=models.slice(0,3);
    selected.forEach((model,index)=>{
      const label=el('label','intel-model-option');
      const checkbox=el('input','');checkbox.type='checkbox';checkbox.name='intelModel';checkbox.value=model.id;checkbox.checked=index<2;
      label.append(checkbox,el('span','',model.name||model.id),el('small','',model.id));
      wrap.append(label);
    });
    status.textContent=models.length+' FREE ROUTES FOUND · SELECT UP TO 3';
    wrap.dataset.count=String(models.length);
  }catch(error){status.textContent='MODEL DIRECTORY UNAVAILABLE · '+error.message;}
}
async function runArena(form,results,status){
  const prompt=$('.intel-prompt',form).value.trim();
  const chosen=[...form.querySelectorAll('input[name="intelModel"]:checked')].slice(0,3);
  if(!prompt){status.textContent='ENTER A TEST PROMPT FIRST';return}
  if(!chosen.length){status.textContent='SELECT AT LEAST ONE MODEL';return}
  form.querySelectorAll('input[name="intelModel"]').forEach(input=>input.disabled=true);
  const run=$('.intel-primary',form);run.disabled=true;run.textContent='RUNNING…';
  results.replaceChildren();
  status.textContent='RUNNING '+chosen.length+' MODEL ROUTE(S)…';
  const cards=chosen.map(input=>{
    const option=input.closest('.intel-model-option');
    const card=el('article','intel-result-card');
    card.append(el('h4','',option.querySelector('span').textContent),el('small','',input.value),el('div','intel-answer','Waiting for response…'));
    results.append(card);return {input,card};
  });
  await Promise.all(cards.map(async({input,card})=>{
    const output=$('.intel-answer',card);
    try{
      const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({
        message:prompt,model:input.value,history:[],
        system:'You are participating in a controlled model comparison. Answer the user prompt directly, clearly, and completely. State uncertainty instead of inventing facts. Do not claim to have used tools, browsed, tested code, or verified current data unless that actually happened. Keep the answer self-contained.'
      })});
      const data=await response.json();
      if(!response.ok)throw new Error(data.error||'Provider request failed');
      output.textContent=data.reply||'The model returned an empty response.';
      const meta=el('span','intel-response-meta','ROUTE · '+(data.model||input.value));card.append(meta);
    }catch(error){output.textContent='Request failed: '+error.message;card.classList.add('is-error')}
  }));
  status.textContent='COMPARISON COMPLETE · REVIEW ANSWERS BEFORE RELYING ON THEM';
  run.disabled=false;run.textContent='RUN AGAIN';
  form.querySelectorAll('input[name="intelModel"]').forEach(input=>input.disabled=false);
}
function buildChain(){
  const panel=el('section','intel-panel');panel.hidden=true;panel.id='intelChain';
  const intro=el('div','intel-intro');
  intro.append(el('h3','','Base token intelligence'),el('p','','Look up a Base token by contract address or search term. Data is supplied by DexScreener and may be delayed or incomplete.'));
  const form=el('form','intel-chain-form');form.id='intelSearch';
  const input=el('input','intel-chain-input');input.placeholder='Paste Base contract address or token name…';input.autocomplete='off';input.required=true;
  const submit=el('button','intel-primary','SEARCH BASE');submit.type='submit';
  form.append(input,submit);
  const status=el('div','intel-status','BASE NETWORK · READY');status.id='intelChainStatus';
  const results=el('div','intel-chain-results');results.id='intelChainResults';
  const note=el('p','intel-disclaimer','Market data is informational only, not investment advice. Token listings, liquidity, volume, and price data do not establish legitimacy or safety. Always verify contract addresses independently.');
  panel.append(intro,form,status,results,note);
  return panel;
}
async function searchBase(panel){
  const query=$('.intel-chain-input',panel).value.trim();
  const status=$('#intelChainStatus',panel),results=$('#intelChainResults',panel),button=$('button[type="submit"]',panel);
  if(!query)return;
  button.disabled=true;button.textContent='SEARCHING…';status.textContent='QUERYING BASE MARKET DATA…';results.replaceChildren();
  try{
    const isAddress=/^0x[a-f0-9]{40}$/i.test(query);
    const endpoint=isAddress?'https://api.dexscreener.com/tokens/v1/base/'+encodeURIComponent(query):'https://api.dexscreener.com/latest/dex/search?q='+encodeURIComponent(query);
    const response=await fetch(endpoint,{headers:{accept:'application/json'},cache:'no-store'});
    if(!response.ok)throw new Error('Market data provider returned HTTP '+response.status);
    const payload=await response.json();
    const pairs=(Array.isArray(payload)?payload:Array.isArray(payload.pairs)?payload.pairs:[]).filter(pair=>String(pair.chainId||'').toLowerCase()==='base');
    const unique=new Map();
    for(const pair of pairs){
      const token=pair.baseToken||{};
      const key=String(token.address||'').toLowerCase();
      if(!key)continue;
      const current=unique.get(key);
      if(!current||Number(pair.liquidity?.usd||0)>Number(current.liquidity?.usd||0))unique.set(key,pair);
    }
    const matches=[...unique.values()].sort((a,b)=>Number(b.liquidity?.usd||0)-Number(a.liquidity?.usd||0)).slice(0,8);
    if(!matches.length){status.textContent='NO BASE PAIRS FOUND · CHECK THE QUERY OR CONTRACT ADDRESS';return}
    status.textContent=matches.length+' BASE TOKEN MATCH(ES) · SORTED BY REPORTED LIQUIDITY';
    matches.forEach(pair=>results.append(renderPair(pair)));
  }catch(error){status.textContent='LOOKUP FAILED · '+error.message}
  finally{button.disabled=false;button.textContent='SEARCH BASE'}
}
function renderPair(pair){
  const token=pair.baseToken||{},stats=pair.priceChange||{},card=el('article','intel-token-card');
  const head=el('div','intel-token-head');
  const identity=el('div','intel-token-identity');
  identity.append(el('strong','',token.name||'Unknown token'),el('span','',String(token.symbol||'—')+' · '+short(token.address)));
  const change=el('b','intel-token-change',pct(stats.h24));change.classList.toggle('negative',Number(stats.h24)<0);
  head.append(identity,change);
  const metrics=el('div','intel-token-metrics');
  [['PRICE',money(pair.priceUsd)],['LIQUIDITY',money(pair.liquidity?.usd)],['24H VOLUME',money(pair.volume?.h24)],['FDV',money(pair.fdv)]].forEach(([label,value])=>{
    const item=el('div','');item.append(el('small','',label),el('b','',value));metrics.append(item);
  });
  const foot=el('div','intel-token-foot');
  foot.append(link('https://basescan.org/token/'+encodeURIComponent(token.address||''),'BASESCAN ↗'));
  if(pair.url)foot.append(link(pair.url,'DEXSCREENER ↗'));
  if(pair.dexId)foot.append(el('span','',String(pair.dexId).toUpperCase()));
  card.append(head,metrics,foot);return card;
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
