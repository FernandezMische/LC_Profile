(function() {
    'use strict';

    // ----- THEME TOGGLE -----
    const toggleBtn = document.getElementById('themeToggle');
    const toggleIcon = document.getElementById('toggleIcon');
    const htmlEl = document.documentElement;

    const savedTheme = localStorage.getItem('lc-theme');
    if (savedTheme) {
        htmlEl.setAttribute('data-theme', savedTheme);
        updateIcon(savedTheme);
    } else {
        updateIcon('light');
    }

    toggleBtn.addEventListener('click', function() {
        const current = htmlEl.getAttribute('data-theme');
        const next = (current === 'light') ? 'dark' : 'light';
        htmlEl.setAttribute('data-theme', next);
        localStorage.setItem('lc-theme', next);
        updateIcon(next);
    });

    function updateIcon(theme) {
        if (theme === 'dark') {
            toggleIcon.className = 'fas fa-sun';
        } else {
            toggleIcon.className = 'fas fa-moon';
        }
    }

    // ----- FORM SUBMIT (demo) -----
    const form = document.getElementById('loginForm');
    const signInBtn = document.getElementById('signInBtn');

    form.addEventListener('submit', function(e) {
        e.preventDefault();

        const originalText = signInBtn.innerHTML;
        signInBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in…';
        signInBtn.disabled = true;

        setTimeout(function() {
            const email = document.getElementById('email').value.trim();
            const pass = document.getElementById('password').value.trim();

            if (!email || !pass) {
                alert('Please fill in both email and password.');
            } else {
                alert('Login successful! (demo)\nWelcome back, ' + email);
            }

            signInBtn.innerHTML = originalText;
            signInBtn.disabled = false;
        }, 1200);
    });

})();