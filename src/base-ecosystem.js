const endpoint='/api/base';
const $=id=>document.getElementById(id);
const number=value=>Number.parseInt(value,16);
const formatBlock=value=>Number.isFinite(value)?value.toLocaleString('en-US'):'—';
const formatAge=seconds=>{if(!Number.isFinite(seconds)||seconds<0)return 'TIME UNAVAILABLE';if(seconds<60)return seconds+' SEC AGO';if(seconds<3600)return Math.floor(seconds/60)+' MIN AGO';return Math.floor(seconds/3600)+' HRS AGO'};
let loading=false;
async function refreshBaseNetwork(){
 if(loading)return;
 loading=true;
 const status=$('baseNetworkStatus'),state=$('baseEcosystem')?.querySelector('.base-live-state');
 if(status)status.textContent='SYNCING BASE MAINNET';
 try{
  const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({action:'network'}),cache:'no-store'});
  const raw=await response.text();
  let data;
  try { data=JSON.parse(raw); }
  catch { throw new Error(response.status===404 || /^<!doctype html|^<html/i.test(raw.trim()) ? 'Cloudflare did not route /api/base to its Function. Check the latest Pages deployment and Functions routing.' : 'API returned invalid JSON (HTTP '+response.status+').'); }
  if(!response.ok||!data.ok)throw new Error(data.error||'Base RPC request failed');
  const block=number(data.blockNumber),gas=Number(BigInt(data.gasPrice))/1e9;
  const txCount=Number(data.transactionCount);
  $('baseChainName').textContent='BASE MAINNET';
  $('baseChainId').textContent='CHAIN ID · '+data.chainId;
  $('baseBlockNumber').textContent=formatBlock(block);
  $('baseBlockAge').textContent=formatAge(Math.max(0,Math.floor(Date.now()/1000)-number(data.blockTimestamp)));
  $('baseGasPrice').textContent=Number.isFinite(gas)?(gas<0.01?gas.toFixed(5):gas.toFixed(3)):'—';
  $('baseTxCount').textContent=Number.isFinite(txCount)?txCount.toLocaleString('en-US'):'—';
  $('baseBlockTime').textContent='BLOCK '+String(block||'').slice(-8);
  if(status)status.textContent='LIVE · BASE MAINNET';
  state?.classList.remove('is-error');
 }catch(error){
  if(status)status.textContent='NETWORK DATA UNAVAILABLE';
  state?.classList.add('is-error');
  $('baseDataNote').textContent='Could not retrieve live Base RPC metrics. '+String(error?.message||'Check your connection')+'. Retry in a moment.';
 }finally{loading=false}
}
$('refreshBaseNetwork')?.addEventListener('click',refreshBaseNetwork);
$('openClankerIntelligence')?.addEventListener('click',()=>{
 const launcher=$('clankerLauncher');
 if(launcher){launcher.click();return}
 window.open('https://www.clanker.world/clankers?filter=trending','_blank','noopener,noreferrer');
});
document.addEventListener('click',event=>{
 const target=event.target.closest('[data-scroll-target]');
 if(target){document.getElementById(target.dataset.scrollTarget)?.scrollIntoView({behavior:'smooth',block:'start'});}
 const mobile=event.target.closest('[data-mobile-action="base"]');
 if(mobile){document.getElementById('mobileMenuBackdrop')?.setAttribute('hidden','');document.getElementById('mobileMenuBtn')?.setAttribute('aria-expanded','false');document.getElementById('baseEcosystem')?.scrollIntoView({behavior:'smooth',block:'start'});}
});
refreshBaseNetwork();
window.setInterval(()=>{if(!document.hidden)refreshBaseNetwork()},20000);
