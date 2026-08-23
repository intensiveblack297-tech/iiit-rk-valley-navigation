const campusCenter = '14.33571,78.53841';

const blocks = [
  {name:'AB-1',icon:'🏢',query:'Academic Block 1, IIIT RGUKT RK Valley',type:'academic'},
  {name:'AB-2',icon:'🏢',query:'Academic Block 2, IIIT RGUKT RK Valley',type:'academic'},
  {name:'BH-1',icon:'🏠',query:'Boys Hostel 1, IIIT RGUKT RK Valley',type:'hostel'},
  {name:'BH-2',icon:'🏠',query:'Boys Hostel 2, IIIT RGUKT RK Valley',type:'hostel'},
  {name:'GH-1',icon:'🏠',query:'Girls Hostel 1, IIIT RGUKT RK Valley',type:'hostel'},
  {name:'SAC',icon:'🏟️',query:'Student Activity Centre, IIIT RGUKT RK Valley',type:'sports'}
];

const academicFloors = [
  ['101','102','103','104','105 — CSE Department','106 — ECE Department','107 — EEE Department','108','109 — CE Department','110 — Academic Office'],
  ['201','202','203','204','205 — CSE Lab','206 — ECE Lab','207 — EEE Lab','208 — IT Department','209 — ME Department','210 — Faculty Room'],
  ['301 — CSE Department','302 — ECE Department','303 — EEE Department','304 — MME Department','305 — Seminar Hall','306 — Project Lab','307 — CHE Department','308 — Mathematics','309 — Physics/Chemistry','310 — Common Room']
];

const hostelFloors = [
  ['101','102','103','104','105','106','107','108','109','110 — Warden Office'],
  ['201','202','203','204','205','206','207','208','209','210 — Common Room'],
  ['301','302','303','304','305','306','307','308','309','310 — Study Room']
];

const sacFloors = [
  ['SAC Entrance','Gym','Indoor Gymnasium','Table Tennis','Badminton','Chess / Indoor Games','Student Clubs Room','Multipurpose Hall','Basketball Court','Tennis Court','Volleyball Court','Sports Office']
];

const floorNames=['Ground Floor','First Floor','Second Floor'];
const currentBuilding=document.getElementById('currentBuilding'),currentFloor=document.getElementById('currentFloor'),currentRoom=document.getElementById('currentRoom');
const destinationBuilding=document.getElementById('destinationBuilding'),destinationFloor=document.getElementById('destinationFloor'),destinationRoom=document.getElementById('destinationRoom');
const message=document.getElementById('message'),routeResult=document.getElementById('routeResult'),routeSummary=document.getElementById('routeSummary'),steps=document.getElementById('steps'),floorPreview=document.getElementById('floorPreview'),googleMaps=document.getElementById('googleMaps'),locations=document.getElementById('locations');

function floorsFor(b){if(blocks[b].type==='hostel')return hostelFloors;if(blocks[b].type==='sports')return sacFloors;return academicFloors;}
function roomsFor(b,f){return floorsFor(b)[f]||[];}
function floorLabel(b,f){return blocks[b].type==='sports'?'SAC / Ground Level':floorNames[f];}
function fillBuildings(s){s.innerHTML=blocks.map((b,i)=>`<option value="${i}">${b.icon} ${b.name}</option>`).join('');}
function fillFloors(s,b){s.innerHTML=floorsFor(b).map((_,i)=>`<option value="${i}">${floorLabel(b,i)}</option>`).join('');}
function fillRooms(s,b,f){s.innerHTML=roomsFor(b,f).map((r,i)=>`<option value="${i}">${r}</option>`).join('');}
function placeName(b,f,r){return `${blocks[b].name} • ${floorLabel(b,f)} • ${roomsFor(b,f)[r]||'Entrance'}`;}

// Google Maps fallback: prototype building names are not always recognized by Maps.
// We use the campus coordinate as a stable origin and also provide a direct destination search.
function mapsSearchUrl(query){return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;}
function mapsDirectionsUrl(fromBlock,toBlock){
  const origin=encodeURIComponent(`${campusCenter} (${blocks[fromBlock].name}), IIIT RGUKT RK Valley`);
  const destination=encodeURIComponent(blocks[toBlock].query);
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
}

fillBuildings(currentBuilding);fillBuildings(destinationBuilding);fillFloors(currentFloor,0);fillFloors(destinationFloor,0);fillRooms(currentRoom,0,0);fillRooms(destinationRoom,0,0);
currentBuilding.addEventListener('change',()=>{fillFloors(currentFloor,+currentBuilding.value);fillRooms(currentRoom,+currentBuilding.value,+currentFloor.value);});
destinationBuilding.addEventListener('change',()=>{fillFloors(destinationFloor,+destinationBuilding.value);fillRooms(destinationRoom,+destinationBuilding.value,+destinationFloor.value);});
currentFloor.addEventListener('change',()=>fillRooms(currentRoom,+currentBuilding.value,+currentFloor.value));
destinationFloor.addEventListener('change',()=>fillRooms(destinationRoom,+destinationBuilding.value,+destinationFloor.value));

blocks.forEach(b=>{const d=document.createElement('div');d.className='place';const description=b.type==='hostel'?'3 floors • residential rooms • warden/common/study spaces • no labs':b.type==='sports'?'Student Activity Centre • gym • tennis • basketball • badminton • indoor games':'3 floors • departments • classrooms • labs • faculty/academic facilities';d.innerHTML=`<strong>${b.icon} ${b.name}</strong><span>${description}</span>`;locations.appendChild(d);});

function nodeRoom(i){return `r${i}`;}function nodeCorridor(i){return `c${i}`;}
function buildGraph(count){const g={};for(let i=0;i<count;i++){const r=nodeRoom(i),c=nodeCorridor(i%5);g[r]??=[];g[c]??=[];g[r].push({to:c,cost:1});g[c].push({to:r,cost:1});}for(let i=0;i<4;i++){g[nodeCorridor(i)].push({to:nodeCorridor(i+1),cost:1});g[nodeCorridor(i+1)].push({to:nodeCorridor(i),cost:1});}return g;}
function aStar(g,start,goal){const open=[start],came={},cost={[start]:0},score={[start]:1};while(open.length){open.sort((a,b)=>score[a]-score[b]);const cur=open.shift();if(cur===goal){const path=[cur];while(came[path[0]])path.unshift(came[path[0]]);return path;}for(const e of g[cur]||[]){const n=(cost[cur]??Infinity)+e.cost;if(n<(cost[e.to]??Infinity)){came[e.to]=cur;cost[e.to]=n;score[e.to]=n+(e.to===goal?0:1);if(!open.includes(e.to))open.push(e.to);}}}return [];}
function center(i,count){const row=i%5,side=i<Math.ceil(count/2)?'left':'right';return side==='left'?{x:17,y:12+row*17}:{x:83,y:12+row*17};}
function routeSvg(c,d,b,f){if(c<0||d<0||c===d)return '';const count=roomsFor(b,f).length,path=aStar(buildGraph(count),nodeRoom(c),nodeRoom(d));if(!path.length)return '';const pts=path.map(n=>n[0]==='r'?center(Number(n.slice(1)),count):{x:50,y:12+Number(n.slice(1))*17});const line=pts.map((p,i)=>`${i?'L':'M'} ${p.x} ${p.y}`).join(' ');return `<svg class="route-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Calculated indoor route"><defs><marker id="arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#2563eb"/></marker></defs><path class="route-shadow" d="${line}"/><path class="route-line" d="${line}" marker-end="url(#arrow)"/><circle class="route-start" cx="${pts[0].x}" cy="${pts[0].y}" r="2.2"/><circle class="route-end" cx="${pts.at(-1).x}" cy="${pts.at(-1).y}" r="2.5"/></svg>`;}
function renderFloorMap(b,f,c,d,show=true){const rooms=roomsFor(b,f),markup=rooms.map((r,i)=>`<div class="room ${i===c?'current':''} ${i===d?'destination':''}" style="grid-column:${i<Math.ceil(rooms.length/2)?1:3};grid-row:${i%5+1}"><span>${r}</span></div>`).join(''),route=show?routeSvg(c,d,b,f):'';floorPreview.innerHTML=`<div class="floor-title">${blocks[b].name} — ${floorLabel(b,f)} <span class="prototype-label">(prototype)</span></div><div class="map-legend"><span class="legend-item"><i class="legend-dot current"></i> Current</span><span class="legend-item"><i class="legend-dot destination"></i> Destination</span><span class="legend-item"><i class="legend-dot route"></i> Calculated route</span><span class="legend-item"><i class="legend-dot stairs"></i> Stairs / elevator</span></div><div class="floor-map-shell"><div class="floor-map"><div class="floor-map-label">Conceptual floor plan • ${blocks[b].name}</div><div class="floor-plan">${markup}<div class="corridor">↕ MAIN CORRIDOR<br>↕</div>${route}</div><div class="entrance">🚪 MAIN ENTRANCE</div><div class="stairs">🪜 STAIRS + ELEVATOR</div></div></div><div class="map-note">Simulated navigation graph for the prototype. Hostel blocks contain residential rooms and common facilities only — no lab rooms. Department and SAC facilities are prototype entries until official campus data is available.</div>`;}
function addStep(text){const n=steps.children.length+1,e=document.createElement('div');e.className='step';e.innerHTML=`<div class="step-number">${n}</div><div>${text}</div>`;steps.appendChild(e);}
function setMapsButtons(fromBlock,toBlock){googleMaps.hidden=false;googleMaps.textContent='🌍 Open Route in Google Maps';googleMaps.onclick=()=>window.open(mapsDirectionsUrl(fromBlock,toBlock),'_blank','noopener,noreferrer');const searchButton=document.createElement('button');searchButton.className='secondary-button';searchButton.textContent='📍 Open Destination in Google Maps';searchButton.onclick=()=>window.open(mapsSearchUrl(blocks[toBlock].query),'_blank','noopener,noreferrer');googleMaps.parentElement.appendChild(searchButton);}

document.getElementById('navigate').addEventListener('click',()=>{
  const cb=+currentBuilding.value,cf=+currentFloor.value,cr=+currentRoom.value,db=+destinationBuilding.value,df=+destinationFloor.value,dr=+destinationRoom.value;
  routeResult.hidden=false;steps.innerHTML='';floorPreview.innerHTML='';googleMaps.hidden=true;document.querySelectorAll('.result-heading .secondary-button + .secondary-button').forEach(e=>e.remove());message.textContent='';
  if(cb===db&&cf===df&&cr===dr){routeSummary.textContent=`You are already at ${placeName(db,df,dr)}.`;addStep('No route is needed — your current location and destination are the same.');renderFloorMap(db,df,cr,dr,false);return;}
  routeSummary.textContent=`${placeName(cb,cf,cr)} → ${placeName(db,df,dr)}`;addStep(`Start at ${placeName(cb,cf,cr)}.`);
  if(cb===db&&cf===df){addStep('Follow the calculated blue A* route through the corridor.');addStep(`Arrive at ${roomsFor(db,df)[dr]} 🎯.`);renderFloorMap(db,df,cr,dr,true);return;}
  if(cb===db){addStep('Follow the indoor route to the nearest stairs/elevator.');addStep(`Take the stairs/elevator from ${floorLabel(cb,cf)} to ${floorLabel(db,df)}.`);addStep(`Follow the corridor on ${floorLabel(db,df)} to ${roomsFor(db,df)[dr]}.`);renderFloorMap(db,df,-1,dr,false);return;}
  addStep(`Follow the indoor route to the ${blocks[cb].name} entrance/exit.`);addStep(`For the outdoor section, open Google Maps and continue toward ${blocks[db].name}.`);addStep(`At ${blocks[db].name}, go to ${floorLabel(db,df)} and follow the indoor route to ${roomsFor(db,df)[dr]}.`);setMapsButtons(cb,db);renderFloorMap(db,df,-1,dr,false);
});