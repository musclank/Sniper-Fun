import * as THREE from 'three';
import './style.css';

const app=document.querySelector('#app');
const scene=new THREE.Scene();
scene.background=new THREE.Color(0x9caeae);
scene.fog=new THREE.FogExp2(0x9caeae,0.0018);
const camera=new THREE.PerspectiveCamera(65,innerWidth/innerHeight,.1,1800);
camera.position.set(0,2.1,12);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.15;
app.prepend(renderer.domElement);

scene.add(new THREE.HemisphereLight(0xdceaff,0x596044,2.1));
const sun=new THREE.DirectionalLight(0xffe0b2,3.4);sun.position.set(-35,65,25);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-100;sun.shadow.camera.right=100;sun.shadow.camera.top=100;sun.shadow.camera.bottom=-100;scene.add(sun);
const mat=(color,roughness=1)=>new THREE.MeshStandardMaterial({color,roughness});
const ground=new THREE.Mesh(new THREE.PlaneGeometry(1200,1200),mat(0x77775e));ground.rotation.x=-Math.PI/2;ground.position.y=-.08;ground.receiveShadow=true;scene.add(ground);
const hillMat=mat(0x626b62),rockMat=mat(0x777b70);
function ridge(x,z,sx,sy,sz,material=hillMat){const m=new THREE.Mesh(new THREE.ConeGeometry(1,1,5),material);m.position.set(x,sy/2-1,z);m.scale.set(sx,sy,sz);m.rotation.y=Math.random();m.castShadow=true;m.receiveShadow=true;scene.add(m);}
for(let i=0;i<24;i++){const x=(Math.random()-.5)*420,z=-100-Math.random()*250;ridge(x,z,25+Math.random()*55,25+Math.random()*65,30+Math.random()*45,i%3?hillMat:rockMat);}
const floorGrid=new THREE.GridHelper(500,100,0x9b9a79,0x8b8b72);floorGrid.position.y=.01;floorGrid.material.transparent=true;floorGrid.material.opacity=.12;scene.add(floorGrid);
// Sparse dry vegetation and range structures
for(let i=0;i<90;i++){const x=(Math.random()-.5)*180,z=-15-Math.random()*180;const h=.6+Math.random()*1.8;const shrub=new THREE.Mesh(new THREE.DodecahedronGeometry(.5,0),mat(i%2?0x555b3f:0x77734d));shrub.position.set(x,h/2-.05,z);shrub.scale.set(1,h,1);shrub.castShadow=true;scene.add(shrub);}
const targets=[];
function makeTarget(x,z){const group=new THREE.Group();group.position.set(x,0,z);const body=new THREE.Mesh(new THREE.CylinderGeometry(.32,.42,1.55,12),mat(0x343c39,.7));body.position.y=1.15;body.castShadow=true;group.add(body);const head=new THREE.Mesh(new THREE.SphereGeometry(.28,14,12),mat(0x8b806b));head.position.y=2.08;head.castShadow=true;group.add(head);const plate=new THREE.Mesh(new THREE.BoxGeometry(1.3,.16,.12),mat(0x9c9b83));plate.position.y=2.75;group.add(plate);const pole=new THREE.Mesh(new THREE.CylinderGeometry(.045,.045,3.3,8),mat(0x454942));pole.position.set(0,1.5,-.13);group.add(pole);group.userData.hit=false;scene.add(group);targets.push(group);}
makeTarget(-8,-65);makeTarget(5,-105);makeTarget(19,-155);
const raycaster=new THREE.Raycaster();let yaw=0,pitch=0,zoomed=false,started=false,ammo=5,score=0,drag=false,lastX=0,lastY=0;
const $=s=>document.querySelector(s);
function updateHud(){$('#ammo').innerHTML=String(ammo).padStart(2,'0')+' <span>/ 05</span>';$('#score').innerHTML=String(score).padStart(2,'0')+' <span>/ 03</span>';}
function showMessage(t){const el=$('#message');el.textContent=t;el.classList.add('show');clearTimeout(showMessage.timer);showMessage.timer=setTimeout(()=>el.classList.remove('show'),1300);}
function fire(){if(!started)return;if(ammo<=0){showMessage('RELOAD REQUIRED');return;}ammo--;updateHud();raycaster.setFromCamera(new THREE.Vector2(0,0),camera);const meshes=targets.filter(t=>!t.userData.hit).flatMap(t=>t.children);const hits=raycaster.intersectObjects(meshes,false);if(hits.length){let root=hits[0].object;while(root.parent&&!targets.includes(root))root=root.parent;if(targets.includes(root)&&!root.userData.hit){root.userData.hit=true;root.rotation.z=-.9;root.position.y=-.3;score++;updateHud();showMessage('TARGET NEUTRALIZED');if(score===3)showMessage('RANGE CLEARED');return;}}showMessage('SHOT FIRED');}
function reload(){ammo=5;updateHud();showMessage('MAGAZINE RELOADED');}
function toggleZoom(){zoomed=!zoomed;camera.fov=zoomed?18:65;camera.updateProjectionMatrix();$('#scope').classList.toggle('active',zoomed);$('#zoom').classList.toggle('active',zoomed);}
function pointerDown(e){if(!started||e.target.closest('button'))return;drag=true;lastX=e.clientX;lastY=e.clientY;}
function pointerMove(e){if(!drag)return;yaw-=(e.clientX-lastX)*.003;pitch-=(e.clientY-lastY)*.002;pitch=THREE.MathUtils.clamp(pitch,-.5,.45);lastX=e.clientX;lastY=e.clientY;}
function pointerUp(){drag=false;}
renderer.domElement.addEventListener('pointerdown',pointerDown);addEventListener('pointermove',pointerMove);addEventListener('pointerup',pointerUp);
renderer.domElement.addEventListener('click',e=>{if(started&&!e.target.closest('button'))fire();});
$('#startBtn').addEventListener('click',()=>{$('#start').classList.add('hidden');started=true;renderer.domElement.requestPointerLock?.();});
$('#fire').addEventListener('click',fire);$('#reload').addEventListener('click',reload);$('#zoom').addEventListener('click',toggleZoom);
addEventListener('keydown',e=>{if(e.code==='Space')fire();if(e.code==='KeyR')reload();if(e.code==='KeyZ')toggleZoom();});
function resize(){camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight);renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));}
addEventListener('resize',resize);
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const t=clock.getElapsedTime();camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;camera.position.y=2.1+Math.sin(t*.7)*.018;renderer.render(scene,camera);}
animate();updateHud();
