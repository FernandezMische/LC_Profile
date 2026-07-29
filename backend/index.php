<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

require_once __DIR__ . '/controller/AuthController.php';
$auth = new AuthController();

$route = $_GET['route'] ?? '';
switch ($route) {
    case 'login':
        $auth->login();
        break;
    case 'check':
        $auth->check();
        break;
    case 'logout':
        $auth->logout();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Not found']);
}