import * as THREE from 'three';
import './style.css';

const app=document.querySelector('#app');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9caeae);
scene.fog=new THREE.FogExp2(0x9caeae,.0018);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1800);
camera.position.set(0,2.1,12);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
app.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdceaff,0x596044,2.1));
const sun=new THREE.DirectionalLight(0xffe0b2,3.4);sun.position.set(-35,65,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-100;sun.shadow.camera.right=100;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;scene.add(sun);
const mat=(color,roughness=1,metalness=0)=>new THREE.MeshStandardMaterial({color,roughness,metalness});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),mat(0x77775e));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
const hillMat=mat(0x626b62),rockMat=mat(0x777b70);
function ridge(x,z,sx,sy,sz,material=hillMat){const m=new THREE.Mesh(new THREE.ConeGeometry(1,1,5),material);m.position.set(x,sy/2-1,z);m.scale.set(sx,sy,sz);m.rotation.y=Math.random();m.castShadow=true;m.receiveShadow=true;scene.add(m);}
for(let i=0;i<24;i++){const x=(Math.random()-.5)*420,z=-100-Math.random()*250;ridge(x,z,25+Math.random()*55,25+Math.random()*65,30+Math.random()*45,i%3?hillMat:rockMat);}
const floorGrid=new THREE.GridHelper(500,100,0x9b9a79,0x8b8b72);floorGrid.position.y=.01;floorGrid.material.transparent=true;floorGrid.material.opacity=.12;scene.add(floorGrid);
for(let i=0;i<90;i++){const x=(Math.random()-.5)*180,z=-15-Math.random()*180,h=.6+Math.random()*1.8;const shrub=new THREE.Mesh(new THREE.DodecahedronGeometry(.5,0),mat(i%2?0x555b3f:0x77734d));shrub.position.set(x,h/2-.05,z);shrub.scale.set(1,h,1);shrub.castShadow=true;scene.add(shrub);}


// Expanded battlefield set dressing: outpost, defensive positions, road and drifting dust.
const concrete=mat(0x77786d,.94),sandbag=mat(0x9a8969,.98),steel=mat(0x414943,.72,.35),wood=mat(0x66533c,.95);
function boxAsset(x,y,z,w,h,d,material,rz=0){
 const mesh=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),material);
 mesh.position.set(x,y,z);mesh.rotation.z=rz;mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;
}
function cylinderAsset(x,y,z,r1,r2,h,material,segments=10){
 const mesh=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,segments),material);
 mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;scene.add(mesh);return mesh;
}
// Low concrete command bunker to the left of the firing lane.
boxAsset(-27,1.6,-75,13,3.2,10,concrete);
boxAsset(-27,3.35,-75,14,.35,11,mat(0x555b54));
boxAsset(-27,1.2,-69.85,3.2,1.5,.18,mat(0x252d2a));
boxAsset(-30,2.2,-69.72,.18,.12,.12,steel);
boxAsset(-24,2.2,-69.72,.18,.12,.12,steel);
// Watch tower on the far right, with cross-braced supports.
for(const x of [29,34])for(const z of [-92,-87]){
 cylinderAsset(x,4.5,z,.13,.18,9,steel,8);
}
boxAsset(31.5,8.6,-89.5,7,.35,7,wood);
boxAsset(31.5,10.2,-89.5,7,.35,7,wood);
for(const x of [28.5,34.5]){
 boxAsset(x,9.4,-86, .18,1.5,.18,steel);
 boxAsset(x,9.4,-93, .18,1.5,.18,steel);
}
boxAsset(31.5,9.5,-89.5,5.8,1.6,5.8,mat(0x5d655a));
// Guard rail and ladder details.
for(let i=0;i<7;i++)boxAsset(28.6+i*.95,9.4,-86.1,.06,.9,.06,steel);
for(let i=0;i<8;i++)boxAsset(34.3,1.2+i*1.05,-89.5,.75,.08,.12,steel);
// Sandbag firing positions, staggered along the range.
function sandbagWall(x,z,count,angle=0){
 for(let row=0;row<2;row++)for(let i=0;i<count;i++){
  const a=boxAsset(x+(i-(count-1)/2)*1.05, .34+row*.52,z-row*.13,1.12,.55,.72,sandbag);
  a.rotation.y=angle;
 }
}
sandbagWall(-15,-37,8,-.12);sandbagWall(17,-48,7,.18);sandbagWall(-35,-115,9,.08);
// Supply crates, fuel drums and anti-vehicle barriers.
for(const [x,z] of [[-20,-43],[-23,-45],[23,-58],[26,-60],[-40,-95]]){
 boxAsset(x,.65,z,1.35,1.3,1.35,wood,Math.random()*.08);
 boxAsset(x,.67,z,1.38,.08,.08,steel);
}
for(const [x,z] of [[-18,-48],[20,-65],[38,-105]]){
 cylinderAsset(x,.72,z,.48,.48,1.4,mat(0x4b594d,.55,.55),16);
 cylinderAsset(x,1.44,z,.49,.49,.08,steel,16);
}
function barrier(x,z,angle=0){
 const g=new THREE.Group();g.position.set(x,.0,z);g.rotation.y=angle;
 const base=new THREE.Mesh(new THREE.BoxGeometry(3.5,.8,.8),mat(0x777b70));base.position.y=.45;base.castShadow=true;base.receiveShadow=true;g.add(base);
 const stripe=new THREE.Mesh(new THREE.BoxGeometry(3.52,.22,.82),mat(0xb09a62));stripe.position.y=.5;g.add(stripe);scene.add(g);
}
barrier(-8,-24,.15);barrier(9,-31,-.18);barrier(42,-76,.5);
// A worn service road running toward the distant outpost.
const road=new THREE.Mesh(new THREE.PlaneGeometry(15,260),mat(0x625e4d));road.rotation.x=-Math.PI/2;road.position.set(0,.005,-145);road.receiveShadow=true;scene.add(road);
for(let side of [-1,1])for(let i=0;i<24;i++){
 const dash=new THREE.Mesh(new THREE.BoxGeometry(.12,.015,2.2),mat(0xb6a77d));
 dash.position.set(side*7.15,.02,-24-i*10.5);scene.add(dash);
}
// Fine dust drifting across the battlefield; low particle count for mobile GPUs.
const dustCount=520,dustPositions=new Float32Array(dustCount*3),dustSpeeds=new Float32Array(dustCount);
for(let i=0;i<dustCount;i++){
 dustPositions[i*3]=(Math.random()-.5)*150;
 dustPositions[i*3+1]=Math.random()*15;
 dustPositions[i*3+2]=-Math.random()*220;
 dustSpeeds[i]=.4+Math.random()*1.2;
}
const dustGeometry=new THREE.BufferGeometry();dustGeometry.setAttribute('position',new THREE.BufferAttribute(dustPositions,3));
const dust=new THREE.Points(dustGeometry,new THREE.PointsMaterial({color:0xd8c9a6,size:.12,transparent:true,opacity:.3,depthWrite:false}));
scene.add(dust);

// Procedural first-person rifle: camera-mounted geometry, no external asset required.
const rifle=new THREE.Group();camera.add(rifle);rifle.position.set(.42,-.38,-.82);rifle.rotation.set(-.04,-.08,-.02);
const gunMetal=mat(0x202824,.34,.72),gunDark=mat(0x111714,.52,.25),gunRubber=mat(0x303832,.9),scopeGlass=new THREE.MeshStandardMaterial({color:0x243c3b,metalness:.8,roughness:.12});
function gunPart(geometry,material,pos,rot){const mesh=new THREE.Mesh(geometry,material);mesh.position.set(...pos);if(rot)mesh.rotation.set(...rot);mesh.castShadow=true;rifle.add(mesh);return mesh;}
gunPart(new THREE.BoxGeometry(.18,.2,.78),gunMetal,[0,0,0]);
gunPart(new THREE.CylinderGeometry(.045,.055,.82,16),gunDark,[0,.015,-.59],[Math.PI/2,0,0]);
gunPart(new THREE.CylinderGeometry(.052,.052,.18,16),gunMetal,[0,.015,-1.03],[Math.PI/2,0,0]);
gunPart(new THREE.BoxGeometry(.12,.26,.3),gunRubber,[0,-.19,.28],[-.25,0,0]);
gunPart(new THREE.BoxGeometry(.1,.24,.18),gunDark,[0,-.18,-.03],[.18,0,0]);
gunPart(new THREE.CylinderGeometry(.07,.07,.36,20),gunMetal,[0,.17,-.34],[Math.PI/2,0,0]);
gunPart(new THREE.CylinderGeometry(.083,.083,.035,20),scopeGlass,[0,.17,-.53],[Math.PI/2,0,0]);
gunPart(new THREE.BoxGeometry(.22,.035,.12),gunDark,[0,.28,-.3]);
const flash=new THREE.PointLight(0xffb45b,0,5);flash.position.set(0,0,-1.12);rifle.add(flash);
const flashMesh=new THREE.Mesh(new THREE.ConeGeometry(.12,.42,8),new THREE.MeshBasicMaterial({color:0xffd08a,transparent:true,opacity:.9}));flashMesh.rotation.x=-Math.PI/2;flashMesh.position.set(0,.015,-1.25);flashMesh.visible=false;rifle.add(flashMesh);

const targets=[];
function makeTarget(x,z,index){const group=new THREE.Group();group.position.set(x,0,z);group.userData.baseX=x;group.userData.phase=index*1.8;group.userData.hit=false;group.userData.speed=.35+index*.12;
 const uniform=mat(index===1?0x555d4d:0x454f43,.92),skin=mat(0x8c7864,.95),gear=mat(0x343c37,.8),helmet=mat(0x343f38,.7),boots=mat(0x252b27,.9);
 function part(geometry,material,pos,rot){const m=new THREE.Mesh(geometry,material);m.position.set(...pos);if(rot)m.rotation.set(...rot);m.castShadow=true;m.receiveShadow=true;group.add(m);return m;}
 // Combat silhouette with helmet, torso, limbs and field gear.
 part(new THREE.CylinderGeometry(.34,.42,.95,10),uniform,[0,1.28,0]);
 part(new THREE.SphereGeometry(.25,12,10),skin,[0,1.96,0]);
 part(new THREE.SphereGeometry(.29,12,8),helmet,[0,2.13,-.015]);
 part(new THREE.BoxGeometry(.55,.28,.32),gear,[0,1.28,.23]);
 part(new THREE.CylinderGeometry(.09,.11,.72,8),uniform,[-.43,1.35,0],[0,0,-.22]);
 part(new THREE.CylinderGeometry(.09,.11,.72,8),uniform,[.43,1.35,0],[0,0,.22]);
 part(new THREE.CylinderGeometry(.12,.14,.78,8),uniform,[-.17,.43,0],[0,0,-.04]);
 part(new THREE.CylinderGeometry(.12,.14,.78,8),uniform,[.17,.43,0],[0,0,.04]);
 part(new THREE.BoxGeometry(.22,.12,.38),boots,[-.17,.07,.05]);
 part(new THREE.BoxGeometry(.22,.12,.38),boots,[.17,.07,.05]);
 // A compact rifle across the chest.
 part(new THREE.BoxGeometry(.1,.12,.82),gear,[.12,1.35,.38],[.08,0,-.28]);
 part(new THREE.CylinderGeometry(.025,.025,.48,8),steel,[.12,1.39,.78],[Math.PI/2,0,0]);
 scene.add(group);targets.push(group);}
makeTarget(-8,-65,0);makeTarget(5,-105,1);makeTarget(19,-155,2);

const raycaster=new THREE.Raycaster();let yaw=0,pitch=0,zoomed=false,started=false,ammo=5,score=0,drag=false,lastX=0,lastY=0,recoil=0,reloadTime=0,pointerMoved=false,suppressNextClick=false;
// Mobile gyroscope aiming. The player must enable it from a direct tap gesture.
let gyroEnabled=false,gyroBaseline=null,gyroLastEvent=null,gyroSensitivity=.012,gyroScopeSensitivity=.006,gyroSmoothing=.22;
function loadGyroPreferences(){
 try{
  const saved=JSON.parse(localStorage.getItem('sniperFunGyro')||'{}');
  if(Number.isFinite(saved.camera))gyroSensitivity=THREE.MathUtils.clamp(saved.camera,.003,.024);
  if(Number.isFinite(saved.scope))gyroScopeSensitivity=THREE.MathUtils.clamp(saved.scope,.002,.016);
 }catch(_){}
}
function saveGyroPreferences(){
 try{localStorage.setItem('sniperFunGyro',JSON.stringify({camera:gyroSensitivity,scope:gyroScopeSensitivity}));}catch(_){}
}
loadGyroPreferences();
let gyroFilteredYaw=0,gyroFilteredPitch=0;
function wrapAngleDelta(value){while(value>180)value-=360;while(value<-180)value+=360;return value;}
function calibrateGyro(){
 if(!gyroEnabled||!gyroLastEvent){showMessage('ENABLE GYRO AND MOVE PHONE');return;}
 gyroBaseline={beta:gyroLastEvent.beta,gamma:gyroLastEvent.gamma,angle:screen.orientation?.angle??0};
 gyroFilteredYaw=0;gyroFilteredPitch=0;
 showMessage('GYRO RECENTERED');
}
function openGyroSettings(){ syncGyroSettingsUI();$('#gyroPanel').classList.remove('hidden'); }
function closeGyroSettings(){ $('#gyroPanel').classList.add('hidden'); }
function updateGyroSettings(){
 const cameraValue=$('#gyroSensitivity'),scopeValue=$('#gyroScopeSensitivity');
 if(cameraValue){gyroSensitivity=Number(cameraValue.value)/1000;$('#gyroSensitivityValue').textContent=(Number(cameraValue.value)/10).toFixed(1)+'×';}
 if(scopeValue){gyroScopeSensitivity=Number(scopeValue.value)/1000;$('#gyroScopeSensitivityValue').textContent=(Number(scopeValue.value)/10).toFixed(1)+'×';}
 saveGyroPreferences();
}
function syncGyroSettingsUI(){
 $('#gyroSensitivity').value=Math.round(gyroSensitivity*1000);
 $('#gyroScopeSensitivity').value=Math.round(gyroScopeSensitivity*1000);
 updateGyroSettings();
}
function onDeviceOrientation(event){
 if(!gyroEnabled||event.beta===null||event.gamma===null)return;
 const current={beta:event.beta,gamma:event.gamma,angle:screen.orientation?.angle??0};
 if(!gyroLastEvent){gyroLastEvent=current;gyroBaseline=current;return;}
 const previous=gyroLastEvent;gyroLastEvent=current;
 let yawDelta=wrapAngleDelta(current.gamma-previous.gamma);
 let pitchDelta=wrapAngleDelta(current.beta-previous.beta);
 if(current.angle===90){yawDelta=wrapAngleDelta(current.beta-previous.beta);pitchDelta=-wrapAngleDelta(current.gamma-previous.gamma);}
 else if(current.angle===270){yawDelta=-wrapAngleDelta(current.beta-previous.beta);pitchDelta=wrapAngleDelta(current.gamma-previous.gamma);}
 else if(current.angle===180){yawDelta=-yawDelta;pitchDelta=-pitchDelta;}
 const scale=zoomed?gyroScopeSensitivity:gyroSensitivity;
 gyroFilteredYaw+=(yawDelta*scale-gyroFilteredYaw)*gyroSmoothing;
 gyroFilteredPitch+=(pitchDelta*scale-gyroFilteredPitch)*gyroSmoothing;
 yaw=THREE.MathUtils.clamp(yaw-gyroFilteredYaw,-Math.PI*.48,Math.PI*.48);
 pitch=THREE.MathUtils.clamp(pitch-gyroFilteredPitch*.72,-.5,.45);
}
async function toggleGyro(){
 if(gyroEnabled){gyroEnabled=false;gyroBaseline=null;gyroLastEvent=null;removeEventListener('deviceorientation',onDeviceOrientation);updateGyroButtons();showMessage('GYRO OFF');return;}
 if(!('DeviceOrientationEvent' in window)){showMessage('GYROSCOPE NOT SUPPORTED');return;}
 if(!isSecureContext){showMessage('GYRO REQUIRES HTTPS');return;}
 try{
  if(typeof DeviceOrientationEvent.requestPermission==='function'){
   const permission=await DeviceOrientationEvent.requestPermission();
   if(permission!=='granted'){showMessage('GYRO PERMISSION DENIED');return;}
  }
  gyroEnabled=true;gyroBaseline=null;gyroLastEvent=null;gyroFilteredYaw=0;gyroFilteredPitch=0;addEventListener('deviceorientation',onDeviceOrientation,{passive:true});
  updateGyroButtons();showMessage('GYRO ON · HOLD PHONE COMFORTABLY');
 }catch(error){gyroEnabled=false;showMessage('GYRO PERMISSION UNAVAILABLE');updateGyroButtons();}
}
function updateGyroButtons(){
 const button=$('#gyro');if(!button)return;
 button.textContent=gyroEnabled?'GYRO ON':'GYRO OFF';button.classList.toggle('active',gyroEnabled);button.setAttribute('aria-pressed',String(gyroEnabled));
 const calibration=$('#calibrateGyro');if(calibration)calibration.disabled=!gyroEnabled;
}

let playerHealth=100,enemyAlert=0,incomingCooldown=2.5,missionFailed=false,shotsFired=0,missionStart=0,missionElapsed=0;
const $=s=>document.querySelector(s);
function updateHud(){$('#ammo').innerHTML=String(ammo).padStart(2,'0')+' <span>/ 05</span>';$('#score').innerHTML=String(score).padStart(2,'0')+' <span>/ 03</span>';$('#healthValue').textContent=Math.ceil(playerHealth)+'%';$('#healthBar').style.width=playerHealth+'%';$('#alertValue').textContent=enemyAlert>75?'ENGAGED':enemyAlert>30?'SEARCHING':'LOW';$('#alertBar').style.width=enemyAlert+'%';}
function showMessage(t){const el=$('#message');el.textContent=t;el.classList.add('show');clearTimeout(showMessage.timer);showMessage.timer=setTimeout(()=>el.classList.remove('show'),1300);}
function updateMissionReport(){
 const elapsed=missionStart?Math.max(0,(performance.now()-missionStart)/1000):missionElapsed;
 missionElapsed=elapsed;
 const minutes=Math.floor(elapsed/60),seconds=Math.floor(elapsed%60);
 const accuracy=shotsFired?Math.round(score/shotsFired*100):0;
 $('#statTargets').textContent=String(score).padStart(2,'0')+' / 03';
 $('#statShots').textContent=String(shotsFired).padStart(2,'0');
 $('#statAccuracy').textContent=accuracy+'%';
 $('#statTime').textContent=String(minutes).padStart(2,'0')+':'+String(seconds).padStart(2,'0');
}
function fire(){if(!started||reloadTime>0||missionFailed)return;enemyAlert=Math.min(100,enemyAlert+38);if(ammo<=0){showMessage('RELOAD REQUIRED');return;}ammo--;shotsFired++;recoil=.12;flash.intensity=5;flashMesh.visible=true;updateHud();
 raycaster.setFromCamera(new THREE.Vector2(0,0),camera);const meshes=targets.filter(t=>!t.userData.hit).flatMap(t=>t.children);const hits=raycaster.intersectObjects(meshes,false);
 if(hits.length){let root=hits[0].object;while(root.parent&&!targets.includes(root))root=root.parent;if(targets.includes(root)&&!root.userData.hit){root.userData.hit=true;root.userData.hitAt=performance.now();score++;updateHud();showMessage('TARGET NEUTRALIZED');if(score===3){missionFailed=true;updateMissionReport();showMessage('RANGE CLEARED');$('#missionTitle').textContent='MISSION COMPLETE';$('#resultTitle').innerHTML='MISSION<br><span>COMPLETE.</span>';$('#resultCopy').textContent='All training targets have been neutralized. Score: 03 / 03.';$('#result').classList.remove('hidden');}return;}}
 showMessage('SHOT FIRED');}
function reload(){if(missionFailed||reloadTime>0||ammo===5)return;reloadTime=1.25;showMessage('RELOADING');}
function retryMission(){
 score=0;ammo=5;playerHealth=100;enemyAlert=0;incomingCooldown=2.5;missionFailed=false;reloadTime=0;recoil=0;yaw=0;pitch=0;zoomed=false;shotsFired=0;missionStart=performance.now();missionElapsed=0;
 camera.fov=65;camera.updateProjectionMatrix();$('#scope').classList.remove('active');$('#zoom').classList.remove('active');
 targets.forEach(target=>{target.userData.hit=false;delete target.userData.hitAt;target.position.set(target.userData.baseX,0,target.position.z);target.rotation.set(0,0,0);});
 $('#missionTitle').textContent='LONG RANGE RECON';$('#result').classList.add('hidden');rifle.rotation.set(-.04,-.08,-.02);rifle.position.set(.42,-.38,-.82);updateHud();showMessage('MISSION RESTARTED');
}
$('#retryBtn').addEventListener('click',retryMission);
$('#howBtn').addEventListener('click',()=>$('#howPanel').classList.remove('hidden'));
$('#closeHow').addEventListener('click',()=>$('#howPanel').classList.add('hidden'));
$('#howPanel').addEventListener('click',e=>{if(e.target===$('#howPanel'))$('#howPanel').classList.add('hidden');});
function toggleZoom(){zoomed=!zoomed;camera.fov=zoomed?18:65;camera.updateProjectionMatrix();$('#scope').classList.toggle('active',zoomed);$('#zoom').classList.toggle('active',zoomed);}
function pointerDown(e){
 if(!started||e.target.closest('button'))return;
 drag=true;pointerMoved=false;suppressNextClick=false;lastX=e.clientX;lastY=e.clientY;
 try{renderer.domElement.setPointerCapture(e.pointerId);}catch(_){}
}
function pointerMove(e){
 if(!started)return;
 // Pointer-lock uses movement deltas because clientX/clientY remain centered.
 if(document.pointerLockElement===renderer.domElement){
  yaw-=((e.movementX||0))*.003;
  pitch=THREE.MathUtils.clamp(pitch-((e.movementY||0))*.002,-.5,.45);
  return;
 }
 if(!drag)return;
 const dx=e.clientX-lastX,dy=e.clientY-lastY;
 if(Math.abs(dx)+Math.abs(dy)>4)pointerMoved=true;
 yaw-=dx*.0035;
 pitch=THREE.MathUtils.clamp(pitch-dy*.0025,-.5,.45);
 lastX=e.clientX;lastY=e.clientY;
}
function pointerUp(e){if(pointerMoved)suppressNextClick=true;drag=false;try{if(renderer.domElement.hasPointerCapture(e.pointerId))renderer.domElement.releasePointerCapture(e.pointerId);}catch(_){}}
renderer.domElement.addEventListener('pointerdown',pointerDown);
renderer.domElement.addEventListener('pointermove',pointerMove);
renderer.domElement.addEventListener('pointerup',pointerUp);
renderer.domElement.addEventListener('pointercancel',pointerUp);
renderer.domElement.addEventListener('click',e=>{
 if(!started||e.target.closest('button'))return;
 if(suppressNextClick){suppressNextClick=false;return;}
 fire();
});
$('#startBtn').addEventListener('click',()=>{
 $('#start').classList.add('hidden');started=true;missionStart=performance.now();missionElapsed=0;
 // Pointer lock is desktop-only; touch devices use drag-to-look.
 if(matchMedia('(pointer:fine)').matches)renderer.domElement.requestPointerLock?.();
});
$('#fire').addEventListener('click',fire);$('#reload').addEventListener('click',reload);$('#zoom').addEventListener('click',toggleZoom);
$('#gyro').addEventListener('click',toggleGyro);$('#calibrateGyro').addEventListener('click',openGyroSettings);$('#recenterGyro').addEventListener('click',calibrateGyro);$('#closeGyroSettings').addEventListener('click',closeGyroSettings);$('#gyroSensitivity').addEventListener('input',updateGyroSettings);$('#gyroScopeSensitivity').addEventListener('input',updateGyroSettings);
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();fire();}if(e.code==='KeyR')reload();if(e.code==='KeyZ')toggleZoom();});
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));}
addEventListener('resize',resize);
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
 camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;camera.position.y=2.1+Math.sin(t*.7)*.018;
 recoil=Math.max(0,recoil-dt*.55);rifle.position.z=-.82+recoil;rifle.rotation.x=-.04+recoil*.8;
 flash.intensity=Math.max(0,flash.intensity-dt*35);if(flash.intensity===0)flashMesh.visible=false;
 if(reloadTime>0){reloadTime=Math.max(0,reloadTime-dt);rifle.rotation.z=Math.sin((1.25-reloadTime)/1.25*Math.PI)*.48;if(reloadTime===0){ammo=5;updateHud();showMessage('MAGAZINE READY');}}else rifle.rotation.z=THREE.MathUtils.lerp(rifle.rotation.z,-.02,dt*8);
 const dustAttr=dust.geometry.attributes.position;for(let i=0;i<dustCount;i++){const j=i*3;dustAttr.array[j]+=dt* dustSpeeds[i]*.75;dustAttr.array[j+1]+=Math.sin(t+i)*dt*.08;dustAttr.array[j+2]+=dt*dustSpeeds[i]*.3;if(dustAttr.array[j]>78)dustAttr.array[j]=-78;if(dustAttr.array[j+2]>8)dustAttr.array[j+2]=-220;}dustAttr.needsUpdate=true;
 // Enemies become suspicious after shots and survivors track the player's position.
 if(score<3){const alive=targets.filter(target=>!target.userData.hit);if(alive.length&&enemyAlert>0){enemyAlert=Math.max(0,enemyAlert-dt*.65);incomingCooldown-=dt;alive.forEach(target=>target.lookAt(camera.position.x,target.position.y+1.3,camera.position.z));if(incomingCooldown<=0&&enemyAlert>35){incomingCooldown=2.8+Math.random()*1.4;playerHealth=Math.max(0,playerHealth-(enemyAlert>75?9:5));showMessage('INCOMING FIRE');if(playerHealth<=0){missionFailed=true;updateMissionReport();$('#missionTitle').textContent='MISSION FAILED';$('#resultTitle').innerHTML='MISSION<br><span>FAILED.</span>';$('#resultCopy').textContent='Operator down. Regroup and try the range again.';$('#result').classList.remove('hidden');showMessage('OPERATOR DOWN');}}}}
 targets.forEach(target=>{if(!target.userData.hit){target.position.x=target.userData.baseX+Math.sin(t*target.userData.speed+target.userData.phase)*1.35;}else if(target.userData.hitAt){const fallen=Math.min((performance.now()-target.userData.hitAt)/420,1);target.rotation.z=-fallen*.9;target.position.y=-fallen*.28;}});updateHud();
 renderer.render(scene,camera);}
animate();updateHud();
