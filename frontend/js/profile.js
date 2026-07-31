/**
 * TraineeHub Dashboard - Vanilla JavaScript
 * Matches React mock: TraineeDashboardClient, AddTraineeModal, EditTraineeModal, FilterBar, KpiBar, TraineeTable
 */

(function () {
    'use strict';

    // ============================================================
    // DATA
    // ============================================================
    var INITIAL_TRAINEES = [
        { id: 'trainee-001', name: 'Zahraa Thompson', title: 'Software Developer Intern', cohort: 16, employed: true, avatar: 'https://i.pravatar.cc/40?img=47', cvLink: 'https://drive.google.com/cv-zahraa', portfolioLink: 'https://zahraa.dev', linkedIn: 'https://linkedin.com/in/zahraa-thompson', github: 'https://github.com/zahraa-thompson' },
        { id: 'trainee-002', name: 'Sinaye Dlamini', title: 'Frontend Developer Intern', cohort: 16, employed: true, avatar: 'https://i.pravatar.cc/40?img=12', cvLink: 'https://drive.google.com/cv-sinaye', portfolioLink: 'https://sinaye.co.za', linkedIn: 'https://linkedin.com/in/sinaye-dlamini', github: 'https://github.com/sinaye-dlamini' },
        { id: 'trainee-003', name: 'Nadia Patel', title: 'UI/UX Design Intern', cohort: 16, employed: true, avatar: 'https://i.pravatar.cc/40?img=32', cvLink: 'https://drive.google.com/cv-nadia', portfolioLink: 'https://nadiapatel.design', linkedIn: 'https://linkedin.com/in/nadia-patel', github: 'https://github.com/nadia-patel' },
        { id: 'trainee-004', name: 'Luthando Mgwaza', title: 'Backend Developer Intern', cohort: 16, employed: true, avatar: 'https://i.pravatar.cc/40?img=11', cvLink: 'https://drive.google.com/cv-luthando', portfolioLink: 'https://luthando.dev', linkedIn: 'https://linkedin.com/in/luthando-mgwaza', github: 'https://github.com/luthando-mgwaza' },
        { id: 'trainee-005', name: 'Jordan Petersen', title: 'Mobile Developer Intern', cohort: 17, employed: false, avatar: 'https://i.pravatar.cc/40?img=15', cvLink: '', portfolioLink: '', linkedIn: 'https://linkedin.com/in/jordan-petersen', github: 'https://github.com/jordan-petersen' },
        { id: 'trainee-006', name: 'Amina Karim', title: 'Data Analytics Intern', cohort: 17, employed: true, avatar: 'https://i.pravatar.cc/40?img=44', cvLink: 'https://drive.google.com/cv-amina', portfolioLink: 'https://aminakarim.io', linkedIn: 'https://linkedin.com/in/amina-karim', github: 'https://github.com/amina-karim' },
        { id: 'trainee-007', name: 'Luke Fraser', title: 'DevOps Intern', cohort: 17, employed: true, avatar: 'https://i.pravatar.cc/40?img=18', cvLink: 'https://drive.google.com/cv-luke', portfolioLink: 'https://lukefraser.dev', linkedIn: 'https://linkedin.com/in/luke-fraser', github: 'https://github.com/luke-fraser' },
        { id: 'trainee-008', name: 'Thando Nkoala', title: 'Content & Brand Intern', cohort: 17, employed: false, avatar: 'https://i.pravatar.cc/40?img=25', cvLink: '', portfolioLink: 'https://thando.co.za', linkedIn: 'https://linkedin.com/in/thando-nkoala', github: '' },
        { id: 'trainee-009', name: 'Kefilwe Mokoena', title: 'Product Management Intern', cohort: 15, employed: true, avatar: 'https://i.pravatar.cc/40?img=49', cvLink: 'https://drive.google.com/cv-kefilwe', portfolioLink: 'https://kefilwe.pm', linkedIn: 'https://linkedin.com/in/kefilwe-mokoena', github: '' },
        { id: 'trainee-010', name: 'Ruan van der Berg', title: 'Cloud Infrastructure Intern', cohort: 15, employed: true, avatar: 'https://i.pravatar.cc/40?img=20', cvLink: 'https://drive.google.com/cv-ruan', portfolioLink: '', linkedIn: 'https://linkedin.com/in/ruan-vdberg', github: 'https://github.com/ruan-vdberg' },
        { id: 'trainee-011', name: 'Fatima Al-Hassan', title: 'Cybersecurity Intern', cohort: 15, employed: false, avatar: 'https://i.pravatar.cc/40?img=36', cvLink: 'https://drive.google.com/cv-fatima', portfolioLink: '', linkedIn: 'https://linkedin.com/in/fatima-alhassan', github: 'https://github.com/fatima-alhassan' },
        { id: 'trainee-012', name: 'Sipho Khumalo', title: 'QA Engineering Intern', cohort: 15, employed: true, avatar: 'https://i.pravatar.cc/40?img=7', cvLink: 'https://drive.google.com/cv-sipho', portfolioLink: 'https://sipho.dev', linkedIn: 'https://linkedin.com/in/sipho-khumalo', github: 'https://github.com/sipho-khumalo' },
        { id: 'trainee-013', name: 'Priya Naidoo', title: 'Machine Learning Intern', cohort: 18, employed: false, avatar: 'https://i.pravatar.cc/40?img=39', cvLink: 'https://drive.google.com/cv-priya', portfolioLink: '', linkedIn: 'https://linkedin.com/in/priya-naidoo', github: 'https://github.com/priya-naidoo' },
        { id: 'trainee-014', name: 'Ethan Botha', title: 'Systems Analysis Intern', cohort: 18, employed: true, avatar: 'https://i.pravatar.cc/40?img=52', cvLink: 'https://drive.google.com/cv-ethan', portfolioLink: 'https://ethanbotha.co.za', linkedIn: 'https://linkedin.com/in/ethan-botha', github: 'https://github.com/ethan-botha' },
        { id: 'trainee-015', name: 'Nomvula Sithole', title: 'Graphic Design Intern', cohort: 18, employed: true, avatar: 'https://i.pravatar.cc/40?img=43', cvLink: 'https://drive.google.com/cv-nomvula', portfolioLink: 'https://nomvula.design', linkedIn: 'https://linkedin.com/in/nomvula-sithole', github: '' },
        { id: 'trainee-016', name: 'Brendan Jacobs', title: 'Network Engineering Intern', cohort: 18, employed: false, avatar: 'https://i.pravatar.cc/40?img=55', cvLink: '', portfolioLink: '', linkedIn: 'https://linkedin.com/in/brendan-jacobs', github: 'https://github.com/brendan-jacobs' },
        { id: 'trainee-017', name: 'Aisha Okonkwo', title: 'Digital Marketing Intern', cohort: 16, employed: true, avatar: 'https://i.pravatar.cc/40?img=45', cvLink: 'https://drive.google.com/cv-aisha', portfolioLink: 'https://aisha.marketing', linkedIn: 'https://linkedin.com/in/aisha-okonkwo', github: '' },
        { id: 'trainee-018', name: 'Tebogo Ramaphosa', title: 'Business Analysis Intern', cohort: 16, employed: true, avatar: 'https://i.pravatar.cc/40?img=30', cvLink: 'https://drive.google.com/cv-tebogo', portfolioLink: '', linkedIn: 'https://linkedin.com/in/tebogo-ramaphosa', github: '' },
        { id: 'trainee-019', name: 'Chidi Obi', title: 'Data Engineering Intern', cohort: 17, employed: false, avatar: 'https://i.pravatar.cc/40?img=13', cvLink: 'https://drive.google.com/cv-chidi', portfolioLink: 'https://chidiobi.dev', linkedIn: 'https://linkedin.com/in/chidi-obi', github: 'https://github.com/chidi-obi' },
        { id: 'trainee-020', name: 'Liesl van Wyk', title: 'React Native Intern', cohort: 17, employed: true, avatar: 'https://i.pravatar.cc/40?img=40', cvLink: 'https://drive.google.com/cv-liesl', portfolioLink: 'https://liesl.dev', linkedIn: 'https://linkedin.com/in/liesl-van-wyk', github: 'https://github.com/liesl-van-wyk' },
        { id: 'trainee-021', name: 'Oluwaseun Adeyemi', title: 'Full Stack Developer Intern', cohort: 15, employed: true, avatar: 'https://i.pravatar.cc/40?img=60', cvLink: 'https://drive.google.com/cv-oluwaseun', portfolioLink: 'https://seun.dev', linkedIn: 'https://linkedin.com/in/oluwaseun-adeyemi', github: 'https://github.com/oluwaseun-adeyemi' },
        { id: 'trainee-022', name: 'Mariam Essam', title: 'Technical Writing Intern', cohort: 15, employed: false, avatar: 'https://i.pravatar.cc/40?img=33', cvLink: 'https://drive.google.com/cv-mariam', portfolioLink: 'https://mariam.writes', linkedIn: 'https://linkedin.com/in/mariam-essam', github: '' },
        { id: 'trainee-023', name: 'Kwame Asante', title: 'Blockchain Developer Intern', cohort: 18, employed: true, avatar: 'https://i.pravatar.cc/40?img=14', cvLink: 'https://drive.google.com/cv-kwame', portfolioLink: 'https://kwame.blockchain', linkedIn: 'https://linkedin.com/in/kwame-asante', github: 'https://github.com/kwame-asante' },
        { id: 'trainee-024', name: 'Zanele Dube', title: 'IT Support Intern', cohort: 18, employed: false, avatar: 'https://i.pravatar.cc/40?img=46', cvLink: '', portfolioLink: '', linkedIn: 'https://linkedin.com/in/zanele-dube', github: '' },
    ];

    var ROWS_PER_PAGE = 8;

    // ============================================================
    // STATE
    // ============================================================
    var trainees = JSON.parse(JSON.stringify(INITIAL_TRAINEES));
    var searchTerm = '';
    var cohortFilter = 'all';
    var statusFilter = 'all';
    var currentPage = 1;
    var addAvatarDataUrl = '';
    var editAvatarDataUrl = '';

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
    var statusFilterEl = $('statusFilter');
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

    var editForm = $('editTraineeForm');
    var editId = $('editId');
    var editName = $('editName');
    var editTitle = $('editTitle');
    var editCohort = $('editCohort');
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

    function getCohorts() {
        var unique = {};
        trainees.forEach(function (t) { unique[t.cohort] = true; });
        return Object.keys(unique).map(Number).sort(function (a, b) { return a - b; });
    }

    function getFiltered() {
        return trainees.filter(function (t) {
            var q = searchTerm.toLowerCase().trim();
            var matchSearch = !q || t.name.toLowerCase().includes(q) || t.title.toLowerCase().includes(q) || String(t.cohort).includes(q);
            var matchCohort = cohortFilter === 'all' || String(t.cohort) === cohortFilter;
            var matchStatus = statusFilter === 'all' || (statusFilter === 'employed' && t.employed) || (statusFilter === 'not-employed' && !t.employed);
            return matchSearch && matchCohort && matchStatus;
        });
    }

    function getRandomAvatar() {
        return 'https://i.pravatar.cc/40?img=' + (Math.floor(Math.random() * 70) + 1);
    }

    // ============================================================
    // RENDER
    // ============================================================
    function populateCohortSelects() {
        var cohorts = getCohorts();
        var selects = [addCohort, editCohort];
        selects.forEach(function (sel) {
            if (!sel) return;
            sel.innerHTML = '<option value="">Select cohort</option>';
            cohorts.forEach(function (c) {
                var opt = document.createElement('option');
                opt.value = String(c);
                opt.textContent = 'Cohort ' + c;
                sel.appendChild(opt);
            });
        });
        if (cohortFilterEl) {
            cohortFilterEl.innerHTML = '<option value="all">All Cohorts</option>';
            cohorts.forEach(function (c) {
                var opt = document.createElement('option');
                opt.value = String(c);
                opt.textContent = 'Cohort ' + c;
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
            paginated.forEach(function (t, idx) {
                var statusClass = t.employed ? 'status-employed' : 'status-not-employed';
                var statusText = t.employed ? 'Currently Employed' : 'Not Employed';
                var initials = getInitials(t.name);
                var displayName = displayValue(t.name);
                var displayTitle = displayValue(t.title);

                // Generate avatar from initials (no external images)
                var avatarHtml = '<span class="trainee-avatar-fallback" style="display:flex;">' + initials + '</span>';

                // If avatar exists in data, use it, but fallback to initials
                if (t.avatar) {
                    avatarHtml = '<img src="' + t.avatar + '" alt="' + t.name + '" onerror="this.style.display=\'none\';this.nextElementSibling.style.display=\'flex\'" />' +
                                 '<span class="trainee-avatar-fallback" style="display:none;">' + initials + '</span>';
                }

                html += '<tr>' +
                    '<td><div class="trainee-cell">' +
                    '<div class="trainee-avatar">' + avatarHtml + '</div>' +
                    '<div><div class="trainee-name">' + displayName + '</div><div class="trainee-subtitle">' + displayTitle + '</div></div>' +
                    '</div></td>' +
                    '<td>' + displayTitle + '</td>' +
                    '<td>' + t.cohort + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' +
                    '<span class="status-dot ' + (t.employed ? 'employed' : 'not-employed') + '"></span>' +
                    statusText + '</span></td>' +
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
        var deleted = null;
        for (var i = 0; i < trainees.length; i++) {
            if (trainees[i].id === id) { deleted = trainees[i]; break; }
        }
        if (!deleted) return;
        trainees = trainees.filter(function (t) { return t.id !== id; });
        renderTable();

        showToast(deleted.name + ' was removed.', 'info', function () {
            var insertIdx = -1;
            for (var j = 0; j < INITIAL_TRAINEES.length; j++) {
                if (INITIAL_TRAINEES[j].id === id) { insertIdx = j; break; }
            }
            if (insertIdx >= 0) { trainees.splice(Math.min(insertIdx, trainees.length), 0, deleted); }
            else { trainees.unshift(deleted); }
            renderTable();
        });
    }

    function handleAddTrainee(e) {
        e.preventDefault();
        var name = addName.value.trim();
        var title = addTitle.value.trim();
        var cohort = addCohort.value;
        var employed = document.querySelector('input[name="addEmployed"]:checked');
        var errors = false;

        if (!name) { addNameError.textContent = 'Name is required'; errors = true; } else { addNameError.textContent = ''; }
        if (!title) { addTitleError.textContent = 'Title is required'; errors = true; } else { addTitleError.textContent = ''; }
        if (!cohort) { addCohortError.textContent = 'Cohort is required'; errors = true; } else { addCohortError.textContent = ''; }
        if (errors) return;

        var newTrainee = {
            id: 'trainee-' + Date.now(),
            name: name,
            title: title,
            subtitle: title,
            cohort: parseInt(cohort),
            employed: employed ? employed.value === 'yes' : true,
            avatar: addAvatarDataUrl || '',
            cvLink: addCvLink.value.trim(),
            portfolioLink: addPortfolioLink.value.trim(),
            linkedIn: addLinkedIn.value.trim(),
            github: addGithub.value.trim()
        };
        trainees.unshift(newTrainee);
        renderTable();
        closeAddModal();
        showToast(name + ' has been added successfully.', 'success');
        addForm.reset();
        addAvatarDataUrl = '';
        if (imagePreview) { imagePreview.style.display = 'none'; imagePreview.src = ''; }
        var up = imageUploadArea ? imageUploadArea.querySelector('p') : null;
        var ui = imageUploadArea ? imageUploadArea.querySelector('i') : null;
        if (up) up.style.display = 'block';
        if (ui) ui.style.display = 'block';
    }

    function openEditModal(id) {
        var trainee = null;
        for (var i = 0; i < trainees.length; i++) {
            if (trainees[i].id === id) { trainee = trainees[i]; break; }
        }
        if (!trainee) return;

        editId.value = trainee.id;
        editName.value = trainee.name;
        editTitle.value = trainee.title;
        editCohort.value = String(trainee.cohort);
        editCvLink.value = trainee.cvLink || '';
        editPortfolioLink.value = trainee.portfolioLink || '';
        editLinkedIn.value = trainee.linkedIn || '';
        editGithub.value = trainee.github || '';

        document.querySelectorAll('input[name="editEmployed"]').forEach(function (r) {
            r.checked = (r.value === 'yes') === trainee.employed;
        });

        editAvatarDataUrl = trainee.avatar || '';
        if (editImagePreview && editAvatarDataUrl) {
            editImagePreview.src = editAvatarDataUrl;
            editImagePreview.style.display = 'block';
        } else if (editImagePreview) {
            editImagePreview.style.display = 'none';
        }
        var up = editImageUploadArea ? editImageUploadArea.querySelector('p') : null;
        var ui = editImageUploadArea ? editImageUploadArea.querySelector('i') : null;
        if (up) up.style.display = 'none';
        if (ui) ui.style.display = 'none';

        editNameError.textContent = '';
        editTitleError.textContent = '';
        editCohortError.textContent = '';

        var cohorts = getCohorts();
        if (cohorts.indexOf(trainee.cohort) < 0) cohorts.push(trainee.cohort);
        cohorts.sort(function (a, b) { return a - b; });
        editCohort.innerHTML = '<option value="">Select cohort</option>';
        cohorts.forEach(function (c) {
            var opt = document.createElement('option');
            opt.value = String(c);
            opt.textContent = 'Cohort ' + c;
            if (c === trainee.cohort) opt.selected = true;
            editCohort.appendChild(opt);
        });

        if (editModal) editModal.classList.add('open');
    }

    function handleEditTrainee(e) {
        e.preventDefault();
        var id = editId.value;
        var name = editName.value.trim();
        var title = editTitle.value.trim();
        var cohort = editCohort.value;
        var employed = document.querySelector('input[name="editEmployed"]:checked');
        var errors = false;

        if (!name) { editNameError.textContent = 'Name is required'; errors = true; } else { editNameError.textContent = ''; }
        if (!title) { editTitleError.textContent = 'Title is required'; errors = true; } else { editTitleError.textContent = ''; }
        if (!cohort) { editCohortError.textContent = 'Cohort is required'; errors = true; } else { editCohortError.textContent = ''; }
        if (errors) return;

        for (var i = 0; i < trainees.length; i++) {
            if (trainees[i].id === id) {
                trainees[i].name = name;
                trainees[i].title = title;
                trainees[i].subtitle = title;
                trainees[i].cohort = parseInt(cohort);
                trainees[i].employed = employed ? employed.value === 'yes' : true;
                trainees[i].avatar = editAvatarDataUrl || trainees[i].avatar || '';
                trainees[i].cvLink = editCvLink.value.trim();
                trainees[i].portfolioLink = editPortfolioLink.value.trim();
                trainees[i].linkedIn = editLinkedIn.value.trim();
                trainees[i].github = editGithub.value.trim();
                break;
            }
        }
        renderTable();
        closeEditModal();
        showToast(name + '\'s profile has been updated.', 'success');
    }

    // ============================================================
    // MODAL CONTROLS
    // ============================================================
    function openAddModal() {
        populateCohortSelects();
        addForm.reset();
        addAvatarDataUrl = '';
        addNameError.textContent = '';
        addTitleError.textContent = '';
        addCohortError.textContent = '';
        if (imagePreview) { imagePreview.style.display = 'none'; imagePreview.src = ''; }
        var up = imageUploadArea ? imageUploadArea.querySelector('p') : null;
        var ui = imageUploadArea ? imageUploadArea.querySelector('i') : null;
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
            var reader = new FileReader();
            reader.onload = function (ev) {
                var dataUrl = ev.target.result;
                if (previewEl) { previewEl.src = dataUrl; previewEl.style.display = 'block'; }
                var p = areaEl.querySelector('p');
                var i = areaEl.querySelector('i');
                if (p) p.style.display = 'none';
                if (i) i.style.display = 'none';
                if (callback) callback(dataUrl);
            };
            reader.readAsDataURL(file);
        });
    }

    // ============================================================
    // FILTERS
    // ============================================================
    function applyFilters() { currentPage = 1; renderTable(); }
    function resetFilters() {
        if (searchInput) searchInput.value = '';
        if (cohortFilterEl) cohortFilterEl.value = 'all';
        if (statusFilterEl) statusFilterEl.value = 'all';
        searchTerm = ''; cohortFilter = 'all'; statusFilter = 'all'; currentPage = 1;
        renderTable();
    }

    // ============================================================
    // INIT
    // ============================================================
    function init() {
        initTheme();
        if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
        populateCohortSelects();
        renderTable();
        if (tbody) tbody.addEventListener('click', handleTableClick);
        if (searchInput) searchInput.addEventListener('input', function () { searchTerm = this.value; applyFilters(); });
        if (cohortFilterEl) cohortFilterEl.addEventListener('change', function () { cohortFilter = this.value; applyFilters(); });
        if (statusFilterEl) statusFilterEl.addEventListener('change', function () { statusFilter = this.value; applyFilters(); });
        if (resetBtn) resetBtn.addEventListener('click', resetFilters);
        if (openModalBtn) openModalBtn.addEventListener('click', openAddModal);
        if (closeModalBtn) closeModalBtn.addEventListener('click', closeAddModal);
        if (cancelAddBtn) cancelAddBtn.addEventListener('click', closeAddModal);
        if (addModal) addModal.addEventListener('click', function (e) { if (e.target === addModal) closeAddModal(); });
        if (closeEditBtn) closeEditBtn.addEventListener('click', closeEditModal);
        if (cancelEditBtn) cancelEditBtn.addEventListener('click', closeEditModal);
        if (editModal) editModal.addEventListener('click', function (e) { if (e.target === editModal) closeEditModal(); });
        if (addForm) addForm.addEventListener('submit', handleAddTrainee);
        if (editForm) editForm.addEventListener('submit', handleEditTrainee);
        setupImageUpload(imageInput, imagePreview, imageUploadArea, function (dataUrl) { addAvatarDataUrl = dataUrl; });
        setupImageUpload(editImageInput, editImagePreview, editImageUploadArea, function (dataUrl) { editAvatarDataUrl = dataUrl; });
        console.log('TraineeHub Dashboard initialized.');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();