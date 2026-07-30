/**
 * TraineeHub Admin Management - Vanilla JavaScript
 * Matches React mock: AdminManagementPage, AddAdminModal
 */

(function () {
    'use strict';

    var INITIAL_ADMINS = [
        { id: 'admin-001', name: 'Nash Williams', email: 'nash@traineehub.co.za', role: 'Super Admin', addedOn: '2024-01-10' },
        { id: 'admin-002', name: 'Lerato Dube', email: 'lerato@traineehub.co.za', role: 'Admin', addedOn: '2024-03-15' }
    ];

    var admins = JSON.parse(JSON.stringify(INITIAL_ADMINS));

    function $(id) { return document.getElementById(id); }

    var tbody = $('adminTableBody');
    var emptyState = $('adminEmptyState');
    var adminCount = $('adminCount');
    var openAddBtn = $('openAddAdminBtn');
    var addModal = $('addAdminModal');
    var closeAddBtn = $('closeAddAdminBtn');
    var cancelAddBtn = $('cancelAddAdminBtn');
    var addForm = $('addAdminForm');
    var adminName = $('adminName');
    var adminEmail = $('adminEmail');
    var adminPassword = $('adminPassword');
    var adminRole = $('adminRole');
    var adminNameError = $('adminNameError');
    var adminEmailError = $('adminEmailError');
    var adminPasswordError = $('adminPasswordError');
    var togglePassword = $('togglePassword');
    var passwordIcon = $('passwordIcon');
    var themeToggle = $('themeToggle');
    var themeIcon = $('themeIcon');
    var toastContainer = $('toastContainer');

    // ============================================================
    // THEME with icon swap
    // ============================================================
    function getThemeIcon(theme) {
        if (theme === 'dark') {
            return '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>';
        }
        return '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
    }

    function initTheme() {
        var saved = localStorage.getItem('traineehub-theme');
        var theme = saved === 'dark' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        if (themeIcon) {
            themeIcon.innerHTML = getThemeIcon(theme);
        }
    }

    function toggleThemeHandler() {
        var html = document.documentElement;
        var current = html.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        localStorage.setItem('traineehub-theme', next);
        if (themeIcon) {
            themeIcon.innerHTML = getThemeIcon(next);
        }
    }

    // ============================================================
    // TOAST
    // ============================================================
    function showToast(message, type, undoCallback) {
        if (!toastContainer) return;
        var svgIcons = {
            success: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check-circle" aria-hidden="true"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
            error: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x-circle" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
            info: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
        };
        var toast = document.createElement('div');
        toast.className = 'toast toast-' + (type || 'info');
        toast.innerHTML =
            '<span class="toast-icon">' + (svgIcons[type] || svgIcons.info) + '</span>' +
            '<span class="toast-message">' + message + '</span>' +
            (undoCallback ? '<div class="toast-actions"><button class="toast-btn" data-action="undo">Undo</button></div>' : '') +
            '<button class="toast-close-btn"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-x" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button>';
        toastContainer.appendChild(toast);

        var undoBtn = toast.querySelector('[data-action="undo"]');
        if (undoBtn && undoCallback) {
            undoBtn.addEventListener('click', function () {
                undoCallback();
                removeToast(toast);
                showToast('Restored successfully.', 'success');
            });
        }
        var closeBtn = toast.querySelector('.toast-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', function () { removeToast(toast); });
        }
        setTimeout(function () { removeToast(toast); }, 5000);
    }

    function removeToast(toast) {
        if (!toast || !toast.parentNode) return;
        toast.classList.add('toast-out');
        setTimeout(function () { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 300);
    }

    // ============================================================
    // HELPERS
    // ============================================================
    function getInitials(name) {
        return name.split(' ').map(function (w) { return w[0]; }).join('').substring(0, 2).toUpperCase();
    }

    function getToday() {
        var d = new Date();
        var year = d.getFullYear();
        var month = String(d.getMonth() + 1).padStart(2, '0');
        var day = String(d.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    // ============================================================
    // RENDER
    // ============================================================
    function renderAdmins() {
        if (!tbody || !emptyState || !adminCount) return;

        adminCount.textContent = admins.length + ' admin' + (admins.length !== 1 ? 's' : '') + ' with access';

        if (admins.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            return;
        }

        emptyState.style.display = 'none';

        var html = '';
        admins.forEach(function (admin) {
            var initials = getInitials(admin.name);
            var roleClass = '';
            if (admin.role === 'Super Admin') {
                roleClass = 'status-employed';
            } else if (admin.role === 'Viewer') {
                roleClass = 'status-not-employed';
            } else {
                roleClass = 'status-employed';
            }

            html += '<tr>' +
                '<td>' +
                '<div class="trainee-cell">' +
                '<div class="trainee-avatar">' + initials + '</div>' +
                '<span class="trainee-name">' + admin.name + '</span>' +
                '</div>' +
                '</td>' +
                '<td class="show-sm" style="color:var(--muted-foreground);">' + admin.email + '</td>' +
                '<td class="show-md"><span class="status-badge ' + roleClass + '">' + admin.role + '</span></td>' +
                '<td class="show-lg" style="color:var(--muted-foreground);">' + admin.addedOn + '</td>' +
                '<td style="text-align:right;">' +
                '<button class="action-btn danger" data-action="delete" data-id="' + admin.id + '" title="Remove ' + admin.name + '"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2" aria-hidden="true"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
                '</td>' +
                '</tr>';
        });

        tbody.innerHTML = html;
    }

    // ============================================================
    // TABLE ACTIONS
    // ============================================================
    function handleTableClick(e) {
        var target = e.target.closest('[data-action]');
        if (!target) return;
        var action = target.getAttribute('data-action');
        var id = target.getAttribute('data-id');
        if (!action || !id) return;
        if (action === 'delete') { deleteAdmin(id); }
    }

    // ============================================================
    // CRUD
    // ============================================================
    function deleteAdmin(id) {
        var deleted = null;
        for (var i = 0; i < admins.length; i++) {
            if (admins[i].id === id) { deleted = admins[i]; break; }
        }
        if (!deleted) return;

        admins = admins.filter(function (a) { return a.id !== id; });
        renderAdmins();

        showToast(deleted.name + ' was removed.', 'info', function () {
            var insertIdx = -1;
            for (var j = 0; j < INITIAL_ADMINS.length; j++) {
                if (INITIAL_ADMINS[j].id === id) { insertIdx = j; break; }
            }
            if (insertIdx >= 0) { admins.splice(Math.min(insertIdx, admins.length), 0, deleted); }
            else { admins.unshift(deleted); }
            renderAdmins();
        });
    }

    function handleAddAdmin(e) {
        e.preventDefault();

        var name = adminName.value.trim();
        var email = adminEmail.value.trim();
        var password = adminPassword.value;
        var role = adminRole.value;
        var hasError = false;

        if (!name) { adminNameError.textContent = 'Name is required'; hasError = true; } else { adminNameError.textContent = ''; }
        if (!email) { adminEmailError.textContent = 'Email is required'; hasError = true; } else if (!validateEmail(email)) { adminEmailError.textContent = 'Enter a valid email address'; hasError = true; } else { adminEmailError.textContent = ''; }
        if (!password) { adminPasswordError.textContent = 'Password is required'; hasError = true; } else if (password.length < 6) { adminPasswordError.textContent = 'Password must be at least 6 characters'; hasError = true; } else { adminPasswordError.textContent = ''; }

        if (hasError) return;

        var newAdmin = {
            id: 'admin-' + Date.now(),
            name: name,
            email: email,
            role: role,
            addedOn: getToday()
        };

        admins.push(newAdmin);
        renderAdmins();
        closeAddAdminModal();
        showToast(name + ' has been added successfully.', 'success');
        addForm.reset();
        adminRole.value = 'Admin';
    }

    // ============================================================
    // MODAL
    // ============================================================
    function openAddAdminModal() {
        addForm.reset();
        adminRole.value = 'Admin';
        adminNameError.textContent = '';
        adminEmailError.textContent = '';
        adminPasswordError.textContent = '';
        if (addModal) addModal.classList.add('open');
    }

    function closeAddAdminModal() {
        if (addModal) addModal.classList.remove('open');
    }

    // ============================================================
    // PASSWORD TOGGLE
    // ============================================================
    function togglePasswordVisibility() {
        if (!adminPassword || !passwordIcon) return;
        var type = adminPassword.getAttribute('type');
        if (type === 'password') {
            adminPassword.setAttribute('type', 'text');
            passwordIcon.setAttribute('viewBox', '0 0 24 24');
            passwordIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
        } else {
            adminPassword.setAttribute('type', 'password');
            passwordIcon.setAttribute('viewBox', '0 0 24 24');
            passwordIcon.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
        }
    }

    // ============================================================
    // INIT
    // ============================================================
    function init() {
        initTheme();
        if (themeToggle) themeToggle.addEventListener('click', toggleThemeHandler);
        renderAdmins();
        if (tbody) tbody.addEventListener('click', handleTableClick);
        if (openAddBtn) openAddBtn.addEventListener('click', openAddAdminModal);
        if (closeAddBtn) closeAddBtn.addEventListener('click', closeAddAdminModal);
        if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddAdminModal);
        if (addModal) addModal.addEventListener('click', function (e) { if (e.target === addModal) closeAddAdminModal(); });
        if (addForm) addForm.addEventListener('submit', handleAddAdmin);
        if (togglePassword) togglePassword.addEventListener('click', togglePasswordVisibility);
        console.log('Admin Management initialized.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();