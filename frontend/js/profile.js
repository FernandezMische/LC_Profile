/**
 * TraineeHub Dashboard - Vanilla JavaScript
 * Data is loaded exclusively from the MySQL database via the protected API.
 */

(function () {
    'use strict';
    var csrfToken = '';

    function buildApiUrl(route) {
        var url = new URL('backend/index.php', window.location.href);
        url.searchParams.set('route', route);
        return url.toString();
    }

    // ---- Session guard: redirect to login if not authenticated ----
    function requireAuth() {
        return fetch(buildApiUrl('check'), {
            method: 'GET',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' }
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            if (!data.authenticated) {
                window.location.href = 'admin-login.html';
                return false;
            }
            csrfToken = data.csrfToken || '';
            var currentAdmin = document.getElementById('currentAdminEmail');
            if (currentAdmin) currentAdmin.textContent = data.email || 'Administrator';
            return true;
        })
        .catch(function () {
            window.location.href = 'admin-login.html';
            return false;
        });
    }

    // ---- Logout: destroy the server-side session, then redirect ----
    function logout() {
        fetch(buildApiUrl('logout'), {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken }
        })
        .then(function () {
            window.location.href = 'admin-login.html';
        })
        .catch(function () {
            // Even if the request fails, still send the user to the login page
            window.location.href = 'admin-login.html';
        });
    }

    function api(route, method, body, fallbackMessage) {
        var isFormData = body instanceof FormData;
        return fetch(buildApiUrl(route), {
            method: method || 'GET',
            credentials: 'same-origin',
            headers: method === 'GET' ? {} : Object.assign({ 'X-CSRF-Token': csrfToken }, isFormData ? {} : { 'Content-Type': 'application/json' }),
            body: body ? (isFormData ? body : JSON.stringify(body)) : undefined
        }).then(function (response) {
            return response.text().then(function (text) {
                var data = {};
                if (text) {
                    try { data = JSON.parse(text); } catch (e) { data = {}; }
                }
                if (!response.ok) {
                    var message = data.error || data.message || fallbackMessage || 'Request failed';
                    if (response.status === 413) message = fallbackMessage || 'Request is too large.';
                    var error = new Error(message);
                    error.status = response.status;
                    throw error;
                }
                return data;
            });
        }).catch(function (error) {
            if (error && error.status) throw error;
            throw new Error(fallbackMessage || 'Request failed. Please try again.');
        });
    }

    function loadTrainees() {
        return Promise.all([api('trainees'), api('cohorts')]).then(function (results) {
            trainees = results[0].trainees || [];
            availableCohorts = (results[1].cohorts || []).map(function (value) {
                var cohort = parseInt(value, 10);
                return Number.isNaN(cohort) ? null : cohort;
            }).filter(function (value) { return value !== null; });
            populateCohortSelects();
            renderTable();
        }).catch(function (error) {
            showToast(error.message || 'Could not load trainees.', 'error');
        });
    }

    // ============================================================
    // STATE
    // ============================================================
    // Dashboard data is always loaded from MySQL through the protected API.
    var trainees = [];
    var availableCohorts = [];
    var searchTerm = '';
    var cohortFilter = 'all';
    var selectedStatuses = [];
    var currentPage = 1;
    var addAvatarDataUrl = '';
    var addProfileImageDataUrl = '';
    var editAvatarDataUrl = '';
    var editProfileImageDataUrl = '';
    var editAvatarChanged = false;
    var editProfileImageChanged = false;
    var ROWS_PER_PAGE = 8;

    // ============================================================
    // DOM REFS
    // ============================================================
    function $(id) { return document.getElementById(id); }

    var tbody = $('traineeTableBody');
    var paginationButtons = $('paginationButtons');
    var paginationInfo = $('paginationInfo');
    var statTotal = $('statTotal');
    var statEmployed = $('statEmployed');
    var statNotEmployed = $('statNotEmployed');
    var statCohorts = $('statCohorts');
    var searchInput = $('searchInput');
    var cohortFilterEl = $('cohortFilter');
    var statusFilterWrap = $('statusFilterWrap');
    var statusFilterTrigger = $('statusFilterTrigger');
    var statusFilterLabel = $('statusFilterLabel');
    var statusFilterMenu = $('statusFilterMenu');
    var statusCheckboxes = document.querySelectorAll('.status-option');
    var resetBtn = $('resetBtn');
    var openModalBtn = $('openModalBtn');
    var addModal = $('addModal');
    var closeModalBtn = $('closeModalBtn');
    var cancelAddBtn = $('cancelAddBtn');
    var editModal = $('editModal');
    var closeEditBtn = $('closeEditBtn');
    var cancelEditBtn = $('cancelEditBtn');
    var themeToggle = $('themeToggle');
    var themeIcon = $('themeIcon');
    var toastContainer = $('toastContainer');

    var addForm = $('addTraineeForm');
    var addName = $('addName');
    var addTitle = $('addTitle');
    var addCohort = $('addCohort');
    var addStatus = $('addStatus');
    var addStatusError = $('addStatusError');
    var addCvLink = $('addCvLink');
    var addPortfolioLink = $('addPortfolioLink');
    var addLinkedIn = $('addLinkedIn');
    var addGithub = $('addGithub');
    var addNameError = $('addNameError');
    var addTitleError = $('addTitleError');
    var addCohortError = $('addCohortError');
    var imageInput = $('imageInput');
    var imagePreview = $('imagePreview');
    var imageUploadArea = $('imageUploadArea');
    var profileImageInput = $('profileImageInput');
    var profileImagePreview = $('profileImagePreview');
    var profileImageUploadArea = $('profileImageUploadArea');

    var editForm = $('editTraineeForm');
    var editId = $('editId');
    var editName = $('editName');
    var editTitle = $('editTitle');
    var editCohort = $('editCohort');
    var editStatus = $('editStatus');
    var editStatusError = $('editStatusError');
    var editCvLink = $('editCvLink');
    var editPortfolioLink = $('editPortfolioLink');
    var editLinkedIn = $('editLinkedIn');
    var editGithub = $('editGithub');
    var editNameError = $('editNameError');
    var editTitleError = $('editTitleError');
    var editCohortError = $('editCohortError');
    var editImageInput = $('editImageInput');
    var editImagePreview = $('editImagePreview');
    var editImageUploadArea = $('editImageUploadArea');
    var editProfileImageInput = $('editProfileImageInput');
    var editProfileImagePreview = $('editProfileImagePreview');
    var editProfileImageUploadArea = $('editProfileImageUploadArea');

    var deleteModal = $('deleteModal');
    var closeDeleteBtn = $('closeDeleteBtn');
    var cancelDeleteBtn = $('cancelDeleteBtn');
    var confirmDeleteBtn = $('confirmDeleteBtn');
    var deleteTraineeName = $('deleteTraineeName');
    var pendingDeleteId = null;

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
        // default to dark if user has no saved preference (matches live site)
        var theme;
        if (saved === 'dark' || saved === 'light') {
            theme = saved;
        } else {
            theme = 'dark';
            // persist default so subsequent loads follow same appearance
            try { localStorage.setItem('traineehub-theme', 'dark'); } catch (e) {}
        }
        document.documentElement.setAttribute('data-theme', theme);
        // also keep a `dark` class for projects that rely on the class selector
        if (theme === 'dark') document.documentElement.classList.add('dark');
        else document.documentElement.classList.remove('dark');
        if (themeIcon) {
            themeIcon.innerHTML = getThemeIcon(theme);
        }
    }

    function toggleTheme() {
        var html = document.documentElement;
        var current = html.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        html.setAttribute('data-theme', next);
        // mirror the attribute with a class for compatibility
        if (next === 'dark') html.classList.add('dark'); else html.classList.remove('dark');
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

    function displayValue(value) {
        return String(value).trim();
    }

    function normalizeLink(value) {
        var link = String(value || '').trim();
        if (link && !/^[a-z][a-z0-9+.-]*:\/\//i.test(link)) link = 'https://' + link;
        return link;
    }

    function linksAreValid(links) {
        return Object.keys(links).every(function (key) {
            if (!links[key]) return true;
            try {
                var url = new URL(links[key]);
                return Boolean(url.hostname);
            } catch (e) {
                return false;
            }
        });
    }

    function normalizeStatusSet(values) {
        var allowed = ['freelance', 'opportunities', 'employed'];
        var normalized = [];
        var raw = Array.isArray(values) ? values : parseStatusValues(values);
        raw.forEach(function (entry) {
            var item = String(entry || '').trim().toLowerCase();
            if (!item || allowed.indexOf(item) === -1) return;
            if (normalized.indexOf(item) === -1) normalized.push(item);
        });

        var hasEmployed = normalized.indexOf('employed') !== -1;
        var hasOpportunities = normalized.indexOf('opportunities') !== -1;
        if (hasEmployed && hasOpportunities) {
            normalized = normalized.filter(function (status) { return status !== 'opportunities'; });
        }

        return normalized;
    }

    function parseStatusValues(value) {
        var allowed = ['freelance', 'opportunities', 'employed'];
        var values = [];
        var raw = Array.isArray(value) ? value : String(value || '').split(/[|,]/);
        raw.forEach(function (entry) {
            var item = String(entry || '').trim().toLowerCase();
            if (!item || allowed.indexOf(item) === -1) return;
            if (values.indexOf(item) === -1) values.push(item);
        });
        return normalizeStatusSet(values);
    }

    function serializeStatusValues(value) {
        return normalizeStatusSet(value).join(',');
    }

    function getStatusLabels(values) {
        var labels = {
            'freelance': 'Available to Freelance',
            'opportunities': 'Open to Opportunities',
            'employed': 'Currently Employed'
        };
        return parseStatusValues(values).map(function (status) {
            return labels[status] || status;
        });
    }

    function syncModalStatusSelection(groupName) {
        var wrapper = document.querySelector('.status-multi-select[data-status-group="' + groupName + '"]');
        if (!wrapper) return;
        var checkboxes = wrapper.querySelectorAll('.modal-status-option');
        var selected = [];
        checkboxes.forEach(function (checkbox) {
            if (checkbox.checked) selected.push(checkbox.value);
        });

        var normalized = normalizeStatusSet(selected);
        checkboxes.forEach(function (checkbox) {
            checkbox.checked = normalized.indexOf(checkbox.value) !== -1;
        });

        if (groupName === 'add' && addStatus) addStatus.value = serializeStatusValues(normalized);
        if (groupName === 'edit' && editStatus) editStatus.value = serializeStatusValues(normalized);
    }

    function resetModalStatusSelection(groupName) {
        var wrapper = document.querySelector('.status-multi-select[data-status-group="' + groupName + '"]');
        if (!wrapper) return;
        wrapper.querySelectorAll('.modal-status-option').forEach(function (checkbox) {
            checkbox.checked = false;
        });
        syncModalStatusSelection(groupName);
    }

    function getCohorts() {
        var unique = {};
        availableCohorts.forEach(function (value) {
            var cohort = parseInt(value, 10);
            if (!Number.isNaN(cohort)) unique[cohort] = true;
        });
        trainees.forEach(function (t) {
            var cohort = parseInt(t.cohort, 10);
            if (!Number.isNaN(cohort)) unique[cohort] = true;
        });
        return Object.keys(unique).map(Number).sort(function (a, b) { return a - b; });
    }

    // Display a cohort under the "Cohort XX" ruling: pad single digits with a
    // leading zero (e.g. 1 -> "01", 17 -> "17") while leaving multi-digit
    // values intact (e.g. 134 -> "134").
    function formatCohort(value) {
        var n = parseInt(value, 10);
        if (Number.isNaN(n) || n < 0) return '';
        return String(n).padStart(2, '0');
    }

    // Populates the shared <datalist> used by the add/edit cohort inputs. The
    // input is free-typed (so brand-new cohorts like 18 can be entered before
    // anyone belongs to them), but existing cohorts appear as suggestions.
    function populateCohortSuggestions() {
        var list = document.getElementById('cohortSuggestions');
        if (!list) return;
        var cohorts = getCohorts();
        list.innerHTML = '';
        cohorts.forEach(function (c) {
            var opt = document.createElement('option');
            opt.value = formatCohort(c);
            list.appendChild(opt);
        });
    }

    function getFiltered() {
        return trainees.filter(function (t) {
            var q = searchTerm.toLowerCase().trim();
            var matchSearch = !q || t.name.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || String(t.cohort).includes(q);
            var matchCohort = cohortFilter === 'all' || String(t.cohort) === cohortFilter;
            var traineeStatuses = parseStatusValues(t.status || (t.employed ? 'employed' : 'freelance'));
            var matchStatus = selectedStatuses.length === 0 || selectedStatuses.some(function (status) {
                return traineeStatuses.indexOf(status) !== -1;
            });
            return matchSearch && matchCohort && matchStatus;
        });
    }

    // MySQL returns integer IDs while data-* attributes are strings.
    // Always compare as strings so edit/delete actions locate the right trainee.
    function findTraineeById(id) {
        for (var i = 0; i < trainees.length; i++) {
            if (String(trainees[i].id) === String(id)) return trainees[i];
        }
        return null;
    }

    // ============================================================
    // RENDER
    // ============================================================
    function populateCohortSelects() {
        var cohorts = getCohorts();
        // The add/edit cohort inputs are free-typed text fields backed by a
        // datalist of existing cohorts, so they need no option-building here —
        // just refresh the shared suggestion list.
        populateCohortSuggestions();
        if (cohortFilterEl) {
            cohortFilterEl.innerHTML = '<option value="all">All Cohorts</option>';
            cohorts.forEach(function (c) {
                var opt = document.createElement('option');
                opt.value = String(c);
                opt.textContent = 'Cohort ' + formatCohort(c);
                cohortFilterEl.appendChild(opt);
            });
        }
    }

    function updateStats() {
        var total = trainees.length;
        var employed = trainees.filter(function (t) { return t.employed; }).length;
        var notEmployed = total - employed;
        var uniqueCohorts = getCohorts().length;
        if (statTotal) statTotal.textContent = total;
        if (statEmployed) statEmployed.textContent = employed;
        if (statNotEmployed) statNotEmployed.textContent = notEmployed;
        if (statCohorts) statCohorts.textContent = uniqueCohorts;
    }

    function renderTable() {
        var filtered = getFiltered();
        var totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
        var safePage = Math.min(currentPage, totalPages);
        currentPage = safePage;
        var start = (safePage - 1) * ROWS_PER_PAGE;
        var paginated = filtered.slice(start, start + ROWS_PER_PAGE);

        if (!tbody) return;

        if (paginated.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="empty-state-table" style="border:none;">' +
                '<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-users" aria-hidden="true" style="color:var(--muted-foreground);opacity:0.3;display:block;margin:0 auto 12px;"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><path d="M16 3.128a4 4 0 0 1 0 7.744"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/></svg>' +
                '<h3>No trainees found</h3><p>Try adjusting your search or filter criteria.</p></td></tr>';
        } else {
            var html = '';
            paginated.forEach(function (t) {
                var statusValues = parseStatusValues(t.status || (t.employed ? 'employed' : 'freelance'));
                var avatarUrl = t.avatar || t.image || '';
                var profileImageUrl = t.profileImage || t.avatar || t.image || '';
                var initials = getInitials(t.name);
                var displayName = displayValue(t.name);
                var displayTitle = displayValue(t.title);
                var statusHtml = statusValues.length ? statusValues.map(function (status) {
                    return '<span class="status-badge status-' + status + '">' +
                        '<span class="status-dot ' + status + '"></span>' +
                        (getStatusLabels([status])[0] || 'Available to Freelance') +
                        '</span>';
                }).join(' ') : '<span class="status-badge status-freelance"><span class="status-dot freelance"></span>Available to Freelance</span>';

                // Generate avatar from initials (no external images)
                var avatarHtml = '<span class="trainee-avatar-fallback" style="display:flex;">' + initials + '</span>';

                // If avatar exists in data, use it, but fallback to initials
                if (avatarUrl) {
                    avatarHtml = '<img src="' + avatarUrl + '" alt="' + t.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' +
                                 '<span class="trainee-avatar-fallback" style="display:none;">' + initials + '</span>';
                }

                html += '<tr>' +
                    '<td><div class="trainee-cell">' +
                    '<div class="trainee-avatar">' + avatarHtml + '</div>' +
                    '<div><div class="trainee-name">' + displayName + '</div><div class="trainee-subtitle">' + displayTitle + '</div></div>' +
                    '</div></td>' +
                    '<td data-label="Title">' + displayTitle + '</td>' +
                    '<td data-label="Cohort">' + formatCohort(t.cohort) + '</td>' +
                    '<td data-label="Status">' + statusHtml + '</td>' +
                    '<td>' +
                    '<button class="action-btn" data-action="edit" data-id="' + t.id + '" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-pencil" aria-hidden="true"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg></button>' +
                    '<button class="action-btn danger" data-action="delete" data-id="' + t.id + '" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-trash-2" aria-hidden="true"><path d="M10 11v6"/><path d="M14 11v6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M3 6h18"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>' +
                    '</td>' +
                    '</tr>';
            });
            tbody.innerHTML = html;
        }

        renderPagination(filtered.length, totalPages, safePage);
        updateStats();
    }

    function renderPagination(totalFiltered, totalPages, current) {
        if (!paginationButtons || !paginationInfo) return;
        var startItem = (current - 1) * ROWS_PER_PAGE + 1;
        var endItem = Math.min(current * ROWS_PER_PAGE, totalFiltered);
        paginationInfo.textContent = 'Showing ' + startItem + ' to ' + endItem + ' of ' + totalFiltered + ' trainees';

        var html = '';
        html += '<button class="page-btn" data-page="prev" ' + (current <= 1 ? 'disabled' : '') + '><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg></button>';
        for (var i = 1; i <= totalPages; i++) {
            html += '<button class="page-btn ' + (i === current ? 'page-btn-active' : '') + '" data-page="' + i + '">' + i + '</button>';
        }
        html += '<button class="page-btn" data-page="next" ' + (current >= totalPages ? 'disabled' : '') + '><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg></button>';
        paginationButtons.innerHTML = html;

        paginationButtons.querySelectorAll('.page-btn').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var page = this.getAttribute('data-page');
                if (page === 'prev' && currentPage > 1) { currentPage--; }
                else if (page === 'next' && currentPage < totalPages) { currentPage++; }
                else if (page !== 'prev' && page !== 'next') { currentPage = parseInt(page); }
                renderTable();
            });
        });
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
        if (action === 'edit') { openEditModal(id); }
        else if (action === 'delete') { deleteTrainee(id); }
    }

    // ============================================================
    // CRUD
    // ============================================================
    function deleteTrainee(id) {
        var deleted = findTraineeById(id);
        if (!deleted) return;
        pendingDeleteId = String(id);
        if (deleteTraineeName) deleteTraineeName.textContent = deleted.name;
        if (deleteModal) deleteModal.classList.add('open');
    }

    function closeDeleteModal() {
        if (deleteModal) deleteModal.classList.remove('open');
        pendingDeleteId = null;
    }

    function confirmDeleteTrainee() {
        if (!pendingDeleteId) return;
        var id = pendingDeleteId;
        var deleted = findTraineeById(id);
        if (!deleted) { closeDeleteModal(); return; }
        if (confirmDeleteBtn) confirmDeleteBtn.disabled = true;
        api('trainee-delete', 'POST', { id: id }).then(function () {
            closeDeleteModal();
            showToast(deleted.name + ' was removed.', 'success');
            return loadTrainees();
        }).catch(function (error) {
            showToast(error.message || 'Could not delete trainee.', 'error');
        }).then(function () {
            if (confirmDeleteBtn) confirmDeleteBtn.disabled = false;
        });
    }

    function handleAddTrainee(e) {
        e.preventDefault();
        var name = addName.value.trim();
        var title = addTitle.value.trim();
        var cohort = addCohort.value.trim();
        var status = addStatus ? serializeStatusValues(addStatus.value) : '';
        var errors = false;

        if (!name) { addNameError.textContent = 'Name is required'; errors = true; } else { addNameError.textContent = ''; }
        if (!title) { addTitleError.textContent = 'Title is required'; errors = true; } else { addTitleError.textContent = ''; }
        if (!cohort) { addCohortError.textContent = 'Cohort is required'; errors = true; }
        else if (!/^\d+$/.test(cohort)) { addCohortError.textContent = 'Please enter a valid cohort number (e.g. 17)'; errors = true; }
        else { addCohortError.textContent = ''; }
        if (!status) { addStatusError.textContent = 'Select at least one status'; errors = true; } else { addStatusError.textContent = ''; }
        if (!addAvatarDataUrl || !addProfileImageDataUrl) { showToast('Upload both a grid illustration and a profile photo.', 'error'); errors = true; }
        if (errors) return;

        var newTrainee = new FormData();
        newTrainee.append('name', name);
        newTrainee.append('title', title);
        newTrainee.append('cohort', parseInt(cohort, 10));
        newTrainee.append('status', status);
        var links = {
            cvLink: normalizeLink(addCvLink.value),
            portfolioLink: normalizeLink(addPortfolioLink.value),
            linkedIn: normalizeLink(addLinkedIn.value),
            github: normalizeLink(addGithub.value)
        };
        newTrainee.append('cvLink', links.cvLink);
        newTrainee.append('portfolioLink', links.portfolioLink);
        newTrainee.append('linkedIn', links.linkedIn);
        newTrainee.append('github', links.github);
        newTrainee.append('avatar', addAvatarDataUrl);
        newTrainee.append('profileImage', addProfileImageDataUrl);
        if (!linksAreValid(links)) { showToast('Links are not valid. Please check each URL.', 'error'); return; }
        api('trainee-create', 'POST', newTrainee, 'Trainee could not be created.').then(function (result) {
            return result;
        }, function (error) { throw new Error(error.message || 'Trainee details could not be saved.'); }).then(function (result) {
            var hasLinks = Object.keys(links).some(function (key) { return links[key] !== ''; });
            return hasLinks ? api('trainee-update-links', 'POST', { id: result.id, cvLink: links.cvLink, portfolioLink: links.portfolioLink, linkedIn: links.linkedIn, github: links.github }, 'Links could not be saved. Please check that the links are valid.') : result;
        }).then(function () {
            closeAddModal();
            showToast(name + ' has been added successfully.', 'success');
            addForm.reset(); addAvatarDataUrl = ''; addProfileImageDataUrl = '';
            if (imagePreview) { imagePreview.style.display = 'none'; imagePreview.src = ''; }
            if (profileImagePreview) { profileImagePreview.style.display = 'none'; profileImagePreview.src = ''; }
            return loadTrainees();
        }).catch(function (error) { showToast(error.message || 'Could not add trainee.', 'error'); });
    }

    function openEditModal(id) {
        var trainee = findTraineeById(id);
        if (!trainee) return;

        editId.value = trainee.id;
        editName.value = trainee.name;
        editTitle.value = trainee.title;
        editCohort.value = trainee.cohort != null && trainee.cohort !== '' ? formatCohort(trainee.cohort) : '';
        editCvLink.value = trainee.cvLink || '';
        editPortfolioLink.value = trainee.portfolioLink || '';
        editLinkedIn.value = trainee.linkedIn || '';
        editGithub.value = trainee.github || '';

        var currentStatuses = parseStatusValues(trainee.status || (trainee.employed ? 'employed' : 'freelance'));
        document.querySelectorAll('.modal-status-option[data-group="edit"]').forEach(function (checkbox) {
            checkbox.checked = currentStatuses.indexOf(checkbox.value) !== -1;
        });
        syncModalStatusSelection('edit');

        editAvatarDataUrl = trainee.avatar || trainee.image || '';
        editProfileImageDataUrl = trainee.profileImage || trainee.avatar || trainee.image || '';
        editAvatarChanged = false;
        editProfileImageChanged = false;
        if (editImagePreview && editAvatarDataUrl) {
            editImagePreview.src = editAvatarDataUrl;
            editImagePreview.style.display = 'block';
            editImageUploadArea.classList.add('is-previewing');
        } else if (editImagePreview) {
            editImagePreview.style.display = 'none';
            editImageUploadArea.classList.remove('is-previewing');
        }
        var up = editImageUploadArea ? editImageUploadArea.querySelector('p') : null;
        var ui = editImageUploadArea ? editImageUploadArea.querySelector('.upload-icon') : null;
        if (up) up.style.display = editAvatarDataUrl ? 'none' : 'block';
        if (ui) ui.style.display = editAvatarDataUrl ? 'none' : 'block';
        setImagePreview(editProfileImagePreview, editProfileImageUploadArea, editProfileImageDataUrl);

        editNameError.textContent = '';
        editTitleError.textContent = '';
        editCohortError.textContent = '';

        if (editModal) editModal.classList.add('open');
    }

    function setupStatusMultiSelect(groupName) {
        var wrapper = document.querySelector('.status-multi-select[data-status-group="' + groupName + '"]');
        if (!wrapper) return;

        wrapper.querySelectorAll('.modal-status-option').forEach(function (checkbox) {
            checkbox.addEventListener('change', function () {
                syncModalStatusSelection(groupName);
            });
        });
    }

    function handleEditTrainee(e) {
        e.preventDefault();
        var id = editId.value;
        var name = editName.value.trim();
        var title = editTitle.value.trim();
        var cohort = editCohort.value.trim();
        var status = editStatus ? serializeStatusValues(editStatus.value) : '';
        var errors = false;

        if (!name) { editNameError.textContent = 'Name is required'; errors = true; } else { editNameError.textContent = ''; }
        if (!title) { editTitleError.textContent = 'Title is required'; errors = true; } else { editTitleError.textContent = ''; }
        if (!cohort) { editCohortError.textContent = 'Cohort is required'; errors = true; }
        else if (!/^\d+$/.test(cohort)) { editCohortError.textContent = 'Please enter a valid cohort number (e.g. 17)'; errors = true; }
        else { editCohortError.textContent = ''; }
        if (!status) { editStatusError.textContent = 'Select at least one status'; errors = true; } else { editStatusError.textContent = ''; }
        if (!editAvatarDataUrl || !editProfileImageDataUrl) { showToast('Both images are required.', 'error'); errors = true; }
        if (errors) return;

        var updatedTrainee = { id: String(id), name: name, title: title, cohort: parseInt(cohort, 10), status: status };
        var links = { cvLink: normalizeLink(editCvLink.value), portfolioLink: normalizeLink(editPortfolioLink.value), linkedIn: normalizeLink(editLinkedIn.value), github: normalizeLink(editGithub.value) };
        if (!linksAreValid(links)) { showToast('Links are not valid. Please check each URL.', 'error'); return; }
        api('trainee-update-details', 'POST', updatedTrainee, 'Profile details could not be saved.').then(function () {
            if (!editAvatarChanged && !editProfileImageChanged) return null;
            var imageUpload = new FormData();
            imageUpload.append('id', id);
            if (editAvatarChanged) imageUpload.append('avatar', editAvatarDataUrl);
            if (editProfileImageChanged) imageUpload.append('profileImage', editProfileImageDataUrl);
            return api('trainee-update-images', 'POST', imageUpload, 'One of the image files is too large.');
        }).then(function () {
            return api('trainee-update-links', 'POST', { id: id, cvLink: links.cvLink, portfolioLink: links.portfolioLink, linkedIn: links.linkedIn, github: links.github }, 'Links could not be saved. Please check that the links are valid.');
        }).then(function () {
            closeEditModal(); showToast(name + '\'s profile has been updated.', 'success'); return loadTrainees();
        }).catch(function (error) { showToast(error.message || 'Could not update trainee.', 'error'); });
    }

    function traineeAvatar(id) { var trainee = findTraineeById(id); return trainee ? (trainee.avatar || trainee.image || '') : ''; }
    function traineeProfileImage(id) { var trainee = findTraineeById(id); return trainee ? (trainee.profileImage || trainee.avatar || trainee.image || '') : ''; }

    function setImagePreview(previewEl, areaEl, dataUrl) {
        if (!previewEl || !areaEl) return;
        previewEl.src = dataUrl || '';
        previewEl.style.display = dataUrl ? 'block' : 'none';
        areaEl.classList.toggle('is-previewing', Boolean(dataUrl));
        var label = areaEl.querySelector('p');
        var icon = areaEl.querySelector('.upload-icon');
        if (label) label.style.display = dataUrl ? 'none' : 'block';
        if (icon) icon.style.display = dataUrl ? 'none' : 'block';
    }

    // ============================================================
    // MODAL CONTROLS
    // ============================================================
    function openAddModal() {
        populateCohortSelects();
        addForm.reset();
        addAvatarDataUrl = '';
        addProfileImageDataUrl = '';
        addNameError.textContent = '';
        addTitleError.textContent = '';
        addCohortError.textContent = '';
        addStatusError.textContent = '';
        resetModalStatusSelection('add');
        if (imagePreview) { imagePreview.style.display = 'none'; imagePreview.src = ''; }
        setImagePreview(profileImagePreview, profileImageUploadArea, '');
        if (imageUploadArea) imageUploadArea.classList.remove('is-previewing');
        var up = imageUploadArea ? imageUploadArea.querySelector('p') : null;
        var ui = imageUploadArea ? imageUploadArea.querySelector('.upload-icon') : null;
        if (up) up.style.display = 'block';
        if (ui) ui.style.display = 'block';
        if (addModal) addModal.classList.add('open');
    }

    function closeAddModal() { if (addModal) addModal.classList.remove('open'); }
    function closeEditModal() { if (editModal) editModal.classList.remove('open'); }

    // ============================================================
    // IMAGE UPLOAD
    // ============================================================
    function setupImageUpload(inputEl, previewEl, areaEl, callback) {
        if (!inputEl || !areaEl) return;
        areaEl.addEventListener('click', function () { inputEl.click(); });
        inputEl.addEventListener('change', function (e) {
            var file = e.target.files[0];
            if (!file) return;
            // Validate the file is an image and within a reasonable size
            if (!/^image\/(jpeg|png|webp)$/i.test(file.type)) {
                showToast('Please choose a JPG, PNG or WEBP image.', 'error');
                inputEl.value = '';
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                showToast(inputEl === imageInput || inputEl === editImageInput ? 'Grid Illustration file too large. Maximum size is 5MB.' : 'Profile Photo file too large. Maximum size is 5MB.', 'error');
                inputEl.value = '';
                return;
            }
            // Store the original data URL so uploads keep their source quality and dimensions.
            var reader = new FileReader();
            reader.onload = function (ev) {
                var dataUrl = ev.target.result;
                if (previewEl) { previewEl.src = dataUrl; previewEl.style.display = 'block'; }
                var p = areaEl.querySelector('p');
                var i = areaEl.querySelector('.upload-icon');
                if (p) p.style.display = 'none';
                if (i) i.style.display = 'none';
                areaEl.classList.add('is-previewing');
                if (callback) callback(file);
            };
            reader.readAsDataURL(file);
        });
    }

    // ============================================================
    // FILTERS
    // ============================================================
    function applyFilters() { currentPage = 1; renderTable(); }
    function updateStatusFilterLabel() {
        if (!statusFilterLabel) return;
        if (selectedStatuses.length === 0) {
            statusFilterLabel.textContent = 'All Statuses';
        } else if (selectedStatuses.length === 1) {
            var labels = {
                'freelance': 'Available to Freelance',
                'opportunities': 'Open to Opportunities',
                'employed': 'Currently Employed'
            };
            statusFilterLabel.textContent = labels[selectedStatuses[0]] || selectedStatuses[0];
        } else {
            statusFilterLabel.textContent = selectedStatuses.length + ' Statuses Selected';
        }
    }

    function resetFilters() {
        if (searchInput) searchInput.value = '';
        if (cohortFilterEl) cohortFilterEl.value = 'all';
        statusCheckboxes.forEach(function (cb) { cb.checked = false; });
        searchTerm = ''; cohortFilter = 'all'; selectedStatuses = []; currentPage = 1;
        updateStatusFilterLabel();
        renderTable();
    }

    // ============================================================
    // INIT
    // ============================================================
    function init() {
        requireAuth().then(function (authenticated) { if (authenticated) loadTrainees(); });
        initTheme();
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
        var logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', logout);
        populateCohortSelects();
        renderTable();
        if (tbody) tbody.addEventListener('click', handleTableClick);
        if (searchInput) searchInput.addEventListener('input', function () { searchTerm = this.value; applyFilters(); });
        if (cohortFilterEl) cohortFilterEl.addEventListener('change', function () { cohortFilter = this.value; applyFilters(); });
        if (statusFilterTrigger) {
            statusFilterTrigger.addEventListener('click', function () {
                var isOpen = statusFilterWrap.classList.toggle('is-open');
                statusFilterTrigger.setAttribute('aria-expanded', String(isOpen));
            });
        }
        if (statusFilterMenu) {
            statusFilterMenu.addEventListener('change', function () {
                selectedStatuses = [];
                statusCheckboxes.forEach(function (cb) {
                    if (cb.checked) selectedStatuses.push(cb.value);
                });
                selectedStatuses = normalizeStatusSet(selectedStatuses);
                statusCheckboxes.forEach(function (cb) {
                    cb.checked = selectedStatuses.indexOf(cb.value) !== -1;
                });
                updateStatusFilterLabel();
                applyFilters();
            });
        }
        document.addEventListener('click', function (e) {
            if (statusFilterWrap && !statusFilterWrap.contains(e.target)) {
                statusFilterWrap.classList.remove('is-open');
                if (statusFilterTrigger) statusFilterTrigger.setAttribute('aria-expanded', 'false');
            }
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && statusFilterWrap) {
                statusFilterWrap.classList.remove('is-open');
                if (statusFilterTrigger) statusFilterTrigger.setAttribute('aria-expanded', 'false');
            }
        });
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
        if (openModalBtn) openModalBtn.addEventListener('click', openAddModal);
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddModal);
        if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddModal);
        if (addModal) addModal.addEventListener('click', function (e) { if (e.target === addModal) closeAddModal(); });
        if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
        if (editModal) editModal.addEventListener('click', function (e) { if (e.target === editModal) closeEditModal(); });
        if (closeDeleteBtn) closeDeleteBtn.addEventListener('click', closeDeleteModal);
        if (cancelDeleteBtn) cancelDeleteBtn.addEventListener('click', closeDeleteModal);
        if (confirmDeleteBtn) confirmDeleteBtn.addEventListener('click', confirmDeleteTrainee);
        if (deleteModal) deleteModal.addEventListener('click', function (e) { if (e.target === deleteModal) closeDeleteModal(); });
        if (addForm) addForm.addEventListener('submit', handleAddTrainee);
        if (editForm) editForm.addEventListener('submit', handleEditTrainee);
        setupStatusMultiSelect('add');
        setupStatusMultiSelect('edit');
        setupImageUpload(imageInput, imagePreview, imageUploadArea, function (dataUrl) { addAvatarDataUrl = dataUrl; });
        setupImageUpload(profileImageInput, profileImagePreview, profileImageUploadArea, function (dataUrl) { addProfileImageDataUrl = dataUrl; });
        setupImageUpload(editImageInput, editImagePreview, editImageUploadArea, function (dataUrl) { editAvatarDataUrl = dataUrl; editAvatarChanged = true; });
        setupImageUpload(editProfileImageInput, editProfileImagePreview, editProfileImageUploadArea, function (dataUrl) { editProfileImageDataUrl = dataUrl; editProfileImageChanged = true; });
        console.log('TraineeHub Dashboard initialized.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
