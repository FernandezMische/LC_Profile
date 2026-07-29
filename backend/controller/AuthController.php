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
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || !isset($input['email']) || !isset($input['password'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Email and password required']);
            return;
        }
        $email = trim($input['email']);
        $password = $input['password'];

        $user = $this->userModel->findByEmail($email);
        if (!$user || !$this->userModel->verifyPassword($password, $user['password_hash'])) {
            http_response_code(401);
            echo json_encode(['error' => 'Invalid credentials']);
            return;
        }

        session_start();
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_email'] = $user['email'];

        echo json_encode(['success' => true, 'message' => 'Login successful']);
    }

    public function check() {
        session_start();
        if (isset($_SESSION['user_id'])) {
            echo json_encode(['authenticated' => true, 'email' => $_SESSION['user_email']]);
        } else {
            http_response_code(401);
            echo json_encode(['authenticated' => false]);
        }
    }

    public function logout() {
        session_start();
        session_destroy();
        echo json_encode(['success' => true, 'message' => 'Logged out']);
    }
}