const canvas=document.getElementById('game'),ctx=canvas.getContext('2d');
const $=id=>document.getElementById(id);
const assets={map:new Image(),sander:new Image(),nemesis:new Image()};
assets.map.src='assets/map-estacao-paulista.png'; assets.sander.src='assets/sander-sprites.png'; assets.nemesis.src='assets/nemesis-sprites.png';

const state={mode:'intro',difficulty:'normal',running:false,paused:false,sound:true,time:180,teleport:0,energy:0,shake:0,last:0,flash:0};
const diff={
 easy:{hp:1800,speed:70,damage:10,attackGap:1.25,energyDrop:1.0},
 normal:{hp:2400,speed:85,damage:15,attackGap:.95,energyDrop:1.15},
 hard:{hp:3300,speed:105,damage:21,attackGap:.72,energyDrop:1.35}
};
const player={x:.36,y:.62,hp:100,energy:0,dir:1,attack:0,special:0,inv:0,frame:0};
const enemy={x:.67,y:.39,hp:2400,maxHp:2400,attack:0,stun:0,frame:0};
const keys={};
const gems=[
 [.28,.26],[.46,.25],[.78,.22],[.14,.42],[.39,.40],[.57,.48],[.82,.48],
 [.27,.67],[.49,.68],[.75,.70],[.33,.83],[.61,.84]
].map((p,i)=>({x:p[0],y:p[1],alive:true,phase:i*.8}));

function fit(){canvas.width=1280;canvas.height=800}
addEventListener('resize',fit);fit();

function show(id){['intro','difficulty','hud','pause','result','touch'].forEach(x=>$(x).classList.add('hidden'));$(id).classList.remove('hidden')}
function sfx(type){
 if(!state.sound)return;
 try{
  const A=new AudioContext(),o=A.createOscillator(),g=A.createGain();
  const f={hit:[120,65],gem:[520,780],special:[180,820],teleport:[240,1100],win:[440,660],hurt:[90,55]}[type]||[220,180];
  o.type=type==='special'?'sawtooth':'sine';o.frequency.setValueAtTime(f[0],A.currentTime);o.frequency.exponentialRampToValueAtTime(f[1],A.currentTime+.12);
  g.gain.setValueAtTime(.0001,A.currentTime);g.gain.exponentialRampToValueAtTime(.06,A.currentTime+.01);g.gain.exponentialRampToValueAtTime(.0001,A.currentTime+.16);
  o.connect(g).connect(A.destination);o.start();o.stop(A.currentTime+.18);
 }catch(e){}
}
function resetGame(){
 const d=diff[state.difficulty]; state.running=true;state.paused=false;state.time=180;state.teleport=0;state.energy=0;state.shake=0;state.flash=0;
 Object.assign(player,{x:.36,y:.62,hp:100,energy:0,dir:1,attack:0,special:0,inv:0,frame:0});
 Object.assign(enemy,{x:.67,y:.39,hp:d.hp,maxHp:d.hp,attack:0,stun:0,frame:0});
 gems.forEach(g=>g.alive=true);
 show('hud'); $('touch').classList.remove('hidden'); updateHud(); last=performance.now(); requestAnimationFrame(loop);
}
$('startBtn').onclick=()=>{state.mode='difficulty';show('difficulty')};
document.querySelectorAll('[data-difficulty]').forEach(b=>b.onclick=()=>{state.difficulty=b.dataset.difficulty;resetGame()});
$('pauseBtn').onclick=()=>togglePause();$('resumeBtn').onclick=()=>togglePause();
$('soundBtn').onclick=()=>{state.sound=!state.sound;$('soundBtn').textContent=state.sound?'🔊':'🔇'};
$('restartBtn').onclick=()=>resetGame();
function togglePause(){if(!state.running)return;state.paused=!state.paused;$('pause').classList.toggle('hidden',!state.paused);if(!state.paused){last=performance.now();requestAnimationFrame(loop)}}

addEventListener('keydown',e=>{keys[e.key.toLowerCase()]=true;if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase()))e.preventDefault();if(e.key.toLowerCase()==='p')togglePause();});
addEventListener('keyup',e=>keys[e.key.toLowerCase()]=false);
document.querySelectorAll('[data-key]').forEach(b=>{
 const k=b.dataset.key.toLowerCase();
 ['pointerdown','touchstart'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();keys[k]=true}));
 ['pointerup','pointercancel','pointerleave','touchend'].forEach(ev=>b.addEventListener(ev,e=>{e.preventDefault();keys[k]=false}));
});

function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function clamp(v,a,b){return Math.max(a,Math.min(b,v))}
function worldX(v){return v*canvas.width} function worldY(v){return v*canvas.height}
function damageEnemy(n){enemy.hp=Math.max(0,enemy.hp-n);enemy.stun=.18;state.shake=8;state.flash=.1;sfx('hit');if(enemy.hp<=0)finish(true)}
function collectGems(dt){
 gems.forEach(g=>{if(!g.alive)return;g.phase+=dt*3;if(dist(player,g)<.055){g.alive=false;player.energy=clamp(player.energy+180,0,1000);state.energy=player.energy;sfx('gem');}});
}
function basicAttack(){
 if(player.attack>0)return;player.attack=.38;player.frame=1;
 if(dist(player,enemy)<.18){damageEnemy(90+player.energy*.035);player.energy=Math.max(0,player.energy-25)}
}
function specialAttack(){
 if(player.special>0)return;player.special=2.4;player.frame=2;
 const d=dist(player,enemy); if(d<.48){damageEnemy(260+player.energy*.16);player.energy=Math.max(0,player.energy-120)}
 sfx('special');state.shake=14;
}
function teleport(){
 if(state.teleport>0)return;
 player.x=clamp(enemy.x+(Math.random()>.5?.22:-.22),.08,.92);player.y=clamp(enemy.y+(Math.random()>.5?.18:-.18),.14,.88);
 state.teleport=30;player.inv=.6;sfx('teleport');state.shake=7;
}
function update(dt){
 if(!state.running||state.paused)return;
 state.time-=dt;state.teleport=Math.max(0,state.teleport-dt);player.attack=Math.max(0,player.attack-dt);player.special=Math.max(0,player.special-dt);player.inv=Math.max(0,player.inv-dt);enemy.attack=Math.max(0,enemy.attack-dt);enemy.stun=Math.max(0,enemy.stun-dt);
 const sp=.28*dt;
 let dx=0,dy=0;
 if(keys.arrowleft)dx--;if(keys.arrowright)dx++;if(keys.arrowup)dy--;if(keys.arrowdown)dy++;
 if(dx||dy){const m=Math.hypot(dx,dy);player.x=clamp(player.x+dx/m*sp,.08,.92);player.y=clamp(player.y+dy/m*sp,.14,.90);player.dir=dx<0?-1:dx>0?1:player.dir;player.frame=3}else player.frame=0;
 if(keys.z){basicAttack();keys.z=false} if(keys.x){specialAttack();keys.x=false} if(keys.c){teleport();keys.c=false}
 collectGems(dt);
 // Enemy AI
 const d=diff[state.difficulty], ed=dist(player,enemy);
 if(enemy.stun<=0){
   if(ed>.17){const ex=(player.x-enemy.x)/Math.max(ed,.001),ey=(player.y-enemy.y)/Math.max(ed,.001);enemy.x=clamp(enemy.x+ex*d.speed/1000*dt,.1,.9);enemy.y=clamp(enemy.y+ey*d.speed/1000*dt,.15,.88)}
   else if(enemy.attack<=0){enemy.attack=d.attackGap;player.inv>0?null:(player.hp=Math.max(0,player.hp-d.damage),sfx('hurt'),state.shake=10);if(player.hp<=0)finish(false)}
 }
 enemy.frame=ed<.2?1:0;
 if(Math.random()<dt*.03){const alive=gems.filter(g=>!g.alive);if(alive.length){alive[Math.floor(Math.random()*alive.length)].alive=true}}
 if(state.time<=0)finish(false,'O tempo acabou. O Némesis permaneceu de pé.');
 state.shake=Math.max(0,state.shake-dt*30);state.flash=Math.max(0,state.flash-dt);
 updateHud();
}
function updateHud(){
 $('sanderHp').style.width=player.hp+'%';$('sanderEnergy').style.width=(player.energy/10)+'%';$('nemesisHp').style.width=(enemy.hp/enemy.maxHp*100)+'%';
 const t=Math.max(0,Math.ceil(state.time));$('timer').textContent=String(Math.floor(t/60)).padStart(2,'0')+':'+String(t%60).padStart(2,'0');$('timer').classList.toggle('timer-low',t<30);
 $('teleportStatus').textContent=state.teleport<=0?'TELEPORTE: PRONTO':`TELEPORTE: ${Math.ceil(state.teleport)}s`;
}
function finish(win,txt){state.running=false;$('touch').classList.add('hidden');$('result').classList.remove('hidden');$('resultIcon').textContent=win?'🏆':'⚡';$('resultTitle').textContent=win?'VITÓRIA!':'DERROTA';$('resultText').textContent=txt||(win?'Sander derrotou o Némesis e dominou a arena!':'Sander ficou sem energia antes de concluir o confronto.');sfx(win?'win':'hurt')}

function drawMap(){
 const im=assets.map;
 if(im.complete)ctx.drawImage(im,0,0,canvas.width,canvas.height);
 else{ctx.fillStyle='#123';ctx.fillRect(0,0,canvas.width,canvas.height)}
 // subtle gameplay tint
 const grad=ctx.createLinearGradient(0,0,0,canvas.height);grad.addColorStop(0,'rgba(3,15,35,.08)');grad.addColorStop(1,'rgba(3,12,27,.25)');ctx.fillStyle=grad;ctx.fillRect(0,0,canvas.width,canvas.height);
}
function sprite(img,frame,x,y,flip=false,scale=.22){
 const cols=4,rows=4,sw=img.width/cols,sh=img.height/rows;const sx=(frame%cols)*sw,sy=Math.floor(frame/cols)*sh;
 const dw=sw*scale,dh=sh*scale;
 ctx.save();ctx.translate(x,y);if(flip)ctx.scale(-1,1);ctx.globalAlpha=1;
 ctx.drawImage(img,sx,sy,sw,sh,-dw/2,-dh*.88,dw,dh);ctx.restore();
}
function glow(x,y,r,c1,c2){
 const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,c1);g.addColorStop(1,c2);ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
}
function drawGems(time){
 gems.forEach(g=>{if(!g.alive)return;const x=worldX(g.x),y=worldY(g.y)+Math.sin(time/300+g.phase)*5;glow(x,y,22,'rgba(255,231,65,.42)','rgba(255,168,0,0)');ctx.fillStyle='#ffd83d';ctx.beginPath();ctx.arc(x,y,9,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#fff3a0';ctx.lineWidth=2;ctx.stroke()});
}
function drawEffects(){
 if(player.attack>0){ctx.strokeStyle='rgba(86,213,255,.9)';ctx.lineWidth=8;ctx.beginPath();ctx.arc(worldX(player.x)+player.dir*35,worldY(player.y)-45,55,-.8,.8);ctx.stroke()}
 if(player.special>0){const x=worldX(player.x)+player.dir*90,y=worldY(player.y)-65;glow(x,y,85,'rgba(65,218,255,.5)','rgba(80,60,255,0)');ctx.strokeStyle='rgba(120,235,255,.9)';ctx.lineWidth=5;ctx.beginPath();ctx.arc(x,y,65,-.7,.7);ctx.stroke()}
 if(enemy.attack<.12&&dist(player,enemy)<.22){ctx.strokeStyle='rgba(255,110,70,.8)';ctx.lineWidth=8;ctx.beginPath();ctx.arc(worldX(enemy.x),worldY(enemy.y)-50,60,0,Math.PI*2);ctx.stroke()}
}
function draw(time){
 ctx.save();if(state.shake){ctx.translate((Math.random()-.5)*state.shake,(Math.random()-.5)*state.shake)}
 drawMap();drawGems(time);
 // target rings
 ctx.strokeStyle='rgba(70,170,255,.45)';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(worldX(player.x),worldY(player.y)+15,55,16,0,0,Math.PI*2);ctx.stroke();
 ctx.strokeStyle='rgba(255,150,70,.6)';ctx.beginPath();ctx.ellipse(worldX(enemy.x),worldY(enemy.y)+15,60,18,0,0,Math.PI*2);ctx.stroke();
 sprite(assets.sander,player.frame,worldX(player.x),worldY(player.y),player.dir<0,.22);
 sprite(assets.nemesis,enemy.frame,worldX(enemy.x),worldY(enemy.y),enemy.x<player.x,.20);
 drawEffects();
 // nameplates
 ctx.font='900 14px system-ui';ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText('SANDER',worldX(player.x),worldY(player.y)-110);ctx.fillStyle='#ffe28a';ctx.fillText('NÉMESIS',worldX(enemy.x),worldY(enemy.y)-112);
 ctx.restore();
 if(state.flash){ctx.fillStyle=`rgba(120,220,255,${state.flash*.7})`;ctx.fillRect(0,0,canvas.width,canvas.height)}
}
function loop(t){if(!state.running)return;const dt=Math.min(.035,(t-last)/1000);last=t;update(dt);draw(t);requestAnimationFrame(loop)}
// Wait for assets but allow the game to start immediately.
Promise.all(Object.values(assets).map(i=>new Promise(r=>{if(i.complete)r();else i.onload=r}))).then(()=>draw(0));
