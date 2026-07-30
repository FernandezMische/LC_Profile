(function () {
    'use strict';

    var DEMO = { email: 'nash@traineehub.co.za', password: 'TraineeHub@2026' };
    var $ = function (id) { return document.getElementById(id); };
    var form = $('loginForm');
    var email = $('email');
    var password = $('password');
    var themeToggle = $('themeToggle');
    var themeIcon = $('themeIcon');
    var passwordToggle = $('passwordToggle');
    var eyeIcon = $('eyeIcon');
    var submit = $('signInBtn');
    var loginError = $('loginError');

    // Theme functions with icon swap
    function getThemeIcon(theme) {
        if (theme === 'dark') {
            return '<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>';
        }
        return '<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>';
    }

    function setTheme(value) {
        document.documentElement.setAttribute('data-theme', value);
        localStorage.setItem('traineehub-theme', value);
        if (themeIcon) {
            themeIcon.innerHTML = getThemeIcon(value);
        }
    }

    function toggleTheme() {
        var current = document.documentElement.getAttribute('data-theme');
        var next = current === 'dark' ? 'light' : 'dark';
        setTheme(next);
    }

    // Initialize theme
    var savedTheme = localStorage.getItem('traineehub-theme') || 'light';
    setTheme(savedTheme);

    // Event listeners
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

    // Password toggle with SVG
    if (passwordToggle) {
        passwordToggle.addEventListener('click', function () {
            var show = password.type === 'password';
            password.type = show ? 'text' : 'password';
            if (eyeIcon) {
                if (show) {
                    eyeIcon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
                } else {
                    eyeIcon.innerHTML = '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>';
                }
            }
        });
    }

    // Autofill
    var autofillBtn = $('autofillBtn');
    if (autofillBtn) {
        autofillBtn.addEventListener('click', function () {
            email.value = DEMO.email;
            password.value = DEMO.password;
            if (loginError) loginError.textContent = '';
        });
    }

    // Copy buttons
    document.querySelectorAll('.copy-btn').forEach(function (button) {
        button.addEventListener('click', function () {
            var text = this.getAttribute('data-copy');
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text).then(function () {
                    var original = button.innerHTML;
                    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
                    setTimeout(function () { button.innerHTML = original; }, 1200);
                });
            }
        });
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();

            var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);
            var emailError = $('emailError');
            var passwordError = $('passwordError');

            if (emailError) {
                emailError.textContent = validEmail ? '' : (email.value ? 'Enter a valid email address' : 'Email is required');
            }
            if (passwordError) {
                passwordError.textContent = password.value.length >= 6 ? '' : (password.value ? 'Password must be at least 6 characters' : 'Password is required');
            }

            if (!validEmail || password.value.length < 6) return;

            submit.disabled = true;
            submit.innerHTML = '<svg class="spinner" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="2" fill="none"/></svg> <span>Signing in...</span>';

            setTimeout(function () {
                if (email.value === DEMO.email && password.value === DEMO.password) {
                    window.location.href = '../../index.html';
                    return;
                }
                if (loginError) {
                    loginError.textContent = 'Invalid credentials — use the demo account below to sign in';
                }
                submit.disabled = false;
                submit.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" x2="3" y1="12" y2="12"/></svg> <span>Sign In</span>';
            }, 800);
        });
    }
}());