// ===========================
// AcadAI — Full Script
// ===========================

// ---- DEMO ACCOUNT ----
const DEMO = { firstName:'Maria', lastName:'Santos', studentId:'2024-00123', email:'maria.santos@uni.edu', password:'password123', course:'BS Computer Science', year:'3rd Year', section:'A' };

// ---- STORAGE ----
function getAccounts() {
  let a = JSON.parse(localStorage.getItem('acadai_accounts') || '[]');
  if (!a.find(x => x.email === DEMO.email)) a.push(DEMO);
  return a;
}
function saveAccounts(a) { localStorage.setItem('acadai_accounts', JSON.stringify(a)); }
function getSession() { return JSON.parse(localStorage.getItem('acadai_session') || 'null'); }
function setSession(u) { localStorage.setItem('acadai_session', JSON.stringify(u)); }
function clearSession() { localStorage.removeItem('acadai_session'); }

// Per-user data key
function dataKey(key) { const s = getSession(); return s ? `acadai_${s.email}_${key}` : null; }
function getUserData(key, def) { const k = dataKey(key); return k ? JSON.parse(localStorage.getItem(k) || JSON.stringify(def)) : def; }
function setUserData(key, val) { const k = dataKey(key); if (k) localStorage.setItem(k, JSON.stringify(val)); }

// ---- MICRO-INTERACTIONS & POLISH ----
function showToast(message, type = 'success') {
  const toastContainer = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const iconMap = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
  toast.innerHTML = `
    <i class="fas ${iconMap[type]} toast-icon ${type}"></i>
    <span class="toast-message">${message}</span>
    <button class="toast-close" onclick="this.parentElement.remove()">×</button>
  `;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('closing');
      setTimeout(() => toast.remove(), 300);
    }
  }, 4000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.position = 'fixed';
  container.style.bottom = '24px';
  container.style.right = '24px';
  container.style.zIndex = '9999';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.gap = '12px';
  container.style.pointerEvents = 'none';
  document.body.appendChild(container);
  return container;
}

function animateCounter(element, target, duration = 800) {
  const start = 0;
  const increment = target / (duration / 16);
  let current = start;
  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      element.textContent = target;
      clearInterval(timer);
    } else {
      element.textContent = Math.floor(current);
    }
  }, 16);
}

// ---- DARK MODE ----
function initTheme() {
  const savedTheme = localStorage.getItem('acadai_theme') || 'light';
  setTheme(savedTheme);
}

function setTheme(theme) {
  const html = document.documentElement;
  const toggle = document.querySelector('.theme-toggle i');
  
  if (theme === 'dark') {
    html.setAttribute('data-theme', 'dark');
    localStorage.setItem('acadai_theme', 'dark');
    if (toggle) toggle.className = 'fas fa-sun';
  } else {
    html.removeAttribute('data-theme');
    localStorage.setItem('acadai_theme', 'light');
    if (toggle) toggle.className = 'fas fa-moon';
  }
}

function toggleTheme() {
  const html = document.documentElement;
  const currentTheme = html.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  const message = newTheme === 'dark' ? 'Dark mode enabled 🌙' : 'Light mode enabled ☀️';
  showToast(message, 'info');
}

// ---- AUTH ----
function showLogin() {
  document.getElementById('register-page').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  clearAlerts();
}
function showRegister() {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('register-page').style.display = 'flex';
  clearAlerts();
}
function clearAlerts() {
  ['login-error','register-error','register-success'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.style.display = 'none'; el.innerHTML = ''; }
  });
}
function showAlert(id, msg, type) {
  const el = document.getElementById(id);
  const icon = type === 'error' ? 'fa-exclamation-circle' : 'fa-check-circle';
  el.innerHTML = `<i class="fas ${icon}"></i> ${msg}`;
  el.style.display = 'flex';
}

function togglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  const icon = btn.querySelector('i');
  inp.type = inp.type === 'password' ? 'text' : 'password';
  icon.className = inp.type === 'password' ? 'fas fa-eye' : 'fas fa-eye-slash';
}
function checkPwStrength(pw) {
  const wrap = document.getElementById('pw-strength');
  const fill = document.getElementById('pw-strength-fill');
  const label = document.getElementById('pw-strength-label');
  if (!pw) { wrap.style.display = 'none'; return; }
  wrap.style.display = 'flex';
  let s = 0;
  if (pw.length >= 8) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const lvls = [
    {p:'25%',c:'#ef4444',t:'Weak'},{p:'50%',c:'#f97316',t:'Fair'},
    {p:'75%',c:'#eab308',t:'Good'},{p:'100%',c:'#22c55e',t:'Strong'}
  ];
  const l = lvls[s-1] || lvls[0];
  fill.style.width = l.p; fill.style.background = l.c;
  label.textContent = l.t; label.style.color = l.c;
}

function doLogin() {
  clearAlerts();
  const email = document.getElementById('login-email').value.trim();
  const pw = document.getElementById('login-pw').value;
  if (!email || !pw) { showAlert('login-error','Please enter your email and password.','error'); return; }
  const user = getAccounts().find(a => (a.email.toLowerCase()===email.toLowerCase()||a.studentId===email) && a.password===pw);
  if (!user) { showAlert('login-error','Incorrect email/Student ID or password.','error'); return; }
  setSession(user);
  launchApp(user);
}

function doRegister() {
  clearAlerts();
  const fn = document.getElementById('reg-firstname').value.trim();
  const ln = document.getElementById('reg-lastname').value.trim();
  const sid = document.getElementById('reg-studentid').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const course = document.getElementById('reg-course').value;
  const year = document.getElementById('reg-year').value;
  const section = document.getElementById('reg-section').value.trim();
  const pw = document.getElementById('reg-pw').value;
  const pw2 = document.getElementById('reg-pw2').value;
  const agreed = document.getElementById('reg-agree').checked;

  if (!fn||!ln) { showAlert('register-error','Please enter your full name.','error'); return; }
  if (!sid) { showAlert('register-error','Please enter your Student ID.','error'); return; }
  if (!email||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showAlert('register-error','Please enter a valid email.','error'); return; }
  if (!course) { showAlert('register-error','Please select your program.','error'); return; }
  if (!year) { showAlert('register-error','Please select your year level.','error'); return; }
  if (!pw||pw.length<8) { showAlert('register-error','Password must be at least 8 characters.','error'); return; }
  if (pw!==pw2) { showAlert('register-error','Passwords do not match.','error'); return; }
  if (!agreed) { showAlert('register-error','Please agree to the Terms & Conditions.','error'); return; }

  const accounts = getAccounts();
  if (accounts.find(a => a.email.toLowerCase()===email.toLowerCase()||a.studentId===sid)) {
    showAlert('register-error','An account with this email or Student ID already exists.','error'); return;
  }
  const newUser = {firstName:fn,lastName:ln,studentId:sid,email,course,year,section,password:pw};
  accounts.push(newUser);
  saveAccounts(accounts);
  showAlert('register-success','Account created! Redirecting to login…','success');
  ['reg-firstname','reg-lastname','reg-studentid','reg-email','reg-pw','reg-pw2','reg-section'].forEach(id=>document.getElementById(id).value='');
  document.getElementById('reg-course').value=''; document.getElementById('reg-year').value='';
  document.getElementById('reg-agree').checked=false;
  setTimeout(showLogin, 2000);
}

function logout() {
  clearSession();
  document.getElementById('app').style.display = 'none';
  document.getElementById('login-page').style.display = 'flex';
  document.getElementById('login-email').value = '';
  document.getElementById('login-pw').value = '';
  clearAlerts();
}

function launchApp(user) {
  document.getElementById('login-page').style.display = 'none';
  document.getElementById('register-page').style.display = 'none';
  document.getElementById('app').style.display = 'block';
  const name = user.firstName + ' ' + user.lastName;
  document.querySelector('.user-name').textContent = name;
  document.querySelector('.avatar').textContent = user.firstName[0] + user.lastName[0];
  document.getElementById('dash-greeting').textContent = `Good day, ${user.firstName} 👋`;
  showPage('dashboard', document.querySelector('.nav-btn'));
  renderDashboard();
  syncAdvisorGrades();
  setTimeout(() => showToast(`Welcome back, ${user.firstName}! 🎓`, 'success'), 300);
}

// ---- NAVIGATION ----
function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-'+name).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  if (name === 'reports') renderReports();
  if (name === 'progress') renderProgress();
}

// ================================================================
// GRADES & GWA
// ================================================================

// Philippine grading: percentage → GWA grade
function pctToGWA(pct) {
  if (pct >= 99) return 1.0;
  if (pct >= 96) return 1.25;
  if (pct >= 93) return 1.5;
  if (pct >= 90) return 1.75;
  if (pct >= 87) return 2.0;
  if (pct >= 84) return 2.25;
  if (pct >= 81) return 2.5;
  if (pct >= 78) return 2.75;
  if (pct >= 75) return 3.0;
  return 5.0; // Failed
}

function gradeColor(gwa) {
  const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
  if (gwa <= 1.5) return isDark ? '#5DCAA5' : '#1D9E75';
  if (gwa <= 2.0) return isDark ? '#60A5FA' : '#378ADD';
  if (gwa <= 2.75) return isDark ? '#FCD34D' : '#EF9F27';
  return isDark ? '#F87171' : '#EF4444';
}

function gradeRemark(gwa) {
  if (gwa === 5.0) return '<span class="chip chip-red">Failed</span>';
  if (gwa <= 1.5) return '<span class="chip chip-green">Excellent</span>';
  if (gwa < 2.0) return '<span class="chip chip-blue">Good</span>';
  if (gwa < 2.25) return '<span class="chip chip-blue">Average</span>';
  if (gwa < 2.5) return '<span class="chip chip-amber">Below Average</span>';
  if (gwa <= 2.75) return '<span class="chip chip-amber">Fair</span>';
  return '<span class="chip chip-red">Poor</span>';
}

function computeGWA(subjects) {
  if (!subjects.length) return null;
  const graded = subjects.filter(s => s.pct !== '' && s.pct !== null);
  if (!graded.length) return null;
  const totalUnits = graded.reduce((s, x) => s + x.units, 0);
  if (!totalUnits) return null;
  const weighted = graded.reduce((s, x) => s + pctToGWA(x.pct) * x.units, 0);
  return (weighted / totalUnits).toFixed(2);
}

function getSubjects() { return getUserData('subjects', []); }
function saveSubjects(s) { setUserData('subjects', s); }

function renderDashboard() {
  const subjects = getSubjects();
  const noMsg = document.getElementById('no-subjects-msg');
  const table = document.getElementById('grades-table');
  const tbody = document.getElementById('grades-tbody');

  document.getElementById('dash-subject-count').textContent = subjects.length;

  if (!subjects.length) {
    noMsg.style.display = 'block'; table.style.display = 'none';
    document.getElementById('dash-gwa').textContent = '—';
    document.getElementById('dash-gwa-sub').textContent = 'No grades yet';
    document.getElementById('dash-best').textContent = '—';
    document.getElementById('dash-best-grade').textContent = 'No grades yet';
    document.getElementById('dash-worst').textContent = '—';
    document.getElementById('dash-worst-grade').textContent = 'No grades yet';
    document.getElementById('table-gwa').textContent = '—';
    return;
  }

  noMsg.style.display = 'none'; table.style.display = 'table';

  tbody.innerHTML = subjects.map((s, i) => {
    const gwa = s.pct !== '' ? pctToGWA(s.pct) : null;
    const color = gwa ? gradeColor(gwa) : '#9CA3AF';
    return `<tr>
      <td style="font-weight:500;">${s.name}</td>
      <td>${s.units} units</td>
      <td>
        <input type="number" class="grade-edit-input" value="${s.pct}" min="0" max="100"
          placeholder="0-100" onchange="updateGrade(${i}, this.value)" title="Enter percentage score"/>
        ${gwa ? `<span style="color:${color};font-weight:600;margin-left:8px;">${gwa}</span>` : ''}
      </td>
      <td>${s.pct !== '' ? s.pct + '%' : '—'}</td>
      <td>${gwa ? gradeRemark(gwa) : '—'}</td>
      <td><button class="del-btn" onclick="deleteSubject(${i})" title="Remove subject"><i class="fas fa-trash"></i></button></td>
    </tr>`;
  }).join('');

  // Compute and display GWA
  const gwa = computeGWA(subjects);
  const tableGWAEl = document.getElementById('table-gwa');
  const dashGWAEl = document.getElementById('dash-gwa');

  if (gwa) {
    const gwaNum = parseFloat(gwa);
    const col = gradeColor(gwaNum);
    tableGWAEl.innerHTML = `<span style="color:${col};">${gwa}</span>`;
    dashGWAEl.textContent = gwa;
    dashGWAEl.style.color = col;
    document.getElementById('dash-gwa-sub').textContent = gwaNum <= 1.75 ? 'Dean\'s List range 🏅' : gwaNum <= 2.5 ? 'Good standing' : 'Keep improving!';
  } else {
    tableGWAEl.textContent = '—';
    dashGWAEl.textContent = '—';
    dashGWAEl.style.color = 'var(--text)';
    document.getElementById('dash-gwa-sub').textContent = 'Enter % scores above';
  }

  // Best & worst
  const graded = subjects.filter(s => s.pct !== '' && s.pct !== null);
  if (graded.length) {
    const best = graded.reduce((a, b) => b.pct > a.pct ? b : a);
    // Only show worst subject if it actually needs attention (GWA >= 2.0)
    const needsAttention = graded.filter(s => pctToGWA(s.pct) >= 2.0);
    const worst = needsAttention.length ? needsAttention.reduce((a, b) => b.pct < a.pct ? b : a) : null;
    document.getElementById('dash-best').textContent = best.name;
    document.getElementById('dash-best-grade').textContent = `GWA: ${pctToGWA(best.pct)} (${best.pct}%)`;
    document.getElementById('dash-worst').textContent = worst ? worst.name : '—';
    document.getElementById('dash-worst-grade').textContent = worst ? `GWA: ${pctToGWA(worst.pct)} (${worst.pct}%)` : 'All grades are good!';
  }
}

function updateGrade(index, value) {
  const subjects = getSubjects();
  const pct = value === '' ? '' : Math.min(100, Math.max(0, parseFloat(value)));
  subjects[index].pct = pct === '' ? '' : pct;
  saveSubjects(subjects);
  if (pct !== '') {
    const gwa = pctToGWA(pct);
    showToast(`${subjects[index].name} updated to ${pct}% (GWA: ${gwa})`, 'success');
  }
  renderDashboard();
  syncAdvisorGrades();
  updateMilestones();
}

function deleteSubject(index) {
  const subjects = getSubjects();
  const deleted = subjects[index].name;
  subjects.splice(index, 1);
  saveSubjects(subjects);
  showToast(`${deleted} removed`, 'info');
  renderDashboard();
  syncAdvisorGrades();
}

function openAddSubjectModal() {
  document.getElementById('modal-title').textContent = 'Add Subject';
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group"><label>Subject Name <span class="required">*</span></label>
      <input type="text" id="new-subj-name" placeholder="e.g. Data Structures, Calculus"/></div>
    <div class="form-group"><label>Units <span class="required">*</span></label>
      <select id="new-subj-units">
        <option value="">— Select units —</option>
        <option>1</option><option>2</option><option>3</option><option>4</option><option>5</option>
      </select></div>
    <div class="form-group"><label>Percentage Score (0–100) <span style="font-size:11px;color:var(--text-muted);">— leave blank if no grade yet</span></label>
      <input type="number" id="new-subj-pct" placeholder="e.g. 92" min="0" max="100"/></div>
    <div id="add-subj-error" class="alert-error" style="display:none;"></div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModals()">Cancel</button>
      <button class="btn-primary" onclick="confirmAddSubject()"><i class="fas fa-plus"></i> Add Subject</button>
    </div>`;
  document.getElementById('modal-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('new-subj-name').focus(), 100);
}

function confirmAddSubject() {
  const name = document.getElementById('new-subj-name').value.trim();
  const units = parseInt(document.getElementById('new-subj-units').value);
  const pctVal = document.getElementById('new-subj-pct').value;
  const pct = pctVal === '' ? '' : Math.min(100, Math.max(0, parseFloat(pctVal)));
  const err = document.getElementById('add-subj-error');

  if (!name) { err.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a subject name.'; err.style.display = 'flex'; return; }
  if (!units) { err.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please select the number of units.'; err.style.display = 'flex'; return; }

  const subjects = getSubjects();
  subjects.push({ name, units, pct });
  saveSubjects(subjects);
  closeModals();
  showToast(`${name} added successfully!`, 'success');
  renderDashboard();
  syncAdvisorGrades();
  updateMilestones();
}

// ---- ADVISOR SYNC ----
function syncAdvisorGrades() {
  const subjects = getSubjects();
  const wrap = document.getElementById('advisor-grades-preview');
  if (!subjects.length) {
    wrap.innerHTML = '<p style="font-size:12px;color:var(--text-muted);">No subjects yet. Add them on the Dashboard.</p>';
    return;
  }
  wrap.innerHTML = subjects.map(s => {
    const gwa = s.pct !== '' ? pctToGWA(s.pct) : null;
    const col = gwa ? gradeColor(gwa) : '#9CA3AF';
    return `<div class="advisor-grades-row">
      <span class="subj">${s.name} <span style="color:var(--text-muted);font-size:11px;">(${s.units}u)</span></span>
      ${gwa ? `<span class="grade-badge" style="background:${col}20;color:${col};">${gwa}</span>` : '<span style="font-size:11px;color:var(--text-muted);">No grade</span>'}
    </div>`;
  }).join('');
}

// ================================================================
// TAGS — Add custom interests / strengths
// ================================================================
let currentTagTarget = '';

function openAddTagModal(target) {
  currentTagTarget = target;
  const label = target === 'interests' ? 'Interest' : 'Strength';
  document.getElementById('modal-title').textContent = `Add ${label}`;
  document.getElementById('modal-body').innerHTML = `
    <div class="form-group">
      <label>Enter a new ${label.toLowerCase()}</label>
      <input type="text" id="new-tag-input" placeholder="e.g. ${target === 'interests' ? 'Game Dev, Blockchain, IoT' : 'Teamwork, Fast Learner'}"/>
    </div>
    <p style="font-size:12px;color:var(--text-muted);margin-bottom:16px;">It will be added as a selectable tag. You can remove any custom tag by clicking the × on it.</p>
    <div id="add-tag-error" class="alert-error" style="display:none;"></div>
    <div class="modal-actions">
      <button class="btn-secondary" onclick="closeModals()">Cancel</button>
      <button class="btn-primary" onclick="confirmAddTag()"><i class="fas fa-plus"></i> Add Tag</button>
    </div>`;
  document.getElementById('modal-overlay').style.display = 'flex';
  setTimeout(() => document.getElementById('new-tag-input').focus(), 100);
}

function confirmAddTag() {
  const val = document.getElementById('new-tag-input').value.trim();
  const err = document.getElementById('add-tag-error');
  if (!val) { err.innerHTML = '<i class="fas fa-exclamation-circle"></i> Please enter a tag name.'; err.style.display = 'flex'; return; }

  const containerId = currentTagTarget === 'interests' ? 'interests-tags' : 'strengths-tags';
  const container = document.getElementById(containerId);

  // Check duplicate
  const existing = [...container.querySelectorAll('.tag')].map(t => t.dataset.label?.toLowerCase());
  if (existing.includes(val.toLowerCase())) {
    err.innerHTML = '<i class="fas fa-exclamation-circle"></i> This tag already exists.'; err.style.display = 'flex'; return;
  }

  const tag = document.createElement('span');
  tag.className = 'tag selected';
  tag.dataset.label = val;
  tag.dataset.custom = 'true';
  tag.innerHTML = `${val} <span class="tag-remove" onclick="removeTag(this)" title="Remove">×</span>`;
  tag.onclick = function(e) { if (!e.target.classList.contains('tag-remove')) toggleTag(this); };
  container.appendChild(tag);
  closeModals();
  const tagType = currentTagTarget === 'interests' ? 'Interest' : 'Strength';
  showToast(`${tagType} "${val}" added!`, 'success');
}

function removeTag(removeBtn) {
  const tagName = removeBtn.parentElement.dataset.label;
  removeBtn.parentElement.remove();
  showToast(`"${tagName}" removed`, 'info');
}

function toggleTag(el) { el.classList.toggle('selected'); }

// ================================================================
// AI RECOMMENDATIONS — Dynamic based on grades + interests + strengths
// ================================================================
let aiRunCount = 0;
let lastAIRun = null;



function runAI() {
  const subjects = getSubjects();
  const interests = [...document.querySelectorAll('#interests-tags .tag.selected')]
    .map(t => (t.dataset.label || t.textContent.replace('×','').trim()));
  const strengths = [...document.querySelectorAll('#strengths-tags .tag.selected')]
    .map(t => (t.dataset.label || t.textContent.replace('×','').trim()));

  document.getElementById('ai-output').style.display = 'none';
  document.getElementById('ai-thinking').style.display = 'block';

  callClaudeAPI(subjects, interests, strengths);
}

async function callClaudeAPI(subjects, interests, strengths){
  const gwa = computeGWA(subjects);
  const gwaNum = gwa ? parseFloat(gwa) : null;

  // Build a detailed profile string for Claude
  const subjectList = subjects.length
    ? subjects.map(s => {
        const g = s.pct !== '' ? ` — ${s.pct}% (GWA: ${pctToGWA(s.pct)})` : ' — no grade yet';
        return `• ${s.name} (${s.units} units)${g}`;
      }).join('\n')
    : 'No subjects added yet.';

  const prompt = `You are an expert AI Academic Advisor for Filipino college students. Analyze this student profile and give highly personalized, specific recommendations. Do NOT repeat generic advice — tailor everything to this exact student.

STUDENT PROFILE:
- Interests: ${interests.join(', ') || 'Not specified'}
- Strengths: ${strengths.join(', ') || 'Not specified'}
- Current GWA: ${gwa || 'No grades entered'}
- Subjects & Grades:
${subjectList}

Give your recommendations in this EXACT JSON format (no markdown, no extra text, pure JSON only):
{
  "gwa_insight": "One sentence of honest, specific insight about their GWA and academic standing",
  "recommended_subjects": [
    {"title": "Subject Name", "desc": "Why this fits their exact profile — be specific"},
    {"title": "Subject Name", "desc": "Why this fits their exact profile — be specific"},
    {"title": "Subject Name", "desc": "Why this fits their exact profile — be specific"},
    {"title": "Subject Name", "desc": "Why this fits their exact profile — be specific"}
  ],
  "thesis_topics": [
    {"title": "Full specific thesis title", "desc": "methodology + why it suits this student"},
    {"title": "Full specific thesis title", "desc": "methodology + why it suits this student"},
    {"title": "Full specific thesis title", "desc": "methodology + why it suits this student"}
  ],
  "career_paths": [
    {"title": "Career Title", "match": 95, "desc": "Why this career fits this student specifically", "icon": "fa-brain", "color": "#1D9E75", "bg": "#E1F5EE"},
    {"title": "Career Title", "match": 88, "desc": "Why this career fits this student specifically", "icon": "fa-chart-bar", "color": "#378ADD", "bg": "#E6F1FB"},
    {"title": "Career Title", "match": 82, "desc": "Why this career fits this student specifically", "icon": "fa-code", "color": "#7F77DD", "bg": "#EEEDFE"}
  ],
  "study_plan": [
    {"label": "Week 1", "task": "Specific Topic", "sub": "Specific subtask based on their grades"},
    {"label": "Week 2", "task": "Specific Topic", "sub": "Specific subtask"},
    {"label": "Week 3", "task": "Specific Topic", "sub": "Specific subtask"},
    {"label": "Week 4", "task": "Specific Topic", "sub": "Specific subtask"}
  ],
  "top_interest": "${interests[0] || 'General'}"
}

Rules:
- Be specific to their ACTUAL interests and subjects, not generic
- Thesis titles must be fully formed research paper titles
- Career match % should reflect actual fit to their profile
- Study plan must relate to their top interest: ${interests[0] || 'general'}
- Use Font Awesome icon class names for career icons (fa-brain, fa-shield-alt, fa-code, fa-database, etc.)
- Pure JSON only, no explanation outside the JSON`;

  try {
    // Call our local server proxy (avoids CORS issues)
    const response = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    const data = await response.json();
    if (!response.ok || data.error) {
      throw new Error(data.error || `Server error ${response.status}`);
    }

    const raw = data.content[0].text.trim();

    // Strip markdown fences if present
    const jsonStr = raw.replace(/^```json\s*/,'').replace(/^```\s*/,'').replace(/```\s*$/,'').trim();
    const recs = JSON.parse(jsonStr);

    aiRunCount++;
    lastAIRun = new Date().toLocaleString();
    setUserData('ai_count', aiRunCount);
    setUserData('ai_last', lastAIRun);
    updateMilestones(true);

    renderAIOutput(recs, interests, subjects);

  } catch (err) {
    document.getElementById('ai-thinking').style.display = 'none';
    document.getElementById('ai-output').style.display = 'flex';
    document.getElementById('ai-output').innerHTML = `
      <div style="background:#fff0f0;border:1px solid #fca5a5;border-radius:var(--radius-lg);padding:24px;text-align:center;">
        <i class="fas fa-exclamation-circle" style="font-size:32px;color:#dc2626;display:block;margin-bottom:12px;"></i>
        <p style="font-weight:600;color:#b91c1c;margin-bottom:8px;">AI Request Failed</p>
        <p style="font-size:13px;color:#6B7280;">${err.message}</p>
        <p style="font-size:12px;color:#9CA3AF;margin-top:10px;">Check your API key and internet connection, then try again.</p>
      </div>`;
  }
}

function renderAIOutput(recs, interests, subjects) {
  const out = document.getElementById('ai-output');
  const gwa = computeGWA(subjects);
  const gwaNum = gwa ? parseFloat(gwa) : null;

  // GWA insight banner
  let gwaBanner = '';
  if (recs.gwa_insight) {
    const isGood = gwaNum && gwaNum <= 2.0;
    const color = isGood ? 'var(--green-dark)' : 'var(--amber-dark)';
    const bg = isGood ? 'var(--green-light)' : 'var(--amber-light)';
    const border = isGood ? '#5DCAA5' : '#f6c36f';
    const icon = isGood ? 'fa-medal' : 'fa-lightbulb';
    gwaBanner = `<div style="background:${bg};border:1px solid ${border};border-radius:var(--radius-lg);padding:14px 18px;font-size:13px;color:${color};display:flex;gap:10px;align-items:flex-start;">
      <i class="fas ${icon}" style="margin-top:2px;flex-shrink:0;"></i>
      <span>${recs.gwa_insight}</span>
    </div>`;
  }

  const subjectsHTML = (recs.recommended_subjects || []).map(s => `
    <div class="rec-item">
      <div class="rec-title">${s.title}</div>
      <div class="rec-desc">${s.desc}</div>
    </div>`).join('');

  const thesisHTML = (recs.thesis_topics || []).map(t => `
    <div class="thesis-item">
      <div class="rec-title">${t.title}</div>
      <div class="rec-desc">${t.desc}</div>
    </div>`).join('');

  const careerHTML = (recs.career_paths || []).map((c, i) => `
    <div class="career-rec-item">
      <div class="career-rec-icon" style="background:${c.bg||'#E1F5EE'};color:${c.color||'#1D9E75'};"><i class="fas ${c.icon||'fa-briefcase'}"></i></div>
      <div style="flex:1;">
        <div style="font-size:13px;font-weight:600;">${c.title}</div>
        <div style="font-size:12px;color:var(--text-secondary);">${c.match}% match · ${c.desc}</div>
      </div>
      ${i === 0 ? '<span class="chip chip-green">Top Pick</span>' : ''}
    </div>`).join('');

  const planHTML = (recs.study_plan || []).map(w => `
    <div class="plan-week">
      <div class="week-label">${w.label}</div>
      <div class="week-task">${w.task}</div>
      <div class="week-sub">${w.sub}</div>
    </div>`).join('');

  out.innerHTML = `
    ${gwaBanner}
    <div class="rec-section">
      <h4><i class="fas fa-book-open" style="color:#1D9E75;"></i> Recommended Subjects</h4>
      <div class="rec-grid">${subjectsHTML}</div>
    </div>
    <div class="rec-section">
      <h4><i class="fas fa-file-alt" style="color:#378ADD;"></i> Thesis / Research Topics</h4>
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Based on your interests: <strong>${interests.slice(0,3).join(', ')}</strong></p>
      <div class="thesis-list">${thesisHTML}</div>
    </div>
    <div class="rec-section">
      <h4><i class="fas fa-briefcase" style="color:#7F77DD;"></i> Career Path Matches</h4>
      <div class="career-rec-list">${careerHTML}</div>
    </div>
    <div class="rec-section">
      <h4><i class="fas fa-calendar-alt" style="color:#EF9F27;"></i> Personalized 4-Week Study Plan</h4>
      <p style="font-size:12px;color:var(--text-muted);margin-bottom:12px;">Tailored for: <strong>${recs.top_interest || interests[0] || 'your profile'}</strong></p>
      <div class="study-plan">${planHTML}</div>
    </div>`;

  document.getElementById('ai-thinking').style.display = 'none';
  out.style.display = 'flex';
}

// ---- PROGRESS ----
function renderProgress() {
  const subjects = getSubjects();
  const barsEl = document.getElementById('progress-bars');

  if (!subjects.length) {
    barsEl.innerHTML = '<p style="font-size:13px;color:var(--text-muted);">No subjects added yet.</p>';
  } else {
    const graded = subjects.filter(s => s.pct !== '');
    if (!graded.length) {
      barsEl.innerHTML = '<p style="font-size:13px;color:var(--text-muted);">Enter percentage scores on the Dashboard to see mastery bars.</p>';
    } else {
      barsEl.innerHTML = graded.map(s => {
        const col = s.pct >= 90 ? '#1D9E75' : s.pct >= 80 ? '#378ADD' : s.pct >= 75 ? '#EF9F27' : '#EF4444';
        return `<div class="prog-bar-section">
          <div class="prog-bar-label"><span>${s.name}</span><span class="pct">${s.pct}%</span></div>
          <div class="prog-bar"><div class="prog-fill" style="width:${s.pct}%;background:${col};"></div></div>
        </div>`;
      }).join('');
    }
  }

  // GWA donut
  const gwa = computeGWA(subjects);
  const arc = document.getElementById('gwa-donut-arc');
  const txt = document.getElementById('gwa-donut-text');
  const stats = document.getElementById('gwa-donut-stats');
  if (gwa) {
    const gwaNum = parseFloat(gwa);
    // 1.0 = best, 5.0 = worst. Map to percentage for visual (invert: 1.0=100%, 5.0=0%)
    const pct = Math.max(0, Math.min(100, ((5.0 - gwaNum) / 4.0) * 100));
    const circ = 2 * Math.PI * 55;
    const dash = (pct / 100) * circ;
    const col = gradeColor(gwaNum);
    arc.setAttribute('stroke-dasharray', `${dash.toFixed(1)} ${circ.toFixed(1)}`);
    arc.setAttribute('stroke', col);
    txt.textContent = gwa;
    txt.setAttribute('fill', col);
    document.querySelector('#gwa-donut-arc ~ text, svg text:last-of-type')
    stats.innerHTML = `<span>GWA: ${gwa}</span><span>${gwaNum <= 2.0 ? 'Good Standing ✓' : 'Keep going!'}</span>`;
  } else {
    arc.setAttribute('stroke-dasharray', '0 346');
    txt.textContent = '—';
    stats.innerHTML = '<span>No grades entered yet</span>';
  }
}

// ---- MILESTONES ----
function updateMilestones(aiRan = false) {
  const subjects = getSubjects();
  const msSub = document.getElementById('ms-subjects');
  const msAI = document.getElementById('ms-ai');
  if (subjects.length > 0) {
    msSub.querySelector('.ms-icon').className = 'ms-icon done';
    msSub.querySelector('.ms-icon').innerHTML = '<i class="fas fa-check"></i>';
    msSub.querySelector('.ms-date').textContent = `${subjects.length} subject(s) added`;
  }
  if (aiRan || getUserData('ai_count', 0) > 0) {
    msAI.querySelector('.ms-icon').className = 'ms-icon done';
    msAI.querySelector('.ms-icon').innerHTML = '<i class="fas fa-check"></i>';
    msAI.querySelector('.ms-date').textContent = 'Completed';
  }
}

// ---- REPORTS ----
function renderReports() {
  const subjects = getSubjects();
  const gwa = computeGWA(subjects);
  const gwaNum = gwa ? parseFloat(gwa) : null;

  document.getElementById('rpt-gwa').textContent = gwa || '—';
  if (gwa) document.getElementById('rpt-gwa').style.color = gradeColor(gwaNum);
  document.getElementById('rpt-count').textContent = subjects.length;

  const graded = subjects.filter(s => s.pct !== '');
  if (graded.length) {
    const best = graded.reduce((a,b) => b.pct>a.pct?b:a);
    // Only show worst subject if it actually needs attention (GWA >= 2.0)
    const needsAttention = graded.filter(s => pctToGWA(s.pct) >= 2.0);
    const worst = needsAttention.length ? needsAttention.reduce((a,b) => b.pct<a.pct?b:a) : null;
    document.getElementById('rpt-best').textContent = `${best.name} (${pctToGWA(best.pct)})`;
    document.getElementById('rpt-worst').textContent = worst ? `${worst.name} (${pctToGWA(worst.pct)})` : 'No subjects need attention';
  } else {
    document.getElementById('rpt-best').textContent = '—';
    document.getElementById('rpt-worst').textContent = '—';
  }

  // Standing
  const standEl = document.getElementById('rpt-standing');
  if (gwaNum) {
    if (gwaNum <= 1.75) standEl.innerHTML = '<span class="chip chip-green">Dean\'s List 🏅</span>';
    else if (gwaNum <= 2.5) standEl.innerHTML = '<span class="chip chip-blue">Good Standing</span>';
    else if (gwaNum <= 3.0) standEl.innerHTML = '<span class="chip chip-amber">Average Standing</span>';
    else standEl.innerHTML = '<span class="chip chip-red">Academic Alert</span>';
  } else { standEl.textContent = '—'; }

  // Subject breakdown
  const listEl = document.getElementById('rpt-subject-list');
  if (!subjects.length) { listEl.innerHTML = '<p style="font-size:13px;color:var(--text-muted);padding:8px 0;">No subjects added yet.</p>'; }
  else {
    listEl.innerHTML = subjects.map(s => {
      const gwa = s.pct !== '' ? pctToGWA(s.pct) : null;
      const col = gwa ? gradeColor(gwa) : '#9CA3AF';
      return `<div class="report-stat">
        <span class="key">${s.name} (${s.units}u)</span>
        <span class="val" style="color:${col};">${gwa || '—'} ${s.pct !== '' ? `<small style="color:var(--text-muted);font-weight:400;">(${s.pct}%)</small>` : ''}</span>
      </div>`;
    }).join('');
  }

  // Interests & Strengths
  const interests = [...document.querySelectorAll('#interests-tags .tag.selected')].map(t => (t.dataset.label||t.textContent.replace('×','').trim()));
  const strengths = [...document.querySelectorAll('#strengths-tags .tag.selected')].map(t => (t.dataset.label||t.textContent.replace('×','').trim()));
  document.getElementById('rpt-interests').textContent = interests.join(', ') || '—';
  document.getElementById('rpt-strengths').textContent = strengths.join(', ') || '—';

  // AI log
  const aiCount = getUserData('ai_count', 0);
  const aiLast = getUserData('ai_last', null);
  document.getElementById('rpt-ai-count').textContent = aiCount;
  document.getElementById('rpt-ai-last').textContent = aiLast || 'Never';
}

function closeModals() { document.getElementById('modal-overlay').style.display = 'none'; }
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModals();
  if (e.key === 'Enter' && document.getElementById('login-page').style.display !== 'none') doLogin();
});

// ---- AUTO LOGIN ----
window.addEventListener('load', () => {
  initTheme();
  const user = getSession();
  if (user) launchApp(user);
  aiRunCount = getUserData('ai_count', 0);
  lastAIRun = getUserData('ai_last', null);
  setTimeout(() => showToast(`Welcome back, ${user.firstName}! 🎓`, 'success'), 300); initTheme(); // ← add this line
});



function downloadPDF(type) {
  const user = getSession();
  const subjects = getSubjects();
  const gwa = computeGWA(subjects);
  const gwaNum = gwa ? parseFloat(gwa) : null;
  const interests = [...document.querySelectorAll('#interests-tags .tag.selected')]
    .map(t => (t.dataset.label || t.textContent.replace('×','').trim()));
  const strengths = [...document.querySelectorAll('#strengths-tags .tag.selected')]
    .map(t => (t.dataset.label || t.textContent.replace('×','').trim()));
  const aiCount = getUserData('ai_count', 0);
  const aiLast  = getUserData('ai_last', 'Never');
  const now     = new Date().toLocaleDateString('en-PH', {year:'numeric',month:'long',day:'numeric'});
  const name    = user ? `${user.firstName} ${user.lastName}` : 'Student';
  const course  = user?.course || '—';
  const year    = user?.year || '—';
  const sid     = user?.studentId || '—';

  function standingLabel(g) {
    if (!g) return '—';
    if (g <= 1.75) return "Dean's List 🏅";
    if (g <= 2.5)  return 'Good Standing';
    if (g <= 3.0)  return 'Average Standing';
    return 'Academic Alert';
  }

  function remarkLabel(g) {
    if (g === 5.0)  return 'Failed';
    if (g <= 1.5)   return 'Excellent';
    if (g < 2.0)    return 'Good';
    if (g < 2.25)   return 'Average';
    if (g < 2.5)    return 'Below Average';
    if (g <= 2.75)  return 'Fair';
    return 'Poor';
  }

  function subjectRows() {
    if (!subjects.length) return '<tr><td colspan="5" style="text-align:center;color:#888;padding:16px;">No subjects added yet.</td></tr>';
    return subjects.map(s => {
      const g = s.pct !== '' ? pctToGWA(s.pct) : null;
      return `<tr>
        <td>${s.name}</td>
        <td style="text-align:center;">${s.units}</td>
        <td style="text-align:center;">${s.pct !== '' ? s.pct + '%' : '—'}</td>
        <td style="text-align:center;font-weight:600;color:${g ? gradeColor(g) : '#888'}">${g || '—'}</td>
        <td style="text-align:center;">${g ? remarkLabel(g) : '—'}</td>
      </tr>`;
    }).join('');
  }

  const graded = subjects.filter(s => s.pct !== '');
  const bestSubject = graded.length ? graded.reduce((a,b) => b.pct > a.pct ? b : a) : null;
  // Only show worst subject if it actually needs attention (GWA >= 2.0)
  const needsAttention = graded.filter(s => pctToGWA(s.pct) >= 2.0);
  const worstSubject = needsAttention.length ? needsAttention.reduce((a,b) => b.pct < a.pct ? b : a) : null;

  const sections = {
    academic: `
      <div class="pdf-section">
        <h2><span class="icon">📊</span> Academic Summary</h2>
        <table class="info-table">
          <tr><td>Current GWA</td><td class="val" style="color:#1D9E75;font-size:20px;font-weight:700;">${gwa || '—'}</td></tr>
          <tr><td>Academic Standing</td><td class="val">${standingLabel(gwaNum)}</td></tr>
          <tr><td>Subjects Enrolled</td><td class="val">${subjects.length}</td></tr>
          <tr><td>Best Subject</td><td class="val">${bestSubject ? bestSubject.name + ' (' + pctToGWA(bestSubject.pct) + ')' : '—'}</td></tr>
          <tr><td>Needs Attention</td><td class="val">${worstSubject ? worstSubject.name + ' (' + pctToGWA(worstSubject.pct) + ')' : '—'}</td></tr>
          <tr><td>Date Generated</td><td class="val">${now}</td></tr>
        </table>
      </div>`,

    subjects: `
      <div class="pdf-section">
        <h2><span class="icon">📚</span> Subject Breakdown</h2>
        <table class="grade-table">
          <thead><tr><th>Subject</th><th>Units</th><th>Score</th><th>GWA Grade</th><th>Remark</th></tr></thead>
          <tbody>${subjectRows()}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align:right;font-weight:600;">Computed GWA:</td>
              <td colspan="2" style="font-weight:700;font-size:16px;color:#1D9E75;">${gwa || '—'}</td>
            </tr>
          </tfoot>
        </table>
      </div>`,

    interests: `
      <div class="pdf-section">
        <h2><span class="icon">⭐</span> Interests &amp; Strengths</h2>
        <table class="info-table">
          <tr><td>Interests</td><td class="val">${interests.join(', ') || '—'}</td></tr>
          <tr><td>Strengths</td><td class="val">${strengths.join(', ') || '—'}</td></tr>
        </table>
      </div>`,

    ailog: `
      <div class="pdf-section">
        <h2><span class="icon">🤖</span> AI Recommendation Log</h2>
        <table class="info-table">
          <tr><td>Recommendations Run</td><td class="val">${aiCount}</td></tr>
          <tr><td>Last Run</td><td class="val">${aiLast}</td></tr>
          <tr><td>Career Paths Mapped</td><td class="val">3 per analysis</td></tr>
          <tr><td>Date Generated</td><td class="val">${now}</td></tr>
        </table>
      </div>`
  };

  let body = '';
  let title = '';
  if (type === 'all') {
    body = sections.academic + sections.subjects + sections.interests + sections.ailog;
    title = 'Complete Academic Report';
  } else {
    body = sections[type];
    const titles = {
      academic: 'Academic Summary',
      subjects: 'Subject Breakdown',
      interests: 'Interests & Strengths',
      ailog: 'AI Recommendation Log'
    };
    title = titles[type];
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>AcadAI — ${title}</title>
  <style>
    * { box-sizing:border-box; margin:0; padding:0; }
    body { font-family:'Segoe UI',Arial,sans-serif; color:#1A1A2E; background:#fff; padding:40px; font-size:14px; }
    .pdf-header { display:flex; align-items:center; justify-content:space-between; padding-bottom:20px; border-bottom:3px solid #1D9E75; margin-bottom:28px; }
    .pdf-logo { display:flex; align-items:center; gap:10px; font-size:22px; font-weight:700; }
    .pdf-logo .dot { width:12px; height:12px; border-radius:50%; background:#1D9E75; }
    .pdf-meta { text-align:right; font-size:12px; color:#6B7280; }
    .pdf-meta strong { display:block; font-size:14px; color:#1A1A2E; }
    .student-bar { background:#f0f9f5; border:1px solid #b6ecd8; border-radius:10px; padding:14px 20px; margin-bottom:28px; display:flex; gap:32px; flex-wrap:wrap; }
    .student-bar .item { display:flex; flex-direction:column; }
    .student-bar .label { font-size:11px; color:#6B7280; font-weight:600; text-transform:uppercase; letter-spacing:.5px; }
    .student-bar .value { font-size:14px; font-weight:600; color:#1A1A2E; margin-top:2px; }
    .pdf-section { margin-bottom:32px; page-break-inside:avoid; }
    .pdf-section h2 { font-size:16px; font-weight:700; color:#1D9E75; margin-bottom:14px; display:flex; align-items:center; gap:8px; padding-bottom:8px; border-bottom:1px solid #e2e4ea; }
    .info-table { width:100%; border-collapse:collapse; }
    .info-table tr { border-bottom:1px solid #f0f1f5; }
    .info-table td { padding:10px 12px; font-size:13px; }
    .info-table td:first-child { color:#6B7280; width:200px; }
    .info-table .val { font-weight:600; color:#1A1A2E; }
    .grade-table { width:100%; border-collapse:collapse; font-size:13px; }
    .grade-table th { background:#f0f9f5; color:#0F6E56; font-weight:600; padding:10px 12px; text-align:left; border-bottom:2px solid #b6ecd8; }
    .grade-table td { padding:10px 12px; border-bottom:1px solid #f0f1f5; }
    .grade-table tbody tr:nth-child(even) { background:#fafafa; }
    .grade-table tfoot td { background:#f0f9f5; padding:12px; border-top:2px solid #b6ecd8; }
    .pdf-footer { margin-top:40px; padding-top:16px; border-top:1px solid #e2e4ea; display:flex; justify-content:space-between; font-size:11px; color:#9CA3AF; }
    @media print { body { padding:20px; } .pdf-section { page-break-inside:avoid; } }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div class="pdf-logo"><div class="dot"></div> AcadAI</div>
    <div class="pdf-meta"><strong>${title}</strong>Generated: ${now}</div>
  </div>
  <div class="student-bar">
    <div class="item"><span class="label">Student Name</span><span class="value">${name}</span></div>
    <div class="item"><span class="label">Student ID</span><span class="value">${sid}</span></div>
    <div class="item"><span class="label">Program</span><span class="value">${course}</span></div>
    <div class="item"><span class="label">Year Level</span><span class="value">${year}</span></div>
    <div class="item"><span class="label">Current GWA</span><span class="value" style="color:#1D9E75;">${gwa || '—'}</span></div>
  </div>
  ${body}
  <div class="pdf-footer">
    <span>AcadAI — AI Academic Advisor</span>
    <span>Confidential — For Student Use Only</span>
    <span>${now}</span>
  </div>
  <script>window.onload = function(){ window.print(); }<\/script>
</body>
</html>`;

  const blob = new Blob([html], { type: 'text/html' });
  const url  = URL.createObjectURL(blob);
  const win  = window.open(url, '_blank');
  if (!win) alert('Please allow pop-ups for this site to download PDFs.');
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}