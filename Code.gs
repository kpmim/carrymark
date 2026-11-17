/**
 * Student Marks Checker — reads the exact PBPA tabs supplied by the lecturer.
 * Paste this code into Extensions > Apps Script in the source Google spreadsheet.
 *
 * Data columns from row 21:
 * B = student name, C = student ID, E = Quiz/Written Test weighted mark,
 * G = Project 1 weighted mark, I = Project 2 weighted mark.
 * Column K (Project 3) is intentionally NOT read.
 */
const CLASS_CONFIG = {
  editing: {
    tab: 'M 2063 - 3A ', className: 'DCD3A',
    subjectCode: 'DCD2063', subjectName: 'Editing and Compositing',
    carryMax: 50,
    assessments: [
      {name:'Quiz', detail:'', max:15, icon:'clipboard-check', tone:'blue'},
      {name:'Project 1', detail:'Simple Editing', max:25, icon:'film', tone:'purple'},
      {name:'Project 2', detail:'Audio Editing', max:10, icon:'audio-lines', tone:'green'}
    ]
  },
  animation: {
    subjectCode: 'DCD2614', subjectName: '3D Animation', carryMax: 70,
    assessments: [
      {name:'Written Test', detail:'', max:10, icon:'file-pen-line', tone:'blue'},
      {name:'Project 1', detail:'Bouncing Ball', max:20, icon:'circle-dot', tone:'purple'},
      {name:'Project 2', detail:'Face Expression', max:20, icon:'smile', tone:'green'}
    ],
    tabs: [
      {tab:'M 2614 - 4A', className:'DCD4A'},
      {tab:'M 2614 - 4C', className:'DCD4C'}
    ]
  }
};
function normalizeID(v) {
  return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
}
function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}
function findStudentInTab(sheet, requested) {
  const last = sheet.getLastRow();
  if (last < 21) return null;
  // B:I => name, ID, D, Quiz/Test, F, Project 1, H, Project 2
  const rows = sheet.getRange(21, 2, last - 20, 8).getValues();
  const row = rows.find(r => normalizeID(r[1]) === requested);
  if (!row || !row[0]) return null;
  return row;
}
function doGet(e) {
  const requested = normalizeID(e && e.parameter ? e.parameter.id : '');
  let payload;
  try {
    if (!requested) throw new Error('Sila masukkan nombor pelajar.');
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let cfg, row, className;

    if (requested.startsWith('IDC2503')) {
      cfg = CLASS_CONFIG.editing;
      const sh = ss.getSheetByName(cfg.tab);
      if (!sh) throw new Error('Tab M 2063 - 3A tidak ditemui.');
      row = findStudentInTab(sh, requested);
      className = cfg.className;
    } else if (requested.startsWith('IDC2502')) {
      cfg = CLASS_CONFIG.animation;
      for (const item of cfg.tabs) {
        const sh = ss.getSheetByName(item.tab);
        if (!sh) continue;
        const found = findStudentInTab(sh, requested);
        if (found) { row = found; className = item.className; break; }
      }
    } else {
      throw new Error('Format nombor pelajar tidak dikenali.');
    }
    if (!row) throw new Error('Rekod pelajar tidak dijumpai.');
    // B:I row positions: B=0 name, C=1 ID, E=3, G=5, I=7.
    const marks = [num(row[3]), num(row[5]), num(row[7])];
    const assessments = cfg.assessments.map((a, i) => ({
      name:a.name, detail:a.detail, mark:marks[i], max:a.max,
      icon:a.icon, tone:a.tone
    }));
    const student = {
      studentId:row[1], name:row[0], className,
      subjectCode:cfg.subjectCode, subjectName:cfg.subjectName,
      carryMark:marks.reduce((sum, mark) => sum + mark, 0),
      carryMax:cfg.carryMax, assessments
    };
    // DCD2614 denominator stays /70. Project 3 (column K) is excluded.
    payload = {ok:true, student};
  } catch (err) {
    payload = {ok:false, error:err.message || 'Ralat membaca rekod.'};
  }
  const callback = String(e && e.parameter ? e.parameter.callback || '' : '')
    .replace(/[^A-Za-z0-9_$]/g, '');
  const body = JSON.stringify(payload);
  if (callback) return ContentService.createTextOutput(callback + '(' + body + ');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}
