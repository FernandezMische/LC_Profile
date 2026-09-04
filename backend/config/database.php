<?php
/**
 * Load environment variables from .env file
 */
function loadEnv($path) {
    if (!file_exists($path)) {
        return;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        // Skip comments
        if (strpos(trim($line), '#') === 0) {
            continue;
        }
        list($key, $value) = explode('=', $line, 2);
        $key = trim($key);
        $value = trim($value);
        // Remove quotes if present
        if (preg_match('/^"([^"]*)"$/', $value, $matches) || preg_match("/^'([^']*)'$/", $value, $matches)) {
            $value = $matches[1];
        }
        putenv("$key=$value");
        $_ENV[$key] = $value;
        $_SERVER[$key] = $value;
    }
}

// Load .env from the project root (two levels up from this file: config/ -> backend/ -> project root)
loadEnv(__DIR__ . '/../../.env');

// Database configuration from environment
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'your_database_name');
define('DB_USER', getenv('DB_USER') ?: 'your_username');
define('DB_PASS', getenv('DB_PASS') ?: 'your_password');

/**
 * Start a session with hardened cookie settings.
 * Use this everywhere instead of calling session_start() directly.
 */
function secureSessionStart() {
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }
    $isHttps = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off')
        || (isset($_SERVER['HTTP_X_FORWARDED_PROTO']) && $_SERVER['HTTP_X_FORWARDED_PROTO'] === 'https');

    session_set_cookie_params([
        'lifetime' => 0,
        'path'     => '/',
        'domain'   => '',
        'secure'   => $isHttps,   // only sent over HTTPS when HTTPS is actually in use
        'httponly' => true,       // not readable from JS, blocks XSS cookie theft
        'samesite' => 'Lax',      // blocks basic CSRF while still allowing normal navigation
    ]);
    session_start();
}

/**
 * Very lightweight brute-force protection for the login endpoint.
 * Tracks failed attempts per IP+email in the system temp dir.
 * Returns true if the caller is currently locked out.
 */
function isLoginLockedOut($identifier) {
    $data = readLoginAttempts($identifier);
    return $data['count'] >= 5 && (time() - $data['last']) < 900; // 5 fails -> 15 min lockout
}

function recordLoginFailure($identifier) {
    $data = readLoginAttempts($identifier);
    $data['count'] = (time() - $data['last']) < 900 ? $data['count'] + 1 : 1;
    $data['last'] = time();
    file_put_contents(loginAttemptsFile($identifier), json_encode($data), LOCK_EX);
}

function clearLoginAttempts($identifier) {
    $file = loginAttemptsFile($identifier);
    if (file_exists($file)) {
        unlink($file);
    }
}

function readLoginAttempts($identifier) {
    $file = loginAttemptsFile($identifier);
    if (!file_exists($file)) {
        return ['count' => 0, 'last' => 0];
    }
    $data = json_decode(file_get_contents($file), true);
    return is_array($data) ? $data : ['count' => 0, 'last' => 0];
}

function loginAttemptsFile($identifier) {
    return sys_get_temp_dir() . '/lc_login_' . hash('sha256', $identifier) . '.json';
}

function getDBConnection() {
    try {
        $pdo = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4", DB_USER, DB_PASS);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        return $pdo;
    } catch (PDOException $e) {
        error_log('Database connection failed: ' . $e->getMessage());
        throw new RuntimeException('Database connection unavailable.', 0, $e);
    }
}

/**
 * Add the file modification time to locally served image URLs. This also
 * refreshes portraits that were uploaded before versioned filenames were used.
 */
function cacheBustedImageUrl($url) {
    $url = (string) $url;
    if ($url === '' || preg_match('#^https?://#i', $url)) {
        return $url;
    }

    $path = parse_url($url, PHP_URL_PATH);
    $filePath = __DIR__ . '/../../' . ltrim((string) $path, '/');
    if (!is_file($filePath)) {
        return $url;
    }

    return $url . (strpos($url, '?') === false ? '?' : '&') . 'v=' . filemtime($filePath);
}

function csrfToken() {
    secureSessionStart();
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function requireCsrfToken() {
    secureSessionStart();
    $token = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (empty($_SESSION['csrf_token']) || !is_string($token) || !hash_equals($_SESSION['csrf_token'], $token)) {
        http_response_code(403);
        echo json_encode(['error' => 'Invalid security token. Please refresh the page and try again.']);
        return false;
    }
    return true;
}
