<?php
require_once __DIR__ . '/../model/Trainee.php';

class TraineeController {
    private $model;
    public function __construct() { $this->model = new Trainee(); }

    public function publicList() { echo json_encode(['success' => true, 'trainees' => $this->model->getPublic()]); }

    public function list() {
        if (!$this->requireAdmin()) return;
        echo json_encode(['success' => true, 'trainees' => $this->model->getAll()]);
    }

    public function cohorts() {
        if (!$this->requireAdmin()) return;
        echo json_encode(['success' => true, 'cohorts' => $this->model->getCohorts()]);
    }

    public function create() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $data = $this->validatedInput(); if ($data === null) return;
        $id = $this->model->create($data);
        http_response_code(201); echo json_encode(['success' => true, 'id' => $id]);
    }

    public function update() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $input = $this->input(); $id = $this->normalizeId($input);
        if (!$id || $id < 1) { $this->error('A valid trainee ID is required'); return; }
        $data = $this->validatedInput($input); if ($data === null) return;
        $this->model->update($id, $data); echo json_encode(['success' => true]);
    }

    public function delete() {
        if (!$this->requireAdmin() || !$this->requirePostCsrf()) return;
        $input = $this->input(); $id = $this->normalizeId($input);
        if (!$id || $id < 1) { $this->error('A valid trainee ID is required'); return; }
        if (!$this->model->delete($id)) { http_response_code(404); echo json_encode(['error' => 'Trainee not found']); return; }
        echo json_encode(['success' => true]);
    }

    private function requireAdmin() {
        secureSessionStart();
        if (isset($_SESSION['user_id'])) return true;
        http_response_code(401); echo json_encode(['error' => 'Unauthorized']); return false;
    }
    private function requirePostCsrf() {
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') { http_response_code(405); echo json_encode(['error' => 'Method not allowed']); return false; }
        return requireCsrfToken();
    }
    private function input() { $input = json_decode(file_get_contents('php://input'), true); return is_array($input) ? $input : []; }
    private function normalizeId($input) {
        foreach (['id', 'traineeId', 'trainee_id'] as $key) {
            if (array_key_exists($key, $input) && $input[$key] !== '') {
                return filter_var($input[$key], FILTER_VALIDATE_INT);
            }
        }
        return false;
    }
    private function value($input, $keys, $default = '') {
        foreach ((array) $keys as $key) {
            if (array_key_exists($key, $input)) {
                return $input[$key];
            }
        }
        return $default;
    }
    private function validatedInput($input = null) {
        $input = $input === null ? $this->input() : $input;
        $name = trim((string) $this->value($input, ['name'], '')); $title = trim((string) $this->value($input, ['title'], ''));
        $cohort = filter_var($this->value($input, ['cohort'], ''), FILTER_VALIDATE_INT);
        $status = $this->value($input, ['status'], (($this->value($input, ['employed'], false) === true) ? 'employed' : 'freelance'));
        if ($name === '' || mb_strlen($name) > 150 || $title === '' || mb_strlen($title) > 150 || !$cohort || $cohort > 9999 || !in_array($status, ['freelance', 'opportunities', 'employed'], true)) { $this->error('Please provide a valid name, title, cohort and status'); return null; }
        $avatar = (string) $this->value($input, ['avatar'], '');
        if ($avatar !== '' && (!preg_match('#^data:image/(?:jpeg|png|webp);base64,#', $avatar) || strlen($avatar) > 7000000)) { $this->error('Photo must be a JPG, PNG or WEBP image smaller than 5MB'); return null; }
        $links = ['cv' => ['cv', 'cvLink', 'cv_link'], 'portfolio' => ['portfolio', 'portfolioLink', 'portfolio_link'], 'linkedin' => ['linkedin', 'linkedIn', 'linkedin_link'], 'github' => ['github', 'githubLink', 'github_link']]; $data = ['name' => $name, 'title' => $title, 'cohort' => $cohort, 'status' => $status, 'avatar' => $avatar];
        foreach ($links as $column => $keys) { $value = trim((string) $this->value($input, $keys, '')); if ($value !== '' && (!filter_var($value, FILTER_VALIDATE_URL) || strlen($value) > 2048)) { $this->error('Please provide valid links'); return null; } $data[$column] = $value ?: null; }
        return $data;
    }
    private function error($message) { http_response_code(400); echo json_encode(['error' => $message]); }
}
