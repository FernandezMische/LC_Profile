(function () {
  "use strict";

  var $ = function (id) {
    return document.getElementById(id);
  };
  var form = $("loginForm");
  var email = $("email");
  var password = $("password");
  var themeToggle = $("themeToggle");
  var toggleIcon = $("toggleIcon");
  var togglePassword = $("togglePassword");
  var eyeIcon = $("eyeIcon");
  var submit = $("signInBtn");
  var loginError = $("loginError");

  // ---- Theme toggle: sun for light mode, moon for dark mode ----
  function setTheme(value) {
    document.documentElement.setAttribute("data-theme", value);
    localStorage.setItem("traineehub-theme", value);
    if (toggleIcon) {
      toggleIcon.className = value === "dark" ? "fas fa-sun" : "fas fa-moon";
    }
  }

  function toggleTheme() {
    var current = document.documentElement.getAttribute("data-theme");
    var next = current === "dark" ? "light" : "dark";
    setTheme(next);
  }

  // ---- If already authenticated, redirect to profile dashboard ----
  fetch("/backend/index.php?route=check", {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  })
    .then(function (res) {
      return res.json();
    })
    .then(function (data) {
      if (data.authenticated) {
        window.location.href = "profile.html";
      }
    })
    .catch(function () {});

  // Initialize theme
  var savedTheme = localStorage.getItem("traineehub-theme") || "light";
  setTheme(savedTheme);

  // Event listeners
  if (themeToggle) themeToggle.addEventListener("click", toggleTheme);

  // ---- Password toggle: eye / eye-slash icons ----
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      var show = password.type === "password";
      password.type = show ? "text" : "password";
      if (eyeIcon) {
        eyeIcon.className = show ? "fas fa-eye-slash" : "fas fa-eye";
      }
    });
  }

  // ---- Backend login API call ----
  function apiLogin(email, password) {
    return fetch("/backend/index.php?route=login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, password: password }),
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) throw new Error(data.error || "Login failed");
        return data;
      });
    });
  }

  // ---- Restore button to default state ----
  function restoreButton() {
    submit.disabled = false;
    submit.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
  }

  // ---- Form submission ----
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();

      // Clear previous errors
      if (loginError) loginError.textContent = "";
      var emailError = $("emailError");
      var passwordError = $("passwordError");

      var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value);

      if (emailError) {
        emailError.textContent = validEmail
          ? ""
          : email.value
            ? "Enter a valid email address"
            : "Email is required";
      }
      if (passwordError) {
        passwordError.textContent =
          password.value.length >= 6
            ? ""
            : password.value
              ? "Password must be at least 6 characters"
              : "Password is required";
      }

      if (!validEmail || password.value.length < 6) return;

      submit.disabled = true;
      submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in…';

      // Authenticate via backend API only
      apiLogin(email.value, password.value)
        .then(function () {
          window.location.href = "profile.html";
        })
        .catch(function (err) {
          if (loginError) {
            loginError.textContent =
              err.message || "Something went wrong. Please try again.";
          }
          restoreButton();
        });
    });
  }
})();
