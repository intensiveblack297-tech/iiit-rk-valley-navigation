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
const currentBuilding=document.getElementById('currentBuilding');
const currentFloor=document.getElementById('currentFloor');
const currentRoom=document.getElementById('currentRoom');
const destinationBuilding=document.getElementById('destinationBuilding');
const destinationFloor=document.getElementById('destinationFloor');
const destinationRoom=document.getElementById('destinationRoom');
const message=document.getElementById('message');
const routeResult=document.getElementById('routeResult');
const routeSummary=document.getElementById('routeSummary');
const steps=document.getElementById('steps');
const floorPreview=document.getElementById('floorPreview');
const googleMaps=document.getElementById('googleMaps');
const locations=document.getElementById('locations');

function fillBuildings(select){
  select.innerHTML=blocks.map((b,i)=>`<option value="${i}">${b.icon} ${b.name}</option>`).join('');
}
function fillFloors(select){
  select.innerHTML=floorNames.map((f,i)=>`<option value="${i}">${f}</option>`).join('');
}
function fillRooms(select,floor){
  select.innerHTML=facilityByFloor[floor].map((r,i)=>`<option value="${i}">${r}</option>`).join('');
}
function placeName(blockIndex,floor,roomIndex){
  return `${blocks[blockIndex].name} • ${floorNames[floor]} • ${facilityByFloor[floor][roomIndex]}`;
}
function roomNumber(floor,roomIndex){
  return String((floor+1)*100+(roomIndex+1));
}
function mapsUrl(fromBlock,toBlock){
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(blocks[fromBlock].query)}&destination=${encodeURIComponent(blocks[toBlock].query)}&travelmode=walking`;
}

fillBuildings(currentBuilding); fillBuildings(destinationBuilding);
fillFloors(currentFloor); fillFloors(destinationFloor);
fillRooms(currentRoom,0); fillRooms(destinationRoom,0);

currentFloor.addEventListener('change',()=>fillRooms(currentRoom,Number(currentFloor.value)));
destinationFloor.addEventListener('change',()=>fillRooms(destinationRoom,Number(destinationFloor.value)));

blocks.forEach((b,i)=>{
  const d=document.createElement('div');
  d.className='place';
  d.innerHTML=`<strong>${b.icon} ${b.name}</strong><span>3-floor prototype • 30 numbered spaces + facilities</span>`;
  locations.appendChild(d);
});

function renderFloorMap(blockIndex,floor,currentRoomIndex,destinationRoomIndex){
  const rooms=facilityByFloor[floor];
  floorPreview.innerHTML=`<div class="floor-title">${blocks[blockIndex].name} — ${floorNames[floor]} <span style="font-weight:normal;color:#667085">(prototype)</span></div><div class="floor-map">${rooms.map((r,i)=>`<div class="room ${i===currentRoomIndex?'current':''} ${i===destinationRoomIndex?'destination':''}">${r}</div>`).join('')}<div class="corridor">↔ Main corridor • Staircase at corridor junction • Elevator/exit points can be added later</div></div>`;
}

function addStep(text){
  const n=steps.children.length+1;
  const el=document.createElement('div');
  el.className='step';
  el.innerHTML=`<div class="step-number">${n}</div><div>${text}</div>`;
  steps.appendChild(el);
}

document.getElementById('navigate').addEventListener('click',()=>{
  const cb=Number(currentBuilding.value), cf=Number(currentFloor.value), cr=Number(currentRoom.value);
  const db=Number(destinationBuilding.value), df=Number(destinationFloor.value), dr=Number(destinationRoom.value);
  routeResult.hidden=false; steps.innerHTML=''; floorPreview.innerHTML=''; googleMaps.hidden=true;
  message.textContent='';

  if(cb===db && cf===df && cr===dr){
    routeSummary.textContent=`You are already at ${placeName(db,df,dr)}.`;
    addStep('No route is needed — your current location and destination are the same.');
    renderFloorMap(db,df,cr,dr);
    return;
  }

  if(cb===db){
    routeSummary.textContent=`${placeName(cb,cf,cr)} → ${placeName(db,df,dr)}`;
    addStep(`Start at ${facilityByFloor[cf][cr]} on ${floorNames[cf]}.`);
    if(cf!==df){
      addStep('Follow the main corridor to the staircase/elevator junction.');
      addStep(`Take the staircase/elevator from ${floorNames[cf]} to ${floorNames[df]}.`);
      addStep(`On ${floorNames[df]}, follow the main corridor toward ${facilityByFloor[df][dr]}.`);
    }else{
      addStep(`Follow the main corridor from ${facilityByFloor[cf][cr]} toward ${facilityByFloor[df][dr]}.`);
    }
    addStep(`Arrive at ${facilityByFloor[df][dr]} 🎯.`);
    renderFloorMap(db,df,cf===df?cr:-1,dr);
    return;
  }

  routeSummary.textContent=`${placeName(cb,cf,cr)} → ${placeName(db,df,dr)}`;
  addStep(`Start at ${placeName(cb,cf,cr)}.`);
  addStep('Follow the indoor corridor to the building exit.');
  addStep(`Travel from ${blocks[cb].name} to ${blocks[db].name} using Google Maps walking directions.`);
  addStep(`Enter ${blocks[db].name}, go to ${floorNames[df]}, then follow the indoor corridor to ${facilityByFloor[df][dr]}.`);
  googleMaps.hidden=false;
  googleMaps.onclick=()=>window.open(mapsUrl(cb,db),'_blank','noopener,noreferrer');
  renderFloorMap(db,df,-1,dr);
});