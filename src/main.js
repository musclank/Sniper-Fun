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
 const body=new THREE.Mesh(new THREE.CylinderGeometry(.32,.42,1.55,12),mat(0x343c39,.7));body.position.y=1.15;body.castShadow=true;group.add(body);
 const head=new THREE.Mesh(new THREE.SphereGeometry(.28,14,12),mat(0x8b806b));head.position.y=2.08;head.castShadow=true;group.add(head);
 const plate=new THREE.Mesh(new THREE.BoxGeometry(1.3,.16,.12),mat(0x9c9b83));plate.position.y=2.75;group.add(plate);
 const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,3.3,8),mat(0x454942));pole.position.set(0,1.5,-.13);group.add(pole);
 const marker=new THREE.Mesh(new THREE.BoxGeometry(.16,.16,.08),new THREE.MeshBasicMaterial({color:0xb99c5d}));marker.position.set(0,2.75,.08);group.add(marker);
 scene.add(group);targets.push(group);}
makeTarget(-8,-65,0);makeTarget(5,-105,1);makeTarget(19,-155,2);

const raycaster=new THREE.Raycaster();let yaw=0,pitch=0,zoomed=false,started=false,ammo=5,score=0,drag=false,lastX=0,lastY=0,recoil=0,reloadTime=0;
const $=s=>document.querySelector(s);
function updateHud(){$('#ammo').innerHTML=String(ammo).padStart(2,'0')+' <span>/ 05</span>';$('#score').innerHTML=String(score).padStart(2,'0')+' <span>/ 03</span>';}
function showMessage(t){const el=$('#message');el.textContent=t;el.classList.add('show');clearTimeout(showMessage.timer);showMessage.timer=setTimeout(()=>el.classList.remove('show'),1300);}
function fire(){if(!started||reloadTime>0)return;if(ammo<=0){showMessage('RELOAD REQUIRED');return;}ammo--;recoil=.12;flash.intensity=5;flashMesh.visible=true;updateHud();
 raycaster.setFromCamera(new THREE.Vector2(0,0),camera);const meshes=targets.filter(t=>!t.userData.hit).flatMap(t=>t.children);const hits=raycaster.intersectObjects(meshes,false);
 if(hits.length){let root=hits[0].object;while(root.parent&&!targets.includes(root))root=root.parent;if(targets.includes(root)&&!root.userData.hit){root.userData.hit=true;root.userData.hitAt=performance.now();score++;updateHud();showMessage('TARGET NEUTRALIZED');if(score===3){showMessage('RANGE CLEARED');$('#missionTitle').textContent='MISSION COMPLETE';}return;}}
 showMessage('SHOT FIRED');}
function reload(){if(reloadTime>0||ammo===5)return;reloadTime=1.25;showMessage('RELOADING');}
function toggleZoom(){zoomed=!zoomed;camera.fov=zoomed?18:65;camera.updateProjectionMatrix();$('#scope').classList.toggle('active',zoomed);$('#zoom').classList.toggle('active',zoomed);}
function pointerDown(e){if(!started||e.target.closest('button'))return;drag=true;lastX=e.clientX;lastY=e.clientY;}
function pointerMove(e){if(!drag)return;yaw-=(e.clientX-lastX)*.003;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-lastY)*.002,-.5,.45);lastX=e.clientX;lastY=e.clientY;}
function pointerUp(){drag=false;}
renderer.domElement.addEventListener('pointerdown',pointerDown);addEventListener('pointermove',pointerMove);addEventListener('pointerup',pointerUp);
renderer.domElement.addEventListener('click',e=>{if(started&&!e.target.closest('button'))fire();});
$('#startBtn').addEventListener('click',()=>{$('#start').classList.add('hidden');started=true;renderer.domElement.requestPointerLock?.();});
$('#fire').addEventListener('click',fire);$('#reload').addEventListener('click',reload);$('#zoom').addEventListener('click',toggleZoom);
addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();fire();}if(e.code==='KeyR')reload();if(e.code==='KeyZ')toggleZoom();});
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));}
addEventListener('resize',resize);
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;
 camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;camera.position.y=2.1+Math.sin(t*.7)*.018;
 recoil=Math.max(0,recoil-dt*.55);rifle.position.z=-.82+recoil;rifle.rotation.x=-.04+recoil*.8;
 flash.intensity=Math.max(0,flash.intensity-dt*35);if(flash.intensity===0)flashMesh.visible=false;
 if(reloadTime>0){reloadTime=Math.max(0,reloadTime-dt);rifle.rotation.z=Math.sin((1.25-reloadTime)/1.25*Math.PI)*.48;if(reloadTime===0){ammo=5;updateHud();showMessage('MAGAZINE READY');}}else rifle.rotation.z=THREE.MathUtils.lerp(rifle.rotation.z,-.02,dt*8);
 targets.forEach(target=>{if(!target.userData.hit){target.position.x=target.userData.baseX+Math.sin(t*target.userData.speed+target.userData.phase)*1.35;}else if(target.userData.hitAt){const fallen=Math.min((performance.now()-target.userData.hitAt)/420,1);target.rotation.z=-fallen*.9;target.position.y=-fallen*.28;}});
 renderer.render(scene,camera);}
animate();updateHud();
