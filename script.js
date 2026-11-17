/*
  Student Marks Checker
  Smart ID Search: case-insensitive; ignores hyphens, spaces and punctuation.
  1) For preview, DEMO_MODE is true.
  2) For live Google Sheets, set DEMO_MODE=false and paste your Apps Script URL in API_URL.
*/
const DEMO_MODE = false;
const API_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const form=document.getElementById('searchForm');
const input=document.getElementById('studentId');
const result=document.getElementById('result');
const message=document.getElementById('message');

function normalizeID(value){return String(value||'').toUpperCase().replace(/[^A-Z0-9]/g,'');}
function showMessage(text,isError=false){message.textContent=text;message.classList.toggle('error',isError);}
function formatMark(value){return Number(value).toFixed(2);}
function safeText(value){return String(value??'');}

function renderStudent(student){
  // DCD2614 includes Written Test + Projects 1 and 2 only; Project 3 is excluded.
  if(student.subjectCode==='DCD2614'){
    student={...student,assessments:(student.assessments||[]).slice(0,3),carryMax:70};
    student.carryMark=student.assessments.reduce((sum,item)=>sum+Number(item.mark||0),0);
  }
  document.getElementById('studentName').textContent=safeText(student.name);
  document.getElementById('studentNumber').textContent=safeText(student.studentId);
  document.getElementById('studentClass').textContent=safeText(student.className);
  document.getElementById('subjectCode').textContent=safeText(student.subjectCode);
  document.getElementById('subjectName').textContent=safeText(student.subjectName);
  document.getElementById('carryMark').textContent=formatMark(student.carryMark);
  document.getElementById('carryMax').textContent=safeText(student.carryMax);
  const subjectIcon=document.getElementById('subjectIcon');
  subjectIcon.innerHTML=`<i data-lucide="${student.subjectCode==='DCD2063'?'clapperboard':'film'}"></i>`;
  const grid=document.getElementById('assessmentGrid');
  grid.innerHTML='';
  (student.assessments||[]).forEach(item=>{
    const card=document.createElement('article');
    card.className=`assessment-card tone-${item.tone||'blue'}`;
    const icon=document.createElement('div');icon.className='assessment-icon';icon.innerHTML=`<i data-lucide="${item.icon||'clipboard-list'}"></i>`;
    const heading=document.createElement('h3');heading.textContent=[item.name,item.detail].filter(Boolean).join(' — ');
    const score=document.createElement('div');score.className='score';score.innerHTML=`${formatMark(item.mark)} <small>/ ${safeText(item.max)}</small>`;
    card.append(icon,heading,score);grid.appendChild(card);
  });
  result.hidden=false;
  if(window.lucide)lucide.createIcons();
  showMessage('Rekod pelajar berjaya dijumpai.');
}

function jsonp(url){
  return new Promise((resolve,reject)=>{
    const callbackName='marksCallback_'+Date.now()+'_'+Math.floor(Math.random()*10000);
    const script=document.createElement('script');
    const timeout=setTimeout(()=>{cleanup();reject(new Error('Masa carian tamat. Cuba lagi.'));},15000);
    function cleanup(){clearTimeout(timeout);delete window[callbackName];script.remove();}
    window[callbackName]=(payload)=>{cleanup();resolve(payload);};
    script.onerror=()=>{cleanup();reject(new Error('Tidak dapat menghubungi Google Sheets API.'));};
    script.src=`${url}${url.includes('?')?'&':'?'}id=${encodeURIComponent(document.getElementById('studentId').value)}&callback=${callbackName}`;
    document.body.appendChild(script);
  });
}

form.addEventListener('submit',async event=>{
  event.preventDefault();
  const raw=input.value.trim();
  if(!raw){result.hidden=true;showMessage('Sila masukkan nombor pelajar.',true);input.focus();return;}
  const key=normalizeID(raw);
  result.hidden=true;showMessage('Sedang mencari rekod…');
  try{
    let student;
    if(!API_URL.startsWith('https://script.google.com/'))throw new Error('URL Google Apps Script belum ditetapkan dalam script.js. Selepas deploy Apps Script, tampal URL Web App di sini.');
    const response=await jsonp(API_URL);
    if(!response||!response.ok)throw new Error(response?.error||'Rekod tidak dijumpai.');
    student=response.student;
    if(!student){showMessage('Rekod tidak dijumpai. Semak semula nombor ID anda.',true);return;}
    renderStudent(student);
  }catch(error){showMessage(error.message||'Ralat semasa membuat carian.',true);}
});
if(window.lucide)lucide.createIcons();
