(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var admins = [], csrfToken = '', page = 1, pages = 1, searchTimer;
  var tbody = $('adminTableBody'), count = $('adminCount'), empty = $('adminEmptyState');
  var error = $('adminLoadError'), search = $('adminSearch'), pagination = $('adminPagination');
  var modal = $('addAdminModal'), form = $('addAdminForm'), submit = $('submitAddAdminBtn');

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('traineehub-theme', theme);
    var icon = $('themeIcon');
    if (icon) {
      icon.innerHTML = theme === 'dark'
        ? '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>'
        : '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/>';
    }
  }

  function api(url, method, body) {
    return fetch('/backend/index.php?route=' + url, { method: method || 'GET', headers: method === 'GET' ? {} : { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }, body: body ? JSON.stringify(body) : undefined })
      .then(function (res) { return res.json().then(function (data) { if (!res.ok) throw new Error(data.error || 'Request failed'); return data; }); });
  }
  function text(element, value) { element.textContent = value || ''; return element; }
  function showToast(message, type) {
    var container = $('toastContainer'); if (!container) return;
    var item = document.createElement('div'); item.className = 'toast toast-' + (type || 'info'); text(item, message); container.appendChild(item);
    setTimeout(function () { item.remove(); }, 4500);
  }
  function render() {
    tbody.innerHTML = '';
    text(count, (admins.length ? '' : 'No ') + admins.length + ' admin' + (admins.length === 1 ? '' : 's') + ' on this page');
    empty.style.display = admins.length ? 'none' : 'block';
    admins.forEach(function (admin) {
      var row = document.createElement('tr');
      var email = document.createElement('td'); email.className = 'show-sm'; email.setAttribute('data-label', 'Email'); text(email, admin.email);
      var date = document.createElement('td'); date.className = 'show-lg'; date.setAttribute('data-label', 'Added On'); text(date, admin.created_at ? new Date(admin.created_at).toLocaleDateString() : '');
      var actions = document.createElement('td'), remove = document.createElement('button'); actions.style.textAlign = 'right'; remove.className = 'action-btn danger'; text(remove, 'Remove'); remove.addEventListener('click', function () { removeAdmin(admin); }); actions.appendChild(remove);
      row.append(email, date, actions); tbody.appendChild(row);
    });
    pagination.innerHTML = '';
    for (var n = 1; n <= pages; n++) { var b = document.createElement('button'); b.type = 'button'; text(b, n); b.disabled = n === page; b.addEventListener('click', (function (number) { return function () { load(number); }; })(n)); pagination.appendChild(b); }
  }
  function load(nextPage) {
    page = nextPage || 1; error.hidden = true; tbody.innerHTML = '<tr><td colspan="3">Loading administrators…</td></tr>';
    api('admins&page=' + page + '&per_page=10&search=' + encodeURIComponent(search.value.trim()))
      .then(function (data) { admins = data.admins || []; pages = data.pagination.pages || 1; render(); })
      .catch(function () { admins = []; render(); text(error, 'Unable to load administrators. Please try again.'); error.hidden = false; });
  }
  function removeAdmin(admin) {
    if (!window.confirm('Are you sure you want to remove ' + admin.email + '?')) return;
    api('delete-admin', 'POST', { id: admin.id }).then(function () { showToast(admin.email + ' was removed.', 'success'); load(page); }).catch(function (err) { showToast(err.message, 'error'); });
  }
  function fieldError(id, message) { text($(id), message); return !!message; }
  function addAdmin(event) {
    event.preventDefault();
    var email = $('adminEmail').value.trim(), password = $('adminPassword').value;
    var invalid = fieldError('adminEmailError', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid email address' : '') |
      fieldError('adminPasswordError', password.length < 8 ? 'Password must be at least 8 characters' : '');
    if (invalid) return;
    submit.disabled = true; text(submit, 'Saving…');
    api('register', 'POST', { email: email, password: password })
      .then(function () { modal.classList.remove('open'); form.reset(); showToast('✓ Admin added', 'success'); load(1); })
      .catch(function (err) { showToast(err.message, 'error'); })
      .finally(function () { submit.disabled = false; text(submit, 'Add Admin'); });
  }
  function init() {
    setTheme(localStorage.getItem('traineehub-theme') === 'dark' ? 'dark' : 'light');
    api('check').then(function (data) { if (!data.authenticated) throw new Error(); csrfToken = data.csrfToken; text($('currentAdminEmail'), data.email || 'Administrator'); load(1); }).catch(function () { window.location.href = 'admin-login.html'; });
    $('openAddAdminBtn').addEventListener('click', function () { form.reset(); modal.classList.add('open'); });
    $('closeAddAdminBtn').addEventListener('click', function () { modal.classList.remove('open'); });
    $('cancelAddAdminBtn').addEventListener('click', function () { modal.classList.remove('open'); });
    form.addEventListener('submit', addAdmin);
    search.addEventListener('input', function () { clearTimeout(searchTimer); searchTimer = setTimeout(function () { load(1); }, 250); });
    $('themeToggle').addEventListener('click', function () { setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); });
    $('logoutBtn').addEventListener('click', function () { api('logout', 'POST').finally(function () { window.location.href = 'admin-login.html'; }); });
  }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
}());
