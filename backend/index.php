<?php
error_reporting(E_ALL);
ini_set('display_errors', '0');

// Allow image uploads without HTTP 413 errors.
// .htaccess applies the same limits when Apache handles the request.
ini_set('post_max_size', '32M');
ini_set('upload_max_filesize', '16M');
ini_set('max_execution_time', '60');
ini_set('max_input_time', '60');
ini_set('memory_limit', '128M');

header("Content-Type: application/json");
require_once __DIR__ . '/controller/AuthController.php';
require_once __DIR__ . '/controller/TraineeController.php';
require_once __DIR__ . '/controller/DeveloperController.php';
try {
    $auth = new AuthController();
    $trainees = new TraineeController();
    $developers = new DeveloperController();
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
    case 'developers-public':
        $developers->publicList();
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
    case 'trainee-update-details':
        $trainees->updateDetails();
        break;
    case 'trainee-update-images':
        $trainees->updateImages();
        break;
    case 'trainee-update-links':
        $trainees->updateLinks();
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
