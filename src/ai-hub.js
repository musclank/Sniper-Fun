import './ai-hub.css';

// Cinematic boot screen
const bootStartedAt=Date.now();
window.addEventListener('load',()=>{
 const bootScreen=document.querySelector('#bootScreen');
 if(!bootScreen)return;
 const wait=Math.max(0,1450-(Date.now()-bootStartedAt));
 window.setTimeout(()=>{
  bootScreen.classList.add('is-hidden');
  window.setTimeout(()=>bootScreen.remove(),600);
 },wait);
},{once:true});

const $=s=>document.querySelector(s);
const messages=$('#messages'),modelSelect=$('#model'),routing=$('#routing'),input=$('#promptInput');
const LEGACY_KEY='sniper-vvv-chat-v1',SESSIONS_KEY='sniper-vvv-sessions-v1';
let models=[],busy=false,tool='chat',conversation=[],sessions=[],activeSessionId='';
const systemPrompts={
 chat:'You are Sniper-$VVV, a helpful and precise AI assistant. Be clear, honest, and useful.',
 code:'You are Sniper-$VVV Coding Assistant. Help design, debug, explain, and write maintainable software. Include code blocks when useful.',
 image:'You are Sniper-$VVV Visual Assistant. Help users write detailed image-generation prompts and discuss visual concepts. Do not claim to generate images unless an image tool is connected.'
};
function makeId(){return (window.crypto&&crypto.randomUUID)?crypto.randomUUID():'s-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}
function setStatus(s){$('#modelStatus').textContent=s}
function saveSessions(){try{localStorage.setItem(SESSIONS_KEY,JSON.stringify(sessions))}catch{setStatus('LOCAL STORAGE LIMIT REACHED')}}
function currentSession(){return sessions.find(s=>s.id===activeSessionId)}
function saveCurrentSession(){
 const session=currentSession();if(!session)return;
 session.messages=conversation.slice(-100);session.updatedAt=Date.now();
 const firstUser=conversation.find(m=>m.role==='user');
 if(firstUser&&(!session.title||session.title==='New session'))session.title=firstUser.text.slice(0,42)+(firstUser.text.length>42?'…':'');
 saveSessions();
}
function loadSessions(){
 try{
  const stored=JSON.parse(localStorage.getItem(SESSIONS_KEY)||'null');
  if(Array.isArray(stored)&&stored.length){sessions=stored}
  else{
   const legacy=JSON.parse(localStorage.getItem(LEGACY_KEY)||'[]');
   sessions=Array.isArray(legacy)&&legacy.length?[{id:makeId(),title:'Previous conversation',createdAt:Date.now(),updatedAt:Date.now(),messages:legacy.slice(-100)}]:[];
  }
 }catch{sessions=[]}
 if(!sessions.length)sessions=[{id:makeId(),title:'New session',createdAt:Date.now(),updatedAt:Date.now(),messages:[]}];
 activeSessionId=sessions[0].id;conversation=[...(sessions[0].messages||[])];saveSessions();renderConversation();
}
function addMessage(role,text,save=true){
 const el=document.createElement('div');el.className='message '+role;
 const head=document.createElement('div');head.className='message-head';
 const label=document.createElement('span');label.className='role';label.textContent=role==='user'?'YOU':'SNIPER AI';head.append(label);
 if(role==='assistant'){
  const copy=document.createElement('button');copy.className='copy-message';copy.type='button';copy.textContent='COPY';copy.setAttribute('aria-label','Copy response');copy.addEventListener('click',()=>copyText(text,copy));head.append(copy);
 }
 const content=document.createElement('div');content.className='message-content';if(role==='assistant')renderRichContent(content,text);else content.textContent=text;
 el.append(head,content);messages.append(el);messages.scrollTop=messages.scrollHeight;
 if(save){conversation.push({role,text});saveCurrentSession()}
 return el;
}
function renderRichContent(container,text){
 container.innerHTML='';
 const pattern=/```([a-zA-Z0-9_+#.-]*)\s*\n([\s\S]*?)```/g;
 let cursor=0,match;
 while((match=pattern.exec(text))){
  if(match.index>cursor){const prose=document.createElement('div');prose.className='response-text';prose.textContent=text.slice(cursor,match.index);container.append(prose)}
  const block=document.createElement('section');block.className='code-block';
  const head=document.createElement('div');head.className='code-block-head';
  const lang=document.createElement('span');lang.textContent=(match[1]||'CODE').toUpperCase();
  const copy=document.createElement('button');copy.type='button';copy.className='copy-code';copy.textContent='COPY CODE';
  const codeText=match[2].replace(/\n$/,'');
  copy.addEventListener('click',()=>copyText(codeText,copy));
  head.append(lang,copy);
  const pre=document.createElement('pre');const code=document.createElement('code');code.textContent=codeText;pre.append(code);
  block.append(head,pre);container.append(block);cursor=pattern.lastIndex;
 }
 if(cursor<text.length||!container.childNodes.length){const prose=document.createElement('div');prose.className='response-text';prose.textContent=text.slice(cursor);container.append(prose)}
}
function showWelcome(){
 messages.innerHTML='<div class="welcome"><div class="welcome-title">SNIPER AI TERMINAL <span>v1.0</span></div><p>System initialized. Intelligence router standing by.</p><div class="terminal-help"><span>AVAILABLE COMMANDS</span><code>/help</code><code>/clear</code><code>/models</code><code>/history</code><code>/prompts</code><code>/export</code></div><div class="prompt-grid"><button class="prompt" data-prompt="Explain a complex topic in simple terms.">Explain a complex topic <span>↗</span></button><button class="prompt" data-prompt="Help me plan and build a web application.">Plan a web application <span>↗</span></button><button class="prompt" data-prompt="Review this code and suggest improvements.">Review my code <span>↗</span></button></div></div>';
}
function renderConversation(){
 messages.innerHTML='';
 if(!conversation.length){showWelcome();return}
 conversation.forEach(item=>addMessage(item.role,item.text,false));
}
function createSession(){
 const session={id:makeId(),title:'New session',createdAt:Date.now(),updatedAt:Date.now(),messages:[]};
 sessions.unshift(session);activeSessionId=session.id;conversation=[];saveSessions();renderConversation();closeModal('commandModal');setStatus('NEW LOCAL SESSION CREATED');input.focus();
}
function clearBuffer(){
 conversation=[];const session=currentSession();if(session){session.messages=[];session.updatedAt=Date.now()}
 saveSessions();showWelcome();setStatus('CURRENT BUFFER CLEARED');closeModal('commandModal');
}
function openModal(id){const modal=$('#'+id);if(modal){modal.hidden=false;document.body.classList.add('modal-open')}}
function closeModal(id){const modal=$('#'+id);if(modal){modal.hidden=true;if(!document.querySelector('.modal-backdrop:not([hidden])'))document.body.classList.remove('modal-open')}}
function renderSessions(){
 const list=$('#sessionList');list.innerHTML='';
 const ordered=[...sessions].sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
 if(!ordered.length){list.textContent='No saved sessions yet.';return}
 ordered.forEach(session=>{
  const row=document.createElement('div');row.className='session-row'+(session.id===activeSessionId?' active':'');
  const info=document.createElement('button');info.className='session-open';info.type='button';info.dataset.openSession=session.id;
  const title=document.createElement('strong');title.textContent=session.title||'Untitled session';
  const detail=document.createElement('small');detail.textContent=(session.messages||[]).length+' messages · '+new Date(session.updatedAt||Date.now()).toLocaleString();
  info.append(title,detail);
  const actions=document.createElement('div');actions.className='session-actions';
  const rename=document.createElement('button');rename.type='button';rename.textContent='RENAME';rename.dataset.renameSession=session.id;
  const del=document.createElement('button');del.type='button';del.textContent='DELETE';del.dataset.deleteSession=session.id;
  actions.append(rename,del);row.append(info,actions);list.append(row);
 });
}
function restoreHistory(){renderSessions();openModal('sessionModal')}
function openSession(id){
 const session=sessions.find(s=>s.id===id);if(!session)return;
 activeSessionId=id;conversation=[...(session.messages||[])];renderConversation();closeModal('sessionModal');setStatus('SESSION RESTORED · '+conversation.length+' MESSAGES');
}
function renameSession(id){
 const session=sessions.find(s=>s.id===id);if(!session)return;
 const name=window.prompt('Enter a name for this session:',session.title||'Untitled session');
 if(name&&name.trim()){session.title=name.trim().slice(0,60);saveSessions();renderSessions()}
}
function deleteSession(id){
 const session=sessions.find(s=>s.id===id);if(!session)return;
 if(!window.confirm('Delete this local session? This cannot be undone.'))return;
 sessions=sessions.filter(s=>s.id!==id);
 if(!sessions.length)sessions=[{id:makeId(),title:'New session',createdAt:Date.now(),updatedAt:Date.now(),messages:[]}];
 if(activeSessionId===id){activeSessionId=sessions[0].id;conversation=[...(sessions[0].messages||[])];renderConversation()}
 saveSessions();renderSessions();
}
async function copyText(text,button){
 try{
  await navigator.clipboard.writeText(text);
  if(button){button.textContent='COPIED';window.setTimeout(()=>button.textContent='COPY',1200)}
 }catch{
  const area=document.createElement('textarea');area.value=text;document.body.append(area);area.select();
  try{document.execCommand('copy');if(button){button.textContent='COPIED';window.setTimeout(()=>button.textContent='COPY',1200)}}catch{}
  area.remove();
 }
}
function exportChat(){
 if(!conversation.length){setStatus('NOTHING TO EXPORT');return}
 const session=currentSession(),title=(session?.title||'sniper-session').replace(/[^a-z0-9-_]/gi,'-').slice(0,40);
 const body='# '+(session?.title||'SNIPER-$VVV session')+'\n\n'+conversation.map(m=>'## '+(m.role==='user'?'YOU':'SNIPER AI')+'\n\n'+m.text).join('\n\n---\n\n');
 const blob=new Blob([body],{type:'text/markdown;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=title+'.md';document.body.append(a);a.click();a.remove();URL.revokeObjectURL(url);
 setStatus('CHAT EXPORTED · MARKDOWN');
}
function openCommandCenter(){openModal('commandModal')}
function setTool(nextTool){tool=nextTool;document.querySelectorAll('.tool-link').forEach(x=>x.classList.toggle('active',x.dataset.tool===tool));const labels={chat:['SNIPER TERMINAL','THINK FASTER.','A focused AI command line. Ask anything and keep your workflow moving.','GENERAL'],code:['DEVELOPER WORKSPACE','BUILD SMARTER.','Review, debug, explain, and refactor code with your AI engineering assistant.','CODING'],image:['VISUAL ASSISTANT','VISUALIZE IDEAS.','Create and refine image prompts with AI assistance.','VISUAL']};const label=labels[tool]||labels.chat;$('#modeTitle').textContent=label[0];$('#headline').innerHTML=label[1]+'<br><span>WITH SNIPER AI.</span>';$('#intro').textContent=label[2];$('#channelName').textContent=label[3];$('#developerTools').hidden=tool!=='code';}
async function loadModels(){
 models=[{id:'openrouter/free',name:'OPENROUTER SMART ROUTER'}];
 modelSelect.innerHTML='';const option=document.createElement('option');option.value=models[0].id;option.textContent=models[0].name;modelSelect.append(option);
 modelSelect.disabled=true;routing.value='auto';routing.disabled=true;setStatus('1 VERIFIED ROUTE · AUTO MODE');$('#refreshModels').disabled=false;
}
routing.addEventListener('change',()=>{routing.value='auto';modelSelect.value='openrouter/free';setStatus('AUTOMATIC ROUTING ENABLED')});
async function send(text){
 if(busy||!text.trim())return;
 const command=text.trim().toLowerCase();
 if(command==='/help'){addMessage('assistant','AVAILABLE COMMANDS\n/help      Show commands\n/new       Start a new session\n/clear     Clear current buffer\n/models    Show active model route\n/history   Open session history\n/prompts   Open prompt arsenal\n/export    Export current chat');return}
 if(command==='/clear'){clearBuffer();return}
 if(command==='/new'){createSession();return}
 if(command==='/models'){addMessage('assistant','MODEL ROUTER\nACTIVE ROUTE: OPENROUTER SMART ROUTER\nMODE: AUTO\nSTATUS: VERIFIED ROUTE');return}
 if(command==='/history'||command==='/sessions'){restoreHistory();return}
 if(command==='/prompts'){openCommandCenter();return}
 if(command==='/export'){exportChat();return}
 busy=true;$('#sendBtn').disabled=true;addMessage('user',text);
 const reply=addMessage('assistant','Connecting to model…',false);
 try{
  const model='openrouter/free';
  const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,model,system:systemPrompts[tool]})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Request failed');
  const answer=data.reply||'The model returned an empty response.';
  renderRichContent(reply.querySelector('.message-content'),answer);
  const copy=document.createElement('button');copy.className='copy-message';copy.type='button';copy.textContent='COPY';copy.setAttribute('aria-label','Copy response');copy.addEventListener('click',()=>copyText(answer,copy));reply.querySelector('.message-head').append(copy);
  conversation.push({role:'assistant',text:answer});saveCurrentSession();reply.dataset.model=data.model||model;
 }catch(e){reply.classList.add('error');reply.querySelector('.message-content').textContent='Connection error: '+e.message}
 finally{busy=false;$('#sendBtn').disabled=false;input.focus();messages.scrollTop=messages.scrollHeight}
}
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const text=input.value;input.value='';send(text)});
input.addEventListener('keydown',e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();$('#chatForm').requestSubmit()}});
document.addEventListener('click',e=>{
 const prompt=e.target.closest('[data-prompt],[data-library-prompt]');
 if(prompt){input.value=prompt.dataset.prompt||prompt.dataset.libraryPrompt;input.focus();closeModal('commandModal');return}
 const close=e.target.closest('[data-close-modal]');if(close){closeModal(close.dataset.closeModal);return}
 const open=e.target.closest('[data-open-session]');if(open){openSession(open.dataset.openSession);return}
 const rename=e.target.closest('[data-rename-session]');if(rename){renameSession(rename.dataset.renameSession);return}
 const del=e.target.closest('[data-delete-session]');if(del){deleteSession(del.dataset.deleteSession);return}
 const command=e.target.closest('[data-command]');if(command){
  const action=command.dataset.command;closeModal('commandModal');
  if(action==='new')createSession();if(action==='history')restoreHistory();if(action==='export')exportChat();if(action==='clear')clearBuffer();
 }
});
document.querySelectorAll('.modal-backdrop').forEach(modal=>modal.addEventListener('click',e=>{if(e.target===modal)closeModal(modal.id)}));
document.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){e.preventDefault();openCommandCenter()}
 if(e.key==='Escape')document.querySelectorAll('.modal-backdrop:not([hidden])').forEach(m=>closeModal(m.id));
});
$('#newChat').addEventListener('click',createSession);
$('#historyBtn').addEventListener('click',restoreHistory);
$('#promptBtn').addEventListener('click',openCommandCenter);
$('#commandBtn').addEventListener('click',openCommandCenter);
$('#clearChat').addEventListener('click',clearBuffer);
$('#refreshModels').addEventListener('click',loadModels);
document.querySelectorAll('.tool-link').forEach(b=>b.addEventListener('click',()=>setTool(b.dataset.tool)));
document.addEventListener('click',e=>{const task=e.target.closest('[data-code-task]');if(task){const code=input.value.trim();const taskText=task.dataset.codeTask;input.value=code?taskText+'\n\n```\n'+code+'\n```':taskText+'\n\nPaste your code below this instruction.';input.focus();input.setSelectionRange(input.value.length,input.value.length)}});
loadSessions();loadModels();
