const places=[
{name:'AB-1',icon:'🏢',query:'Academic Block 1, IIIT RGUKT RK Valley'},
{name:'AB-2',icon:'🏢',query:'Academic Block 2, IIIT RGUKT RK Valley'},
{name:'BH-1',icon:'🏠',query:'Boys Hostel 1, IIIT RGUKT RK Valley'},
{name:'BH-2',icon:'🏠',query:'Boys Hostel 2, IIIT RGUKT RK Valley'},
{name:'GH-1',icon:'🏠',query:'Girls Hostel 1, IIIT RGUKT RK Valley'},
{name:'CSE Department',icon:'💻',query:'CSE Department, IIIT RGUKT RK Valley'},
{name:'ECE Department',icon:'📡',query:'ECE Department, IIIT RGUKT RK Valley'}
];
const current=document.getElementById('current'),destination=document.getElementById('destination'),message=document.getElementById('message'),locations=document.getElementById('locations');
places.forEach(p=>{[current,destination].forEach(s=>{const o=document.createElement('option');o.value=p.name;o.textContent=p.icon+' '+p.name;s.appendChild(o)});const d=document.createElement('div');d.className='place';d.innerHTML=`<strong>${p.icon} ${p.name}</strong><span>${p.name==='CSE Department'?'Computer Science and Engineering':p.name==='ECE Department'?'Electronics and Communication Engineering':p.name}</span>`;locations.appendChild(d)});
document.getElementById('navigate').addEventListener('click',()=>{const from=places.find(p=>p.name===current.value),to=places.find(p=>p.name===destination.value);if(!from||!to){message.textContent='Please select both current location and destination.';return}if(from.name===to.name){message.textContent='You are already at your selected destination.';return}const url='https://www.google.com/maps/dir/?api=1&origin='+encodeURIComponent(from.query)+'&destination='+encodeURIComponent(to.query)+'&travelmode=walking';message.textContent='Opening Google Maps…';window.open(url,'_blank','noopener,noreferrer')});