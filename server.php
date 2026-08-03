<?php

// Strip query string from the URI to get the clean path
$uri = rawurldecode(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));

// ──────────────────────────────────────────────────────────────
// 0. Session-based authentication guard for admin pages
//    This runs BEFORE any page is served, blocking unauthorized
//    access at the server level.
// ──────────────────────────────────────────────────────────────

// Protected admin pages — require a valid PHP session
$protectedPages = ['/profile.html', '/profiles', '/admin-management.html', '/admin-management'];

// The login page is only for unauthenticated users
$loginPages = ['/admin-login.html', '/admin-login'];

// To check the session we need to include the backend's session setup.
// We only do this for admin pages to avoid overhead on public pages.
if (in_array($uri, $protectedPages, true) || in_array($uri, $loginPages, true)) {
    // Load the backend config to get the same session environment
    require_once __DIR__ . '/backend/config/database.php';

    secureSessionStart();

    // Protected pages: redirect to login if not authenticated
    if (in_array($uri, $protectedPages, true)) {
        if (!isset($_SESSION['user_id'])) {
            header('Location: /admin-login.html');
            http_response_code(302);
            return true;
        }
    }

    // Login page: redirect to dashboard if already authenticated
    if (in_array($uri, $loginPages, true) && isset($_SESSION['user_id'])) {
        header('Location: /profile.html');
        http_response_code(302);
        return true;
    }
}

// ──────────────────────────────────────────────────────────────
// 1. Backend API requests
//    Let PHP's built-in server execute the backend PHP file natively.
// ──────────────────────────────────────────────────────────────
if (strpos($uri, '/backend/') === 0) {
    return false;
}

// ──────────────────────────────────────────────────────────────
// 2. Direct PHP files in the project root
// ──────────────────────────────────────────────────────────────
if ($uri === '/info.php') {
    return false;
}

// ──────────────────────────────────────────────────────────────
// 3. HTML page routing
//    Map clean URLs to the actual HTML files in frontend/html/
// ──────────────────────────────────────────────────────────────
$htmlPages = [
    '/'                  => '/frontend/html/index.html',
    '/index.html'        => '/frontend/html/index.html',
    '/profile.html'      => '/frontend/html/profile.html',
    '/profiles'          => '/frontend/html/profile.html',
    '/admin-login.html'  => '/frontend/html/admin-login.html',
    '/admin-login'       => '/frontend/html/admin-login.html',
    '/admin-management.html' => '/frontend/html/admin-management.html',
    '/admin-management'  => '/frontend/html/admin-management.html',
];

if (isset($htmlPages[$uri])) {
    $filePath = __DIR__ . $htmlPages[$uri];

    if (file_exists($filePath)) {
        header('Content-Type: text/html; charset=utf-8');
        readfile($filePath);
        return true;
    }

    http_response_code(404);
    header('Content-Type: text/plain');
    echo "404 Not Found: " . $uri;
    return true;
}

// ──────────────────────────────────────────────────────────────
// 4. Static files (CSS, JS, images, fonts)
//    Map URL prefixes to the correct filesystem directories.
// ──────────────────────────────────────────────────────────────
$staticMappings = [
    '/css/'      => '/frontend/css/',
    '/js/'       => '/frontend/js/',
    '/images/'   => '/images/',
    '/fonts/'    => '/fonts/',
    '/frontend/' => '/frontend/',
];

// MIME types for all static file extensions used in the project
$mimeTypes = [
    'css'   => 'text/css',
    'js'    => 'application/javascript',
    'json'  => 'application/json',
    'jpg'   => 'image/jpeg',
    'jpeg'  => 'image/jpeg',
    'png'   => 'image/png',
    'gif'   => 'image/gif',
    'svg'   => 'image/svg+xml',
    'webp'  => 'image/webp',
    'otf'   => 'font/otf',
    'ttf'   => 'font/ttf',
    'woff'  => 'font/woff',
    'woff2' => 'font/woff2',
    'ico'   => 'image/x-icon',
    'pdf'   => 'application/pdf',
];

foreach ($staticMappings as $prefix => $dir) {
    if (strpos($uri, $prefix) === 0) {
        // Get the part of the URI after the prefix
        $relativePath = substr($uri, strlen($prefix));
        $filePath     = __DIR__ . $dir . $relativePath;

        if (file_exists($filePath) && is_file($filePath)) {
            $ext = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));
            $contentType = $mimeTypes[$ext] ?? 'application/octet-stream';

            header('Content-Type: ' . $contentType);
            header('Cache-Control: public, max-age=86400');

            readfile($filePath);
            return true;
        }
    }
}

// ──────────────────────────────────────────────────────────────
// 5. 404 Fallback — nothing matched
// ──────────────────────────────────────────────────────────────
http_response_code(404);
header('Content-Type: text/plain');
echo "404 Not Found: " . $uri;
return true;
