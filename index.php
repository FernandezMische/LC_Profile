<?php

// Apache/cPanel entry point for the production site. It replaces the local
// `php -S ... server.php` router used during development.
$uri = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// The public profile view is the homepage. Admin pages always require a login.
$protectedPages = ['/profile.html', '/profiles', '/admin-management.html', '/admin-management'];
$loginPages = ['/admin-login.html', '/admin-login'];

if (in_array($uri, $protectedPages, true) || in_array($uri, $loginPages, true)) {
    require_once __DIR__ . '/backend/config/database.php';
    secureSessionStart();

    if (in_array($uri, $protectedPages, true) && !isset($_SESSION['user_id'])) {
        header('Location: /admin-login', true, 302);
        exit;
    }

    if (in_array($uri, $loginPages, true) && isset($_SESSION['user_id'])) {
        header('Location: /profiles', true, 302);
        exit;
    }
}

$htmlPages = [
    '/' => '/frontend/html/profile-view.html',
    '/profile.html' => '/frontend/html/profile.html',
    '/profiles' => '/frontend/html/profile.html',
    '/admin-login.html' => '/frontend/html/admin-login.html',
    '/admin-login' => '/frontend/html/admin-login.html',
    '/admin-management.html' => '/frontend/html/admin-management.html',
    '/admin-management' => '/frontend/html/admin-management.html',
    // Public profile view. This is intentionally outside the admin guard.
    '/profile-view.html' => '/frontend/html/profile-view.html',
    '/profile-view' => '/frontend/html/profile-view.html',
    '/developers.html' => '/frontend/html/developers.html',
    '/developers' => '/frontend/html/developers.html',
    '/home' => '/frontend/html/profile-view.html',
    '/home.html' => '/frontend/html/profile-view.html',
];

if (isset($htmlPages[$uri])) {
    $filePath = __DIR__ . $htmlPages[$uri];
    if (is_file($filePath)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($filePath);
        exit;
    }
}

http_response_code(404);
header('Content-Type: text/plain; charset=utf-8');
echo '404 Not Found';
