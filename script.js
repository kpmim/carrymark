
const form=document.getElementById('searchForm');
const input=document.getElementById('studentId');
const result=document.getElementById('result');
const message=document.getElementById('message');
let students=[];
function normalizeID(v){return String(v||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function showMessage(t,e=false){message.textContent=t;message.classList.toggle('error',e);}
function fmt(v){return Number(v||0).toFixed(2);}
function renderStudent(s){
 document.getElementById('studentName').textContent=s.name;
 document.getElementById('studentNumber').textContent=s.studentId;
 document.getElementById('studentClass').textContent=s.className;
 document.getElementById('subjectCode').textContent=s.subjectCode;
 document.getElementById('subjectName').textContent=s.subjectName;
 document.getElementById('carryMark').textContent=fmt(s.carryMark);
 document.getElementById('carryMax').textContent=s.carryMax;
 const si=document.getElementById('subjectIcon');
 si.innerHTML=`<i data-lucide="${s.subjectCode==='DCD2063'?'clapperboard':'film'}"></i>`;
 const grid=document.getElementById('assessmentGrid');grid.innerHTML='';
 s.assessments.forEach(a=>{
  const card=document.createElement('article');card.className=`assessment-card tone-${a.tone}`;
  const icon=document.createElement('div');icon.className='assessment-icon';icon.innerHTML=`<i data-lucide="${a.icon}"></i>`;
  const heading=document.createElement('h3');heading.textContent=a.name;
  const score=document.createElement('div');score.className='score';score.innerHTML=`${fmt(a.mark)} <small>/ ${a.max}</small>`;
  card.append(icon,heading,score);grid.appendChild(card);
 });
 result.hidden=false;if(window.lucide)lucide.createIcons();showMessage('Rekod pelajar berjaya dijumpai.');
}
async function loadData(){
 try{const r=await fetch('./marks-data.json');if(!r.ok)throw Error();const d=await r.json();students=d.students||[];showMessage('Masukkan nombor pelajar untuk melihat keputusan.');}
 catch(e){showMessage('Data markah tidak dapat dimuatkan. Pastikan fail marks-data.json turut dimuat naik.',true);}
}
form.addEventListener('submit',e=>{
 e.preventDefault();const id=normalizeID(input.value);
 if(!id){result.hidden=true;showMessage('Sila masukkan No. Pelajar.',true);return;}
 const s=students.find(x=>normalizeID(x.studentId)===id);
 if(!s){result.hidden=true;showMessage('No. Pelajar tidak ditemui. Sila semak semula ID yang dimasukkan.',true);return;}
 renderStudent(s);
});
loadData();
