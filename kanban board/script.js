(() => {
  'use strict';
 
  /* ---------- Constants & helpers ---------- */
  const KEY = 'kanban.tasks.v1';
  const COLUMNS = [
    { id: 'todo', title: 'To Do', hint: 'Add a task to get started.' },
    { id: 'progress', title: 'In Progress', hint: 'Drag a task here when you start it.' },
    { id: 'done', title: 'Completed', hint: 'Finished tasks land here.' }
  ];
  const PRIORITY = { low: 'Low', medium: 'Medium', high: 'High' };
  const $ = (sel, root = document) => root.querySelector(sel);
  const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `t${Date.now()}${Math.random()}`);
  const offsetDay = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const todayStr = () => new Date().toISOString().slice(0, 10);
  const fmtDate = iso => new Date(iso + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
 
  /* ---------- Storage layer ---------- */
  const seed = () => [
    { id: uid(), title: 'Design landing page', description: 'Wireframes and hero section for the marketing site.', priority: 'high', due: offsetDay(2), status: 'todo' },
    { id: uid(), title: 'Write API documentation', description: 'Document auth and product endpoints.', priority: 'medium', due: offsetDay(6), status: 'todo' },
    { id: uid(), title: 'Set up CI pipeline', description: 'Run lint and tests on every pull request.', priority: 'medium', due: offsetDay(4), status: 'progress' },
    { id: uid(), title: 'Fix login redirect bug', description: 'Users land on a blank page after sign-in.', priority: 'high', due: offsetDay(-1), status: 'progress' },
    { id: uid(), title: 'Update team wiki', description: '', priority: 'low', due: '', status: 'done' }
  ];
  const load = () => {
    try { const raw = JSON.parse(localStorage.getItem(KEY)); if (Array.isArray(raw)) return raw; } catch (_) {}
    return seed();
  };
  const persist = () => { try { localStorage.setItem(KEY, JSON.stringify(state.tasks)); } catch (_) {} };
 
  /* ---------- State (single source of truth) ---------- */
  const state = { tasks: load(), query: '', priority: 'all', status: 'all', editingId: null, deletingId: null };
  const setState = (mutate, { focusId } = {}) => { mutate(); persist(); render(focusId); };
 
  const matches = t => t.title.toLowerCase().includes(state.query) && (state.priority === 'all' || t.priority === state.priority);
 
  /* ---------- Rendering ---------- */
  const cardHTML = t => {
    const overdue = t.due && t.status !== 'done' && t.due < todayStr();
    const options = COLUMNS.map(c => `<option value="${c.id}"${c.id === t.status ? ' selected' : ''}>${c.title}</option>`).join('');
    return `<li class="card" draggable="true" data-id="${t.id}">
      <div class="card-top">
        <span class="badge ${t.priority}">${PRIORITY[t.priority]} priority</span>
        <div class="actions">
          <button class="icon-btn" data-action="edit" type="button" aria-label="Edit ${esc(t.title)}">Edit</button>
          <button class="icon-btn" data-action="delete" type="button" aria-label="Delete ${esc(t.title)}">Delete</button>
        </div>
      </div>
      <h3>${esc(t.title)}</h3>
      ${t.description ? `<p>${esc(t.description)}</p>` : ''}
      <div class="card-foot">
        <span>${t.due ? `<time datetime="${t.due}" class="${overdue ? 'overdue' : ''}">${overdue ? 'Overdue · ' : 'Due '}${fmtDate(t.due)}</time>` : 'No due date'}</span>
        <label class="move">Move to
          <select data-action="move" aria-label="Move ${esc(t.title)} to another column">${options}</select>
        </label>
      </div>
    </li>`;
  };
 
  const emptyHTML = (col, filtered) => `<li class="empty">
    <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="14" rx="2"/><path d="M8 10h8M8 14h5"/></svg>
    <strong>${filtered ? 'No matching tasks' : `Nothing in ${col.title} yet`}</strong>
    ${filtered ? 'Adjust the search or filters to see more.' : col.hint}</li>`;
 
  function render(focusId) {
    const visible = state.tasks.filter(matches);
    $('#board').innerHTML = COLUMNS.map(col => {
      const all = state.tasks.filter(t => t.status === col.id);
      const shown = visible.filter(t => t.status === col.id);
      const hidden = state.status !== 'all' && state.status !== col.id;
      return `<section class="column" data-status="${col.id}" aria-labelledby="h-${col.id}"${hidden ? ' hidden' : ''}>
        <div class="column-head"><h2 id="h-${col.id}">${col.title}</h2><span class="count" aria-label="${shown.length} tasks">${shown.length}</span></div>
        <ul class="dropzone" data-status="${col.id}">${shown.length ? shown.map(cardHTML).join('') : emptyHTML(col, all.length > 0)}</ul>
      </section>`;
    }).join('');
 
    const filtersOn = state.query || state.priority !== 'all' || state.status !== 'all';
    const shownCount = visible.filter(t => state.status === 'all' || t.status === state.status).length;
    $('#noResults').hidden = !(filtersOn && shownCount === 0 && state.tasks.length > 0);
    const done = state.tasks.filter(t => t.status === 'done').length;
    $('#summary').textContent = `${state.tasks.length} tasks · ${done} completed`;
    if (focusId) $(`[data-id="${focusId}"] [data-action=move]`)?.focus();
  }
 
  /* ---------- Actions ---------- */
  const findTask = id => state.tasks.find(t => t.id === id);
  const columnTitle = id => COLUMNS.find(c => c.id === id).title;
 
  function moveTask(id, status) {
    const task = findTask(id);
    if (!task || task.status === status) return;
    setState(() => { task.status = status; }, { focusId: id });
    $('#live').textContent = `${task.title} moved to ${columnTitle(status)}`;
  }
 
  function openTaskDialog(id = null) {
    state.editingId = id;
    const t = id ? findTask(id) : { title: '', description: '', priority: 'medium', due: '' };
    $('#dialogTitle').textContent = id ? 'Edit task' : 'New task';
    $('#fTitle').value = t.title; $('#fDesc').value = t.description;
    $('#fPriority').value = t.priority; $('#fDue').value = t.due;
    $('#titleError').hidden = true;
    $('#taskDialog').showModal();
  }
 
  function saveTask(e) {
    e.preventDefault();
    const title = $('#fTitle').value.trim();
    if (!title) { $('#titleError').hidden = false; $('#fTitle').focus(); return; }
    const data = { title, description: $('#fDesc').value.trim(), priority: $('#fPriority').value, due: $('#fDue').value };
    setState(() => {
      if (state.editingId) Object.assign(findTask(state.editingId), data);
      else state.tasks.push({ id: uid(), status: 'todo', ...data });
    });
    $('#taskDialog').close();
  }
 
  /* ---------- Event wiring (delegated) ---------- */
  const board = $('#board');
  board.addEventListener('click', e => {
    const btn = e.target.closest('[data-action]');
    const card = e.target.closest('.card');
    if (!btn || !card) return;
    const id = card.dataset.id;
    if (btn.dataset.action === 'edit') openTaskDialog(id);
    if (btn.dataset.action === 'delete') {
      state.deletingId = id;
      $('#delText').textContent = `“${findTask(id).title}” will be removed permanently.`;
      $('#deleteDialog').showModal();
    }
  });
  board.addEventListener('change', e => {
    if (e.target.dataset.action === 'move') moveTask(e.target.closest('.card').dataset.id, e.target.value);
  });
 
  // Drag & drop
  let dragId = null;
  board.addEventListener('dragstart', e => {
    const card = e.target.closest('.card'); if (!card) return;
    dragId = card.dataset.id;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', dragId);
    requestAnimationFrame(() => card.classList.add('dragging'));
  });
  board.addEventListener('dragend', () => {
    dragId = null;
    board.querySelectorAll('.dragging,.over').forEach(el => el.classList.remove('dragging', 'over'));
  });
  board.addEventListener('dragover', e => {
    const zone = e.target.closest('.dropzone'); if (!zone || !dragId) return;
    e.preventDefault(); e.dataTransfer.dropEffect = 'move';
    board.querySelectorAll('.over').forEach(el => el !== zone && el.classList.remove('over'));
    zone.classList.add('over');
  });
  board.addEventListener('drop', e => {
    const zone = e.target.closest('.dropzone'); if (!zone || !dragId) return;
    e.preventDefault();
    moveTask(dragId, zone.dataset.status);
  });
 
  // Toolbar
  $('#search').addEventListener('input', e => setState(() => { state.query = e.target.value.trim().toLowerCase(); }));
  $('#priorityFilter').addEventListener('change', e => setState(() => { state.priority = e.target.value; }));
  $('#statusFilter').addEventListener('change', e => setState(() => { state.status = e.target.value; }));
  $('#clearFilters').addEventListener('click', () => {
    $('#search').value = ''; $('#priorityFilter').value = 'all'; $('#statusFilter').value = 'all';
    setState(() => Object.assign(state, { query: '', priority: 'all', status: 'all' }));
  });
 
  // Dialogs
  $('#addBtn').addEventListener('click', () => openTaskDialog());
  $('#taskForm').addEventListener('submit', saveTask);
  $('#cancelTask').addEventListener('click', () => $('#taskDialog').close());
  $('#cancelDelete').addEventListener('click', () => $('#deleteDialog').close());
  $('#confirmDelete').addEventListener('click', () => {
    setState(() => { state.tasks = state.tasks.filter(t => t.id !== state.deletingId); });
    $('#deleteDialog').close();
  });
  document.querySelectorAll('dialog').forEach(d =>
    d.addEventListener('click', e => { if (e.target === d) d.close(); })); // click on backdrop closes
 
  // Sync across tabs
  window.addEventListener('storage', e => { if (e.key === KEY) { state.tasks = load(); render(); } });
 
  persist();  // writes seed data on first visit
  render();
})();