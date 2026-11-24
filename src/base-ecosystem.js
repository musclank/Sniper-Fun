const endpoint='/api/base';
const $=id=>document.getElementById(id);
const number=value=>Number.parseInt(value,16);
const formatBlock=value=>Number.isFinite(value)?value.toLocaleString('en-US'):'—';
const formatAge=seconds=>{if(!Number.isFinite(seconds)||seconds<0)return 'TIME UNAVAILABLE';if(seconds<60)return seconds+' SEC AGO';if(seconds<3600)return Math.floor(seconds/60)+' MIN AGO';return Math.floor(seconds/3600)+' HRS AGO'};
const REFRESH_MS=20000;
let loading=false,timer=null,nextRefreshAt=0,lastUpdatedAt=0,retryDelay=5000;
const status=$('baseNetworkStatus'),state=$('baseEcosystem')?.querySelector('.base-live-state');
function setStatus(value,error=false){
 if(status)status.textContent=value;
 state?.classList.toggle('is-error',error);
}
function scheduleRefresh(delay){
 clearTimeout(timer);
 nextRefreshAt=Date.now()+delay;
 updateCountdown();
 timer=setTimeout(()=>{if(!document.hidden)refreshBaseNetwork();else scheduleRefresh(5000)},delay);
}
function updateCountdown(){
 const countdown=$('baseRefreshCountdown');
 if(countdown){
  const seconds=Math.max(0,Math.ceil((nextRefreshAt-Date.now())/1000));
  countdown.textContent=loading?'REQUEST IN PROGRESS':seconds+'S';
 }
 const updated=$('baseLastUpdated');
 if(updated)updated.textContent=lastUpdatedAt?'LAST UPDATE · '+new Date(lastUpdatedAt).toLocaleTimeString():'LAST UPDATE · WAITING';
}
async function refreshBaseNetwork(){
 if(loading)return;
 loading=true;clearTimeout(timer);
 setStatus('SYNCING BASE MAINNET');
 updateCountdown();
 try{
  const response=await fetch(endpoint,{method:'POST',headers:{'content-type':'application/json','accept':'application/json'},body:JSON.stringify({action:'network'}),cache:'no-store',signal:AbortSignal.timeout(12000)});
  const raw=await response.text();
  let data;
  try{data=JSON.parse(raw)}catch{throw new Error(response.status===404||/^<!doctype html|^<html/i.test(raw.trim())?'Cloudflare did not route /api/base to its Function.':'API returned invalid JSON (HTTP '+response.status+').')}
  if(!response.ok||!data.ok)throw new Error(data.error||'Base RPC request failed');
  const block=number(data.blockNumber),gas=Number(BigInt(data.gasPrice))/1e9,txCount=Number(data.transactionCount);
  $('baseChainName').textContent='BASE MAINNET';
  $('baseChainId').textContent='CHAIN ID · '+data.chainId;
  $('baseBlockNumber').textContent=formatBlock(block);
  $('baseBlockAge').textContent=formatAge(Math.max(0,Math.floor(Date.now()/1000)-number(data.blockTimestamp)));
  $('baseGasPrice').textContent=Number.isFinite(gas)?(gas<0.01?gas.toFixed(5):gas.toFixed(3)):'—';
  $('baseTxCount').textContent=Number.isFinite(txCount)?txCount.toLocaleString('en-US'):'—';
  $('baseBlockTime').textContent='BLOCK '+String(block||'').slice(-8);
  $('baseDataNote').textContent='Live Base mainnet RPC telemetry. Gas is an indicative network quote, not a transaction fee estimate.';
  lastUpdatedAt=Date.now();retryDelay=5000;
  setStatus('LIVE · BASE MAINNET');
  scheduleRefresh(REFRESH_MS);
 }catch(error){
  setStatus('NETWORK DATA UNAVAILABLE',true);
  $('baseDataNote').textContent='Could not retrieve live Base RPC metrics. '+String(error?.message||'Check your connection')+'. Automatic retry is scheduled.';
  scheduleRefresh(retryDelay);
  retryDelay=Math.min(retryDelay*2,20000);
 }finally{loading=false;updateCountdown()}
}
$('refreshBaseNetwork')?.addEventListener('click',refreshBaseNetwork);
$('openClankerIntelligence')?.addEventListener('click',()=>{
 const launcher=$('clankerLauncher');
 if(launcher){launcher.click();return}
 window.open('https://www.clanker.world/clankers?filter=trending','_blank','noopener,noreferrer');
});
document.addEventListener('click',event=>{
 const target=event.target.closest('[data-scroll-target]');
 if(target)document.getElementById(target.dataset.scrollTarget)?.scrollIntoView({behavior:'smooth',block:'start'});
 const mobile=event.target.closest('[data-mobile-action="base"]');
 if(mobile){document.getElementById('mobileMenuBackdrop')?.setAttribute('hidden','');document.getElementById('mobileMenuBtn')?.setAttribute('aria-expanded','false');document.getElementById('baseEcosystem')?.scrollIntoView({behavior:'smooth',block:'start'});}
});
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden&&!loading&&Date.now()>=nextRefreshAt)refreshBaseNetwork();
});
window.setInterval(updateCountdown,1000);
refreshBaseNetwork();
