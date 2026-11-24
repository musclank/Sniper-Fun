import './ai-hub.css';

const $=s=>document.querySelector(s);
const messages=$('#messages'),modelSelect=$('#model'),routing=$('#routing'),input=$('#promptInput');
const STORAGE_KEY='sniper-vvv-chat-v1';
let models=[],busy=false,tool='chat',conversation=[];
const systemPrompts={
 chat:'You are Sniper-$VVV, a helpful and precise AI assistant. Be clear, honest, and useful.',
 code:'You are Sniper-$VVV Coding Assistant. Help design, debug, explain, and write maintainable software. Include code blocks when useful.',
 image:'You are Sniper-$VVV Visual Assistant. Help users write detailed image-generation prompts and discuss visual concepts. Do not claim to generate images unless an image tool is connected.'
};
function setStatus(s){$('#modelStatus').textContent=s}
function persist(){try{localStorage.setItem(STORAGE_KEY,JSON.stringify(conversation.slice(-80)))}catch{}}
function addMessage(role,text,save=true){
 const el=document.createElement('div');el.className='message '+role;
 const label=document.createElement('span');label.className='role';label.textContent=role==='user'?'YOU':'SNIPER AI';
 const content=document.createElement('div');content.className='message-content';content.textContent=text;
 el.append(label,content);messages.append(el);messages.scrollTop=messages.scrollHeight;
 if(save){conversation.push({role,text});persist()}return el;
}
function showWelcome(){
 messages.innerHTML='<div class="welcome"><div class="welcome-icon"><img src="/sniper-vvv-emblem.svg" alt=""></div><div class="welcome-title">READY WHEN YOU ARE.</div><p>Ask a question, explore an idea, or start building something.</p><div class="prompt-grid"><button class="prompt" data-prompt="Explain a complex topic in simple terms.">Explain a complex topic <span>↗</span></button><button class="prompt" data-prompt="Help me plan and build a web application.">Plan a web application <span>↗</span></button><button class="prompt" data-prompt="Review this code and suggest improvements.">Review my code <span>↗</span></button></div></div>';
}
function restoreHistory(){
 try{const saved=JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]');if(!Array.isArray(saved)||!saved.length){setStatus('NO LOCAL CHAT HISTORY');return}
 conversation=saved;messages.innerHTML='';for(const item of saved)addMessage(item.role,item.text,false);setStatus('LOCAL CHAT RESTORED · '+saved.length+' MESSAGES');
 }catch{setStatus('LOCAL CHAT HISTORY UNAVAILABLE')}
}
async function loadModels(){
 // Only expose the route that has been confirmed working in production.
 models=[{id:'openrouter/free',name:'OPENROUTER SMART ROUTER'}];
 modelSelect.innerHTML='';
 const option=document.createElement('option');option.value=models[0].id;option.textContent=models[0].name;modelSelect.append(option);
 modelSelect.disabled=true;routing.value='auto';routing.disabled=true;
 setStatus('1 VERIFIED ROUTE · AUTO MODE');
 $('#refreshModels').disabled=false;
}
routing.addEventListener('change',()=>{routing.value='auto';modelSelect.value='openrouter/free';setStatus('AUTOMATIC ROUTING ENABLED')});
async function send(text){
 if(busy||!text.trim())return;busy=true;$('#sendBtn').disabled=true;addMessage('user',text);
 const reply=addMessage('assistant','Connecting to model…',false);
 try{
  const model='openrouter/free';
  if(!model)throw new Error('No model selected. Refresh the model list or check API configuration.');
  const response=await fetch('/api/chat',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:text,model,system:systemPrompts[tool]})});
  const data=await response.json();if(!response.ok)throw new Error(data.error||'Request failed');
  const answer=data.reply||'The model returned an empty response.';reply.querySelector('.message-content').textContent=answer;
  conversation.push({role:'assistant',text:answer});persist();reply.dataset.model=data.model||model;
 }catch(e){reply.classList.add('error');reply.querySelector('.message-content').textContent='Connection error: '+e.message}
 finally{busy=false;$('#sendBtn').disabled=false;input.focus();messages.scrollTop=messages.scrollHeight}
}
$('#chatForm').addEventListener('submit',e=>{e.preventDefault();const text=input.value;input.value='';send(text)});
document.addEventListener('click',e=>{const b=e.target.closest('[data-prompt]');if(b){input.value=b.dataset.prompt;input.focus()}});
function newChat(){conversation=[];persist();showWelcome();setStatus('1 VERIFIED ROUTE · AUTO MODE')}
$('#newChat').addEventListener('click',newChat);
$('#clearChat').addEventListener('click',newChat);
$('#historyBtn').addEventListener('click',restoreHistory);
$('#refreshModels').addEventListener('click',loadModels);
document.querySelectorAll('.tool-link').forEach(b=>b.addEventListener('click',()=>{
 document.querySelectorAll('.tool-link').forEach(x=>x.classList.remove('active'));b.classList.add('active');tool=b.dataset.tool;
 const labels={chat:['AI CHAT','THINK FASTER.','A multi-model AI workspace.'],code:['CODING ASSISTANT','BUILD SMARTER.','Design, debug, and improve your code with AI.'],image:['IMAGE TOOLS','VISUALIZE IDEAS.','Create and refine image prompts with AI assistance.']};
 $('#modeTitle').textContent=labels[tool][0];$('#headline').innerHTML=labels[tool][1]+'<br><span>WITH SNIPER AI.</span>';$('#intro').textContent=labels[tool][2];newChat();
}));
loadModels();
