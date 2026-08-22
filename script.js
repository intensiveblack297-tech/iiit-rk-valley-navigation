const blocks=[
  {name:'AB-1',icon:'🏢',query:'Academic Block 1, IIIT RGUKT RK Valley'},
  {name:'AB-2',icon:'🏢',query:'Academic Block 2, IIIT RGUKT RK Valley'},
  {name:'BH-1',icon:'🏠',query:'Boys Hostel 1, IIIT RGUKT RK Valley'},
  {name:'BH-2',icon:'🏠',query:'Boys Hostel 2, IIIT RGUKT RK Valley'},
  {name:'GH-1',icon:'🏠',query:'Girls Hostel 1, IIIT RGUKT RK Valley'}
];
const facilityByFloor={
  0:['101','102','103','104','105 — Lab','106 — Lab','107','108','109','110 — Office'],
  1:['201','202','203','204','205 — Lab','206 — Lab','207','208','209','210 — Faculty Room'],
  2:['301','302','303','304','305 — Seminar','306 — Project Lab','307','308','309','310 — Common Room']
};
const floorNames=['Ground Floor','First Floor','Second Floor'];
const currentBuilding=document.getElementById('currentBuilding'),currentFloor=document.getElementById('currentFloor'),currentRoom=document.getElementById('currentRoom');
const destinationBuilding=document.getElementById('destinationBuilding'),destinationFloor=document.getElementById('destinationFloor'),destinationRoom=document.getElementById('destinationRoom');
const message=document.getElementById('message'),routeResult=document.getElementById('routeResult'),routeSummary=document.getElementById('routeSummary'),steps=document.getElementById('steps'),floorPreview=document.getElementById('floorPreview'),googleMaps=document.getElementById('googleMaps'),locations=document.getElementById('locations');

function fillBuildings(select){select.innerHTML=blocks.map((b,i)=>`<option value="${i}">${b.icon} ${b.name}</option>`).join('');}
function fillFloors(select){select.innerHTML=floorNames.map((f,i)=>`<option value="${i}">${f}</option>`).join('');}
function fillRooms(select,floor){select.innerHTML=facilityByFloor[floor].map((r,i)=>`<option value="${i}">${r}</option>`).join('');}
function placeName(blockIndex,floor,roomIndex){return `${blocks[blockIndex].name} • ${floorNames[floor]} • ${facilityByFloor[floor][roomIndex]}`;}
function mapsUrl(fromBlock,toBlock){return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(blocks[fromBlock].query)}&destination=${encodeURIComponent(blocks[toBlock].query)}&travelmode=walking`;}
fillBuildings(currentBuilding);fillBuildings(destinationBuilding);fillFloors(currentFloor);fillFloors(destinationFloor);fillRooms(currentRoom,0);fillRooms(destinationRoom,0);
currentFloor.addEventListener('change',()=>fillRooms(currentRoom,Number(currentFloor.value)));
destinationFloor.addEventListener('change',()=>fillRooms(destinationRoom,Number(destinationFloor.value)));
blocks.forEach(b=>{const d=document.createElement('div');d.className='place';d.innerHTML=`<strong>${b.icon} ${b.name}</strong><span>3 floors • 30 prototype spaces • rooms, labs and common facilities</span>`;locations.appendChild(d);});

function roomClass(index,currentIndex,destinationIndex){const c=['room'];if(index===currentIndex)c.push('current');if(index===destinationIndex)c.push('destination');return c.join(' ');}
function roomCenter(index){
  const row=index%5, side=index<5?'left':'right';
  return side==='left'?{x:17,y:12+row*19}:{x:83,y:12+row*19};
}
function corridorPoint(index){const p=roomCenter(index);return {x:50,y:p.y};}
function routeSvg(currentIndex,destinationIndex){
  if(currentIndex<0||destinationIndex<0||currentIndex===destinationIndex)return '';
  const a=roomCenter(currentIndex),b=roomCenter(destinationIndex),ca=corridorPoint(currentIndex),cb=corridorPoint(destinationIndex);
  const d=`M ${a.x} ${a.y} L ${ca.x} ${ca.y} L ${cb.x} ${cb.y} L ${b.x} ${b.y}`;
  return `<svg class="route-overlay" viewBox="0 0 100 100" preserveAspectRatio="none" aria-label="Visual route"><defs><marker id="arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L5,2.5 L0,5 Z" fill="#2563eb"/></marker></defs><path class="route-shadow" d="${d}"/><path class="route-line" d="${d}" marker-end="url(#arrow)"/><circle class="route-start" cx="${a.x}" cy="${a.y}" r="2.2"/><circle class="route-end" cx="${b.x}" cy="${b.y}" r="2.5"/></svg>`;
}
function renderFloorMap(blockIndex,floor,currentRoomIndex,destinationRoomIndex,showRoute=true){
  const rooms=facilityByFloor[floor];
  const roomMarkup=rooms.map((r,i)=>{const side=i<5?1:3,row=(i%5)+1;return `<div class="${roomClass(i,currentRoomIndex,destinationRoomIndex)}" style="grid-column:${side};grid-row:${row}"><span>${r}</span></div>`;}).join('');
  const route=showRoute?routeSvg(currentRoomIndex,destinationRoomIndex):'';
  floorPreview.innerHTML=`<div class="floor-title">${blocks[blockIndex].name} — ${floorNames[floor]} <span class="prototype-label">(prototype)</span></div><div class="map-legend"><span class="legend-item"><i class="legend-dot current"></i> Current</span><span class="legend-item"><i class="legend-dot destination"></i> Destination</span><span class="legend-item"><i class="legend-dot route"></i> Suggested route</span><span class="legend-item"><i class="legend-dot stairs"></i> Stairs / elevator</span></div><div class="floor-map-shell"><div class="floor-map"><div class="floor-map-label">Conceptual floor plan • ${blocks[blockIndex].name}</div><div class="floor-plan">${roomMarkup}<div class="corridor">↕ MAIN CORRIDOR<br>↕</div>${route}</div><div class="entrance">🚪 MAIN ENTRANCE</div><div class="stairs">🪜 STAIRS + ELEVATOR</div></div></div><div class="map-note">The floor plan and route are simulated for the prototype. Replace room/corridor geometry with the official building plan before real-world deployment.</div>`;
}
function addStep(text){const n=steps.children.length+1,el=document.createElement('div');el.className='step';el.innerHTML=`<div class="step-number">${n}</div><div>${text}</div>`;steps.appendChild(el);}

document.getElementById('navigate').addEventListener('click',()=>{
  const cb=Number(currentBuilding.value),cf=Number(currentFloor.value),cr=Number(currentRoom.value),db=Number(destinationBuilding.value),df=Number(destinationFloor.value),dr=Number(destinationRoom.value);
  routeResult.hidden=false;steps.innerHTML='';floorPreview.innerHTML='';googleMaps.hidden=true;message.textContent='';
  if(cb===db&&cf===df&&cr===dr){routeSummary.textContent=`You are already at ${placeName(db,df,dr)}.`;addStep('No route is needed — your current location and destination are the same.');renderFloorMap(db,df,cr,dr,false);return;}
  if(cb===db){
    routeSummary.textContent=`${placeName(cb,cf,cr)} → ${placeName(db,df,dr)}`;
    addStep(`Start at ${facilityByFloor[cf][cr]}.`);
    if(cf!==df){addStep('Follow the blue route through the main corridor to the stairs/elevator.');addStep(`Take the stairs/elevator from ${floorNames[cf]} to ${floorNames[df]}.`);addStep(`On ${floorNames[df]}, follow the corridor to ${facilityByFloor[df][dr]}.`);renderFloorMap(db,df,-1,dr,false);}else{addStep('Follow the blue route through the main corridor.');addStep(`Arrive at ${facilityByFloor[df][dr]} 🎯.`);renderFloorMap(db,df,cr,dr,true);}return;
  }
  routeSummary.textContent=`${placeName(cb,cf,cr)} → ${placeName(db,df,dr)}`;addStep(`Start at ${placeName(cb,cf,cr)}.`);addStep('Follow the blue indoor route to the main entrance/exit.');addStep(`Open Google Maps for the outdoor walking route from ${blocks[cb].name} to ${blocks[db].name}.`);addStep(`Enter ${blocks[db].name}, go to ${floorNames[df]}, then follow the indoor corridor to ${facilityByFloor[df][dr]}.`);googleMaps.hidden=false;googleMaps.onclick=()=>window.open(mapsUrl(cb,db),'_blank','noopener,noreferrer');renderFloorMap(db,df,-1,dr,false);
});