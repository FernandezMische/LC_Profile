<?php
require_once __DIR__ . '/../model/User.php';

class AuthController {
    private $userModel;
    public function __construct() {
        $this->userModel = new User();
    }

    public function login() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        //get email and password from the index.php request
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['email'], $input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }
        $email = trim($input['email']);
        $password = $input['password'];
        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || !is_string($password) || $password === '') {
            http_response_code(400);
            echo json_encode(['error' => 'A valid email address and password are required']);
            return;
        }

        // Brute-force protection: lock out after repeated failures for this IP+email
        $ip = $_SERVER['REMOTE_ADDR'] ?? 'unknown';
        $attemptKey = $ip . '|' . strtolower($email);
        if (isLoginLockedOut($attemptKey)) {
            http_response_code(429);
            echo json_encode(['error' => 'Too many failed attempts. Please try again in a few minutes.']);
            return;
        }

       //check if the user exists and the password is correct
        $user = $this->userModel->findByEmail($email);
        //if no user is found or the password is incorrect, return an error
        if (!$user || !$this->userModel->verifyPassword($password, $user['password_hash'])) {
            recordLoginFailure($attemptKey);
            http_response_code(401);
            echo json_encode(['error' => 'Invalid Credentials']);
            return;
        }

        clearLoginAttempts($attemptKey);

      //success start session
        secureSessionStart();
        // Regenerate the session ID on privilege change to prevent session fixation
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];

        echo json_encode(['success' => true, 'message' => 'Login successful', 'csrfToken' => csrfToken()]);
    }

    public function check() {
        secureSessionStart();
        if (isset($_SESSION['user_id'])) {
            echo json_encode(['authenticated' => true, 'email' => $_SESSION['user_email'], 'csrfToken' => csrfToken()]);
        } else {
            http_response_code(401);
            echo json_encode(['authenticated' => false]);
        }
    }

    public function register() {
        // Require an existing authenticated admin — this endpoint creates new
        // admin accounts, it must never be reachable by an anonymous visitor.
        secureSessionStart();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        if (!requireCsrfToken()) { return; }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['email'], $input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password are required']);
            return;
        }
        $email = trim($input['email']);
        $password = $input['password'];

        if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 254) {
            http_response_code(400);
            echo json_encode(['error' => 'A valid email address is required']);
            return;
        }
        if (!is_string($password) || strlen($password) < 8 || strlen($password) > 128) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 8 characters']);
            return;
        }

        // Check if user already exists
        $existing = $this->userModel->findByEmail($email);
        if ($existing) {
            http_response_code(409);
            echo json_encode(['error' => 'Email already exists.']);
            return;
        }

        // Create the user
        try {
            $created = $this->userModel->createUser($email, $password);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                http_response_code(409);
                echo json_encode(['error' => 'Email already exists.']);
                return;
            }
            throw $e;
        }
        if ($created) {
            echo json_encode(['success' => true, 'message' => 'Admin added successfully', 'id' => $created]);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to create user']);
        }
    }

    public function listAdmins() {
        // Require authentication
        secureSessionStart();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        $search = trim($_GET['search'] ?? '');
        $page = max(1, (int) ($_GET['page'] ?? 1));
        $perPage = min(50, max(1, (int) ($_GET['per_page'] ?? 10)));
        $result = $this->userModel->getAll($search, $perPage, ($page - 1) * $perPage);
        echo json_encode(['success' => true, 'admins' => $result['admins'], 'pagination' => ['page' => $page, 'perPage' => $perPage, 'total' => $result['total'], 'pages' => (int) ceil($result['total'] / $perPage)]]);
    }

    public function updateAdmin() {
        // Require authentication
        secureSessionStart();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        if (!requireCsrfToken()) { return; }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Admin ID required']);
            return;
        }
        $id = $input['id'];
        $email = isset($input['email']) ? trim($input['email']) : null;
        $password = isset($input['password']) ? $input['password'] : null;

        if ($email !== null && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            http_response_code(400);
            echo json_encode(['error' => 'A valid email address is required']);
            return;
        }
        if ($password !== null && strlen($password) < 8) {
            http_response_code(400);
            echo json_encode(['error' => 'Password must be at least 8 characters']);
            return;
        }

        $updated = $this->userModel->updateUser($id, $email, $password);
        if ($updated) {
            echo json_encode(['success' => true, 'message' => 'Admin updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update admin']);
        }
    }

    public function deleteAdmin() {
        // Require authentication
        secureSessionStart();
        if (!isset($_SESSION['user_id'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            return;
        }
        if (!requireCsrfToken()) { return; }
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            return;
        }
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Admin ID required']);
            return;
        }
        if ((string)$input['id'] === (string)$_SESSION['user_id']) {
            http_response_code(400);
            echo json_encode(['error' => 'You cannot delete your own account while logged in']);
            return;
        }

        $deleted = $this->userModel->deleteUser($input['id']);
        if ($deleted) {
            echo json_encode(['success' => true, 'message' => 'Admin deleted successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete admin']);
        }
    }

    public function logout() {
        secureSessionStart();
        if (!requireCsrfToken()) { return; }
        $_SESSION = [];
        if (ini_get('session.use_cookies')) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000,
                $params['path'], $params['domain'], $params['secure'], $params['httponly']);
        }
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out']);
    }
}
