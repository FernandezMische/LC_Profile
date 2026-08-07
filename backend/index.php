<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');

header("Content-Type: application/json");
require_once __DIR__ . '/controller/AuthController.php';
require_once __DIR__ . '/controller/TraineeController.php';
try {
    $auth = new AuthController();
    $trainees = new TraineeController();
    $route = $_GET['route'] ?? '';
    switch ($route) {
    case 'login':
        $auth->login();
        break;
    case 'register':
        $auth->register();
        break;
    case 'check':
        $auth->check();
        break;
    case 'logout':
        $auth->logout();
        break;
    case 'admins':
        $auth->listAdmins();
        break;
    case 'update-admin':
        $auth->updateAdmin();
        break;
    case 'delete-admin':
        $auth->deleteAdmin();
        break;
    case 'trainees-public':
        $trainees->publicList();
        break;
    case 'trainees':
        $trainees->list();
        break;
    case 'cohorts':
        $trainees->cohorts();
        break;
    case 'trainee-create':
        $trainees->create();
        break;
    case 'trainee-update':
        $trainees->update();
        break;
    case 'trainee-delete':
        $trainees->delete();
        break;
        default:
            http_response_code(404);
            echo json_encode(['error' => 'Not found']);
    }
} catch (Throwable $e) {
    error_log('API error: ' . $e->getMessage());
    http_response_code(503);
    echo json_encode(['error' => 'Unable to complete the request. Please try again.']);
}
